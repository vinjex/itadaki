"""Talking to an OpenAI-compatible chat API and getting validated JSON back."""

from __future__ import annotations

import json
import re
from collections.abc import Callable
from dataclasses import dataclass, field
from enum import StrEnum
from typing import Any, Protocol, TypeVar

from .errors import ItadakiError
from .models import Usage

T = TypeVar("T")


class AiError(ItadakiError):
    pass


class StructuredOutput(StrEnum):
    # How the JSON shape is enforced. Providers differ: Workers AI supports schemas
    # only on some models, and some servers ignore response_format entirely.
    SCHEMA = "schema"
    JSON = "json"
    OFF = "off"


@dataclass
class AiSettings:
    base_url: str
    api_key: str
    model: str
    # Optional per-action model, keyed by action name (extract, structure, translate, adapt).
    models: dict[str, str] = field(default_factory=dict)
    structured_output: StructuredOutput = StructuredOutput.SCHEMA
    # Provider-specific request fields sent as-is, e.g. Workers AI's switch for a
    # model's thinking mode, which otherwise multiplies output tokens.
    extra_body: dict[str, Any] = field(default_factory=dict)

    def model_for(self, action: str) -> str:
        return self.models.get(action) or self.model


class ChatModel(Protocol):
    def complete(
        self,
        model: str,
        messages: list[dict[str, str]],
        response_format: dict[str, Any] | None,
        extra_body: dict[str, Any],
        max_tokens: int,
    ) -> tuple[str, Usage]: ...


class OpenAIChat:
    def __init__(self, base_url: str, api_key: str, timeout: float = 300) -> None:
        # Long, because shared providers queue requests; callers run AI work as
        # background jobs, so nobody is left staring at a spinner meanwhile.
        from openai import OpenAI

        self._client = OpenAI(base_url=base_url, api_key=api_key, timeout=timeout, max_retries=1)

    def complete(
        self,
        model: str,
        messages: list[dict[str, str]],
        response_format: dict[str, Any] | None,
        extra_body: dict[str, Any],
        max_tokens: int,
    ) -> tuple[str, Usage]:
        from openai import OpenAIError

        extra = {"response_format": response_format} if response_format else {}
        try:
            response = self._client.chat.completions.create(
                model=model, messages=messages, max_tokens=max_tokens, extra_body=extra_body or None, **extra
            )
        except OpenAIError as err:
            raise AiError(f"AI request failed: {err}") from err
        usage = response.usage
        return response.choices[0].message.content or "", Usage(
            usage.prompt_tokens if usage else 0, usage.completion_tokens if usage else 0
        )


_FENCE = re.compile(r"^```(?:json)?\s*|\s*```$")
_THINKING = re.compile(r"<think>.*?</think>", re.DOTALL)


def parse_json(text: str) -> Any:
    """Tolerates the usual wrappers: reasoning blocks, code fences, prose around the object."""
    text = _FENCE.sub("", _THINKING.sub("", text).strip())
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        start, end = text.find("{"), text.rfind("}")
        if start == -1 or end <= start:
            raise
        return json.loads(text[start : end + 1])


def answer_budget(text: str) -> int:
    """A token cap for an answer to `text`. Answers are at most about as long as what
    they rework, but a model can get stuck emitting whitespace until the cap, so the
    cap decides how long a stuck call runs. Tokens are estimated per script: about
    four ASCII characters each, about one character each for kana and kanji. Twice the
    input covers English turning into Japanese."""
    ascii_chars = sum(c.isascii() for c in text)
    return 2 * (ascii_chars // 4 + len(text) - ascii_chars) + 1024


def complete_json(
    chat: ChatModel,
    settings: AiSettings,
    action: str,
    system: str,
    user: str,
    schema: dict[str, Any],
    validate: Callable[[Any], T],
) -> tuple[T, Usage]:
    """Asks for JSON matching `schema` and runs `validate` on it. A malformed or
    invalid answer gets exactly one retry with the error attached, because models
    usually fix a pointed complaint and a loop would only burn tokens. The broken
    answer itself is not sent back: it may be a cap's worth of whitespace."""
    mode = settings.structured_output
    if mode is StructuredOutput.SCHEMA:
        response_format = {
            "type": "json_schema",
            "json_schema": {"name": action, "schema": schema, "strict": True},
        }
    elif mode is StructuredOutput.JSON:
        response_format = {"type": "json_object"}
    else:
        response_format = None
    # Compact output: models that pretty-print can drift into endless indentation.
    system += "\n\nAnswer with compact JSON only, on one line, following the provided JSON Schema."
    if mode is not StructuredOutput.SCHEMA:
        system += f"\nThe JSON Schema:\n{json.dumps(schema)}"

    messages = [{"role": "system", "content": system}, {"role": "user", "content": user}]
    budget = answer_budget(user)
    usage = Usage()
    for attempt in range(2):
        text, spent = chat.complete(
            settings.model_for(action), messages, response_format, settings.extra_body, budget
        )
        usage += spent
        try:
            return validate(parse_json(text)), usage
        except (ValueError, TypeError, KeyError, ItadakiError) as err:
            if attempt:
                raise AiError(f"AI answer for {action} was unusable: {err}") from err
            retry = f"{user}\n\nAn earlier answer to this was invalid: {err}. Answer again, with valid compact JSON only."
            messages = [messages[0], {"role": "user", "content": retry}]
    raise AssertionError("unreachable")
