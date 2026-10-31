import pytest

from core.llm import AiError, AiSettings, StructuredOutput, answer_budget, complete_json, parse_json
from fake_chat import FakeChat

SCHEMA = {"type": "object"}


def settings(mode=StructuredOutput.SCHEMA):
    return AiSettings("http://x", "k", "default", {"translate": "cheap"}, mode)


@pytest.mark.parametrize(
    "text",
    ['{"a": 1}', '```json\n{"a": 1}\n```', '<think>hmm {"b": 2}</think>{"a": 1}', 'Sure! {"a": 1} Done.'],
)
def test_parse_json_tolerates_wrappers(text):
    assert parse_json(text) == {"a": 1}


def test_retries_once_with_the_error_then_succeeds():
    chat = FakeChat('{"n": "x"}', '{"n": 2}')

    def validate(answer):
        return int(answer["n"])

    value, usage = complete_json(chat, settings(), "translate", "sys", "user", SCHEMA, validate)
    assert value == 2
    assert usage.prompt_tokens == 20
    assert "invalid" in chat.sent()
    assert chat.calls[1]["messages"][2]["content"] == '{"n": "x"}'
    assert chat.calls[0]["model"] == "cheap"


def test_gives_up_after_one_retry():
    chat = FakeChat("nope", "still nope")
    with pytest.raises(AiError):
        complete_json(chat, settings(), "extract", "sys", "user", SCHEMA, lambda a: a)
    assert len(chat.calls) == 2


def test_json_mode_puts_schema_in_prompt():
    chat = FakeChat("{}")
    complete_json(chat, settings(StructuredOutput.JSON), "extract", "sys", "u", SCHEMA, lambda a: a)
    call = chat.calls[0]
    assert call["response_format"] == {"type": "json_object"}
    assert "JSON Schema" in call["messages"][0]["content"]
    assert call["model"] == "default"


def test_answer_budget_counts_kana_and_kanji_as_whole_tokens():
    assert answer_budget("") == 1024
    assert answer_budget("a" * 400) == 1024 + 200
    assert answer_budget("卵" * 100) == 1024 + 200


def test_every_call_is_capped():
    chat = FakeChat("{}")
    complete_json(chat, settings(), "extract", "sys", "a" * 400, SCHEMA, lambda a: a)
    assert chat.calls[0]["max_tokens"] == answer_budget("a" * 400)


def test_an_answer_that_did_not_parse_is_not_sent_back():
    chat = FakeChat('{"n": 1' + " " * 50, '{"n": 1}')
    complete_json(chat, settings(), "extract", "sys", "user", SCHEMA, lambda a: a)
    retry = chat.calls[1]["messages"]
    assert len(retry) == 2 and retry[1]["content"].startswith("user") and "not valid JSON" in retry[1]["content"]
