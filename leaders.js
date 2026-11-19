/* ==========================================================================
   leaders.js  —  GUILD MASTERS (GM) AND VICE GUILD MASTERS (VGM)
   --------------------------------------------------------------------------
   Each leader is ONE block between { and }. Copy a block to add another leader
   (for example a second Vice Guild Master) — just give it a NEW unique "id".

   FIELDS
     id        : unique name. Must match the same id in images.js (section "leaders").
     guild     : which guild they lead. Use exactly: "base", "arise" or "overdrive".
     role      : the title shown on the card (e.g. "Guild Master", "Vice Guild Master").
     name      : plain name. The "ΛN • " prefix is added automatically — don't type it.
     country   : country (shown after the short description). Can be "".
     bio       : short description about them.
     review    : their short quote / review about the guild.
     discord   : (optional) link to their Discord profile. Leave "" to hide.
     instagram : (optional) link to their Instagram. Leave "" to hide.

   WHERE THEY APPEAR
     - In their own guild's "Leadership" tab.
     - Inside the member carousels (mixed in randomly with members):
         * the guild's own carousel,
         * the BΛSE carousel (everyone),
         * the "Meet our community" carousel at the bottom of the main page.

   The people below are SAMPLE data. Replace them with your real leaders.
   ========================================================================== */

const LEADERS = [

  /* ---------------- BΛSE ---------------- */
  {
    id: "base-gm", guild: "base", role: "Guild Master",
    name: "AMREN", country: "India",
    bio: "Keeps BΛSE friendly, busy and a little chaotic. Runs the weekend events.",
    review: "I built this place so nobody has to play alone.",
    discord: "https://discord.com/users/1429543022109921354", instagram: "https://www.instagram.com/amrendrakanaujia/"
  },
  // {
  //   id: "base-vgm", guild: "base", role: "Vice Guild Master",
  //   name: "Sofia Marchetti", country: "Italy",
  //   bio: "Welcomes every newcomer and moderates the late-night voice chats.",
  //   review: "Come for the games, stay for the people.",
  //   discord: "", instagram: ""
  // },

  /* ---------------- ΛRISE ---------------- */
  {
    id: "arise-gm", guild: "arise", role: "Guild Master",
    name: "AMREN", country: "India",
    bio: "Plans the weekly Guild Goals and makes sure every sub-guild stays on track.",
    review: "Consistency beats a last-minute panic run, every single week.",
    discord: "https://discord.com/users/1429543022109921354", instagram: "https://www.instagram.com/amrendrakanaujia/"
  },
  {
    id: "arise-vgm", guild: "arise", role: "Vice Guild Master",
    name: "THANOS", country: "India",
    bio: "Guild Boss strategist. Happy to explain any mission to anyone.",
    review: "Ask early, ask often. Nobody here minds.",
    discord: "", instagram: ""
  },
  {
    id: "arise-vgm", guild: "arise", role: "Vice Guild Master",
    name: "グリムジョー大佐", country: "",
    bio: "Kinda busyish. Still try my best.",
    review: "Need help? I am ever-ready.",
    discord: "", instagram: ""
  },

  /* ---------------- OVERDRIVE ---------------- */
  {
    id: "overdrive-gm", guild: "overdrive", role: "Guild Master",
    name: "{CS} MOMO", country: "Germany",
    bio: "Bridge between our community and CRIMSON SHΛDOWS. Organises guild nights.",
    review: "Grow together, fight together, dominate together.",
    discord: "", instagram: ""
  },
  {
    id: "overdrive-vgm", guild: "overdrive", role: "Vice Guild Master",
    name: "{CS} DUB", country: "Germany",
    bio: "Helps new members through the joining process and keeps the schedule tidy.",
    review: "A good team is mostly good communication.",
    discord: "", instagram: ""
  },
  {
    id: "overdrive-vgm", guild: "overdrive", role: "Mentor",
    name: "{CS} SLEEP", country: "Germany",
    bio: "Helps new members through the joining process and keeps the schedule tidy.",
    review: "A good team is mostly good communication.",
    discord: "", instagram: ""
  }

];
