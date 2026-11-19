/* ==========================================================================
   config.js  —  GENERAL SETTINGS  (edit this file to change site-wide things)
   --------------------------------------------------------------------------
   HOW TO EDIT:
   - Only change the text/numbers that are AFTER a colon ":" and BEFORE a comma ",".
   - Keep the quotation marks "" around text.
   - Keep every comma at the end of the line.
   - Lines starting with // are comments (notes for you). The computer ignores them.
   ========================================================================== */

const SITE_CONFIG = {

  /* >>> 1. YOUR DISCORD INVITE LINK <<<
     Every "Join our Discord" / "Apply to Join" button on the site uses this one link.
     Create a PERMANENT invite in Discord (Server Settings > Invites, set "Expire after: Never")
     and paste it here. */
  discordUrl: "https://anantyaguilds.wispbyte.org/discord",

  /* >>> 2. SUPPORT LINE <<<
     This sentence is shown near the bottom of the page and in the footer.
     The word "Discord" in it becomes a link to the invite above. */
  supportText: "Need help? For any support, contact us on Discord.",

  /* >>> 3. REPLACE EVERY CAPITAL "A" WITH "Λ" <<<
     true  = every capital A on the whole website (including names) shows as Λ
     false = leave letters as they are */
  useLambda: true,

  /* >>> 4. NAME PREFIX <<<
     Added automatically in front of EVERY member / leader name.
     You only type the plain name in members.js / leaders.js.
     To remove the prefix, change it to "" (two quotation marks, nothing between). */
  namePrefix: "ΛN • ",

  /* >>> 5. IMAGE FOLDER (optional) <<<
     In images.js you can paste full links (https://...). If you instead write only a file
     name like "aarav.webp", this address is put in front of it.
     Example: "https://cdn.jsdelivr.net/gh/YOURNAME/anantya-images@main/members/"
     Leave "" if you always paste full links. */
  imageBaseUrl: "",

  /* >>> 6. DEMO (SAMPLE) MEMBERS <<<
     true  = the site adds sample members so the carousels are full while you build.
     false = only the real members you wrote in members.js are shown.
     Set this to false when your real list is ready. */
  showDemoMembers: true,
  demoMemberCount: 120,       // how many sample members to create (only if the line above is true)

  /* >>> 7. SPEEDS <<<  */
  carouselSpeed: 22,          // member carousels: pixels per second (lower = slower, e.g. 12)
  slideshowSeconds: 6,       // "Guild moments" slideshows: seconds per slide
  languageSeconds: 3          // header language/tagline: seconds before it changes
};

/* Names of the three guilds (shown on cards and slides).
   The left side (base, arise, overdrive) is an ID used by the other files — do NOT change it.
   You can change the text on the right. */
const GUILD_LABELS = {
  base: "BΛSE",
  arise: "ΛRISE",
  overdrive: "OVERDRIVE"
};
