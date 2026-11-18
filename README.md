# Itadaki

A multilingual recipe app for Home Assistant. Keep recipes in any language, import them
from recipe sites, scale them, send ingredients to your shopping list, and translate or
adapt them with an optional AI provider.

![Recipe list](docs/images/recipes.png)

## Install

[![Add to HACS](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=vinjex&repository=itadaki&category=integration)

1. Click the button above, or in HACS open ⋮ → Custom repositories and add
   `https://github.com/vinjex/itadaki` as an Integration.
2. Download Itadaki in HACS and restart Home Assistant.
3. Add the integration:

   [![Add integration](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=itadaki)

Itadaki then appears in the sidebar. Requires Home Assistant 2026.10 or newer.

## Documentation

- [Getting started](docs/getting-started.md)
- [Recipes](docs/recipes.md) and [finding them](docs/finding-recipes.md)
- [Importing from the web](docs/import.md)
- [AI](docs/ai.md), and [reviewing what it drafts](docs/review.md)
- [Translations and variants](docs/translations.md)
- [Ingredients, units and tags](docs/catalogs.md)
- [Shopping list](docs/shopping-list.md)
- [Photos and storage](docs/storage.md)
- [Automations and MCP](docs/automation.md)

## License

[MIT](LICENSE)
