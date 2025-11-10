// nav-active.js
(() => {
  // Global CSS fixes injected on every page to prevent text overflow
  try {
    const style = document.createElement('style');
    style.setAttribute('data-global-fixes', 'true');
    style.textContent = `
      /* Ensure padding/border are counted in width to avoid spillover */
      *, *::before, *::after { box-sizing: border-box; }

      /* Keep media inside their containers */
      img, video, canvas, svg, iframe { max-width: 100%; height: auto; }

      /* Wrap long words/URLs so text stays inside its box on all pages */
      p, li, h1, h2, h3, h4, h5, h6, blockquote, figcaption {
        overflow-wrap: anywhere; /* modern */
        word-break: break-word;  /* fallback */
        hyphens: auto;
      }

      /* Common content ids/classes used across pages */
      #content-text { white-space: normal; }

      /* Navigation dropdown panels: force wrapping and safe sizing */
      nav .relative.group > .absolute,
      nav .group .absolute.left-0,
      nav .group .absolute.left-full {
        white-space: normal !important;
        overflow-wrap: anywhere;
        word-break: break-word;
        hyphens: auto;
        z-index: 50;
        width: max-content;
        min-width: 14rem; /* ~min-w-56 */
        max-width: 20rem; /* ~max-w-xs */
      }

      /* Multi-line row support: keep label+arrow aligned when wrapping */
      nav .group .absolute button { align-items: flex-start !important; gap: 0.75rem; }
      nav .group .absolute button span { white-space: normal !important; }

      /* Top-level nav arrows (desktop + mobile): unify size and prevent shrinking */
      nav .relative.group > button > svg,
      nav button.mobile-dropdown-toggle > svg {
        width: 1rem !important; /* ~h-4 */
        height: 1rem !important; /* ~w-4 */
        flex: 0 0 auto;
        margin-left: 0.25rem; /* ~ml-1 */
      }

    `;
    document.head && document.head.appendChild(style);
  } catch (_) { /* no-op */ }

  // Cache DOM elements and computed values
  let cachedElements = null;
  let cachedPathname = '';

  // Normalize strings: remove extra spaces, trim, lowercase
  const norm = s => s.replace(/\s+/g, " ").trim().toLowerCase();

  // Apply active styles
  const addActive = (el, isSub = false) => {
    if (!el) return;
    if (isSub) {
      el.classList.add("text-red-600", "font-semibold"); // Sub-menu style
    } else {
      el.classList.add("border-b-2", "border-red-600", "pb-1"); // Top-level style
    }
  };

  // Cache nav elements
  const getCachedElements = () => {
    if (!cachedElements) {
      cachedElements = {
        desktopButtons: Array.from(document.querySelectorAll('nav .relative.group > button')),
        mobileButtons: Array.from(document.querySelectorAll('nav button.mobile-dropdown-toggle')),
        navLinks: Array.from(document.querySelectorAll('nav a[href]'))
      };
    }
    return cachedElements;
  };

  // Highlight buttons by label
  // Highlight buttons by label
const highlightByLabel = (label, elements) => {
  const wanted = norm(label);

  // Desktop buttons
  for (const btn of elements.desktopButtons) {
    const span = btn.querySelector("span");
    const text = norm(span ? span.textContent : btn.textContent);
    if (text === wanted) {
      addActive(btn);
      // removed break to allow multiple matches
    }
  }

  // Mobile buttons
  for (const btn of elements.mobileButtons) {
    const text = norm(btn.textContent);
    if (text.startsWith(wanted)) {
      addActive(btn);
      // removed break to allow multiple matches
    }
  }
};

// Highlight links by matcher function
const highlightLinks = (matcher, links, isSub = false) => {
  const origin = location.origin;

  for (const a of links) {
    const href = a.getAttribute('href');
    try {
      const u = new URL(href, origin);
      if (matcher(u)) {
        // Special-case: when an "about" subpage (company profile, terms) matches,
        // prefer highlighting the parent "About us" button instead of underlining the sub-link.
        const path = (u.pathname || '').toLowerCase();
        const isAboutSubpage = path.includes('/about-') || (path.includes('/about') && !path.endsWith('/about.html'));
        if (isAboutSubpage) {
          // Find parent group button (desktop) or mobile parent (if any)
          const parentGroup = a.closest('.relative.group');
          if (parentGroup) {
            const parentBtn = parentGroup.querySelector('button');
            if (parentBtn) {
              addActive(parentBtn, false);
              continue; // don't add active to the link itself
            }
          }
        }

        addActive(a, isSub);
        // removed break to allow multiple links to be highlighted
      }
    } catch (_) {}
  }
};


  // Main runner
  const run = () => {
    const currentPathname = location.pathname;
    const currentSearch = location.search;

    // Return if already processed this path + query
    if (currentPathname + currentSearch === cachedPathname) return;

    cachedPathname = currentPathname + currentSearch;
    const p = currentPathname.toLowerCase();
    const elements = getCachedElements();

    // Clear previous active states
    elements.desktopButtons.forEach(btn => btn.classList.remove("border-b-2", "border-red-600", "pb-1"));
    elements.mobileButtons.forEach(btn => btn.classList.remove("border-b-2", "border-red-600", "pb-1"));
    elements.navLinks.forEach(link => link.classList.remove("border-b-2", "border-red-600", "pb-1", "text-red-600", "font-semibold"));

    // Home page
    if (p.endsWith('/index.html') || p === '/' || p.endsWith('/')) {
      highlightLinks(u => {
        const path = u.pathname;
        return path === '/' || path.endsWith('/index.html') || path.endsWith('/');
      }, elements.navLinks);
      return;
    }

    // Top-level sections
    const pathChecks = [
      ['/pages/ethiopia.html', 'Ethiopia'],
      ['/pages/attraction.html', 'Attractions'],
      ['/pages/activities.html', 'Activities'],
      ['/pages/tailormadetour.html', 'Tailor-made Tours'],
      ['/pages/tourfinal.html', 'Tour Packages'],
      ['/pages/about.html', 'About us'],
      ['/pages/contact.html', 'Contact']
    ];

    // Handle query-based sub-links
// Handle query-based sub-links dynamically
const handleQueryHighlight = (currentPath, currentSearch, elements) => {
  const params = new URLSearchParams(currentSearch);
  let key;

  if (currentPath.includes('/pages/tourfinal.html')) {
    key = 'category';
  } else if (currentPath.includes('/pages/tailormadetour.html')) {
    key = 'tour';
  } else if (currentPath.includes('/pages/about.html')) {
    key = 'tab';
  } else {
    key = 'section';
  }

  const value = params.get(key);
  if (value) {
    highlightLinks(
      u => u.searchParams.get(key) === value,
      elements.navLinks,
      true // mark as subchild
    );
  }
};


   for (const [path, label] of pathChecks) {
  if (p.includes(path)) {
    // Contact uses direct link highlight
    if (path === '/pages/contact.html') {
      highlightLinks(
        u => u.pathname.toLowerCase().includes('/pages/contact.html'),
        elements.navLinks
      );
    } else {
      // Highlight top-level button/link
      highlightByLabel(label, elements);

      // Determine query key based on page
      let queryKey;
      if (path.includes('/pages/tourfinal.html')) queryKey = 'category';
      else if (path.includes('/pages/tailormadetour.html')) queryKey = 'tour';
      else if (path.includes('/pages/about.html')) queryKey = 'tab';
      else queryKey = 'section';

      // Highlight sub-links if query exists
      const params = new URLSearchParams(currentSearch);
      const value = params.get(queryKey);
      if (value) {
        highlightLinks(
          u => u.searchParams.get(queryKey) === value,
          elements.navLinks,
          true // mark as subchild
        );
      }
    }

    return; // stop checking further paths
  }
}




    // Fallback: match current file name
    const lastSlash = p.lastIndexOf('/');
    if (lastSlash !== -1) {
      const file = p.substring(lastSlash + 1);
      if (file) {
        highlightLinks(u => {
          const uPath = u.pathname.toLowerCase();
          return uPath.endsWith('/' + file) || uPath.includes(file);
        }, elements.navLinks);
      }
    }
  };

  // Observe dynamic content
  let observer;

  document.addEventListener('DOMContentLoaded', () => {
    run();

    observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          cachedElements = null;
          run();
          break;
        }
      }
    });

    const nav = document.querySelector('nav');
    if (nav) {
      observer.observe(nav, { childList: true, subtree: true });
    }
  });

  window.addEventListener('beforeunload', () => {
    if (observer) observer.disconnect();
  });

  window.addEventListener('popstate', run);
})();
