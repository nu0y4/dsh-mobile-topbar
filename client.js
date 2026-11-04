window.__ModuleLoader__.load({
  id: '@local/dsh-mobile-topbar',
  factory(require) {
    const PLUGIN_ID = '@local/dsh-mobile-topbar';
    /** Viewport width below which the left sidebar becomes a top bar. */
    const MAX_WIDTH = 768;
    /** Fixed bar height: the bar never grows with its content. */
    const BAR_HEIGHT = 48;
    /** Marker attributes: React owns `className`, so markers are data attributes. */
    const MARK = {
      frame: 'data-mtb-frame',
      sidebar: 'data-mtb-sidebar',
      center: 'data-mtb-center',
      rightbar: 'data-mtb-rightbar',
      bottom: 'data-mtb-bottom',
      shell: 'data-mtb-shell',
      rail: 'data-mtb-rail'
    };
    /**
     * Phone layout. The shell's three-column grid becomes one column: row 1 the
     * sidebar as a fixed-height horizontal bar, row 2 the conversation, row 3
     * the shell bottom. The sidebar column nests a transparent wrapper before
     * the element that actually holds the items, so both levels are marked and
     * both are laid out as one row; the real rail keeps no padding and no
     * margins of its own. An expanded sidebar floats over the conversation.
     */
    const CSS = `
@media (max-width: ${MAX_WIDTH}px){
[data-mtb-frame]{grid-template-columns:100% !important;grid-template-rows:${BAR_HEIGHT}px minmax(0,1fr) auto !important}
[data-mtb-sidebar]{grid-row:1 !important;grid-column:1 !important;width:100% !important;height:${BAR_HEIGHT}px !important;max-height:${BAR_HEIGHT}px !important;box-sizing:border-box !important;border-right:none !important;border-bottom:1px solid var(--dsw-alias-border-l3) !important;overflow:visible !important}
[data-mtb-center]{grid-row:2 !important;grid-column:1 !important}
[data-mtb-rightbar]{grid-row:2 !important;grid-column:1 !important;justify-self:end !important;width:0 !important}
[data-mtb-bottom]{grid-row:3 !important;grid-column:1 !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]{display:flex !important;flex-direction:row !important;align-items:center !important;width:100% !important;height:${BAR_HEIGHT}px !important;min-height:0 !important;max-height:${BAR_HEIGHT}px !important;padding:0 8px !important;margin:0 !important;gap:6px !important;box-sizing:border-box !important;overflow:visible !important;background:transparent !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>*{display:flex !important;flex-direction:row !important;align-items:center !important;align-self:center !important;height:28px !important;min-height:0 !important;max-height:28px !important;flex:0 0 auto !important;margin:0 !important;padding:0 !important;overflow:visible !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>*>*{display:flex !important;flex-direction:row !important;align-items:center !important;justify-content:center !important;height:28px !important;max-height:28px !important;flex:0 0 auto !important;margin:0 !important;padding:0 !important;overflow:visible !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>div>*>div{display:flex !important;flex-direction:row !important;align-items:center !important;justify-content:center !important;width:auto !important;min-width:0 !important;height:28px !important;max-height:28px !important;flex:0 0 auto !important;margin:0 !important;padding:0 !important;overflow:visible !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>div>*>div>*{display:flex !important;align-items:center !important;justify-content:center !important;height:28px !important;max-height:28px !important;flex:0 0 auto !important;margin:0 !important;padding:0 !important;overflow:visible !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail] svg,[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail] img{width:18px !important;height:18px !important;flex:0 0 auto !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>nav{display:flex !important;flex-direction:row !important;align-items:center !important;gap:6px !important;overflow:visible !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>nav>*{width:28px !important;min-width:28px !important;height:28px !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>button{width:28px !important;min-width:28px !important;height:28px !important;padding:0 !important;justify-content:center !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>div{gap:4px !important}
[data-mtb-frame][data-sidebar-collapsed] [data-mtb-rail]>div:last-of-type{margin-left:auto !important}
[data-mtb-frame]:not([data-sidebar-collapsed]) [data-mtb-sidebar]{position:absolute !important;left:0 !important;top:0 !important;bottom:0 !important;width:280px !important;height:auto !important;max-height:none !important;z-index:40 !important;box-shadow:0 8px 24px rgba(0,0,0,.28) !important}
}`;

    /**
     * Find the shell parts once per pass.
     * @returns {{frame: Element, sidebar: Element, center: Element|null, rightbar: Element|null, bottom: Element|null, shell: Element|null} | null} the parts.
     */
    function parts() {
      const bottom = document.querySelector('[data-shell-bottom]');
      const frame = bottom === null ? null : bottom.parentElement;
      if (frame === null) return null;
      const sidebar = frame.firstElementChild;
      if (sidebar === null) return null;
      return {
        frame,
        sidebar,
        center: frame.children[1] ?? null,
        rightbar: frame.querySelector(':scope > [data-rightbar-col]'),
        bottom,
        shell: sidebar.firstElementChild
      };
    }

    /**
     * Walk down to the element that actually holds the bar items: the sidebar
     * column nests a transparent wrapper before it, and only the inner element
     * has several children.
     * @param {Element|null} shell - the sidebar column's first child.
     * @returns {Element|null} the rail element.
     */
    function descend(shell) {
      let node = shell;
      for (let depth = 0; depth < 6 && node !== null; depth += 1) {
        if (node.children.length >= 3) return node;
        node = node.firstElementChild;
      }
      return shell;
    }

    /**
     * Attach a marker attribute once.
     * @param {Element|null} element - target element.
     * @param {string} name - attribute name.
     * @returns {void}
     */
    function tag(element, name) {
      if (element === null || element === undefined) return;
      if (element.hasAttribute(name)) return;
      element.setAttribute(name, '');
    }

    /**
     * Mark every shell part the stylesheet addresses.
     * @returns {void}
     */
    function mark() {
      const found = parts();
      if (found === null) return;
      tag(found.frame, MARK.frame);
      tag(found.sidebar, MARK.sidebar);
      tag(found.center, MARK.center);
      tag(found.rightbar, MARK.rightbar);
      tag(found.bottom, MARK.bottom);
      tag(found.shell, MARK.shell);
      tag(descend(found.shell), MARK.rail);
    }

    /**
     * Compact description of one element.
     * @param {Element} el - the element to describe.
     * @returns {object} the description.
     */
    function describe(el) {
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return {
        t: el.tagName.toLowerCase().slice(0, 4),
        n: el.children.length,
        c: String(el.className || '').slice(0, 36),
        w: Math.round(box.width),
        h: Math.round(box.height),
        d: cs.display.slice(0, 9),
        f: cs.flexDirection.slice(0, 10),
        p: cs.padding.slice(0, 20)
      };
    }

    /**
     * Describe the phone layout for diagnosis.
     * @returns {object|null} the snapshot.
     */
    function snapshot() {
      const found = parts();
      if (found === null) return null;
      const rail = descend(found.shell);
      const kids = (el) => (el === null ? [] : Array.from(el.children).slice(0, 8).map(describe));
      return {
        vw: window.innerWidth,
        vh: window.innerHeight,
        frame: describe(found.frame),
        cols: kids(found.frame),
        rail: rail === null ? null : describe(rail),
        bar: kids(rail)
      };
    }

    /**
     * Report the snapshot through client-service method names, base64 chunked.
     * @param {object} ctx - client plugin context.
     * @param {object} data - the snapshot.
     * @returns {void}
     */
    function report(ctx, data) {
      if (typeof ctx.provide !== 'function') return;
      let encoded;
      try {
        encoded = btoa(JSON.stringify(data));
      } catch {
        return;
      }
      const size = 180;
      const chunks = [];
      for (let index = 0; index < encoded.length && chunks.length < 40; index += size) {
        chunks.push(encoded.slice(index, index + size));
      }
      try {
        const face = {};
        chunks.forEach((chunk, index) => {
          face[`p${String(index).padStart(2, '0')}_${chunk}`] = () => {};
        });
        ctx.provide('mtbProbe', face);
      } catch {
        /* optional channel */
      }
    }

    return {
      inject: [],
      /**
       * Install the stylesheet, keep the markers current, report one snapshot.
       * @param {object} ctx - client plugin context.
       * @returns {void}
       */
      apply(ctx) {
        ctx.effect(() => {
          const style = document.createElement('style');
          style.dataset.plugin = PLUGIN_ID;
          style.textContent = CSS;
          document.head.appendChild(style);
          return () => {
            style.remove();
          };
        }, 'mobile-topbar: stylesheet');
        ctx.effect(() => {
          let pending = 0;
          const schedule = () => {
            if (pending !== 0) return;
            pending = requestAnimationFrame(() => {
              pending = 0;
              try {
                mark();
              } catch {
                /* never break the page for a marker */
              }
            });
          };
          schedule();
          const observer = new MutationObserver(schedule);
          observer.observe(document.documentElement, { childList: true, subtree: true });
          window.addEventListener('resize', schedule);
          const timer = window.setTimeout(() => {
            try {
              mark();
              const data = snapshot();
              if (data !== null) report(ctx, data);
            } catch {
              /* diagnosis is best effort */
            }
          }, 1500);
          return () => {
            observer.disconnect();
            window.removeEventListener('resize', schedule);
            window.clearTimeout(timer);
            if (pending !== 0) cancelAnimationFrame(pending);
          };
        }, 'mobile-topbar: markers');
      }
    };
  }
});
