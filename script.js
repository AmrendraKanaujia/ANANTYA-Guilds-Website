/* ==========================================================================
   script.js  —  THE "MOVING PARTS" OF THE SITE
   --------------------------------------------------------------------------
   You normally do NOT need to edit this file.
   Everything you would want to change (links, names, images, speeds, languages)
   lives in:
       config.js  images.js  leaders.js  members.js  slides.js  translations.js
   ========================================================================== */

(function () {
  "use strict";

  const CFG = SITE_CONFIG;                                   // settings from config.js
  const TCFG = (typeof TRANSLATION_CONFIG !== "undefined") ? TRANSLATION_CONFIG : {
    languages: [{ code: "en", name: "English", tagline: "Belong to Infinity", description: "Default language." }],
    protectedTerms: [],
    manualTranslations: {}
  };

  const $  = (selector, parent = document) => parent.querySelector(selector);       // find ONE element
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)]; // find ALL elements


  /* ========================================================================
     1. SMALL HELPER FUNCTIONS
     ======================================================================== */

  // Turn every capital "A" into "Λ" (if switched on in config.js)
  function lambdaify(text) {
    return CFG.useLambda ? String(text).replace(/A/g, "Λ") : String(text);
  }

  // Make text safe to put inside the page (so a "<" typed in a name cannot break the layout)
  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // Safe text + Λ replacement. Used for everything that comes from the data files.
  function txt(text) { return lambdaify(esc(text)); }

  // Only allow normal web links (blocks "javascript:" tricks). Returns "" if not allowed.
  function safeUrl(url) {
    url = String(url || "").trim();
    return /^https?:\/\//i.test(url) ? esc(url) : "";
  }

  // Add the "AN • " prefix to a name (once). Keep capital A in source; lambdaify handles display.
  function displayName(name) {
    name = String(name || "").trim();
    const rawPrefix = String(CFG.namePrefix || "").replace(/Λ/g, "A");
    if (!rawPrefix || /^(Λ|A)N\s*•/.test(name)) return name;
    return rawPrefix + name;
  }

  // Cloudinary users: if the link is a Cloudinary link, ask for a smaller, optimised copy
  function optimise(url, width) {
    if (url.includes("res.cloudinary.com") && url.includes("/upload/") && !url.includes("f_auto")) {
      return url.replace("/upload/", "/upload/f_auto,q_auto,w_" + width + "/");
    }
    return url;
  }

  // Find an image link in images.js. kind = "leaders" | "members" | "moments".
  function imageUrl(kind, id, width) {
    let url = (IMAGES[kind] || {})[id] || "";
    if (!url) return "";
    const isFullLink = /^(https?:)?\/\//.test(url) || url.indexOf("data:") === 0;
    if (!isFullLink) url = (CFG.imageBaseUrl || "") + url;      // plain file name -> add the folder address
    return optimise(url, width);
  }

  // Coloured placeholder picture with the first letter (used when there is no image or it fails to load)
  function placeholder(name) {
    const letter = esc(lambdaify((String(name || "?").trim().charAt(0) || "?").toUpperCase()));
    let hash = 0;
    for (const ch of String(name)) hash = (hash * 31 + ch.charCodeAt(0)) % 360;
    const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 70'><rect width='100' height='70' fill='hsl(" + hash + ",30%,46%)'/><text x='50' y='36' dy='.35em' text-anchor='middle' font-family='Arial,sans-serif' font-size='34' fill='white'>" + letter + "</text></svg>";
    return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
  }

  // Random shuffle (Fisher–Yates). Returns the same array in random order.
  function shuffle(list) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  // Apply capital "A" -> "Λ" across any subtree (excluding script/style/language-menu)
  function applyLambdaTree(rootEl) {
    if (!CFG.useLambda || !rootEl) return;
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        if (parent.closest && (parent.closest("#languageMenu") || parent.closest("#navLanguageSublist"))) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => {
      if (node._origText === undefined) node._origText = node.nodeValue;
      const target = node._translatedText !== undefined ? node._translatedText : node._origText;
      const converted = lambdaify(target);
      if (node.nodeValue !== converted) node.nodeValue = converted;
    });

    const elements = rootEl.querySelectorAll ? [rootEl, ...rootEl.querySelectorAll("[aria-label],[title],[alt]")] : [];
    elements.forEach(el => {
      if (!el.hasAttribute) return;
      ["aria-label", "title", "alt"].forEach(attr => {
        if (!el.hasAttribute(attr)) return;
        const key = "_orig_" + attr;
        if (el[key] === undefined) el[key] = el.getAttribute(attr);
        const tKey = "_trans_" + attr;
        const base = el[tKey] !== undefined ? el[tKey] : el[key];
        el.setAttribute(attr, lambdaify(base));
      });
    });
  }


  /* ========================================================================
     1B. FREE WEBSITE TRANSLATION ENGINE (MyMemory + LibreTranslate Fallback)
     ======================================================================== */
  let activeLangCode = "en";
  let popupDismissedForSession = false;
  let activeErrorReason = "";
  let translationHaltedForLimit = false;
  const translationCache = {};
  try {
    const storedCache = JSON.parse(localStorage.getItem("anantya-trans-cache") || "{}");
    Object.assign(translationCache, storedCache);
  } catch (e) { /* ignore storage restrictions */ }

  function saveTranslationCache() {
    try {
      localStorage.setItem("anantya-trans-cache", JSON.stringify(translationCache));
    } catch (e) { /* ignore quota/storage errors */ }
  }

  function showTranslationErrorPopup(reason, forceShow) {
    const popup = document.getElementById("translationErrorPopup");
    const reasonEl = document.getElementById("translationErrorReason");
    const closeBtn = document.getElementById("closeTranslationError");
    if (!popup) return;

    const cleanReason = reason || "Unable to reach the translation service.";
    if (forceShow) {
      popupDismissedForSession = false;
    }

    // Do not reopen if the user already closed it for the same error
    if (popupDismissedForSession && !forceShow && activeErrorReason === cleanReason) {
      return;
    }

    activeErrorReason = cleanReason;

    const discordLink = popup.querySelector("[data-discord]");
    if (discordLink && CFG.discordUrl) {
      discordLink.href = CFG.discordUrl;
      discordLink.target = "_blank";
      discordLink.rel = "noopener";
    }

    if (reasonEl) {
      reasonEl.textContent = "Reason: " + cleanReason;
    }

    popup.hidden = false;

    if (closeBtn) {
      closeBtn.onclick = () => {
        popup.hidden = true;
        popupDismissedForSession = true;
      };
    }
  }

  // Build full list of protected strings (names from leaders/members + config protectedTerms)
  const allProtectedTerms = (function () {
    const set = new Set([
      ...(TCFG.doNotTranslate || []),
      ...(TCFG.protectedTerms || [])
    ]);
    (typeof LEADERS !== "undefined" ? LEADERS : []).forEach(l => {
      if (l.name) {
        set.add(l.name);
        set.add(displayName(l.name));
      }
    });
    (typeof MEMBERS !== "undefined" ? MEMBERS : []).forEach(m => {
      if (m.name) {
        set.add(m.name);
        set.add(displayName(m.name));
      }
    });
    // Sort longest first so multi-word phrases match before single words
    return [...set].filter(Boolean).sort((a, b) => b.length - a.length);
  })();

  function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  // Mask manual translations and protected terms with tokens before calling translation API
  function protectText(rawText, langCode) {
    let text = String(rawText);
    const tokens = [];
    const manualMap = (TCFG.manualTranslations && TCFG.manualTranslations[langCode]) || {};

    // 1. Apply manual human translations first (longest keys first)
    const manualKeys = Object.keys(manualMap).sort((a, b) => b.length - a.length);
    manualKeys.forEach(key => {
      if (!key) return;
      const rx = new RegExp(escapeRegex(key), "g");
      if (rx.test(text)) {
        text = text.replace(rx, () => {
          const id = "⟦M" + tokens.length + "⟧";
          tokens.push({ id, value: manualMap[key] });
          return id;
        });
      }
    });

    // 2. Protect exact names, guild names, and game titles from literal translation
    allProtectedTerms.forEach(term => {
      const rx = new RegExp(escapeRegex(term), "g");
      if (rx.test(text)) {
        text = text.replace(rx, match => {
          const id = "⟦P" + tokens.length + "⟧";
          tokens.push({ id, value: match });
          return id;
        });
      }
    });

    return { masked: text, tokens };
  }

  function restoreText(translatedText, tokens) {
    let out = String(translatedText);
    tokens.forEach(t => {
      const flexRx = new RegExp(escapeRegex(t.id).replace("⟦", "⟦\\s*").replace("⟧", "\\s*⟧"), "g");
      out = out.replace(flexRx, t.value);
    });
    return out;
  }

  async function tryLibreTranslate(maskedText, targetLang) {
    const endpoint = (TCFG.libreTranslateUrl) || "https://libretranslate.com/translate";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: maskedText,
        source: "en",
        target: targetLang,
        format: "text"
      })
    });
    if (!res.ok) {
      throw new Error("LibreTranslate fallback failed with status " + res.status + ".");
    }
    const data = await res.json();
    const out = data && data.translatedText ? String(data.translatedText) : "";
    if (!out) {
      throw new Error("LibreTranslate fallback returned an empty response.");
    }
    return out;
  }

  async function fetchFreeTranslation(text, targetLang) {
    const trimmed = text.trim();
    if (!trimmed || targetLang === "en") return text;

    const cacheKey = targetLang + "::" + trimmed;
    if (translationCache[cacheKey]) {
      return text.replace(trimmed, translationCache[cacheKey]);
    }

    const { masked, tokens } = protectText(trimmed, targetLang);
    const stripped = masked.replace(/⟦[MP]\d+⟧/g, "").replace(/[\s·—\-–:,.;!?()0-9/]+/g, "");
    if (!stripped) {
      const direct = restoreText(masked, tokens);
      translationCache[cacheKey] = direct;
      return text.replace(trimmed, direct);
    }

    // If a rate limit already halted network translation for this session, skip extra network requests
    if (translationHaltedForLimit) {
      return text.replace(trimmed, restoreText(masked, tokens));
    }

    let res, data;
    try {
      const url = "https://api.mymemory.translated.net/get?q=" + encodeURIComponent(masked) + "&langpair=en|" + encodeURIComponent(targetLang);
      res = await fetch(url);
      data = await res.json();
    } catch (e) {
      try {
        const libreOut = await tryLibreTranslate(masked, targetLang);
        const finalLibre = restoreText(libreOut, tokens);
        translationCache[cacheKey] = finalLibre;
        return text.replace(trimmed, finalLibre);
      } catch (libreErr) {
        translationHaltedForLimit = true;
        throw new Error("Network or connection error while contacting translation services.");
      }
    }

    const rawTranslated = (data && data.responseData && data.responseData.translatedText) || "";
    const statusVal = data && data.responseStatus;
    const detailsVal = String((data && data.responseDetails) || "");

    const isRateLimited =
      res.status === 429 ||
      statusVal === 429 ||
      String(statusVal) === "429" ||
      /rate\s*limit|too many requests|used all available free translations|quota/i.test(rawTranslated + " " + detailsVal);

    if (isRateLimited) {
      try {
        const libreOut = await tryLibreTranslate(masked, targetLang);
        const finalLibre = restoreText(libreOut, tokens);
        translationCache[cacheKey] = finalLibre;
        return text.replace(trimmed, finalLibre);
      } catch (libreErr) {
        translationHaltedForLimit = true;
        throw new Error("Translation rate limit exceeded and LibreTranslate fallback also failed.");
      }
    }

    if (!res.ok) {
      try {
        const libreOut = await tryLibreTranslate(masked, targetLang);
        const finalLibre = restoreText(libreOut, tokens);
        translationCache[cacheKey] = finalLibre;
        return text.replace(trimmed, finalLibre);
      } catch (libreErr) {
        translationHaltedForLimit = true;
        throw new Error("Translation request failed with status " + res.status + ".");
      }
    }

    if (!rawTranslated) {
      throw new Error("Translation service returned an empty result.");
    }

    const finalStr = restoreText(rawTranslated, tokens);
    translationCache[cacheKey] = finalStr;
    return text.replace(trimmed, finalStr);
  }

  function collectTranslatableNodes(rootEl) {
    const nodes = [];
    const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        if (parent.closest && (
          parent.closest("[data-no-translate]") ||
          parent.closest("#languageMenu") ||
          parent.closest("#navLanguageSublist") ||
          parent.closest("#languageToggle") ||
          parent.closest("#navLangToggle") ||
          parent.closest("#tagline") ||
          parent.closest(".site-clock") ||
          parent.closest(".reset-times") ||
          parent.closest(".reset-count") ||
          parent.closest("#translationErrorPopup")
        )) return NodeFilter.FILTER_REJECT;

        const raw = node._origText !== undefined ? node._origText : node.nodeValue;
        if (!raw || !raw.trim() || !/[A-Za-z]/.test(raw)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (n._origText === undefined) n._origText = n.nodeValue;
      nodes.push(n);
    }
    return nodes;
  }

  // Apply manual translations to elements marked with [data-manual-key]
  function applyManualKeyOverrides(rootEl, langCode) {
    if (!rootEl || !rootEl.querySelectorAll) return;
    const manualMap = (TCFG.manualTranslations && TCFG.manualTranslations[langCode]) || {};
    rootEl.querySelectorAll("[data-manual-key]").forEach(el => {
      const key = el.getAttribute("data-manual-key");
      if (!key) return;
      if (langCode === "en") {
        el.textContent = lambdaify(key);
        return;
      }
      const override = manualMap[key];
      el.textContent = lambdaify(override !== undefined ? override : key);
    });
  }

  async function translateContainer(rootEl, langCode) {
    if (!rootEl) return;
    applyManualKeyOverrides(rootEl, langCode);
    const nodes = collectTranslatableNodes(rootEl);

    if (langCode === "en") {
      nodes.forEach(n => {
        delete n._translatedText;
        n.nodeValue = lambdaify(n._origText);
      });
      if (rootEl === document.body) {
        if (!document._origTitle) document._origTitle = document.title;
        document.title = lambdaify(document._origTitle);
      }
      return;
    }

    // Batch unique strings for speed
    const uniqueTexts = [...new Set(nodes.map(n => n._origText))];
    const batchSize = 10;
    let batchError = null;
    for (let i = 0; i < uniqueTexts.length; i += batchSize) {
      if (translationHaltedForLimit) break;
      const slice = uniqueTexts.slice(i, i + batchSize);
      try {
        await Promise.all(slice.map(t => fetchFreeTranslation(t, langCode)));
      } catch (err) {
        batchError = err;
        break;
      }
    }
    saveTranslationCache();

    if (batchError) {
      showTranslationErrorPopup(batchError.message, false);
    }

    // Apply cached/manual/protected text without issuing further network requests on error
    for (const n of nodes) {
      const trimmed = n._origText.trim();
      const cacheKey = langCode + "::" + trimmed;
      if (translationCache[cacheKey]) {
        const tr = n._origText.replace(trimmed, translationCache[cacheKey]);
        n._translatedText = tr;
        n.nodeValue = lambdaify(tr);
      } else {
        const { masked, tokens } = protectText(trimmed, langCode);
        const fallback = n._origText.replace(trimmed, restoreText(masked, tokens));
        n._translatedText = fallback;
        n.nodeValue = lambdaify(fallback);
      }
    }

    if (rootEl === document.body && !batchError && !translationHaltedForLimit) {
      if (!document._origTitle) document._origTitle = document.title;
      try {
        const trTitle = await fetchFreeTranslation(document._origTitle, langCode);
        document.title = lambdaify(trTitle);
      } catch (err) {
        showTranslationErrorPopup(err.message, false);
      }
    }
  }


  /* ========================================================================
     2. BUILD THE LIST OF PEOPLE (members + leaders) FROM THE DATA FILES
     ======================================================================== */

  const leaderPeople = LEADERS.map(l => ({
    kind: "leaders", id: l.id, name: l.name, guild: l.guild, isLeader: true,
    label: (GUILD_LABELS[l.guild] || "") + " · " + (l.role || "Leader"),
    country: l.country, bio: l.bio, review: l.review, discord: l.discord, instagram: l.instagram
  }));

  const memberPeople = MEMBERS.map(m => ({
    kind: "members", id: m.id, name: m.name, guild: m.guild, isLeader: false,
    label: m.sub || GUILD_LABELS[m.guild] || "",
    country: m.country, bio: m.bio, review: m.review, discord: m.discord, instagram: m.instagram
  }));

  const everyone = leaderPeople.concat(memberPeople);

  const pools = {
    all: everyone,
    base: everyone,
    arise: everyone.filter(p => p.guild === "arise"),
    overdrive: everyone.filter(p => p.guild === "overdrive"),

    "leaders-base": leaderPeople.filter(p => p.guild === "base"),
    "leaders-arise": leaderPeople.filter(p => p.guild === "arise"),
    "leaders-overdrive": leaderPeople.filter(p => p.guild === "overdrive")
  };


  /* ========================================================================
     3. PERSON CARD
     ======================================================================== */
  function makeCard(person) {
    const card = document.createElement("article");
    card.className = "member-card" + (person.isLeader ? " is-leader" : "");

    const photo = imageUrl(person.kind, person.id, 480) || placeholder(person.name);
    const discord = safeUrl(person.discord), insta = safeUrl(person.instagram);
    const links = (discord || insta)
      ? '<div class="member-links">' + (discord ? '<a href="' + discord + '" target="_blank" rel="noopener">Discord</a>' : "") + (insta ? '<a href="' + insta + '" target="_blank" rel="noopener">Instagram</a>' : "") + "</div>"
      : "";
    const fullName = displayName(person.name);

    card.innerHTML =
      '<div class="member-photo"><img src="' + esc(photo) + '" alt="' + txt(fullName) + '" width="480" height="340" loading="lazy" decoding="async" draggable="false"></div>' +
      '<div class="role">' + txt(person.label) + "</div>" +
      '<h4 data-no-translate data-manual-key="' + esc(fullName) + '">' + txt(fullName) + "</h4>" +
      "<p>" + txt(person.bio || "") + (person.country ? " · " + txt(person.country) : "") + "</p>" +
      (person.review ? '<p class="member-review">“' + txt(person.review) + "”</p>" : "") +
      links;

    const img = $("img", card);
    img.addEventListener("error", () => { img.src = placeholder(person.name); }, { once: true });

    if (activeLangCode !== "en") {
      translateContainer(card, activeLangCode);
    }
    return card;
  }


  /* ========================================================================
     4/5. MEMBER AND LEADERSHIP CAROUSELS
     ======================================================================== */
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initCarousel(root) {
    const pool = pools[root.dataset.carousel] || [];
    const windowEl = $(".member-window", root);
    const track = $(".member-track", root);
    const prevBtn = $(".prev", root), nextBtn = $(".next", root), playBtn = $(".play-toggle", root);

    const controlsEl = $(".member-controls", root);
    const fitStatic = root.hasAttribute("data-fit-static");
    let isStatic = false;

    if (!pool.length) {
      track.innerHTML = '<p class="empty-note">' + (fitStatic ? "Leadership will be announced soon." : "No members added yet.") + "</p>";
      controlsEl.hidden = true;
      return;
    }

    let bag = [], items = [], history = [];
    let offset = 0, pending = 0, step = 0, gap = 14;
    let paused = reducedMotion;
    let dragging = false, lastX = 0, lastTime = 0;

    function nextPerson() {
      if (!bag.length) {
        bag = shuffle(pool.slice());
        const lastShown = items[items.length - 1];
        if (bag.length > 1 && bag[bag.length - 1] === lastShown) {
          [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
        }
      }
      return bag.pop();
    }

    function appendOne() {
      const person = nextPerson();
      items.push(person);
      track.appendChild(makeCard(person));
    }

    function layout() {
      const viewWidth = windowEl.clientWidth;
      if (!viewWidth) return false;
      if (!track.firstElementChild) appendOne();
      const cardWidth = track.firstElementChild.offsetWidth;
      if (!cardWidth) return false;

      gap = parseFloat(getComputedStyle(track).columnGap) || 14;
      step = cardWidth + gap;

      if (fitStatic) {
        const fits = pool.length * step - gap <= viewWidth + 0.5;
        if (fits && !isStatic) {
          track.innerHTML = "";
          items = []; bag = []; history = [];
          pool.forEach(p => { items.push(p); track.appendChild(makeCard(p)); });
          isStatic = true;
          controlsEl.hidden = true;
          root.classList.add("is-centered");
        } else if (!fits && isStatic) {
          track.innerHTML = "";
          items = []; bag = []; history = [];
          isStatic = false;
          controlsEl.hidden = false;
          root.classList.remove("is-centered");
          appendOne();
        }
        if (isStatic) {
          offset = 0; pending = 0;
          track.style.transform = "translate3d(0,0,0)";
          return false;
        }
      }

      while (offset >= step) {
        history.push(items.shift());
        track.firstElementChild.remove();
        offset -= step;
        if (history.length > 60) history.shift();
      }
      while (offset < 0) {
        const back = history.pop();
        if (!back) { offset = 0; break; }
        items.unshift(back);
        track.insertBefore(makeCard(back), track.firstElementChild);
        offset += step;
      }
      while (items.length * step - offset < viewWidth + step * 2) appendOne();

      track.style.transform = "translate3d(" + (-offset) + "px,0,0)";
      return true;
    }

    function frame(time) {
      if (lastTime && layout()) {
        const seconds = Math.min(time - lastTime, 50) / 1000;
        let move = 0;
        if (!paused && !dragging) move += CFG.carouselSpeed * seconds;
        if (pending) {
          const part = pending * Math.min(1, seconds * 8);
          move += part; pending -= part;
          if (Math.abs(pending) < 0.5) { move += pending; pending = 0; }
        }
        if (move) { offset += move; layout(); }
      }
      lastTime = time;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    prevBtn.addEventListener("click", () => { if (step) pending -= step; });
    nextBtn.addEventListener("click", () => { if (step) pending += step; });
    function showPlayState() {
      playBtn.textContent = paused ? "▶" : "Ⅱ";
      playBtn.setAttribute("aria-label", paused ? "Play member slideshow" : "Pause member slideshow");
      playBtn.title = paused ? "Play" : "Pause";
    }
    playBtn.addEventListener("click", () => { paused = !paused; showPlayState(); });
    showPlayState();

    windowEl.addEventListener("pointerdown", e => {
      dragging = true; lastX = e.clientX;
      windowEl.classList.add("dragging");
      windowEl.setPointerCapture(e.pointerId);
    });
    windowEl.addEventListener("pointermove", e => {
      if (!dragging) return;
      offset -= e.clientX - lastX; lastX = e.clientX;
      layout();
    });
    const stopDrag = () => { dragging = false; windowEl.classList.remove("dragging"); };
    windowEl.addEventListener("pointerup", stopDrag);
    windowEl.addEventListener("pointercancel", stopDrag);
  }
  $$("[data-carousel]").forEach(initCarousel);


  /* ========================================================================
     6. "GUILD MOMENTS" SLIDESHOWS
     ======================================================================== */
  const slideBoxes = $$("[data-slideshow-guild]");

  function updateSlideOverflowButton(box, expanded) {
    const desc = $(".guild-slide-description", box);
    const btn = $(".guild-slide-more", box);
    if (!desc || !btn) return;
    if (expanded) {
      btn.hidden = false;
      return;
    }
    const overflows = desc.scrollHeight > desc.clientHeight + 2;
    btn.hidden = !overflows;
  }

  function initSlideshow(box) {
    const guild = box.dataset.slideshowGuild;
    const list = SLIDES.filter(s => guild === "all" || s.guild === guild);
    if (!list.length) { box.hidden = true; return; }

    const state = { index: 0, paused: false, expanded: false };
    box._slideState = state;
    box._slideCount = list.length;

    function render() {
      const s = list[state.index];
      const img = imageUrl("moments", s.id, 1000);
      const instagram = safeUrl(s.instagram), discord = safeUrl(s.discord);

      box.classList.toggle("is-expanded", state.expanded);
      box.innerHTML =
        '<article class="guild-slide">' +
          (img ? '<img class="guild-slide-image" src="' + esc(img) + '" alt="' + txt(s.title) + '" loading="lazy" decoding="async">' : '<div class="guild-slide-image no-image"></div>') +
          '<div class="guild-slide-copy">' +
            '<div class="guild-slide-top">' +
              '<div class="guild-slide-kicker">' + txt(GUILD_LABELS[s.guild] || "") + " · COMMUNITY MOMENT</div>" +
              "<h4>" + txt(s.title) + "</h4>" +
              '<p class="guild-slide-description' + (state.expanded ? " expanded" : "") + '">' + txt(s.description) + "</p>" +
              '<button class="guild-slide-more" type="button" data-act="more"' + (state.expanded ? "" : " hidden") + ">" + txt(state.expanded ? "Show less" : "Show more") + "</button>" +
            "</div>" +
            '<div class="guild-slide-bottom">' +
              '<div class="guild-slide-links">' +
                (instagram ? '<a href="' + instagram + '" target="_blank" rel="noopener">Instagram</a>' : "") +
                (discord ? '<a href="' + discord + '" target="_blank" rel="noopener">Discord</a>' : "") +
              "</div>" +
              '<div class="guild-slide-footer">' +
                '<div class="guild-slide-dots">' + list.map((x, i) => '<span class="guild-slide-dot' + (i === state.index ? " active" : "") + '"></span>').join("") + "</div>" +
                '<div class="guild-slide-controls">' +
                  '<button type="button" data-act="prev" aria-label="Previous slide" title="Previous">‹</button>' +
                  '<button type="button" data-act="play" aria-label="' + (state.paused ? "Play" : "Pause") + ' slideshow" title="' + (state.paused ? "Play" : "Pause") + '">' + (state.paused ? "▶" : "Ⅱ") + "</button>" +
                  '<button type="button" data-act="next" aria-label="Next slide" title="Next">›</button>' +
                "</div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</article>";

      const pic = $("img.guild-slide-image", box);
      if (pic) pic.addEventListener("error", () => { pic.outerHTML = '<div class="guild-slide-image no-image"></div>'; }, { once: true });

      if (activeLangCode !== "en") {
        translateContainer(box, activeLangCode).then(() => updateSlideOverflowButton(box, state.expanded));
      } else {
        requestAnimationFrame(() => updateSlideOverflowButton(box, state.expanded));
      }
    }

    box.addEventListener("click", e => {
      const button = e.target.closest("button[data-act]");
      if (!button) return;
      const act = button.dataset.act;
      if (act === "prev") { state.index = (state.index - 1 + list.length) % list.length; state.expanded = false; }
      if (act === "next") { state.index = (state.index + 1) % list.length; state.expanded = false; }
      if (act === "play") { state.paused = !state.paused; if (!state.paused) state.expanded = false; }
      if (act === "more") { state.expanded = !state.expanded; if (state.expanded) state.paused = true; }
      render();
    });

    box._rerender = render;
    box._advance = () => {
      if (state.paused || state.expanded) return;
      state.index = (state.index + 1) % list.length;
      render();
    };
    render();
  }
  slideBoxes.forEach(initSlideshow);
  window.addEventListener("resize", () => {
    slideBoxes.forEach(box => {
      if (box._slideState) updateSlideOverflowButton(box, box._slideState.expanded);
    });
  });
  setInterval(() => slideBoxes.forEach(box => box._advance && box._advance()), CFG.slideshowSeconds * 1000);


  /* ========================================================================
     7. GUILD PANELS, TABS AND CLOSE BUTTONS + GUILD NORMS
     ======================================================================== */
  const panels = $$(".guild-details");

  $$("[data-open-guild]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById("details-" + button.dataset.openGuild);
      panels.forEach(panel => panel.classList.toggle("active", panel === target));
      if (!target) return;
      selectTab(target, $(".tab-btn", target));
      const box = $(".guild-slideshow", target);
      if (box && box._slideState) requestAnimationFrame(() => updateSlideOverflowButton(box, box._slideState.expanded));
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function selectTab(panel, tabButton) {
    $$(".tab-btn", panel).forEach(tab => {
      const isActive = tab === tabButton;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
    });
    $$(".detail-pane", panel).forEach(pane => pane.classList.toggle("active", pane.id === tabButton.dataset.tab));
  }

  panels.forEach(panel => {
    $$(".tab-btn", panel).forEach(tab => tab.addEventListener("click", () => selectTab(panel, tab)));
    $(".close-detail", panel).addEventListener("click", () => {
      panel.classList.remove("active");
      document.getElementById("guilds").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  const normsBox = $("#normsCollapsible"), normsBtn = $("#normsToggle");
  if (normsBox && normsBtn) {
    normsBtn.addEventListener("click", () => {
      const expanded = normsBox.classList.toggle("expanded");
      normsBtn.setAttribute("aria-expanded", String(expanded));
      const label = expanded ? "Show Less" : "View Full Guild Norms";
      normsBtn._origText = label;
      if (activeLangCode !== "en") {
        fetchFreeTranslation(label, activeLangCode)
          .then(tr => { normsBtn.textContent = lambdaify(tr); })
          .catch(err => { showTranslationErrorPopup(err.message, false); });
      } else {
        normsBtn.textContent = lambdaify(label);
      }
      if (!expanded) document.getElementById("norms").scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }


  /* ========================================================================
     8. HEADER: THEME BUTTON, PHONE MENU, DISCORD LINKS, LOGO, SUPPORT LINE, YEAR
     ======================================================================== */
  const root = document.documentElement;

  try {
    const saved = localStorage.getItem("anantya-theme");
    if (saved === "dark" || saved === "light") root.dataset.theme = saved;
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark";
  } catch (e) { /* storage blocked */ }

  function toggleTheme() {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("anantya-theme", next); } catch (e) { /* ignore */ }
  }
  $("#themeToggle").addEventListener("click", toggleTheme);
  if ($("#navThemeToggle")) $("#navThemeToggle").addEventListener("click", toggleTheme);

  const nav = $("#siteNav"), menuButton = $("#menuToggle");
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  if ("IntersectionObserver" in window) {
    const sections = ["guilds", "norms", "join"].map(id => document.getElementById(id)).filter(Boolean);
    const watcher = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        $$("a", nav).forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach(section => watcher.observe(section));
  }

  $$("[data-support]").forEach(el => {
    el.innerHTML = esc(CFG.supportText).replace("Discord", '<a href="#" data-discord>Discord</a>');
  });

  $$("[data-discord]").forEach(link => {
    link.href = CFG.discordUrl;
    link.target = "_blank";
    link.rel = "noopener";
  });

  const logoSource = IMAGES.logo || "";
  const logo = logoSource ? optimise(/^(https?:)?\/\//.test(logoSource) ? logoSource : (CFG.imageBaseUrl || "") + logoSource, 120) : "";
  if (logo) $("#brandMark").innerHTML = '<img src="' + esc(logo) + '" alt="ANANTYA logo" width="42" height="42">';

  $("#year").textContent = new Date().getFullYear();


  /* ========================================================================
     9. HEADER LANGUAGE MENU + TAGLINE
     ======================================================================== */
  const fallbackLanguages = [
    { code: "en",  name: "English",    tagline: "Belong to Infinity",         description: "Default language." },
    { code: "hi",  name: "हिन्दी",      tagline: "अनंत का हिस्सा",             description: "हिन्दी अनुवाद।" },
    { code: "bho", name: "भोजपुरी",    tagline: "अनंत के हिस्सा",             description: "भोजपुरी अनुवाद।" },
    { code: "fr",  name: "Français",   tagline: "Appartenir à l’infini",      description: "Traduction française." },
    { code: "de",  name: "Deutsch",    tagline: "Zur Unendlichkeit gehören",  description: "Deutsche Übersetzung." },
    { code: "sa",  name: "संस्कृतम्",   tagline: "अनन्तस्य अंशः",             description: "संस्कृतानुवादः।" },
    { code: "ru",  name: "Русский",    tagline: "Принадлежать бесконечности", description: "Перевод на русский." },
    { code: "ko",  name: "한국어",      tagline: "무한에 속하다",              description: "한국어 번역." },
    { code: "ja",  name: "日本語",      tagline: "無限に属する",               description: "日本語翻訳。" },
    { code: "ar",  name: "العربية",    tagline: "الانتماء إلى اللانهاية",     description: "الترجمة العربية." }
  ];

  const languages = (typeof TRANSLATION_CONFIG !== "undefined" && Array.isArray(TRANSLATION_CONFIG.languages) && TRANSLATION_CONFIG.languages.length)
    ? TRANSLATION_CONFIG.languages
    : fallbackLanguages;

  const languageName = $("#languageName");
  const navLanguageName = $("#navLanguageName");
  const tagline = $("#tagline");
  const languageToggle = $("#languageToggle");
  const languageMenu = $("#languageMenu");
  const navLangToggle = $("#navLangToggle");
  const navLanguageSublist = $("#navLanguageSublist");
  const langSpinner = $("#langSpinner");

  let languageIndex = 0;
  let userPinnedLanguage = false;

  function animateText(el, value, className) {
    if (!el) return;
    el.classList.remove(className);
    void el.offsetWidth;
    el.textContent = lambdaify(value);
    el.classList.add(className);
  }

  function showLanguagePreview(i) {
    const lang = languages[i];
    if (!lang) return;
    animateText(languageName, lang.name, "language-label-track");
    animateText(tagline, lang.tagline, "tagline-track");
    if (navLanguageName) navLanguageName.textContent = lambdaify(lang.name);
  }

  function buildLanguageMenuItems(container) {
    if (!container) return;
    container.innerHTML = languages.map(lang =>
      '<button class="language-option' + (lang.code === activeLangCode ? " active" : "") + '" type="button" role="menuitemradio" aria-checked="' + (lang.code === activeLangCode) + '" data-lang-code="' + esc(lang.code) + '">' +
        '<div class="language-option-head">' +
          '<span class="language-option-name">' + esc(lang.name) + '</span>' +
          '<span class="language-option-tag">' + esc(lang.tagline) + '</span>' +
        '</div>' +
        '<span class="language-option-desc">' + esc(lang.description || "") + '</span>' +
      '</button>'
    ).join("");
  }

  function refreshAllLanguageMenus() {
    buildLanguageMenuItems(languageMenu);
    buildLanguageMenuItems(navLanguageSublist);
  }

  async function selectWebsiteLanguage(code) {
    const idx = languages.findIndex(l => l.code === code);
    if (idx === -1) return;
    languageIndex = idx;
    activeLangCode = code;
    userPinnedLanguage = code !== "en";
    popupDismissedForSession = false;
    activeErrorReason = "";
    translationHaltedForLimit = false;

    const popup = document.getElementById("translationErrorPopup");
    if (popup) popup.hidden = true;

    showLanguagePreview(idx);
    refreshAllLanguageMenus();

    if (languageMenu) {
      languageMenu.hidden = true;
      if (languageToggle) languageToggle.setAttribute("aria-expanded", "false");
    }
    if (navLanguageSublist) {
      navLanguageSublist.hidden = true;
      if (navLangToggle) navLangToggle.setAttribute("aria-expanded", "false");
    }
    if (nav && nav.classList.contains("open")) {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    }

    document.documentElement.lang = code;
    if (langSpinner && code !== "en") langSpinner.hidden = false;
    try {
      await translateContainer(document.body, code);
      slideBoxes.forEach(box => {
        if (box._slideState) updateSlideOverflowButton(box, box._slideState.expanded);
      });
    } finally {
      if (langSpinner) langSpinner.hidden = true;
    }
  }

  refreshAllLanguageMenus();
  showLanguagePreview(0);

  if (languageToggle && languageMenu) {
    languageToggle.addEventListener("click", e => {
      e.stopPropagation();
      const willOpen = languageMenu.hidden;
      languageMenu.hidden = !willOpen;
      languageToggle.setAttribute("aria-expanded", String(willOpen));
    });

    languageMenu.addEventListener("click", e => {
      const btn = e.target.closest("[data-lang-code]");
      if (btn) selectWebsiteLanguage(btn.dataset.langCode);
    });

    document.addEventListener("click", e => {
      if (!languageMenu.hidden && !e.target.closest("#languageWrap")) {
        languageMenu.hidden = true;
        languageToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (navLangToggle && navLanguageSublist) {
    navLangToggle.addEventListener("click", e => {
      e.stopPropagation();
      const willOpen = navLanguageSublist.hidden;
      navLanguageSublist.hidden = !willOpen;
      navLangToggle.setAttribute("aria-expanded", String(willOpen));
    });

    navLanguageSublist.addEventListener("click", e => {
      const btn = e.target.closest("[data-lang-code]");
      if (btn) selectWebsiteLanguage(btn.dataset.langCode);
    });
  }

  const cycleMs = Math.max(1000, (Number(CFG.languageSeconds) || 4) * 1000);
  setInterval(() => {
    if (userPinnedLanguage) return;
    if (languageMenu && !languageMenu.hidden) return;
    languageIndex = (languageIndex + 1) % languages.length;
    showLanguagePreview(languageIndex);
  }, cycleMs);


  /* ========================================================================
     9B. LIVE CLOCKS (header) AND ARISE RESET TIMES
     ======================================================================== */
  const RESETS = {
    daily:  { weekday: null, hour: 23, minute: 59 },
    weekly: { weekday: 2,    hour: 23, minute: 59 },
    shop:   { weekday: 6,    hour: 23, minute: 59 },
    boss:   { weekday: 2,    hour: 23, minute: 30 }
  };

  const TZ_ABBR = {
    "Asia/Kolkata": "IST", "Asia/Calcutta": "IST", "Asia/Tokyo": "JST", "Asia/Seoul": "KST",
    "Asia/Karachi": "PKT", "Asia/Singapore": "SGT", "Asia/Hong_Kong": "HKT", "Asia/Dubai": "GST",
    "Asia/Manila": "PHT", "Asia/Bangkok": "ICT", "Asia/Ho_Chi_Minh": "ICT", "Asia/Jakarta": "WIB",
    "Asia/Kuala_Lumpur": "MYT", "Europe/Moscow": "MSK", "Africa/Johannesburg": "SAST",
    "Africa/Lagos": "WAT", "America/Sao_Paulo": "BRT"
  };

  const LOCAL_TZ = (function () {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ""; } catch (e) { return ""; }
  })();

  const pad2 = n => String(n).padStart(2, "0");
  const fmtCache = {}, nameCache = {};

  function dateFormatter(tz) {
    const key = tz || "local";
    if (!fmtCache[key]) {
      const opts = { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" };
      if (tz) opts.timeZone = tz;
      fmtCache[key] = new Intl.DateTimeFormat("en-GB", opts);
    }
    return fmtCache[key];
  }

  function formatMoment(date, tz) {
    const p = {};
    dateFormatter(tz).formatToParts(date).forEach(part => { p[part.type] = part.value; });
    return { date: p.weekday + " " + p.day + " " + p.month + " " + p.year, time: p.hour + ":" + p.minute + ":" + p.second };
  }

  function zoneCode(date, tz) {
    if (tz === "UTC") return "UTC";
    for (const locale of ["en-US", "en-GB"]) {
      const key = locale + "|" + (tz || "local");
      if (!nameCache[key]) nameCache[key] = new Intl.DateTimeFormat(locale, Object.assign({ timeZoneName: "short" }, tz ? { timeZone: tz } : {}));
      const part = nameCache[key].formatToParts(date).find(x => x.type === "timeZoneName");
      if (part && !/^(GMT|UTC)[+\-\u2212]/.test(part.value)) return part.value;
    }
    if (TZ_ABBR[LOCAL_TZ]) return TZ_ABBR[LOCAL_TZ];
    const offset = -date.getTimezoneOffset();
    const abs = Math.abs(offset);
    return "UTC" + (offset < 0 ? "-" : "+") + Math.floor(abs / 60) + (abs % 60 ? ":" + pad2(abs % 60) : "");
  }

  function nextReset(rule, now) {
    const t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), rule.hour, rule.minute, 0, 0);
    let daysAhead = 0;
    if (rule.weekday !== null) {
      daysAhead = rule.weekday - ((now.getUTCDay() + 6) % 7);
      if (daysAhead < 0) daysAhead += 7;
    }
    if (daysAhead === 0 && now.getTime() >= t) daysAhead = rule.weekday === null ? 1 : 7;
    return t + daysAhead * 86400000;
  }

  function countdownText(ms) {
    let s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400); s %= 86400;
    const h = Math.floor(s / 3600);  s %= 3600;
    const m = Math.floor(s / 60);    s %= 60;
    return (d ? d + "d " : "") + pad2(h) + "h " + pad2(m) + "m " + pad2(s) + "s";
  }

  function setText(el, value) {
    if (!el) return;
    const v = lambdaify(value);
    if (el.textContent !== v) el.textContent = v;
  }

  const clockEl = name => $('[data-clock="' + name + '"]');
  const clocks = { uz: clockEl("utc-zone"), ut: clockEl("utc-time"), ud: clockEl("utc-date"), lz: clockEl("loc-zone"), lt: clockEl("loc-time"), ld: clockEl("loc-date") };

  const resetCards = $$("[data-reset]").map(card => ({
    card, rule: RESETS[card.dataset.reset], target: 0,
    f: name => $('[data-r="' + name + '"]', card)
  })).filter(r => r.rule);

  function updateReset(r, now) {
    if (!r.target || now.getTime() >= r.target) {
      r.target = nextReset(r.rule, now);
      const when = new Date(r.target);
      const u = formatMoment(when, "UTC"), l = formatMoment(when);
      setText(r.f("utc-zone"), "UTC");        setText(r.f("utc-time"), u.time); setText(r.f("utc-date"), u.date);
      setText(r.f("loc-zone"), "Your time · " + zoneCode(when));
      setText(r.f("loc-time"), l.time);       setText(r.f("loc-date"), l.date);
    }
    setText(r.f("count"), countdownText(r.target - now.getTime()));
  }

  function tickClocks() {
    const now = new Date();
    const u = formatMoment(now, "UTC"), l = formatMoment(now);
    setText(clocks.uz, "UTC");              setText(clocks.ut, u.time); setText(clocks.ud, u.date);
    setText(clocks.lz, zoneCode(now));      setText(clocks.lt, l.time); setText(clocks.ld, l.date);
    resetCards.forEach(r => updateReset(r, now));
  }
  function runClocks() {
    try { tickClocks(); } catch (e) { /* ignore clock error */ }
    setTimeout(runClocks, 1000 - (Date.now() % 1000) + 5);
  }
  runClocks();


  /* ========================================================================
     10. FINAL STEP: CAPITAL "A" -> "Λ" EVERYWHERE ON THE PAGE
     ======================================================================== */
  if (CFG.useLambda) {
    applyLambdaTree(document.body);
    document._origTitle = document.title;
    document.title = lambdaify(document.title);
  }

})();