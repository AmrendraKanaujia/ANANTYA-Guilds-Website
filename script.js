/* ==========================================================================
   script.js  —  THE "MOVING PARTS" OF THE SITE
   --------------------------------------------------------------------------
   You normally do NOT need to edit this file.
   Everything you would want to change (links, names, images, speeds) lives in:
       config.js  images.js  leaders.js  members.js  slides.js

   The few things that live HERE and you may want to tweak:
     - The list of languages in the header (section 9 at the bottom).
   ========================================================================== */

(function () {
  "use strict";

  const CFG = SITE_CONFIG;                                   // settings from config.js
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

  // Add the "ΛN • " prefix to a name (once)
  function displayName(name) {
    name = String(name || "").trim();
    if (!CFG.namePrefix || /^(Λ|A)N\s*•/.test(name)) return name;
    return CFG.namePrefix + name;
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


  /* ========================================================================
     2. BUILD THE LIST OF PEOPLE (members + leaders) FROM THE DATA FILES
     ======================================================================== */

  // Leaders (GM / VGM) from leaders.js
  const leaderPeople = LEADERS.map(l => ({
    kind: "leaders", id: l.id, name: l.name, guild: l.guild, isLeader: true,
    label: (GUILD_LABELS[l.guild] || "") + " · " + (l.role || "Leader"),
    country: l.country, bio: l.bio, review: l.review, discord: l.discord, instagram: l.instagram
  }));

  // Members from members.js
  const memberPeople = MEMBERS.map(m => ({
    kind: "members", id: m.id, name: m.name, guild: m.guild, isLeader: false,
    label: m.sub || GUILD_LABELS[m.guild] || "",
    country: m.country, bio: m.bio, review: m.review, discord: m.discord, instagram: m.instagram
  }));

  const everyone = leaderPeople.concat(memberPeople);

  // Who rolls in which carousel:
  //   all, base  -> everyone (all members + all GMs/VGMs)
  //   arise      -> only ΛRISE members + ΛRISE GM/VGM
  //   overdrive  -> only OVERDRIVE members + OVERDRIVE GM/VGM
  const pools = {
    all: everyone,
    base: everyone,
    arise: everyone.filter(p => p.guild === "arise"),
    overdrive: everyone.filter(p => p.guild === "overdrive"),

    // Leadership tabs: only that guild's GM / VGM (from leaders.js)
    "leaders-base": leaderPeople.filter(p => p.guild === "base"),
    "leaders-arise": leaderPeople.filter(p => p.guild === "arise"),
    "leaders-overdrive": leaderPeople.filter(p => p.guild === "overdrive")
  };


  /* ========================================================================
     3. PERSON CARD (the same card design for members and leaders)
     ======================================================================== */
  function makeCard(person) {
    const card = document.createElement("article");
    card.className = "member-card" + (person.isLeader ? " is-leader" : "");

    const photo = imageUrl(person.kind, person.id, 480) || placeholder(person.name);
    const discord = safeUrl(person.discord), insta = safeUrl(person.instagram);
    const links = (discord || insta)
      ? '<div class="member-links">' + (discord ? '<a href="' + discord + '" target="_blank" rel="noopener">Discord</a>' : "") + (insta ? '<a href="' + insta + '" target="_blank" rel="noopener">Instagram</a>' : "") + "</div>"
      : "";

    card.innerHTML =
      '<div class="member-photo"><img src="' + esc(photo) + '" alt="' + txt(displayName(person.name)) + '" width="480" height="340" loading="lazy" decoding="async" draggable="false"></div>' +
      '<div class="role">' + txt(person.label) + "</div>" +
      "<h4>" + txt(displayName(person.name)) + "</h4>" +
      "<p>" + txt(person.bio || "") + (person.country ? " · " + txt(person.country) : "") + "</p>" +
      (person.review ? '<p class="member-review">“' + txt(person.review) + "”</p>" : "") +
      links;

    // If the picture link is broken, switch to the placeholder instead of showing a broken icon
    const img = $("img", card);
    img.addEventListener("error", () => { img.src = placeholder(person.name); }, { once: true });
    return card;
  }


  /* ========================================================================
     4/5. MEMBER AND LEADERSHIP CAROUSELS — slow, continuous, random,
          no repeats until everyone has shown
     --------------------------------------------------------------------
     The Leadership tabs use this same code. They have the extra attribute
     data-fit-static in index.html, which means: if all leaders fit on the
     screen, they stay still (no movement); if not, they roll like members.
     How it works:
       - We put everyone from the carousel's pool in a "bag" in random order.
       - Cards are taken from the bag one by one and added at the right end.
       - When the bag is empty, it is refilled and shuffled again (new random order).
       - So nobody appears twice until EVERYONE has appeared once.
       - Cards that scrolled away on the left are removed, so the page stays light.
     ======================================================================== */
  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initCarousel(root) {
    const pool = pools[root.dataset.carousel] || [];
    const windowEl = $(".member-window", root);
    const track = $(".member-track", root);
    const prevBtn = $(".prev", root), nextBtn = $(".next", root), playBtn = $(".play-toggle", root);

    const controlsEl = $(".member-controls", root);
    const fitStatic = root.hasAttribute("data-fit-static");   // Leadership tabs: stay still if everyone fits
    let isStatic = false;                                      // true while everyone fits and nothing moves

    if (!pool.length) {
      track.innerHTML = '<p class="empty-note">' + (fitStatic ? "Leadership will be announced soon." : "No members added yet.") + "</p>";
      controlsEl.hidden = true;
      return;
    }

    let bag = [];          // people still waiting to appear in this round
    let items = [];        // people currently on the strip, left to right
    let history = [];      // people that scrolled off the left (so "Previous" works)
    let offset = 0;        // how far the strip has moved left, in pixels
    let pending = 0;       // extra distance still to move after pressing Previous/Next
    let step = 0;          // width of one card + gap
    let gap = 14;
    let paused = reducedMotion;
    let dragging = false, lastX = 0, lastTime = 0;

    // Take the next person from the bag (refill + reshuffle when empty)
    function nextPerson() {
      if (!bag.length) {
        bag = shuffle(pool.slice());
        const lastShown = items[items.length - 1];
        // don't show the same person twice in a row when a new round starts
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

    // Keep the strip filled, recycle cards, and apply the movement.
    // Returns false while the carousel is hidden (inside a closed tab).
    function layout() {
      const viewWidth = windowEl.clientWidth;
      if (!viewWidth) return false;
      if (!track.firstElementChild) appendOne();
      const cardWidth = track.firstElementChild.offsetWidth;
      if (!cardWidth) return false;

      gap = parseFloat(getComputedStyle(track).columnGap) || 14;
      step = cardWidth + gap;

      // Leadership only: do all leaders fit in the visible frame?
      if (fitStatic) {
        const fits = pool.length * step - gap <= viewWidth + 0.5;
        if (fits && !isStatic) {
          // everyone fits -> show each leader once, in order, and stop moving
          track.innerHTML = "";
          items = []; bag = []; history = [];
          pool.forEach(p => { items.push(p); track.appendChild(makeCard(p)); });
          isStatic = true;
          controlsEl.hidden = true;
          root.classList.add("is-centered");             // few leaders -> centre them
        } else if (!fits && isStatic) {
          // screen got narrower -> go back to rolling
          track.innerHTML = "";
          items = []; bag = []; history = [];
          isStatic = false;
          controlsEl.hidden = false;
          root.classList.remove("is-centered");          // too many to fit -> roll from the left
          appendOne();
        }
        if (isStatic) {
          offset = 0; pending = 0;
          track.style.transform = "translate3d(0,0,0)";
          return false;                                  // false = nothing to animate
        }
      }

      // card fully left of the frame -> remove it (remember it for "Previous")
      while (offset >= step) {
        history.push(items.shift());
        track.firstElementChild.remove();
        offset -= step;
        if (history.length > 60) history.shift();
      }
      // moved backwards past the first card -> bring the previous one back
      while (offset < 0) {
        const back = history.pop();
        if (!back) { offset = 0; break; }
        items.unshift(back);
        track.insertBefore(makeCard(back), track.firstElementChild);
        offset += step;
      }
      // not enough cards to the right -> add more
      while (items.length * step - offset < viewWidth + step * 2) appendOne();

      track.style.transform = "translate3d(" + (-offset) + "px,0,0)";
      return true;
    }

    // The animation loop: runs about 60 times per second
    function frame(time) {
      if (lastTime && layout()) {
        const seconds = Math.min(time - lastTime, 50) / 1000;
        let move = 0;
        if (!paused && !dragging) move += CFG.carouselSpeed * seconds;   // the slow continuous drift
        if (pending) {                                                    // smooth Previous / Next jump
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

    // Buttons
    prevBtn.addEventListener("click", () => { if (step) pending -= step; });
    nextBtn.addEventListener("click", () => { if (step) pending += step; });
    function showPlayState() {
      playBtn.textContent = paused ? "▶" : "Ⅱ";
      playBtn.setAttribute("aria-label", paused ? "Play member slideshow" : "Pause member slideshow");
      playBtn.title = paused ? "Play" : "Pause";
    }
    playBtn.addEventListener("click", () => { paused = !paused; showPlayState(); });
    showPlayState();

    // Drag with mouse or finger
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
     6. "GUILD MOMENTS" SLIDESHOWS  (text from slides.js, pictures from images.js)
     ======================================================================== */
  const slideBoxes = $$("[data-slideshow-guild]");

  function initSlideshow(box) {
    const guild = box.dataset.slideshowGuild;                       // "all", "base", "arise" or "overdrive"
    const list = SLIDES.filter(s => guild === "all" || s.guild === guild);
    if (!list.length) { box.hidden = true; return; }

    const state = { index: 0, paused: false, expanded: false };
    box._slideState = state;
    box._slideCount = list.length;

    function render() {
      const s = list[state.index];
      const img = imageUrl("moments", s.id, 1000);
      const instagram = safeUrl(s.instagram), discord = safeUrl(s.discord);
      const needsMore = s.description.length > 145;

      box.innerHTML =
        '<article class="guild-slide">' +
          (img ? '<img class="guild-slide-image" src="' + esc(img) + '" alt="' + txt(s.title) + '" loading="lazy" decoding="async">' : '<div class="guild-slide-image no-image"></div>') +
          '<div class="guild-slide-copy">' +
            '<div class="guild-slide-kicker">' + txt(GUILD_LABELS[s.guild] || "") + " · COMMUNITY MOMENT</div>" +
            "<h4>" + txt(s.title) + "</h4>" +
            '<p class="guild-slide-description' + (state.expanded ? " expanded" : "") + '">' + txt(s.description) + "</p>" +
            (needsMore ? '<button class="guild-slide-more" type="button" data-act="more">' + (state.expanded ? "Show less" : "Show more") + "</button>" : "") +
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
        "</article>";

      // broken picture -> show the soft colour block instead
      const pic = $("img.guild-slide-image", box);
      if (pic) pic.addEventListener("error", () => { pic.outerHTML = '<div class="guild-slide-image no-image"></div>'; }, { once: true });
    }

    // One click listener for all the slideshow buttons (works even after re-drawing)
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

    box._advance = () => {
      if (state.paused || state.expanded) return;
      state.index = (state.index + 1) % list.length;
      render();
    };
    render();
  }
  slideBoxes.forEach(initSlideshow);
  // Automatic change every X seconds (set in config.js)
  setInterval(() => slideBoxes.forEach(box => box._advance && box._advance()), CFG.slideshowSeconds * 1000);


  /* ========================================================================
     7. GUILD PANELS, TABS AND CLOSE BUTTONS
     ======================================================================== */
  const panels = $$(".guild-details");

  // "Explore ..." buttons: show that guild's panel, hide the others, start on the first tab
  $$("[data-open-guild]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById("details-" + button.dataset.openGuild);
      panels.forEach(panel => panel.classList.toggle("active", panel === target));
      if (!target) return;
      selectTab(target, $(".tab-btn", target));                     // first tab
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


  /* ========================================================================
     8. HEADER: THEME BUTTON, PHONE MENU, DISCORD LINKS, LOGO, SUPPORT LINE, YEAR
     ======================================================================== */
  const root = document.documentElement;

  // Light / dark mode (remembered on the visitor's device)
  try {
    const saved = localStorage.getItem("anantya-theme");
    if (saved === "dark" || saved === "light") root.dataset.theme = saved;
    else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark";
  } catch (e) { /* storage blocked: ignore */ }
  $("#themeToggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("anantya-theme", next); } catch (e) { /* ignore */ }
  });

  // Phone menu (☰)
  const nav = $("#siteNav"), menuButton = $("#menuToggle");
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  }));

  // Highlight the menu link of the section you are looking at
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

  // Support line (from config.js): the word "Discord" becomes a link
  $$("[data-support]").forEach(el => {
    el.innerHTML = esc(CFG.supportText).replace("Discord", '<a href="#" data-discord>Discord</a>');
  });

  // Every Discord link/button on the page gets the invite from config.js
  $$("[data-discord]").forEach(link => {
    link.href = CFG.discordUrl;
    link.target = "_blank";
    link.rel = "noopener";
  });

  // Logo (from images.js)
  const logoSource = IMAGES.logo || "";
  const logo = logoSource ? optimise(/^(https?:)?\/\//.test(logoSource) ? logoSource : (CFG.imageBaseUrl || "") + logoSource, 120) : "";
  if (logo) $("#brandMark").innerHTML = '<img src="' + esc(logo) + '" alt="ΛNΛNTYΛ logo" width="42" height="42">';

  $("#year").textContent = new Date().getFullYear();


  /* ========================================================================
     9. HEADER LANGUAGE + TAGLINE (changes automatically)
     --------------------------------------------------------------------
     To add a language, copy one line and change code / name / tagline.
     ======================================================================== */
  const languages = [
    { code: "en", name: "English",   tagline: "Belong to Infinity" },
    { code: "hi", name: "हिन्दी",     tagline: "अनंत का हिस्सा" },
    { code: "fr", name: "Français",  tagline: "Appartenir à l’infini" },
    { code: "de", name: "Deutsch",   tagline: "Zur Unendlichkeit gehören" },
    { code: "sa", name: "संस्कृतम्",  tagline: "अनन्तस्य अंशः" },
    { code: "ru", name: "Русский",   tagline: "Принадлежать бесконечности" },
    { code: "ko", name: "한국어",     tagline: "무한에 속하다" },
    { code: "ja", name: "日本語",     tagline: "無限に属する" },
    { code: "ar", name: "العربية",   tagline: "الانتماء إلى اللانهاية" }
  ];
  const languageName = $("#languageName"), tagline = $("#tagline");
  let languageIndex = 0;

  function animateText(el, value, className) {
    el.classList.remove(className);
    void el.offsetWidth;                   // restarts the slide-up animation
    el.textContent = lambdaify(value);
    el.classList.add(className);
  }
  function showLanguage(i) {
    const lang = languages[i];
    animateText(languageName, lang.name, "language-label-track");
    animateText(tagline, lang.tagline, "tagline-track");
    // (the page itself stays English; only these two labels change)
  }
  showLanguage(0);
  setInterval(() => { languageIndex = (languageIndex + 1) % languages.length; showLanguage(languageIndex); }, CFG.languageSeconds * 1000);


  /* ========================================================================
     9B. LIVE CLOCKS (header) AND ΛRISE RESET TIMES
     --------------------------------------------------------------------
     FORMAT (chosen to be understood by visitors from any country):
       time = 24-hour HH:MM:SS, e.g. 18:05:09   (no AM/PM confusion)
       date = weekday, day, month NAME, year, e.g. Fri 20 Nov 2026
              (a month name can't be mixed up like 03/04/2026 can)
     The timezone code (IST, PST, CET ...) is the visitor's own, read from their device.

     RESET TIMES use the same logic as the TimeDashboard bot:
       Daily reset        every day        23:59 UTC
       Shop & Weekly      every Wednesday  23:59 UTC
       Guild Shop         every Sunday     23:59 UTC
       Guild Boss         every Wednesday  23:30 UTC
     weekday: Monday = 0 ... Sunday = 6 (same numbering as the bot)
     ======================================================================== */
  const RESETS = {
    daily:  { weekday: null, hour: 23, minute: 59 },
    weekly: { weekday: 2,    hour: 23, minute: 59 },
    shop:   { weekday: 6,    hour: 23, minute: 59 },
    boss:   { weekday: 2,    hour: 23, minute: 30 }
  };

  // Used only when the browser gives a vague name like "GMT+5:30" instead of a code
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

  // tz = "UTC" for UTC, or undefined for the visitor's own timezone
  function dateFormatter(tz) {
    const key = tz || "local";
    if (!fmtCache[key]) {
      const opts = { weekday: "short", day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" };
      if (tz) opts.timeZone = tz;
      fmtCache[key] = new Intl.DateTimeFormat("en-GB", opts);
    }
    return fmtCache[key];
  }

  // -> { date: "Fri 20 Nov 2026", time: "18:05:09" }
  function formatMoment(date, tz) {
    const p = {};
    dateFormatter(tz).formatToParts(date).forEach(part => { p[part.type] = part.value; });
    return { date: p.weekday + " " + p.day + " " + p.month + " " + p.year, time: p.hour + ":" + p.minute + ":" + p.second };
  }

  // Timezone code for a moment ("UTC", "IST", "PST", "CET"...). Falls back to "UTC+5:30" style.
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

  // Next daily / weekly reset, in milliseconds (UTC). Same logic as the bot's get_next_*_utc.
  function nextReset(rule, now) {
    const t = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), rule.hour, rule.minute, 0, 0);
    let daysAhead = 0;
    if (rule.weekday !== null) {
      daysAhead = rule.weekday - ((now.getUTCDay() + 6) % 7);   // JS Sunday=0 -> bot's Monday=0
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

  // Write text into an element (with the Λ replacement), only if it changed
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
    if (!r.target || now.getTime() >= r.target) {            // (re)calculate when the reset has passed
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
    try { tickClocks(); } catch (e) { /* never let a clock problem break the rest of the page */ }
    setTimeout(runClocks, 1000 - (Date.now() % 1000) + 5);   // tick right after each new second
  }
  runClocks();


  /* ========================================================================
     10. FINAL STEP: CAPITAL "A" -> "Λ" EVERYWHERE ON THE PAGE
     --------------------------------------------------------------------
     Text that comes from the data files was already converted above.
     This pass converts all the normal text written in index.html, plus the
     browser tab title, and things like button hover text.
     ======================================================================== */
  if (CFG.useLambda) {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentNode.nodeName;
        return (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(node => { node.nodeValue = lambdaify(node.nodeValue); });

    $$("[aria-label],[title],[alt]").forEach(el => {
      ["aria-label", "title", "alt"].forEach(attr => { if (el.hasAttribute(attr)) el.setAttribute(attr, lambdaify(el.getAttribute(attr))); });
    });
    document.title = lambdaify(document.title);
  }

})();