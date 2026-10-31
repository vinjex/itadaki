// The only part of the panel that knows where the backend lives. Inside Home
// Assistant every call is an Itadaki action over HA's websocket; a standalone
// backend later only needs another object with the same `call`.
export function hassTransport(getHass) {
  return {
    async call(action, data = {}) {
      try {
        const result = await getHass().callWS({
          type: "call_service",
          domain: "itadaki",
          service: action,
          service_data: data,
          return_response: true,
        });
        return result.response;
      } catch (err) {
        // `key` names the kind of refusal, when the backend gives one, so screens
        // can react to a specific one without parsing the message.
        throw Object.assign(new Error(err?.message || String(err)), { key: err?.translation_key });
      }
    },
    // Calls `onUpdate({draft_id, status, recipe_id?})` whenever a draft changes;
    // resolves to a function that stops listening.
    subscribeDrafts(onUpdate) {
      return getHass().connection.subscribeMessage(onUpdate, { type: "itadaki/subscribe_drafts" });
    },
  };
}
