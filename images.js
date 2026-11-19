/* ==========================================================================
   images.js  —  ALL IMAGE LINKS IN ONE PLACE
   --------------------------------------------------------------------------
   Every image on the site is looked up here by its ID.
   The IDs match the ones in members.js, leaders.js and slides.js.

   HOW TO ADD AN IMAGE
   1. Upload your image to a free image host (see the notes in the chat / README).
   2. Copy the direct link (it should end in .jpg, .png or .webp).
   3. Paste it between the quotation marks after the matching ID.

   Example:   "m001": "https://example.com/aarav.webp",

   If an ID has NO link (empty "") or the link is broken, the site automatically shows
   a coloured placeholder with the person's first letter. Nothing breaks.

   TIPS
   - Square-ish photos work best for members/leaders (about 480 x 340 px is plenty).
   - Moments/slides: about 1000 x 700 px.
   - Use .webp if you can. Keep each file under 500 KB.
   - Do NOT use Discord attachment links: they expire after a while.
   - Keep the comma at the end of every line (except it's fine on the last one too).
   ========================================================================== */

const IMAGES = {

  /* ---------- LOGO (optional) ----------
     Small square image shown top-left instead of the "ΛN" box. Leave "" to keep the box. */
  logo: "",

  /* ---------- LEADERS (Guild Master / Vice Guild Master) ----------
     IDs must match the "id" values in leaders.js. */
  leaders: {
    "base-gm":        "",   // BΛSE Guild Master photo link
    "base-vgm":       "",   // BΛSE Vice Guild Master photo link
    "arise-gm":       "",   // ΛRISE Guild Master photo link
    "arise-vgm":      "",   // ΛRISE Vice Guild Master photo link
    "overdrive-gm":   "",   // OVERDRIVE Guild Master photo link
    "overdrive-vgm":  ""    // OVERDRIVE Vice Guild Master photo link
  },

  /* ---------- MEMBERS ----------
     IDs must match the "id" values in members.js.
     Add one line per member:  "m001": "https://....webp",   */
  members: {
    // "m001": "https://your-image-link/aarav.webp",
    // "m002": "https://your-image-link/ananya.webp",
  },

  /* ---------- GUILD MOMENTS (slideshow pictures) ----------
     IDs must match the "id" values in slides.js.
     The links below are free sample photos so the slideshow is not empty.
     Replace them with your own guild pictures. */
  moments: {
    "b1": "https://images.unsplash.com/photo-1474511320723-9a56873867b5?auto=format&fit=crop&w=1000&q=80",
    "b2": "https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=1000&q=80",
    "a1": "https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=1000&q=80",
    "a2": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=1000&q=80",
    "o1": "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80",
    "o2": "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80"
  }
};
