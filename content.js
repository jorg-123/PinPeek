(() => {
  function isUserContext(path) {
    const seg = path.split('/').filter(Boolean);
    if (!seg.length) return false;
    const global = [
      'pin','pins','ideas','topic','search',
      'login','signup','settings','_'
    ];
    return !global.includes(seg[0]);
  }

  async function getInitData() {
    const prefsP = chrome.storage.sync.get(['showGrid','style','corner']);
    const pinsP = chrome.runtime.sendMessage({ type: 'getPins' });
    const [prefs, pinsResp] = await Promise.all([prefsP, pinsP]);

    return {
      prefs: {
        showGrid: prefs.showGrid ?? true,
        style: prefs.style || 'absolute',
        corner: prefs.corner || 'bl'
      },
      pins: pinsResp?.pins || {}
    };
  }

  async function injectHook() {
    if (document.getElementById('pinpeek-hook')) return;

    const data = await getInitData();

    const blob = document.createElement('script');
    blob.id = 'pinpeek-data';
    blob.type = 'application/json';
    blob.textContent = JSON.stringify(data);
    document.documentElement.appendChild(blob);

    const s = document.createElement('script');
    s.id = 'pinpeek-hook';
    s.src = chrome.runtime.getURL('pagehook.js');
    document.documentElement.appendChild(s);
  }

  chrome.storage.onChanged.addListener(changes => {
    const delta = {};
    if (changes.showGrid) delta.showGrid = changes.showGrid.newValue;
    if (Object.keys(delta).length) {
      document.dispatchEvent(new CustomEvent('pinpeek:updatePrefs', { detail: delta }));
    }
  });

  let lastPath = '';
  function checkPath() {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      if (isUserContext(lastPath)) injectHook();
    }
  }

  checkPath();
  addEventListener('popstate', checkPath, true);
  ['pushState','replaceState'].forEach(fn => {
    const orig = history[fn];
    history[fn] = function (...args) {
      const out = orig.apply(this, args);
      checkPath();
      return out;
    };
  });
})();
