from pathlib import Path

CORE = Path(__file__).parents[2] / "custom_components" / "itadaki" / "core"


def test_core_never_imports_home_assistant():
    offenders = [p.name for p in CORE.glob("*.py") if "homeassistant" in p.read_text()]
    assert offenders == []
