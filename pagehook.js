(() => {
  const init = JSON.parse(
    document.getElementById('pinpeek-data')?.textContent || '{}'
  );

  const prefs = {
    showGrid: true,
    style:    'absolute',
    corner:   'bl',
    ...init.prefs
  };
  const pinDates = new Map(Object.entries(init.pins || {}));
  const MAX_PINS = 5000;

  document.addEventListener('pinpeek:updatePrefs', e => {
    const d = e.detail || {};
    if ('showGrid' in d && d.showGrid !== prefs.showGrid) {
      prefs.showGrid = d.showGrid;
      if (!prefs.showGrid) removeGridBadges();
      else labelGrid();
    }
  });

  const pinApiRE = /\/resource\/(?:UserPins|BoardFeed|BoardSectionPins|RelatedPins|PinFeed)Resource\/get\//;
  const realFetch = window.fetch;
  window.fetch = async function (...args) {
    const url  = String(args[0] ?? '');
    const resp = await realFetch.apply(this, args);
    if (pinApiRE.test(url)) resp.clone().json().then(harvest).catch(()=>{});
    return resp;
  };

  const open0 = XMLHttpRequest.prototype.open;
  const send0 = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m,u,...r){
    this.__pinpeekURL = u;
    return open0.call(this,m,u,...r);
  };
  XMLHttpRequest.prototype.send = function(b){
    this.addEventListener('readystatechange',()=>{
      if (this.readyState===4 && pinApiRE.test(this.__pinpeekURL||'')) {
        try { harvest(JSON.parse(this.responseText)); } catch(_){}
      }
    });
    return send0.call(this,b);
  };

  function harvest(obj) {
    const pins = obj?.resource_response?.data;
    if (!Array.isArray(pins)) return;

    const delta = Object.create(null);
    pins.forEach(p => {
      if (p.id && p.created_at && !pinDates.has(p.id)) {
        pinDates.set(p.id, p.created_at);
        delta[p.id] = p.created_at;
        while (pinDates.size > MAX_PINS)
          pinDates.delete(pinDates.keys().next().value);
      }
    });
    if (Object.keys(delta).length) {
      dispatchEvent(new CustomEvent('pinpeek:newPins', { detail: delta }));
    }
  }

  const relFmt = new Intl.RelativeTimeFormat(
    document.documentElement.lang || navigator.language || 'en-US',
    { numeric:'auto' }
  );
  function fmt(ts){
    if (prefs.style==='relative') {
      const diff = Date.now()-ts;
      const m=Math.round(diff/60000);
      if(m<60)     return relFmt.format(-m,'minute');
      const h=Math.round(m/60);
      if(h<24)     return relFmt.format(-h,'hour');
      const d=Math.round(h/24);
      if(d<30)     return relFmt.format(-d,'day');
    }
    return new Intl.DateTimeFormat(
      document.documentElement.lang || navigator.language || 'en-US',
      { dateStyle:'medium' }
    ).format(new Date(ts));
  }
  const cornerCSS = c => ({
    bl:'left:6px; bottom:6px;',
    br:'right:6px; bottom:6px;',
    tl:'left:6px; top:6px;',
    tr:'right:6px; top:6px;'
  }[c]||'left:6px; bottom:6px;');

  function labelGrid() {
    if (!prefs.showGrid) return;
    document.querySelectorAll('div[data-test-id=\'pin\']').forEach(pinEl=>{
      if (pinEl.querySelector('.pin-date-label')) return;

      const link = pinEl.querySelector('a[href*="/pin/"]');
      const id   = link?.href.match(/\/pin\/(\d+)\//)?.[1];
      if (!id) return;

      const ts = pinDates.get(id);
      if (!ts) return;

      const badge = document.createElement('div');
      badge.className='pin-date-label';
      badge.textContent='🕑 ' + fmt(ts);
      badge.style.cssText=
        `
        position:absolute; ${cornerCSS(prefs.corner)};
        padding:2px 6px; font:12px/14px sans-serif;
        background:rgba(255,255,255,.85); color:#333;
        border-radius:4px; pointer-events:none; z-index:30;
      `;

      const anchor = pinEl.querySelector('img')?.parentElement || pinEl;
      anchor.style.position='relative';
      anchor.appendChild(badge);
    });
  }

  function removeGridBadges(){
    document.querySelectorAll('.pin-date-label').forEach(e=>e.remove());
  }
  setInterval(()=>{ labelGrid() },1200);
})();
