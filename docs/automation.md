# Automations and MCP

Everything the panel does is also a Home Assistant action in the `itadaki` domain, and every
action returns its result. That makes the whole library available to scripts, automations
and AI assistants.

Developer tools → Actions lists every Itadaki action with its fields and a description. A
few examples:

| Action | What it does |
|---|---|
| `itadaki.list_recipes` | Recipe summaries, filtered by text, language or tags |
| `itadaki.get_recipe` | A full recipe, scaled if asked |
| `itadaki.create_recipe`, `itadaki.update_recipe` | Write recipes |
| `itadaki.import_url` | Import a recipe page into the drafts inbox |
| `itadaki.translate`, `itadaki.adapt` | Start AI work; each returns draft ids |
| `itadaki.shopping_items`, `itadaki.add_to_shopping_list` | Turn a recipe into to-do items |

For example, a script that puts tonight's recipe on the shopping list:

```yaml
sequence:
  - action: itadaki.list_recipes
    data:
      query: Ratatouille
    response_variable: found
  - action: itadaki.shopping_items
    data:
      recipe_id: "{{ found.recipes[0].id }}"
    response_variable: shopping
  - action: itadaki.add_to_shopping_list
    data:
      list: todo.shopping_list
      items: "{{ shopping['items'] }}"
```

AI actions run in the background: they return draft ids at once, and `itadaki.get_draft`
tells when a draft is ready. Actions that change settings or catalogs are refused for
non-admin users, as in the panel.

## MCP: letting an AI assistant manage recipes

Because every operation is an action that returns data, an MCP server for Home Assistant that
can call actions gives an AI assistant (Claude, ChatGPT, a local model) full access to your
library. [ha-mcp](https://github.com/homeassistant-ai/ha-mcp) is one such server; follow its
instructions to connect it to Home Assistant and to your assistant.

Then ask in plain words, for example:

- "Add the recipe at this link to Itadaki and match its ingredients."
- "Which of my recipes are vegetarian and take under 30 minutes?"
- "Translate my newest recipe into Japanese."
- "Merge the duplicate ingredients 'scallion' and 'green onion'."

The action descriptions tell the assistant how each one works. An assistant can save AI
drafts directly, or leave them in the inbox for you to review in the panel.
