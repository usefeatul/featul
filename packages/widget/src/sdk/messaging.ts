export const messagingSource = String.raw`
  function post(type, payload) {
    if (!state.iframe || !state.iframe.contentWindow) return;
    state.iframe.contentWindow.postMessage({
      source: "featul-widget",
      type: type,
      payload: payload || {}
    }, baseUrl);
  }

  function flush() {
    while (state.queue.length) {
      var item = state.queue.shift();
      post(item.type, item.payload);
    }
  }

  function enqueue(type, payload) {
    if (state.ready) post(type, payload);
    else state.queue.push({ type: type, payload: payload });
  }
`;
