import json

from core.models import Usage


class FakeChat:
    """Replays queued answers and records what was sent."""

    def __init__(self, *answers):
        self.answers = list(answers)
        self.calls = []

    def complete(self, model, messages, response_format, extra_body, max_tokens):
        self.calls.append(
            {
                "model": model,
                "messages": messages,
                "response_format": response_format,
                "extra_body": extra_body,
                "max_tokens": max_tokens,
            }
        )
        answer = self.answers.pop(0)
        return (answer if isinstance(answer, str) else json.dumps(answer, ensure_ascii=False)), Usage(10, 5)

    def sent(self, call=-1):
        return self.calls[call]["messages"][-1]["content"]


def line(name, plural=None, quantity=None, unit=None, note=None, section=None):
    return {
        "name": name,
        "plural": plural,
        "quantity": quantity,
        "unit": unit,
        "note": note,
        "section": section,
    }


def names(*entries):
    """A naming answer: each entry maps language -> name."""
    return {"names": [{lang: {"name": n, "plural": None} for lang, n in e.items()} for e in entries]}
