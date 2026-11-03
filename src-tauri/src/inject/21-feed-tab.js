// Adds a compact Facebook News Feed tab alongside Messenger in fMess.
// The tab is intentionally a route link: Facebook remains responsible for the
// feed's posts, reactions, comments, and account/session state.
(() => {
  if (window.top !== window || window.__fmessFeedTabInstalled) return;
  window.__fmessFeedTabInstalled = true;

  const STYLE_ID = 'fmess-feed-tab-style';
  const TAB_ID = 'fmess-feed-tab';
  const onMessenger = () => /^\/(messages|messenger_media)(\/|$)/.test(location.pathname);
  const onFeed = () => location.pathname === '/' || /^\/(home|feed)(\/|$)/.test(location.pathname);

  const installStyle = () => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #${TAB_ID} {
        position: fixed; z-index: 2147483000; top: calc(var(--header-height, 56px) + 12px);
        right: 18px; display: inline-flex; align-items: center; gap: 8px;
        min-height: 38px; padding: 0 15px; border-radius: 8px;
        color: var(--tm-fg1, var(--primary-text, #242424));
        background: var(--tm-card, var(--surface-background, #fff));
        border: 1px solid var(--tm-stroke, var(--divider, #d1d1d1));
        box-shadow: 0 2px 8px rgba(0,0,0,.12); text-decoration: none;
        font: 600 14px/1.2 inherit; cursor: pointer;
      }
      #${TAB_ID}:hover { background: var(--tm-bg3, var(--hover-overlay, #f2f2f2)); }
      #${TAB_ID} svg { width: 18px; height: 18px; flex: none; }
      html[data-fmess-chats] #${TAB_ID} { top: calc(var(--fmess-title-bar, 0px) + 12px); }
      @media (max-width: 600px) { #${TAB_ID} { right: 10px; } }
    `;
    (document.head || document.documentElement).append(style);
  };


  const createTab = () => {
    installStyle();
    let tab = document.getElementById(TAB_ID);
    if (!onMessenger() && !onFeed()) {
      tab?.remove();
      return;
    }
    if (!tab) {
      tab = document.createElement('a');
      tab.id = TAB_ID;
      tab.setAttribute('role', 'button');
      tab.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none"><path d="M4 5.5h16v13H4z" stroke="currentColor" stroke-width="1.8"/><path d="M4 9h16M8 5.5v13" stroke="currentColor" stroke-width="1.5"/></svg><span></span>`;
      document.body.append(tab);
    }
    const feed = onMessenger();
    tab.href = feed ? '/' : '/messages';
    tab.querySelector('span').textContent = feed ? 'News Feed' : 'Messenger';
    tab.setAttribute('aria-label', feed ? 'Open Facebook News Feed' : 'Open Messenger');
    tab.title = feed ? 'Open Facebook News Feed' : 'Open Messenger';
  };

  const schedule = () => setTimeout(createTab, 250);
  const originalPush = history.pushState;
  const originalReplace = history.replaceState;
  history.pushState = function (...args) { const result = originalPush.apply(this, args); schedule(); return result; };
  history.replaceState = function (...args) { const result = originalReplace.apply(this, args); schedule(); return result; };
  window.addEventListener('popstate', schedule);
  window.addEventListener('load', schedule);
  new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  schedule();
})();
