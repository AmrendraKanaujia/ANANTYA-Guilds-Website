/* ==========================================================================
   translations.js  —  LANGUAGES, TAGLINES, DESCRIPTIONS & TRANSLATION RULES
   --------------------------------------------------------------------------
   - Keep standard capital "A" here; script.js converts "A" to "Λ" on screen.
   - Add new languages, taglines, and localized menu descriptions in LANGUAGES.
   - Add names, guild names, or game titles to DO_NOT_TRANSLATE so the free
     translator leaves them untouched.
   - Add custom per-language word/phrase overrides in MANUAL_TRANSLATIONS.
   ========================================================================== */

const TRANSLATION_CONFIG = {
  defaultLanguage: "en",

  // Languages shown in the header cycler and clickable language menu
  languages: [
    {
      code: "en",
      name: "English",
      tagline: "Belong to Infinity",
      description: "The header cycles through community languages automatically. Click any language below to translate the page while keeping guild, game, and member names intact."
    },
    {
      code: "hi",
      name: "हिन्दी",
      tagline: "अनंत का हिस्सा",
      description: "हेडर में भाषाएँ अपने आप बदलती रहती हैं। पूरी वेबसाइट का अनुवाद करने के लिए नीचे किसी भी भाषा को चुनें—गिल्ड, गेम और सदस्यों के नाम नहीं बदलेंगे।"
    },
    {
      code: "bho",
      name: "भोजपुरी",
      tagline: "अनंत के हिस्सा बनीं",
      description: "ऊपर हेडर में भाषा अपने आप बदलत रहेला। पूरा वेबसाइट के अनुवाद करे खातिर नीचे कवनो भाषा चुनीं—गिल्ड, गेम आ सदस्यन के नाम ओइसहीं रही।"
    },
    {
      code: "fr",
      name: "Français",
      tagline: "Appartenir à l’infini",
      description: "L’en-tête fait défiler automatiquement les langues de la communauté. Cliquez sur une langue ci-dessous pour traduire le site tout en conservant les noms des guildes, des jeux et des membres."
    },
    {
      code: "de",
      name: "Deutsch",
      tagline: "Zur Unendlichkeit gehören",
      description: "Die Kopfzeile wechselt automatisch zwischen den Sprachen der Community. Wähle unten eine Sprache aus, um die Seite zu übersetzen – Gilden-, Spiel- und Mitgliedernamen bleiben unverändert."
    },
    {
      code: "sa",
      name: "संस्कृतम्",
      tagline: "अनन्तस्य अंशः",
      description: "शीर्षभागे समुदायभाषाः स्वतः परिवर्तन्ते। जालपुटस्य अनुवादाय अधः काञ्चित् भाषां चिनुत—संघस्य, क्रीडायाः, सदस्यानां च नामानि यथावत् तिष्ठन्ति।"
    },
    {
      code: "ru",
      name: "Русский",
      tagline: "Принадлежать бесконечности",
      description: "В шапке сайта автоматически сменяются языки сообщества. Нажмите на любой язык ниже, чтобы перевести страницу — названия гильдий, игр и имена участников останутся без изменений."
    },
    {
      code: "ko",
      name: "한국어",
      tagline: "무한에 속하다",
      description: "상단 헤더에서 커뮤니티 언어가 자동으로 순환됩니다. 아래에서 언어를 선택하면 길드, 게임, 멤버 이름은 그대로 유지한 채 페이지 전체가 번역됩니다."
    },
    {
      code: "ja",
      name: "日本語",
      tagline: "無限に属する",
      description: "ヘッダーではコミュニティの言語が自動的に切り替わります。下の言語を選択すると、ギルド名・ゲーム名・メンバー名をそのままにページ全体が翻訳されます。"
    },
    {
      code: "ar",
      name: "العربية",
      tagline: "الانتماء إلى اللانهاية",
      description: "يتنقل الشريط العلوي تلقائيًا بين لغات المجتمع. اختر أي لغة أدناه لترجمة الصفحة مع الحفاظ على أسماء النقابات والألعاب والأعضاء كما هي."
    }
  ],

  // Words & phrases that MUST NEVER be translated (guild names, game names, acronyms, etc.)
  // Note: Leader and member names from leaders.js and members.js are also protected automatically.
  doNotTranslate: [
    "Solo Leveling: ARISE OVERDRIVE",
    "Solo Leveling: ARISE",
    "Solo Leveling",
    "CRIMSON SHADOWS",
    "2ANANTYA",
    "3ANANTYA",
    "ANANTYA Guilds",
    "ANANTYA",
    "OVERDRIVE",
    "ARISE",
    "BASE",
    "Discord",
    "Instagram",
    "UTC",
    "VGM",
    "GM"
  ],

  // Manual translation overrides per language code (checked before calling the free translator)
  // Format: languageCode: { "Exact English phrase": "Manual translation" }
  manualTranslations: {
    hi: {
      "Guilds": "गिल्ड्स",
      "Guild Norms": "गिल्ड नियम",
      "Join Us": "हमसे जुड़ें",
      "Explore our guilds": "हमारे गिल्ड्स देखें",
      "Join our Discord": "हमारे Discord से जुड़ें",
      "Apply to Join": "शामिल होने के लिए आवेदन करें",
      "Leadership": "नेतृत्व",
      "Members": "सदस्य",
      "Reset Times": "रीसेट समय",
      "Guild Goals": "गिल्ड लक्ष्य"
    },
    bho: {
      "guilds": "गिल्ड्स",
      "Guild": "गिल्ड",
      "Guild Norms": "गिल्ड के नियम",
      "Join Us": "हमनी से जुड़ीं",
      "Explore our guilds": "हमनी के गिल्ड्स देखीं",
      "Join our Discord": "हमनी के Discord से जुड़ीं",
      "Apply to Join": "जुड़े खातिर आवेदन करीं",
      "Leadership": "नेतृत्व",
      "Members": "सदस्य लोग",
      "Reset Times": "रीसेट के समय",
      "Guild Goals": "गिल्ड के लक्ष्य"
    }
  }
};