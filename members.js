/* ==========================================================================
   members.js  —  YOUR MEMBER LIST
   --------------------------------------------------------------------------
   Each member is ONE line between { and }. Copy a line to add another member.
   Put a comma after every member except (optionally) the last.

   FIELDS
     id        : unique name for this member, e.g. "m001", "m002"...
                 It must match the same id in images.js (section "members") to show their photo.
                 Never use the same id twice.
     name      : plain name. The "ΛN • " prefix is added automatically — don't type it.
     guild     : "base", "arise" or "overdrive"  (exactly like that, lowercase).
     sub       : the label shown above the name. For ΛRISE use the sub-guild:
                 "ΛNΛNTYΛ", "2ΛNΛNTYΛ" or "3ΛNΛNTYΛ". For others you can leave "".
     country   : country name. Can be "".
     bio       : short description about the member.
     review    : their short review/quote about the guild.
     discord   : (optional) link to Discord profile. "" hides it.
     instagram : (optional) link to Instagram. "" hides it.

   WHERE THEY APPEAR
     - ΛRISE members     -> ΛRISE carousel + BΛSE carousel + main-page carousel
     - OVERDRIVE members -> OVERDRIVE carousel + BΛSE carousel + main-page carousel
     - BΛSE members      -> BΛSE carousel + main-page carousel
   (The BΛSE carousel and the main-page carousel show EVERYONE, mixed randomly.)
   ========================================================================== */

const MEMBERS = [

  /* ----- ADD YOUR REAL MEMBERS BELOW THIS LINE (the two lines below are examples) ----- */

  { id: "m001", name: "Aarav Sharma", guild: "arise", sub: "ΛNΛNTYΛ", country: "India",
    bio: "Collector of screenshots and oddly specific trivia.",
    review: "The guild chat has more plot twists than the game.", discord: "", instagram: "" },

  { id: "m002", name: "Yuki Tanaka", guild: "overdrive", sub: "", country: "Japan",
    bio: "Casual strategist. Professional snack-break coordinator.",
    review: "Great teammates. Terrible influence on my bedtime.", discord: "", instagram: "" }

  /* ----- ADD YOUR REAL MEMBERS ABOVE THIS LINE ----- */
];


/* ==========================================================================
   DEMO MEMBERS  (automatic sample people so the carousels are not empty)
   --------------------------------------------------------------------------
   You do NOT need to touch anything below.
   To turn demo members off, set  showDemoMembers: false  in config.js.
   (You may also delete everything below this box once your real list is ready.)
   ========================================================================== */
if (SITE_CONFIG.showDemoMembers) {
  const firstNames = [["Ishaan","India"],["Meera","India"],["Kabir","India"],["Ren","Japan"],["Hana","Japan"],["Min-jun","South Korea"],["Seo-yun","South Korea"],["Luca","Italy"],["Giulia","Italy"],["Noah","USA"],["Chloe","USA"],["Hugo","France"],["Camille","France"],["Oliver","United Kingdom"],["Isla","United Kingdom"],["Mateo","Spain"],["Camila","Brazil"],["Rafael","Brazil"],["Amina","Egypt"],["Liam","Canada"],["Erik","Sweden"],["Astrid","Norway"],["Thabo","South Africa"],["Amara","Nigeria"],["Layla","UAE"],["Siti","Malaysia"],["Minh","Vietnam"],["Ethan","Australia"],["Ruby","Australia"],["Kai","New Zealand"]];
  const lastNames = ["Patel","Rao","Mehta","Sato","Kim","Park","Rossi","Romano","Miller","Carter","Dubois","Martin","Wilson","Evans","Garcia","Silva","Santos","Khan","Hassan","Andersson","Nkosi","Okafor","Nguyen","Fischer","Novak","Cohen","Mori","Costa","Thompson","Brooks"];
  const bios = ["Here for good games, better people and questionable sleep schedules.","I turn small victories into unnecessarily dramatic celebrations.","Usually farming resources. Occasionally touching grass.","A quiet player until the co-op chaos begins.","Powered by music, late-night queues and pure curiosity.","I enjoy helping teammates and pretending my builds are planned.","Part-time explorer, full-time button enthusiast.","I came for the game and stayed for the memes."];
  const reviews = ["Joined for buffs. Stayed because these people are my debuff.","I gained friends, loot and 47 new inside jokes.","A wholesome community with a suspiciously high meme output.","Five stars. Would get carried again.","Came in shy. Now I am legally required to post memes.","The boss is scary; the group chat is scarier."];
  const subGuilds = ["ΛNΛNTYΛ", "2ΛNΛNTYΛ", "3ΛNΛNTYΛ"];

  const total = SITE_CONFIG.demoMemberCount;
  for (let i = 0; i < total; i++) {
    const [first, country] = firstNames[i % firstNames.length];
    const last = lastNames[(i * 7 + Math.floor(i / firstNames.length) * 11) % lastNames.length];
    // roughly 60% ΛRISE, 12% OVERDRIVE, 28% BΛSE
    const guild = i < total * 0.6 ? "arise" : i < total * 0.72 ? "overdrive" : "base";
    MEMBERS.push({
      id: "demo-" + String(i + 1).padStart(3, "0"),
      name: first + " " + last + (i >= firstNames.length ? " " + (Math.floor(i / firstNames.length) + 1) : ""),
      guild: guild,
      sub: guild === "arise" ? subGuilds[i % 3] : "",
      country: country,
      bio: bios[i % bios.length],
      review: reviews[(i * 5) % reviews.length],
      discord: "", instagram: ""
    });
  }
}
