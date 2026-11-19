/* ==========================================================================
   slides.js  —  "GUILD MOMENTS" SLIDESHOW TEXT
   --------------------------------------------------------------------------
   Each slide is ONE block between { and }. Copy a block to add another slide.

   FIELDS
     id          : unique name. Its picture is set in images.js (section "moments").
     guild       : "base", "arise" or "overdrive".
                   - Shows in that guild's panel slideshow AND in the main-page slideshow.
     title       : slide heading.
     description : slide text. Long text is cut after 3 lines with a "Show more" button.
     instagram   : (optional) link, "" hides the button.
     discord     : (optional) link, "" hides the button.
   ========================================================================== */

const SLIDES = [
  { id: "b1", guild: "base", title: "Small moments, big community",
    description: "A home for every game, every timezone and every kind of player. Share a win, find a squad, trade recommendations or simply hang out. BΛSE is where all our paths meet.",
    instagram: "", discord: "" },

  { id: "b2", guild: "base", title: "A little room to breathe",
    description: "Between raids and ranked matches, there is always room for a laugh, a new friend or a completely unrelated conversation. The best community moments are often the unplanned ones.",
    instagram: "", discord: "" },

  { id: "a1", guild: "arise", title: "Rise together",
    description: "Progress is better when the whole team moves forward. Keep up with weekly goals, help your sub-guild and celebrate every hard-earned upgrade. Consistency beats a last-minute panic run.",
    instagram: "", discord: "" },

  { id: "a2", guild: "arise", title: "The grind has a group chat",
    description: "Daily missions, Guild Boss runs and mini-games are easier with people who understand the assignment. Share strategies, compare progress and remember to have fun between the numbers.",
    instagram: "", discord: "" },

  { id: "o1", guild: "overdrive", title: "Full throttle, good company",
    description: "OVERDRIVE brings players together around teamwork, shared goals and the road ahead with CRIMSON SHΛDOWS. Show up for your teammates, keep communication clear and make every run count.",
    instagram: "", discord: "" },

  { id: "o2", guild: "overdrive", title: "Find your next adventure",
    description: "Strong teams are built outside the scoreboard too. Meet your fellow players, exchange useful tips and make the most of every guild night. Grow together, fight together, dominate together.",
    instagram: "", discord: "" }
];
