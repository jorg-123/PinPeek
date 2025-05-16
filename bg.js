const MAX = 5000;

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'getPins') {
    chrome.storage.session.get('pins').then(x => {
      sendResponse({ pins: x.pins || {} });
    });
    return true;
  }

  if (msg.type === 'pinDatesDelta') {
    chrome.storage.session.get('pins').then(store => {
      const map = new Map(Object.entries(store.pins || {}));
      let dirty = false;

      for (const [id, ts] of Object.entries(msg.data)) {
        if (!map.has(id)) {
          map.set(id, ts);
          dirty = true;
        }
      }

      while (map.size > MAX) {
        map.delete(map.keys().next().value);
      }

      if (dirty) {
        chrome.storage.session.set({ pins: Object.fromEntries(map) });
      }
    });
  }

  if (msg.type === 'clearPins') {
    chrome.storage.session.remove('pins').then(() => sendResponse());
    return true;
  }
});
