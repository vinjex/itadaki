import pytest

from core.llm import AiError, AiSettings, StructuredOutput, complete_json, parse_json
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
