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
        // can word it in the UI language or react to it without parsing the message.
        const message = (err?.message || String(err)).replace(/^Validation error: /, "");
        const ours = err?.translation_domain === "itadaki";
        throw Object.assign(new Error(message), ours ? { key: err.translation_key, params: err.translation_placeholders } : {});
      }
    },
    // Calls `onUpdate({draft_id, status, recipe_id?})` whenever a draft changes;
    // resolves to a function that stops listening.
    subscribeDrafts(onUpdate) {
      return getHass().connection.subscribeMessage(onUpdate, { type: "itadaki/subscribe_drafts" });
    },
  };
}
