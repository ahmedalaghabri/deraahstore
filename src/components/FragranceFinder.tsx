import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Heart, RotateCcw, Sparkles } from "lucide-react";
import { type Product as StoreProduct } from "./ProductDetailsPage";
import { useStoreLocale } from "./StoreLocaleContext";

type QuizKey = "gender" | "clothingColor" | "wallColor" | "possessionsColor" | "hobbies" | "vacation" | "birthday" | "job" | "special" | "personalityType" | "quiet" | "sensitive" | "patient" | "social" | "confidence" | "emotional" | "observant" | "eloquent" | "zodiac" | "skin" | "personalityDescription" | "ingredients" | "scentDirection";
type AnswerValue = string | string[];
type FinderView = "intro" | "quiz" | "results";

type QuizOption = {
  value: string;
  label: string;
  description: string;
};

const colorVisuals: Record<string, string> = {
  black: "#17151a",
  gray: "#9ca0a6",
  brown: "#9a6d52",
  blue: "#6f9cc7",
  white: "#f7f4ef",
  green: "#7da47a",
  pink: "#e5a9ba",
  purple: "#a48bbd",
  orange: "#e09a5c",
  red: "#bd5a5e",
  gold: "#c9a04f",
};

type QuizStep = {
  key: QuizKey;
  eyebrow: string;
  question: string;
  description: string;
  options: QuizOption[];
  maleOptions?: QuizOption[];
  multi?: boolean;
  maxSelections?: number;
};

type FragranceProfile = {
  product: StoreProduct;
  tags: Partial<Record<QuizKey, string[]>> & { audience: string[]; family: string[]; notes: string[]; sweetness: string[]; weight: string[]; season: string[]; occasion: string[]; trail: string[]; personality: string[] };
  signature: string;
  vibe: string;
};

const agreementOptions: QuizOption[] = [
  { value: "strongly-disagree", label: "Strongly disagree", description: "Not like me at all" },
  { value: "disagree", label: "Disagree", description: "Usually not like me" },
  { value: "neutral", label: "Sometimes", description: "It depends on the moment" },
  { value: "agree", label: "Agree", description: "Usually like me" },
  { value: "strongly-agree", label: "Strongly agree", description: "Very much like me" },
];

const agreementStepKeys: QuizKey[] = ["quiet", "sensitive", "patient", "social", "confidence", "emotional", "observant", "eloquent"];

const zodiacOptions: QuizOption[] = [
  { value: "capricorn", label: "December 22 – January 19", description: "Capricorn" },
  { value: "aquarius", label: "January 20 – February 18", description: "Aquarius" },
  { value: "pisces", label: "February 19 – March 20", description: "Pisces" },
  { value: "aries", label: "March 21 – April 19", description: "Aries" },
  { value: "taurus", label: "April 20 – May 20", description: "Taurus" },
  { value: "gemini", label: "May 21 – June 20", description: "Gemini" },
  { value: "cancer", label: "June 21 – July 22", description: "Cancer" },
  { value: "leo", label: "July 23 – August 22", description: "Leo" },
  { value: "virgo", label: "August 23 – September 22", description: "Virgo" },
  { value: "libra", label: "September 23 – October 23", description: "Libra" },
  { value: "scorpio", label: "October 24 – November 21", description: "Scorpio" },
  { value: "sagittarius", label: "November 22 – December 21", description: "Sagittarius" },
];

const finderArabicQuestions: Record<string, string> = {
  "Who is this fragrance for?": "لمن هذا العطر؟",
  "What is your favorite color to wear?": "ما لونك المفضل في ملابسك؟",
  "What is your favorite wall-paint color?": "ما لون طلاء الجدران المفضل لديك؟",
  "What is your favorite color for your possessions?": "ما لونك المفضل في مقتنياتك؟",
  "Which hobbies do you enjoy most?": "ما الهوايات التي تستمتع بها أكثر؟",
  "Where would you spend your vacation if you had the chance?": "أين ستقضي إجازتك لو أتيحت لك الفرصة؟",
  "How would you spend your birthday?": "كيف ستقضي يوم ميلادك؟",
  "Which of these jobs would you wish to have?": "أيّاً من هذه الوظائف تتمنى أن تعمل بها؟",
  "What do you consider special about yourself?": "ما الشيء المميز الذي تراه في نفسك؟",
  "Which personality is closest to yours?": "أي شخصية هي الأقرب إلى شخصيتك؟",
  "Do you lean toward calm and few words?": "هل تميل إلى الهدوء وقلة الكلام؟",
  "How sensitive are you?": "ما مدى حساسيتك؟",
  "How patient are you?": "ما مدى صبرك؟",
  "How social are you?": "ما مدى اجتماعيتك؟",
  "How confident are you?": "ما مدى ثقتك بنفسك؟",
  "How emotional are you?": "ما مدى عاطفيتك؟",
  "How observant are you?": "ما مدى ملاحظتك للتفاصيل؟",
  "How eloquent are you?": "ما مدى فصاحتك؟",
  "Choose your date of birth": "اختر تاريخ ميلادك",
  "What is your skin type?": "ما نوع بشرتك؟",
  "How would you describe your personality?": "كيف تصف شخصيتك؟",
  "Which ingredients would you love in your fragrance?": "ما المكونات التي تفضلها في عطرك؟",
  "Which scents do you lean toward most?": "إلى أي الروائح تميل أكثر؟",
};

const finderArabicOptionLabels: Partial<Record<QuizKey, Record<string, string>>> = {
  gender: { male: "للرجال", female: "للنساء" },
  clothingColor: { black: "الأسود", blue: "الأزرق", white: "الأبيض", brown: "البني", orange: "البرتقالي", red: "الأحمر", purple: "البنفسجي", gray: "الرمادي", pink: "الوردي" },
  wallColor: { green: "الأخضر", white: "الأبيض", gray: "الرمادي", purple: "البنفسجي", pink: "الوردي", brown: "البني", red: "الأحمر", blue: "الأزرق" },
  possessionsColor: { blue: "الأزرق", pink: "الوردي", gold: "الذهبي", black: "الأسود", green: "الأخضر", red: "الأحمر" },
  hobbies: { poetry: "الشعر", mystery: "الروايات البوليسية", events: "تنظيم الأنشطة والفعاليات", home: "ترتيب المنزل", sports: "ممارسة الرياضة", plants: "العناية بالنباتات والزهور" },
  vacation: { home: "في المنزل", island: "في جزيرة", beach: "على الشاطئ", safari: "في رحلة سفاري", park: "في حديقة عامة", "children-home": "في دار للأطفال" },
  birthday: { "family-party": "حفلة عائلية", "romantic-dinner": "عشاء رومانسي", "friends-night": "سهرة مع الأصدقاء", cinema: "فيلم في السينما", "large-hall": "احتفال في قاعة كبيرة", "no-celebration": "لن أحتفل به" },
  job: {
    "female-novelist": "روائي أو روائية", "male-novelist": "روائي", coach: "مدرب تطوير شخصي", "female-accountant": "محاسب أو محاسبة", "male-accountant": "محاسب", "political-party": "عضو في حزب سياسي", judiciary: "في السلك القضائي", politician: "سياسي", sailor: "بحّار", detective: "محقق جنائي", "female-musician": "مغنٍ أو موسيقي", "male-musician": "مغنٍ أو موسيقي", "public-relations": "علاقات عامة", "female-fashion": "مصمم أزياء", "male-fashion": "مصمم أزياء", "female-manager": "مدير أو مدير بنك", "male-manager": "مدير إداري أو مدير بنك", "female-flight-attendant": "مضيف طيران", "male-flight-attendant": "مضيف طيران", "female-archaeologist": "متخصص آثار", "male-archaeologist": "متخصص آثار",
  },
  special: { artistic: "عاطفي وشغوف بالفن", diplomatic: "دبلوماسي واجتماعي", "pleasure-seeker": "أحب المتعة وأبحث عن الحب", traditional: "تقليدي ولا أحب المخاطرة", adventurous: "جريء ومغامر", mysterious: "غامض ومثير للفضول" },
  personalityType: { entertainer: "الشخص المرح", defender: "الحامي", logician: "المفكر المنطقي", adventurer: "المغامر", creator: "المبدع", leader: "القائد" },
  quiet: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  sensitive: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  patient: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  social: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  confidence: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  emotional: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  observant: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  eloquent: { "strongly-disagree": "لا ينطبق علي إطلاقاً", disagree: "غالباً لا ينطبق علي", neutral: "أحياناً", agree: "غالباً ينطبق علي", "strongly-agree": "ينطبق علي جداً" },
  zodiac: { capricorn: "22 ديسمبر – 19 يناير", aquarius: "20 يناير – 18 فبراير", pisces: "19 فبراير – 20 مارس", aries: "21 مارس – 19 أبريل", taurus: "20 أبريل – 20 مايو", gemini: "21 مايو – 20 يونيو", cancer: "21 يونيو – 22 يوليو", leo: "23 يوليو – 22 أغسطس", virgo: "23 أغسطس – 22 سبتمبر", libra: "23 سبتمبر – 23 أكتوبر", scorpio: "24 أكتوبر – 21 نوفمبر", sagittarius: "22 نوفمبر – 21 ديسمبر" },
  skin: { dry: "بشرة جافة", oily: "بشرة دهنية", sensitive: "بشرة حساسة" },
  personalityDescription: { sporty: "أحب الرياضة أو أمارسها", dreamy: "حالم", romantic: "رومانسي", playful: "مرح", leader: "قائد", classic: "كلاسيكي" },
  ingredients: { "aquatic-herbs": "أعشاب برائحة مائية", "green-fruit": "أعشاب خضراء مع الفاكهة", "green-woods": "أعشاب خضراء مع أخشاب عطرية", "green-oriental": "أعشاب خضراء مع مكونات شرقية", "fern-lavender-citrus": "سرخسيات مثل اللافندر مع الأعشاب الخضراء والحمضيات", "fresh-hot": "أعشاب خضراء منعشة مع مكونات حارة", "sweet-notes": "أعشاب مع نوتات حلوة", "citrus-woods": "حمضيات مع أخشاب عطرية", "citrus-oriental": "حمضيات مع مكونات شرقية" },
  scentDirection: { aquatic: "نوتات مائية", woody: "نوتات خشبية", fruity: "نوتات فاكهية", citrus: "نوتات حمضية", "fresh-floral-herbal": "نوتات عشبية منعشة مع الزهور", spicy: "روائح متبلة", sweet: "روائح حلوة" },
};

const finderArabicEyebrows: Record<string, string> = {
  "Your fragrance profile": "ملف عطرك",
  "Your style": "أسلوبك",
  "Your surroundings": "محيطك",
  "Your details": "تفاصيلك",
  "Your free time": "وقت فراغك",
  "Your escape": "وجهتك",
  "Your celebration": "احتفالك",
  "Your ambition": "طموحك",
  "Your signature": "بصمتك",
  "Your personality": "شخصيتك",
  "A closer look": "نظرة أعمق",
  "Your birth date": "تاريخ ميلادك",
  "Your skin": "بشرتك",
  "How you see yourself": "نظرتك إلى نفسك",
  "The ingredients": "المكونات",
  "The scent direction": "اتجاه العطر",
};

function localizeFinderQuestion(value: string, isArabic: boolean) {
  return isArabic ? finderArabicQuestions[value] ?? value : value;
}

function localizeFinderEyebrow(value: string, isArabic: boolean) {
  if (!isArabic) return value;
  const match = value.match(/^Question (\d+) of (\d+) · (.+)$/);
  return match ? `السؤال ${match[1]} من ${match[2]} · ${finderArabicEyebrows[match[3]] ?? match[3]}` : value;
}

function localizeFinderOption(option: QuizOption, stepKey: QuizKey, isArabic: boolean): QuizOption {
  return isArabic ? { ...option, label: finderArabicOptionLabels[stepKey]?.[option.value] ?? option.label } : option;
}

const quizSteps: QuizStep[] = [
  {
    key: "gender",
    eyebrow: "Question 1 of 23 · Your fragrance profile",
    question: "Who is this fragrance for?",
    description: "Choose the direction that feels most like you.",
    options: [
      { value: "male", label: "For men", description: "A confident masculine direction" },
      { value: "female", label: "For women", description: "A soft feminine direction" },
    ],
  },
  {
    key: "clothingColor",
    eyebrow: "Question 1 of 22 · Your style",
    question: "What is your favorite color to wear?",
    description: "Choose the color that feels most like your wardrobe.",
    options: [
      { value: "black", label: "Black", description: "Timeless and confident" },
      { value: "blue", label: "Blue", description: "Calm and dependable" },
      { value: "white", label: "White", description: "Clean and effortless" },
      { value: "brown", label: "Brown", description: "Warm and grounded" },
      { value: "orange", label: "Orange", description: "Energetic and expressive" },
      { value: "red", label: "Red", description: "Bold and memorable" },
      { value: "purple", label: "Purple", description: "Creative and intriguing" },
    ],
    maleOptions: [
      { value: "black", label: "Black", description: "Timeless and confident" },
      { value: "gray", label: "Gray", description: "Balanced and composed" },
      { value: "brown", label: "Brown", description: "Warm and grounded" },
      { value: "blue", label: "Blue", description: "Calm and dependable" },
      { value: "white", label: "White", description: "Clean and effortless" },
      { value: "pink", label: "Pink", description: "Open and expressive" },
    ],
  },
  {
    key: "wallColor",
    eyebrow: "Question 2 of 22 · Your surroundings",
    question: "What is your favorite wall-paint color?",
    description: "The colors around you can reveal the atmosphere you enjoy.",
    options: [
      { value: "green", label: "Green", description: "Natural and restorative" },
      { value: "white", label: "White", description: "Bright and open" },
      { value: "gray", label: "Gray", description: "Quiet and modern" },
      { value: "purple", label: "Purple", description: "Creative and distinctive" },
      { value: "pink", label: "Pink", description: "Soft and warm" },
      { value: "brown", label: "Brown", description: "Comforting and grounded" },
    ],
    maleOptions: [
      { value: "red", label: "Red", description: "Energetic and decisive" },
      { value: "green", label: "Green", description: "Natural and restorative" },
      { value: "gray", label: "Gray", description: "Quiet and modern" },
      { value: "white", label: "White", description: "Bright and open" },
      { value: "purple", label: "Purple", description: "Creative and distinctive" },
      { value: "blue", label: "Blue", description: "Calm and dependable" },
    ],
  },
  {
    key: "possessionsColor",
    eyebrow: "Question 3 of 22 · Your details",
    question: "What is your favorite color for your possessions?",
    description: "Think of the colors you choose for the things you keep close.",
    options: [
      { value: "blue", label: "Blue", description: "Calm and dependable" },
      { value: "pink", label: "Pink", description: "Soft and expressive" },
      { value: "gold", label: "Gold", description: "Luxurious and warm" },
      { value: "black", label: "Black", description: "Timeless and confident" },
      { value: "green", label: "Green", description: "Natural and fresh" },
      { value: "red", label: "Red", description: "Bold and memorable" },
    ],
  },
  {
    key: "hobbies",
    eyebrow: "Question 4 of 22 · Your free time",
    question: "Which hobbies do you enjoy most?",
    description: "Choose more than one if it feels right.",
    multi: true,
    maxSelections: 3,
    options: [
      { value: "poetry", label: "Poetry", description: "Reading or writing" },
      { value: "mystery", label: "Detective novels", description: "Mystery and suspense" },
      { value: "events", label: "Organising activities and events", description: "Bringing people together" },
      { value: "home", label: "Arranging things at home", description: "Order and calm" },
      { value: "sports", label: "Playing sports", description: "Movement and energy" },
      { value: "plants", label: "Caring for plants and flowers", description: "Nature and patience" },
    ],
  },
  {
    key: "vacation",
    eyebrow: "Question 5 of 22 · Your escape",
    question: "Where would you spend your vacation if you had the chance?",
    description: "Choose the place that sounds most restorative.",
    options: [
      { value: "home", label: "At home", description: "Comfort, privacy, and your own rhythm" },
      { value: "island", label: "On an island", description: "A peaceful, beautiful escape" },
      { value: "beach", label: "At the beach", description: "Sun, air, and open space" },
      { value: "safari", label: "On safari", description: "Adventure and discovery" },
      { value: "park", label: "In a public park", description: "Green space and easy moments" },
      { value: "children-home", label: "At a children’s home", description: "Giving time and care" },
    ],
  },
  {
    key: "birthday",
    eyebrow: "Question 6 of 22 · Your celebration",
    question: "How would you spend your birthday?",
    description: "Choose the celebration that feels most natural to you.",
    options: [
      { value: "family-party", label: "A family party", description: "Close people and familiar warmth" },
      { value: "romantic-dinner", label: "A romantic dinner", description: "Intimate and memorable" },
      { value: "friends-night", label: "A night out with friends", description: "Laughter and energy" },
      { value: "cinema", label: "A feature film at the cinema", description: "A story and a little escape" },
      { value: "large-hall", label: "A celebration in a large hall", description: "A big, expressive moment" },
      { value: "no-celebration", label: "I would not celebrate it", description: "A quiet day on your own terms" },
    ],
  },
  {
    key: "job",
    eyebrow: "Question 7 of 22 · Your ambition",
    question: "Which of these jobs would you wish to have?",
    description: "Choose the role that reflects the side of you you want to express.",
    options: [
      { value: "female-novelist", label: "Novelist", description: "Stories, imagination, and feeling" },
      { value: "coach", label: "Personal-development coach", description: "Helping people grow" },
      { value: "female-accountant", label: "Accountant", description: "Precision and structure" },
      { value: "political-party", label: "Political-party member", description: "Conviction and public life" },
      { value: "judiciary", label: "In the judiciary", description: "Justice and judgment" },
      { value: "female-musician", label: "Singer or musician", description: "Performance and emotion" },
      { value: "public-relations", label: "Public relations", description: "People and communication" },
      { value: "female-fashion", label: "Fashion designer", description: "Taste and creativity" },
      { value: "female-manager", label: "Manager or bank director", description: "Leadership and responsibility" },
      { value: "female-flight-attendant", label: "Flight attendant", description: "Movement and hospitality" },
      { value: "female-archaeologist", label: "Archaeology specialist", description: "History and discovery" },
    ],
    maleOptions: [
      { value: "male-novelist", label: "Novelist", description: "Stories, imagination, and feeling" },
      { value: "coach", label: "Personal-development coach", description: "Helping people grow" },
      { value: "sailor", label: "Sailor", description: "Freedom and adventure" },
      { value: "male-accountant", label: "Accountant", description: "Precision and structure" },
      { value: "politician", label: "Politician", description: "Conviction and public life" },
      { value: "detective", label: "Criminal investigator", description: "Observation and discovery" },
      { value: "male-musician", label: "Singer or musician", description: "Performance and emotion" },
      { value: "public-relations", label: "Public relations", description: "People and communication" },
      { value: "male-fashion", label: "Fashion designer", description: "Taste and creativity" },
      { value: "male-manager", label: "Administrative or bank manager", description: "Leadership and responsibility" },
      { value: "male-flight-attendant", label: "Flight attendant", description: "Movement and hospitality" },
      { value: "male-archaeologist", label: "Archaeology specialist", description: "History and discovery" },
    ],
  },
  {
    key: "special",
    eyebrow: "Question 8 of 22 · Your signature",
    question: "What do you consider special about yourself?",
    description: "Choose the quality that feels most distinctive.",
    options: [
      { value: "artistic", label: "Emotional and passionate about art", description: "Feeling and expression" },
      { value: "diplomatic", label: "Diplomatic and social", description: "Grace and connection" },
      { value: "pleasure-seeker", label: "I love pleasure and seek love", description: "Warmth and romance" },
      { value: "traditional", label: "Traditional and not a risk-taker", description: "Steady and familiar" },
      { value: "adventurous", label: "Bold and adventurous", description: "Courage and movement" },
      { value: "mysterious", label: "Mysterious and intriguing", description: "Depth and curiosity" },
    ],
  },
  {
    key: "personalityType",
    eyebrow: "Question 9 of 22 · Your personality",
    question: "Which personality is closest to yours?",
    description: "Pick the description that feels most familiar.",
    options: [
      { value: "entertainer", label: "The entertainer", description: "Playful, lively, and engaging" },
      { value: "defender", label: "The defender", description: "Loyal, caring, and dependable" },
      { value: "logician", label: "The logician", description: "Curious, precise, and analytical" },
      { value: "adventurer", label: "The adventurer", description: "Independent, bold, and open" },
      { value: "creator", label: "The creator", description: "Imaginative, expressive, and original" },
      { value: "leader", label: "The leader", description: "Decisive, confident, and driven" },
    ],
  },
  ...(["quiet", "sensitive", "patient", "social", "confidence", "emotional", "observant", "eloquent"] as const).map((key, index) => ({
    key,
    eyebrow: `Question ${index + 10} of 22 · A closer look`,
    question: [
      "Do you lean toward calm and few words?",
      "How sensitive are you?",
      "How patient are you?",
      "How social are you?",
      "How confident are you?",
      "How emotional are you?",
      "How observant are you?",
      "How eloquent are you?",
    ][index],
    description: "Use the five-point scale to answer honestly.",
    options: agreementOptions,
  })),
  {
    key: "zodiac",
    eyebrow: "Question 18 of 22 · Your birth date",
    question: "Choose your date of birth",
    description: "Select the date range that includes your birthday.",
    options: zodiacOptions,
  },
  {
    key: "skin",
    eyebrow: "Question 19 of 22 · Your skin",
    question: "What is your skin type?",
    description: "This helps us understand how a fragrance may sit on your skin.",
    options: [
      { value: "dry", label: "Dry skin", description: "Often benefits from warmer, softer scents" },
      { value: "oily", label: "Oily skin", description: "Often carries fresh notes with confidence" },
      { value: "sensitive", label: "Sensitive skin", description: "Often suits clean, gentle directions" },
    ],
  },
  {
    key: "personalityDescription",
    eyebrow: "Question 20 of 22 · How you see yourself",
    question: "How would you describe your personality?",
    description: "Choose the sentence that feels closest to you.",
    options: [
      { value: "sporty", label: "I love or practise sports", description: "Active, energetic, and direct" },
      { value: "dreamy", label: "Dreamy", description: "Imaginative and contemplative" },
      { value: "romantic", label: "Romantic", description: "Warm, expressive, and affectionate" },
      { value: "playful", label: "Playful", description: "Light, lively, and fun" },
      { value: "leader", label: "A leader", description: "Confident, decisive, and focused" },
      { value: "classic", label: "Classic", description: "Refined, timeless, and composed" },
    ],
  },
  {
    key: "ingredients",
    eyebrow: "Question 21 of 22 · The ingredients",
    question: "Which ingredients would you love in your fragrance?",
    description: "You can choose more than one answer.",
    multi: true,
    maxSelections: 4,
    options: [
      { value: "aquatic-herbs", label: "Herbs with an aquatic scent", description: "Fresh and transparent" },
      { value: "green-fruit", label: "Green herbs with fruit", description: "Bright and juicy" },
      { value: "green-woods", label: "Green herbs with aromatic woods", description: "Fresh with depth" },
      { value: "green-oriental", label: "Green herbs with oriental ingredients", description: "Fresh with warmth" },
      { value: "fern-lavender-citrus", label: "Ferns, like lavender, with green herbs and citrus", description: "Aromatic and uplifting" },
      { value: "fresh-hot", label: "Fresh green herbs with hot ingredients", description: "Vibrant and spicy" },
      { value: "sweet-notes", label: "Herbs with sweet notes", description: "Soft and addictive" },
      { value: "citrus-woods", label: "Citrus with aromatic woods", description: "Crisp and polished" },
      { value: "citrus-oriental", label: "Citrus with oriental ingredients", description: "Bright and enveloping" },
    ],
  },
  {
    key: "scentDirection",
    eyebrow: "Question 22 of 22 · The scent direction",
    question: "Which scents do you lean toward most?",
    description: "You can choose more than one answer, then we will show your match.",
    multi: true,
    maxSelections: 3,
    options: [
      { value: "aquatic", label: "Aquatic notes", description: "Cool, clean, and airy" },
      { value: "woody", label: "Woody notes", description: "Warm, grounded, and lasting" },
      { value: "fruity", label: "Fruity notes", description: "Juicy, bright, and playful" },
      { value: "citrus", label: "Citrus notes", description: "Sparkling and uplifting" },
      { value: "fresh-floral-herbal", label: "Fresh herbal notes with flowers", description: "Green, soft, and expressive" },
      { value: "spicy", label: "Spicy scents", description: "Warm and distinctive" },
      { value: "sweet", label: "Sweet scents", description: "Gourmand and comforting" },
    ],
  },
];

const quizSlides = quizSteps.map((step, index) => ({
  steps: [{ ...step, eyebrow: step.eyebrow.replace(/Question \d+ of \d+/, `Question ${index + 1} of ${quizSteps.length}`) }],
}));

const fragranceProfiles: FragranceProfile[] = [
  {
    product: { name: "Link White Limited Edition 150ml", brand: "LINK", price: "288", oldPrice: "500", offer: "1+2 Free", views: "900+", image: "/product-assets/real-products/link-white.png", hoverImage: "/product-assets/hover-products/link-white-hover.png" },
    tags: { audience: ["unisex", "gift"], family: ["fresh", "clean"], notes: ["citrus", "clean"], sweetness: ["dry", "balanced"], weight: ["light", "balanced"], season: ["summer", "all-year"], occasion: ["everyday", "gift"], trail: ["soft", "lasting"], personality: ["minimal", "classic"] },
    signature: "Crisp, bright, and easy to wear.",
    vibe: "The effortless one",
  },
  {
    product: { name: "Green Woods Eau de Parfum", brand: "LINK", price: "258", oldPrice: "600", offer: "1+2 Free", views: "9368+", image: "/product-assets/real-products/green-woods.png", hoverImage: "/product-assets/hover-products/green-woods-hover.png" },
    tags: { audience: ["masculine", "unisex", "gift"], family: ["fresh", "woody"], notes: ["green", "woods", "citrus"], sweetness: ["dry", "balanced"], weight: ["balanced"], season: ["summer", "all-year"], occasion: ["everyday", "office", "gift"], trail: ["lasting"], personality: ["minimal", "classic"] },
    signature: "Green woods with a clean, polished finish.",
    vibe: "The everyday signature",
  },
  {
    product: { name: "Black Woods Eau de Toilette", brand: "LINK", price: "208", oldPrice: "500", views: "16470+", image: "/product-assets/real-products/black-woods.png", hoverImage: "/product-assets/hover-products/black-woods-hover.png" },
    tags: { audience: ["masculine", "unisex"], family: ["woody"], notes: ["woods", "clean"], sweetness: ["dry", "balanced"], weight: ["balanced", "rich"], season: ["all-year", "winter"], occasion: ["evening", "everyday"], trail: ["lasting", "intense"], personality: ["classic", "bold"] },
    signature: "A darker woody profile with quiet confidence.",
    vibe: "The modern classic",
  },
  {
    product: { name: "Maroon Perfume by Link 200ml", brand: "LINK", price: "308", oldPrice: "420", offer: "1+2 Free", views: "757+", image: "/product-assets/real-products/maroon.png", hoverImage: "/product-assets/hover-products/maroon-hover.png" },
    tags: { audience: ["masculine", "unisex", "gift"], family: ["woody", "sweet"], notes: ["woods", "sweet"], sweetness: ["sweet"], weight: ["rich"], season: ["winter"], occasion: ["evening", "date", "gift"], trail: ["intense"], personality: ["bold", "playful"] },
    signature: "Warm, expressive, and made for a memorable entrance.",
    vibe: "The after-dark mood",
  },
  {
    product: { name: "Silver Woods Eau de Parfum", brand: "LINK", price: "208", oldPrice: "500", views: "1745+", image: "/product-assets/real-products/silver-woods.png", hoverImage: "/product-assets/hover-products/silver-woods-hover.png" },
    tags: { audience: ["masculine", "unisex", "gift"], family: ["woody", "clean"], notes: ["woods", "clean"], sweetness: ["dry", "balanced"], weight: ["balanced"], season: ["all-year", "winter"], occasion: ["date", "everyday", "gift"], trail: ["lasting"], personality: ["classic", "minimal"] },
    signature: "Smooth woods with a refined, versatile character.",
    vibe: "The polished all-rounder",
  },
  {
    product: { name: "DERAAH PRIVATE Enjoy Eau de Parfum 100ml", brand: "DERAAH PRIVATE", price: "159", oldPrice: "378", offer: "Special Offer", views: "—", image: "/product-assets/private-555.png" },
    tags: { audience: ["feminine", "unisex", "gift"], family: ["sweet", "floral"], notes: ["sweet", "floral"], sweetness: ["sweet", "balanced"], weight: ["balanced", "rich"], season: ["all-year", "winter"], occasion: ["date", "gift", "evening"], trail: ["lasting", "intense"], personality: ["playful"] },
    signature: "Playful sweetness with a soft, luxurious finish.",
    vibe: "The joyful indulgence",
  },
  {
    product: { name: "MAIOS Aroma 100 ml", brand: "MAIOS", price: "108", oldPrice: "268", offer: "Save later", views: "—", image: "/product-assets/misk-toffee.png" },
    tags: { audience: ["feminine", "unisex", "gift"], family: ["clean", "sweet"], notes: ["clean", "sweet"], sweetness: ["balanced", "sweet"], weight: ["light", "balanced"], season: ["all-year", "summer"], occasion: ["everyday", "gift"], trail: ["soft"], personality: ["minimal", "playful"] },
    signature: "Soft, comforting, and close to the skin.",
    vibe: "The quiet comfort",
  },
  {
    product: { name: "PROUD Suave Perfume", brand: "PROUD", price: "294", oldPrice: "420", offer: "1+2 Free", views: "—", image: "/product-assets/leader.png" },
    tags: { audience: ["masculine", "unisex", "gift"], family: ["fresh", "woody"], notes: ["citrus", "green", "woods"], sweetness: ["dry", "balanced"], weight: ["balanced", "rich"], season: ["all-year"], occasion: ["everyday", "evening", "gift"], trail: ["lasting"], personality: ["classic", "bold"] },
    signature: "A clean, confident scent with a tailored finish.",
    vibe: "The composed presence",
  },
  {
    product: { name: "LINK Pedestal Extrait 100 ml", brand: "LINK", price: "348", oldPrice: "696", offer: "Signature", views: "—", image: "/product-assets/real-products/link-white.jpg" },
    tags: { audience: ["masculine", "unisex", "gift"], family: ["woody", "sweet"], notes: ["woods", "sweet"], sweetness: ["sweet", "balanced"], weight: ["rich"], season: ["winter"], occasion: ["evening", "date"], trail: ["intense"], personality: ["bold", "classic"] },
    signature: "A concentrated, elegant trail for the moments that matter.",
    vibe: "The statement piece",
  },
];

function answerValues(answer: AnswerValue | undefined) {
  if (!answer) return [];
  return Array.isArray(answer) ? answer : [answer];
}

type CoreTag = "audience" | "family" | "notes" | "sweetness" | "weight" | "season" | "occasion" | "trail" | "personality";

function profileMatches(profile: FragranceProfile, groups: Array<[CoreTag, string[]]>) {
  return groups.some(([tag, values]) => values.some(value => profile.tags[tag]?.includes(value)));
}

function responseMatches(profile: FragranceProfile, key: QuizKey, value: string) {
  const colors: Record<string, Array<[CoreTag, string[]]>> = {
    black: [["family", ["woody", "clean"]], ["personality", ["classic", "bold"]]],
    gray: [["family", ["clean", "woody"]], ["personality", ["classic", "minimal"]]],
    brown: [["family", ["woody", "sweet"]], ["personality", ["classic", "bold"]]],
    blue: [["family", ["fresh", "clean"]], ["season", ["summer", "all-year"]]],
    white: [["family", ["clean", "fresh"]], ["personality", ["minimal"]]],
    green: [["family", ["fresh", "clean"]], ["notes", ["green"]]],
    pink: [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
    purple: [["family", ["floral", "sweet"]], ["personality", ["playful", "bold"]]],
    orange: [["family", ["fresh", "sweet"]], ["personality", ["playful", "bold"]]],
    red: [["family", ["sweet", "woody"]], ["personality", ["bold"]]],
    gold: [["family", ["woody", "sweet"]], ["weight", ["rich"]]],
  };

  switch (key) {
    case "clothingColor":
    case "wallColor":
    case "possessionsColor":
      return profileMatches(profile, colors[value] ?? []);
    case "hobbies":
      return profileMatches(profile, {
        poetry: [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        mystery: [["family", ["woody"]], ["personality", ["classic", "bold"]]],
        events: [["personality", ["playful", "bold"]], ["occasion", ["evening"]]],
        home: [["family", ["clean"]], ["personality", ["minimal"]]],
        sports: [["family", ["fresh"]], ["weight", ["light", "balanced"]]],
        plants: [["family", ["fresh", "floral"]], ["notes", ["green", "floral"]]],
      }[value] ?? []);
    case "vacation":
      return profileMatches(profile, {
        home: [["family", ["clean"]], ["trail", ["soft"]]],
        island: [["family", ["fresh", "clean"]], ["season", ["summer"]]],
        beach: [["family", ["fresh"]], ["season", ["summer"]]],
        safari: [["family", ["woody"]], ["personality", ["bold"]]],
        park: [["family", ["fresh", "floral"]], ["notes", ["green"]]],
        "children-home": [["personality", ["playful"]], ["occasion", ["gift"]]],
      }[value] ?? []);
    case "birthday":
      return profileMatches(profile, {
        "family-party": [["occasion", ["gift", "everyday"]], ["personality", ["classic"]]],
        "romantic-dinner": [["occasion", ["date"]], ["family", ["floral", "sweet"]]],
        "friends-night": [["occasion", ["evening"]], ["personality", ["playful"]]],
        cinema: [["occasion", ["evening"]], ["trail", ["soft", "lasting"]]],
        "large-hall": [["occasion", ["evening"]], ["trail", ["intense"]]],
        "no-celebration": [["occasion", ["everyday"]], ["trail", ["soft"]]],
      }[value] ?? []);
    case "job":
      return profileMatches(profile, {
        "female-novelist": [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        "male-novelist": [["family", ["woody", "sweet"]], ["personality", ["classic", "playful"]]],
        coach: [["family", ["fresh"]], ["personality", ["bold"]]],
        "female-accountant": [["family", ["clean"]], ["personality", ["minimal", "classic"]]],
        "male-accountant": [["family", ["clean", "woody"]], ["personality", ["classic"]]],
        "political-party": [["personality", ["bold", "classic"]]],
        politician: [["personality", ["bold", "classic"]]],
        judiciary: [["personality", ["classic"]], ["family", ["woody"]]],
        detective: [["personality", ["bold", "classic"]], ["family", ["woody"]]],
        "female-musician": [["personality", ["playful"]], ["family", ["floral", "sweet"]]],
        "male-musician": [["personality", ["playful", "bold"]], ["family", ["woody", "sweet"]]],
        "public-relations": [["personality", ["playful", "classic"]], ["family", ["fresh"]]],
        "female-fashion": [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        "male-fashion": [["family", ["woody", "clean"]], ["personality", ["bold", "classic"]]],
        "female-manager": [["personality", ["classic", "bold"]], ["family", ["woody"]]],
        "male-manager": [["personality", ["classic", "bold"]], ["family", ["woody"]]],
        "female-flight-attendant": [["family", ["clean", "fresh"]], ["personality", ["minimal"]]],
        "male-flight-attendant": [["family", ["clean", "fresh"]], ["personality", ["minimal"]]],
        "female-archaeologist": [["family", ["woody"]], ["personality", ["classic"]]],
        "male-archaeologist": [["family", ["woody"]], ["personality", ["bold", "classic"]]],
        sailor: [["family", ["fresh", "woody"]], ["personality", ["bold"]]],
      }[value] ?? []);
    case "special":
      return profileMatches(profile, {
        artistic: [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        diplomatic: [["family", ["clean", "floral"]], ["personality", ["classic", "minimal"]]],
        "pleasure-seeker": [["family", ["sweet"]], ["personality", ["playful"]]],
        traditional: [["personality", ["classic", "minimal"]], ["family", ["clean", "woody"]]],
        adventurous: [["personality", ["bold"]], ["family", ["woody", "fresh"]]],
        mysterious: [["family", ["woody", "sweet"]], ["trail", ["intense"]]],
      }[value] ?? []);
    case "personalityType":
      return profileMatches(profile, {
        entertainer: [["personality", ["playful"]], ["family", ["sweet", "fresh"]]],
        defender: [["personality", ["classic", "minimal"]], ["trail", ["lasting"]]],
        logician: [["personality", ["minimal", "classic"]], ["family", ["clean"]]],
        adventurer: [["personality", ["bold"]], ["family", ["woody", "fresh"]]],
        creator: [["personality", ["playful"]], ["family", ["floral", "sweet"]]],
        leader: [["personality", ["bold", "classic"]], ["trail", ["intense", "lasting"]]],
      }[value] ?? []);
    case "quiet":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["personality", ["minimal", "classic"]], ["trail", ["soft"]]] : [["personality", ["bold", "playful"]]]);
    case "sensitive":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["family", ["floral", "sweet", "clean"]], ["personality", ["playful"]]] : [["family", ["woody"]], ["personality", ["bold"]]]);
    case "patient":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["personality", ["minimal", "classic"]], ["trail", ["lasting"]]] : [["personality", ["playful", "bold"]]]);
    case "social":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["family", ["fresh", "sweet"]], ["personality", ["playful", "bold"]]] : [["family", ["clean"]], ["trail", ["soft"]]]);
    case "confidence":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["personality", ["bold", "classic"]], ["weight", ["rich", "balanced"]]] : [["personality", ["minimal"]], ["weight", ["light"]]]);
    case "emotional":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["family", ["floral", "sweet"]], ["personality", ["playful"]]] : [["family", ["woody", "clean"]]]);
    case "observant":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["personality", ["classic", "minimal"]], ["family", ["woody"]]] : [["personality", ["playful"]]]);
    case "eloquent":
      return profileMatches(profile, ["agree", "strongly-agree"].includes(value) ? [["personality", ["classic", "bold"]], ["family", ["woody", "fresh"]]] : [["personality", ["minimal", "soft"]]]);
    case "zodiac":
      return profileMatches(profile, {
        capricorn: [["family", ["woody", "clean"]], ["personality", ["classic"]]],
        aquarius: [["family", ["clean", "fresh"]], ["personality", ["minimal"]]],
        pisces: [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        aries: [["family", ["fresh", "woody"]], ["personality", ["bold"]]],
        taurus: [["family", ["sweet", "woody"]], ["personality", ["classic"]]],
        gemini: [["family", ["fresh", "sweet"]], ["personality", ["playful"]]],
        cancer: [["family", ["clean", "sweet"]], ["trail", ["soft"]]],
        leo: [["family", ["sweet", "woody"]], ["personality", ["bold"]]],
        virgo: [["family", ["clean", "fresh"]], ["personality", ["minimal"]]],
        libra: [["family", ["floral", "clean"]], ["personality", ["classic", "playful"]]],
        scorpio: [["family", ["woody", "sweet"]], ["trail", ["intense"]]],
        sagittarius: [["family", ["fresh", "woody"]], ["personality", ["bold"]]],
      }[value] ?? []);
    case "skin":
      return profileMatches(profile, {
        dry: [["family", ["sweet", "floral"]], ["trail", ["soft"]]],
        oily: [["family", ["fresh", "woody"]], ["trail", ["lasting", "intense"]]],
        sensitive: [["family", ["clean"]], ["trail", ["soft"]]],
      }[value] ?? []);
    case "personalityDescription":
      return profileMatches(profile, {
        sporty: [["family", ["fresh"]], ["personality", ["bold"]]],
        dreamy: [["family", ["floral", "sweet"]], ["personality", ["playful"]]],
        romantic: [["family", ["floral", "sweet"]], ["occasion", ["date"]]],
        playful: [["family", ["sweet", "fresh"]], ["personality", ["playful"]]],
        leader: [["family", ["woody"]], ["personality", ["bold", "classic"]]],
        classic: [["family", ["clean", "woody"]], ["personality", ["classic"]]],
      }[value] ?? []);
    case "ingredients":
      return profileMatches(profile, {
        "aquatic-herbs": [["family", ["fresh", "clean"]], ["notes", ["green"]]],
        "green-fruit": [["family", ["fresh", "sweet"]], ["notes", ["green", "citrus"]]],
        "green-woods": [["family", ["fresh", "woody"]], ["notes", ["green", "woods"]]],
        "green-oriental": [["family", ["woody"]], ["notes", ["green", "woods"]]],
        "fern-lavender-citrus": [["family", ["fresh", "clean"]], ["notes", ["green", "citrus"]]],
        "fresh-hot": [["family", ["fresh", "woody"]], ["personality", ["bold"]]],
        "sweet-notes": [["family", ["sweet"]], ["notes", ["sweet"]]],
        "citrus-woods": [["family", ["fresh", "woody"]], ["notes", ["citrus", "woods"]]],
        "citrus-oriental": [["family", ["woody", "sweet"]], ["notes", ["citrus", "woods"]]],
      }[value] ?? []);
    case "scentDirection":
      return profileMatches(profile, {
        aquatic: [["family", ["fresh", "clean"]], ["notes", ["clean"]]],
        woody: [["family", ["woody"]], ["notes", ["woods"]]],
        fruity: [["family", ["sweet", "floral"]], ["notes", ["sweet"]]],
        citrus: [["family", ["fresh"]], ["notes", ["citrus"]]],
        "fresh-floral-herbal": [["family", ["fresh", "floral"]], ["notes", ["green", "floral"]]],
        spicy: [["family", ["woody", "sweet"]], ["personality", ["bold"]]],
        sweet: [["family", ["sweet"]], ["notes", ["sweet"]]],
      }[value] ?? []);
    case "gender":
      return false;
  }
}

function scoreProfile(profile: FragranceProfile, answers: Partial<Record<QuizKey, AnswerValue>>) {
  const gender = answerValues(answers.gender)[0];
  const genderScore = gender && profile.tags.audience.includes(gender === "male" ? "masculine" : "feminine") ? 3 : 0;
  return quizSteps.reduce((score, step) => {
    const values = answerValues(answers[step.key]);
    return score + values.filter(value => responseMatches(profile, step.key, value)).length * 4;
  }, genderScore);
}

function OptionVisual({ stepKey, value }: { stepKey: QuizKey; value: string }) {
  if (["clothingColor", "wallColor", "possessionsColor"].includes(stepKey) && colorVisuals[value]) {
    return <span className="flex items-center gap-2"><i aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-white shadow-[0_0_0_1px_rgba(75,39,53,.15)]" style={{ backgroundColor: colorVisuals[value] }} /></span>;
  }

  if (["quiet", "sensitive", "patient", "social", "confidence", "emotional", "observant", "eloquent"].includes(stepKey)) {
    const level = { "strongly-disagree": 1, disagree: 2, neutral: 3, agree: 4, "strongly-agree": 5 }[value as "strongly-disagree" | "disagree" | "neutral" | "agree" | "strongly-agree"] ?? 0;
    return <span className="flex items-center gap-1" aria-label={`${level} of 5`}><span className="flex items-center gap-1">{[1, 2, 3, 4, 5].map(dot => <i key={dot} aria-hidden="true" className={`h-2.5 w-2.5 rounded-full border ${dot <= level ? "border-[#a7835c] bg-[#a7835c]" : "border-[#dfd1c3] bg-white"}`} />)}</span></span>;
  }

  return null;
}

function ScalePicker({ options, selectedValue, onSelect }: { options: QuizOption[]; selectedValue?: string; onSelect: (value: string) => void }) {
  return <div className="px-3 py-4 sm:px-5 sm:py-5">
      <div className="relative">
        <div aria-hidden="true" className="absolute left-5 right-5 top-5 h-1.5 rounded-full bg-gradient-to-r from-[#e8ddd2] via-[#dec6b1] to-[#a7835c] sm:left-7 sm:right-7 sm:top-6" />
        <div className="relative grid grid-cols-5 gap-1 sm:gap-2">
        {options.map((option, index) => {
          const isSelected = option.value === selectedValue;
          const isWarmEnd = index >= Math.ceil(options.length / 2);
          return <button key={option.value} type="button" onClick={() => onSelect(option.value)} aria-label={option.label} aria-pressed={isSelected} className="group flex min-w-0 flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7835c] focus-visible:ring-offset-2">
            <span className={`relative grid h-10 w-10 place-items-center rounded-full border-2 transition duration-200 group-hover:-translate-y-0.5 sm:h-12 sm:w-12 ${isSelected ? "border-[#a7835c] bg-white shadow-[0_0_0_5px_rgba(167,131,92,.12),0_8px_18px_rgba(167,131,92,.18)]" : isWarmEnd ? "border-[#c7ac8d] bg-gradient-to-br from-[#fffaf5] to-[#f2e7d9] shadow-[0_5px_12px_rgba(167,131,92,.08)]" : "border-[#dfd1c3] bg-gradient-to-br from-white to-[#f6efe7] shadow-[0_5px_12px_rgba(167,131,92,.05)]"}`}>
              <span className={`h-2.5 w-2.5 rounded-full transition sm:h-3 sm:w-3 ${isSelected ? "bg-[#a7835c]" : isWarmEnd ? "bg-[#b9966d] group-hover:bg-[#a7835c]" : "bg-[#d7c1ab] group-hover:bg-[#b9966d]"}`} />
              {isSelected && <Check size={13} className="absolute text-[#a7835c]" />}
            </span>
            <span className={`mt-3 min-h-[24px] max-w-[74px] text-center text-[8px] font-medium leading-3 transition sm:max-w-[100px] sm:text-[9px] ${isSelected ? "text-[#8b6a47]" : isWarmEnd ? "text-[#9a7957]" : "text-[#8b777d]"}`}>{option.label}</span>
          </button>;
        })}
        </div>
      </div>
  </div>;
}

function OptionCard({ option, stepKey, selected, onSelect, isArabic }: { option: QuizOption; stepKey: QuizKey; selected: boolean; onSelect: (value: string) => void; isArabic: boolean }) {
  const isScale = ["quiet", "sensitive", "patient", "social", "confidence", "emotional", "observant", "eloquent"].includes(stepKey);
  return <button type="button" onClick={() => onSelect(option.value)} aria-pressed={selected} className={`group relative min-h-[56px] gap-3 rounded-[14px] border px-3 py-2.5 ${isArabic ? "text-right" : "text-left"} transition duration-200 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a7835c] focus-visible:ring-offset-2 sm:min-h-[62px] sm:px-4 ${isScale ? "flex flex-col items-start justify-center" : "flex items-center justify-between"} ${selected ? "border-[#a7835c] bg-[#fbf5ee] shadow-[0_8px_20px_rgba(167,131,92,.10)]" : "border-[#eadfe0] bg-white hover:border-[#c7ac8d] hover:bg-[#fffaf6]"}`}><span className="min-w-0 text-[14px] font-semibold leading-5 text-[#2d1b23]">{option.label}</span><span className={isScale ? "mt-2" : "shrink-0"}><OptionVisual stepKey={stepKey} value={option.value} /></span></button>;
}

function ResultCard({ profile, favorite, onFavorite }: { profile: FragranceProfile; favorite: boolean; onFavorite: () => void }) {
  const { product } = profile;

  return <article className="group relative flex h-fit min-w-0 flex-col overflow-hidden rounded-[14px] border border-[#e8ebee] bg-white shadow-sm transition-shadow hover:shadow-md">
    <div className="relative grid h-[148px] shrink-0 place-items-center overflow-hidden bg-[#f5f6f7] p-3">
      <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} aria-label={`View ${product.name}`} className="grid h-full w-full place-items-center">
        <img src={product.image} alt={product.name} className="block h-auto w-auto max-h-[124px] max-w-[104px] object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105" />
      </a>
      <button type="button" aria-label={`${favorite ? "Remove" : "Add"} ${product.name} ${favorite ? "from" : "to"} favorites`} onClick={onFavorite} className={`absolute right-2.5 top-2.5 z-10 grid h-8 w-8 place-items-center rounded-full bg-white shadow-md transition-colors hover:bg-[#fffaf6] ${favorite ? "text-[#a7835c]" : "text-[#69717a]"}`}><Heart size={16} fill={favorite ? "currentColor" : "none"} /></button>
    </div>
    <div className="p-3">
      <span className="block text-[10px] font-semibold uppercase tracking-[.14em] text-[#9a9fa6]">{product.brand}</span>
      <a href={`/product-details?product=${encodeURIComponent(product.name)}#details`} className="mt-1 block line-clamp-2 min-h-[36px] text-[12px] font-semibold leading-5 text-[#242225] no-underline hover:text-[#cd1a76]">{product.name}</a>
      <span className="mt-3 block text-[13px] font-semibold text-[#5d6570]">{product.price}</span>
    </div>
  </article>;
}

type FinderIngredientId = "fruits" | "bergamot" | "cardamom" | "oud" | "vanilla" | "flowers" | "roses";

const finderBottleColorways: Array<{ name: string; image: string; imageScale: number; ingredients: FinderIngredientId[] }> = [
  { name: "Link White Limited Edition", image: "/product-assets/fragrance-lab/previous-3d/link-white.png", imageScale: 1, ingredients: ["fruits", "bergamot", "cardamom", "flowers", "oud"] },
  { name: "Green Woods Eau de Parfum", image: "/product-assets/fragrance-lab/previous-3d/green-woods.png", imageScale: 1, ingredients: ["bergamot", "cardamom", "flowers", "roses", "fruits"] },
  { name: "Black Woods Eau de Toilette", image: "/product-assets/fragrance-lab/previous-3d/black-woods.png", imageScale: 1, ingredients: ["oud", "roses", "cardamom", "fruits", "bergamot"] },
  { name: "Maroon Perfume", image: "/product-assets/fragrance-lab/previous-3d/maroon.png", imageScale: 1, ingredients: ["fruits", "flowers", "bergamot", "cardamom", "oud"] },
];

type FinderIngredientNote = {
  id: FinderIngredientId;
  name: string;
  image: string;
  position: string;
  width: number;
  height: number;
  delay: string;
  sourceWidth: number;
  crop: { x: number; y: number; width: number; height: number; scale: number };
};

const cleanIngredientImage = "/product-assets/fragrance-notes-clean.png";
const violetFlowerImage = "/product-assets/fragrance-flower-violet.png";
const jasmineFlowerImage = "/product-assets/fragrance-flower-jasmine.png";
const finderIngredientNotes: FinderIngredientNote[] = [
  { id: "fruits", name: "Fruits", image: cleanIngredientImage, position: "left-1/2 top-[0%] -translate-x-1/2", width: 120, height: 78, delay: "-0.2s", sourceWidth: 1254, crop: { x: 40, y: 35, width: 660, height: 470, scale: 0.18 } },
  { id: "bergamot", name: "Bergamot", image: cleanIngredientImage, position: "left-[82%] top-[29%] -translate-x-1/2 -translate-y-1/2", width: 94, height: 78, delay: "-1.1s", sourceWidth: 1254, crop: { x: 720, y: 100, width: 500, height: 430, scale: 0.18 } },
  { id: "cardamom", name: "Cardamom", image: cleanIngredientImage, position: "left-[75%] top-[75%] -translate-x-1/2 -translate-y-1/2", width: 112, height: 62, delay: "-2s", sourceWidth: 1254, crop: { x: 60, y: 540, width: 600, height: 330, scale: 0.18 } },
  { id: "oud", name: "Oud", image: cleanIngredientImage, position: "left-[25%] top-[75%] -translate-x-1/2 -translate-y-1/2", width: 98, height: 84, delay: "-2.8s", sourceWidth: 1254, crop: { x: 680, y: 520, width: 560, height: 500, scale: 0.16 } },
  { id: "vanilla", name: "Vanilla", image: cleanIngredientImage, position: "left-[18%] top-[29%] -translate-x-1/2 -translate-y-1/2", width: 126, height: 68, delay: "-3.6s", sourceWidth: 1254, crop: { x: 20, y: 840, width: 750, height: 400, scale: 0.16 } },
  { id: "flowers", name: "Violet flowers", image: violetFlowerImage, position: "left-[82%] top-[29%] -translate-x-1/2 -translate-y-1/2", width: 132, height: 86, delay: "-4.4s", sourceWidth: 1312, crop: { x: 0, y: 0, width: 1312, height: 1199, scale: 0.1 } },
  { id: "roses", name: "White flowers", image: jasmineFlowerImage, position: "left-[18%] top-[29%] -translate-x-1/2 -translate-y-1/2", width: 118, height: 88, delay: "-5.2s", sourceWidth: 1294, crop: { x: 0, y: 0, width: 1294, height: 1216, scale: 0.1 } },
];

function FinderIngredientOrb({ note }: { note: FinderIngredientNote }) {
  const imageWidth = note.sourceWidth * note.crop.scale;
  const imageLeft = note.width / 2 - (note.crop.x + note.crop.width / 2) * note.crop.scale;
  const imageTop = note.height / 2 - (note.crop.y + note.crop.height / 2) * note.crop.scale;

  return <div className={`absolute z-20 scale-[0.9] ${note.position}`}>
    <div className="finder-ingredient-float" style={{ animationDelay: note.delay }}>
      <div className="relative overflow-hidden" style={{ width: `${note.width}px`, height: `${note.height}px` }}>
        <img src={note.image} alt="" className="absolute max-w-none" style={{ width: `${imageWidth}px`, left: `${imageLeft}px`, top: `${imageTop}px` }} />
      </div>
    </div>
  </div>;
}

function FinderBottleVisual() {
  const [bottleIndex, setBottleIndex] = useState(0);
  const bottle = finderBottleColorways[bottleIndex];
  const visibleIngredientNotes = bottle.ingredients.flatMap((id, index) => {
    const note = finderIngredientNotes.find(candidate => candidate.id === id);
    const slot = finderIngredientNotes[index];
    return note ? [{ ...note, position: slot?.position ?? note.position, delay: slot?.delay ?? note.delay }] : [];
  });

  useEffect(() => {
    const timer = window.setInterval(() => setBottleIndex(index => (index + 1) % finderBottleColorways.length), 3200);
    return () => window.clearInterval(timer);
  }, []);

  return <>
    <style>{`@keyframes finder-bottle-swap{0%{opacity:0;transform:translate3d(0,0,0) scale(.78)}18%{opacity:1;transform:translate3d(0,0,0) scale(1)}78%{opacity:1;transform:translate3d(0,0,0) scale(1)}100%{opacity:0;transform:translate3d(0,0,0) scale(.78)}}.finder-bottle-swap,.finder-ingredients-swap{animation:finder-bottle-swap 3.2s cubic-bezier(.22,.72,.3,1) both;backface-visibility:hidden;transform-origin:center;will-change:opacity,transform}@keyframes finder-ingredient-float{0%,100%{transform:translate3d(0,0,0) rotate(-2deg)}50%{transform:translate3d(0,-8px,0) rotate(2deg)}}.finder-ingredient-float{animation:finder-ingredient-float 4.8s ease-in-out infinite;will-change:transform}@media (prefers-reduced-motion:reduce){.finder-bottle-swap,.finder-ingredients-swap,.finder-ingredient-float{animation:none;opacity:1;transform:none}}`}</style>
    <div className="relative mx-auto mt-6 h-[384px] w-full max-w-[370px] sm:mt-8 lg:mt-0 lg:h-[360px] lg:max-w-[480px]" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 h-[276px] w-[276px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dec6b1]/35 lg:h-[330px] lg:w-[330px]" />
      <span className="absolute left-1/2 top-1/2 h-[221px] w-[221px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dec6b1]/20 lg:h-[265px] lg:w-[265px]" />
      <div key={`${bottle.name}-ingredients`} className="finder-ingredients-swap absolute inset-0">
        {visibleIngredientNotes.map(note => <FinderIngredientOrb key={`${bottle.name}-${note.id}`} note={note} />)}
      </div>
      <span className="absolute bottom-[18%] left-1/2 h-3 w-32 -translate-x-1/2 rounded-[50%] bg-black/45 blur-[8px] sm:h-4 sm:w-40" />
      <span className="absolute bottom-[19%] left-1/2 h-1.5 w-24 -translate-x-1/2 rounded-[50%] bg-black/60 blur-[2px] sm:w-32" />
      <div className="absolute left-1/2 top-1/2 z-10 h-[133px] w-[133px] -translate-x-1/2 -translate-y-1/2 sm:h-[170px] sm:w-[170px] lg:h-[195px] lg:w-[195px]">
        <div key={bottle.name} className="finder-bottle-swap relative h-full w-full overflow-hidden rounded-[28%]">
          <img src={bottle.image} alt="" className="absolute left-1/2 top-1/2 h-[116%] w-[116%] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain" style={{ transform: `translate(-50%, -50%) scaleX(1.12) scale(${bottle.imageScale})` }} />
        </div>
      </div>
    </div>
  </>;
}

function FinderSteps() {
  return <div className="mt-7 max-w-[330px]">
    <div className="grid grid-cols-4 gap-1.5">
      <div className="rounded-[12px] bg-white/12 px-2.5 py-2.5 ring-1 ring-white/10"><span className="block text-[9px] font-semibold uppercase tracking-[.1em] text-[#dec6b1]">01</span><strong className="mt-1 block truncate text-[10px] text-white sm:text-xs">World</strong></div>
      <div className="rounded-[12px] bg-white/12 px-2.5 py-2.5 ring-1 ring-white/10"><span className="block text-[9px] font-semibold uppercase tracking-[.1em] text-[#dec6b1]">02</span><strong className="mt-1 block truncate text-[10px] text-white sm:text-xs">Character</strong></div>
      <div className="rounded-[12px] bg-white/12 px-2.5 py-2.5 ring-1 ring-white/10"><span className="block text-[9px] font-semibold uppercase tracking-[.1em] text-[#dec6b1]">03</span><strong className="mt-1 block truncate text-[10px] text-white sm:text-xs">Profile</strong></div>
      <div className="rounded-[12px] bg-white/12 px-2.5 py-2.5 ring-1 ring-white/10"><span className="block text-[9px] font-semibold uppercase tracking-[.1em] text-[#dec6b1]">04</span><strong className="mt-1 block truncate text-[10px] text-white sm:text-xs">Scent</strong></div>
    </div>
  </div>;
}

export default function FragranceFinder({ onFavorite, favorites }: { onFavorite: (product: StoreProduct) => void; favorites: string[] }) {
  const { direction, language } = useStoreLocale();
  const isArabic = language === "العربية";
  const [view, setView] = useState<FinderView>("intro");
  const [slideIndex, setSlideIndex] = useState(0);
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  const [answers, setAnswers] = useState<Partial<Record<QuizKey, AnswerValue>>>({});
  const [showAllResults, setShowAllResults] = useState(false);
  const currentSlide = quizSlides[slideIndex];
  const results = useMemo(() => {
    const answeredSteps = quizSteps.filter(step => step.key !== "gender" && answerValues(answers[step.key]).length);
    const maxScore = answeredSteps.reduce((sum, step) => {
      const selectedCount = answerValues(answers[step.key]).length;
      return sum + selectedCount * 4;
    }, answerValues(answers.gender).length * 3);

    return fragranceProfiles
      .map(profile => {
        const score = scoreProfile(profile, answers);
        return { profile, score, matchScore: maxScore ? Math.round((score / maxScore) * 100) : 0 };
      })
      .sort((a, b) => b.score - a.score || b.matchScore - a.matchScore || a.profile.product.name.localeCompare(b.profile.product.name))
      .slice(0, 6);
  }, [answers]);

  const reset = () => {
    setAnswers({});
    setGender(null);
    setSlideIndex(0);
    setShowAllResults(false);
    setView("intro");
  };

  const visibleResults = showAllResults ? results : results.slice(0, 4);

  const begin = () => {
    setAnswers(gender ? { gender } : {});
    setSlideIndex(0);
    setView("quiz");
  };

  const advanceAfterSelection = () => {
    if (slideIndex === quizSlides.length - 1) setView("results");
    else setSlideIndex(index => index + 1);
  };

  const choose = (step: QuizStep, value: string) => {
    if (step.key === "gender") {
      setGender(value as "male" | "female");
      setAnswers(previous => ({ ...previous, gender: value }));
      advanceAfterSelection();
      return;
    }
    if (step.multi) {
      const maxSelections = step.maxSelections ?? step.options.length;
      setAnswers(previous => {
        const selected = answerValues(previous[step.key]);
        const nextSelected = selected.includes(value)
          ? selected.filter(item => item !== value)
          : selected.length < maxSelections
            ? [...selected, value]
            : selected;
        return { ...previous, [step.key]: nextSelected };
      });
      advanceAfterSelection();
      return;
    }
    setAnswers(previous => ({ ...previous, [step.key]: value }));
    advanceAfterSelection();
  };

  const goBack = () => {
    if (slideIndex === 0) setView("intro");
    else setSlideIndex(index => index - 1);
  };

  return (
    <section id="fragrance-finder" dir={direction} aria-labelledby="fragrance-finder-title" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="relative overflow-hidden rounded-[26px] bg-[#000000] text-white shadow-[0_22px_60px_rgba(55,21,36,.16)]">
        <span className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full border-[34px] border-[#dec6b1]/18" />
        <span className="pointer-events-none absolute -bottom-44 left-[38%] h-96 w-96 rounded-full bg-[#dec6b1]/14 blur-3xl" />
        <div className={`relative grid ${view === "intro" ? "lg:grid-cols-1" : "lg:grid-cols-[28.75%_71.25%]"}`}>
          <div className={`flex flex-col justify-between bg-[#000000] px-5 sm:px-10 ${view === "intro" ? "lg:min-h-[442px] lg:flex-row lg:items-center lg:gap-10 lg:px-12 lg:py-7" : "lg:items-stretch lg:justify-between lg:px-7"} ${view === "intro" ? "py-4 sm:py-6" : "py-5 sm:py-10 lg:py-12"}`}>
            <div className={`w-full ${view === "intro" ? "order-2 lg:order-1 lg:flex-1" : "order-2"}`}>
              <div className="flex items-center gap-2 text-[#dec6b1]"><Sparkles size={14} /><p className="text-[10px] font-semibold uppercase tracking-[.24em]">{isArabic ? "اختيارك الشخصي للعطر" : "Personal fragrance edit"}</p></div>
              {view === "intro" ? <><h2 id="fragrance-finder-title" className="mt-4 max-w-[330px] text-3xl font-medium leading-[1.02] tracking-[-.05em] sm:mt-6 sm:text-4xl lg:text-4xl">{isArabic ? <>اختر عطر<br /><span className="text-[#dec6b1]">يشبهك</span></> : <>Choose your scent,<br /><span className="text-[#dec6b1]">your way.</span></>}</h2><p className="mt-3 max-w-[330px] text-xs leading-5 text-white/70 sm:mt-5 sm:max-w-[390px] sm:text-sm sm:leading-6">{isArabic ? "أجب عن أسئلة بسيطة، ودع شخصيتك تختار لك العطر. تستغرق ٣ دقائق فقط." : "Find your match in a few simple choices."}</p><button type="button" onClick={begin} className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-[#000000] transition hover:bg-[#f4eadf]">{isArabic ? "ابدأ اختيار عطرك" : "Start the scent match"} <ArrowRight size={14} /></button></> : <><h2 id="fragrance-finder-title" className="mt-3 max-w-[480px] text-2xl font-medium leading-[1.02] tracking-[-.05em] sm:mt-5 sm:text-5xl">{isArabic ? <>اختر عطر<br /><span className="text-[#dec6b1]">يشبهك</span></> : <>Choose your scent,<br /><span className="text-[#dec6b1]">your way.</span></>}</h2><p className="mt-2 max-w-[420px] text-xs leading-5 text-white/68 sm:mt-5 sm:text-sm sm:leading-6">{isArabic ? "اختيار سريع للعطر الذي يناسبك." : "A quick match for the scent that fits you."}</p></>}
            </div>
            {view === "intro" ? <div className="order-1 flex w-full justify-center lg:order-2 lg:w-1/2"><FinderBottleVisual /></div> : null}
          </div>

          {view !== "intro" && <div className="relative bg-[#000000] p-2 sm:p-5 lg:flex lg:items-center lg:p-7">
          <div className="min-h-0 w-full rounded-[20px] bg-[#ffffff] p-3 text-[#28151f] sm:min-h-[430px] sm:p-7 lg:ml-[50px] lg:h-full lg:w-[calc(100%_-_58px)]">
              {view === "quiz" && currentSlide && (
                <div className="flex min-h-[300px] flex-col sm:min-h-[380px]">
                  <div className="flex items-center justify-between gap-4"><button type="button" onClick={goBack} className="inline-flex items-center gap-1 text-[11px] font-medium text-[#766169] hover:text-[#a7835c]"><ArrowLeft size={13} /> {isArabic ? "رجوع" : "Back"}</button><span className="text-[10px] font-semibold text-[#a7835c]">{isArabic ? `السؤال ${slideIndex + 1} من ${quizSlides.length}` : `${slideIndex + 1} / ${quizSlides.length}`}</span></div>
                  <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[#f2e9df]"><span className="block h-full rounded-full bg-[#a7835c] transition-all duration-300" style={{ width: `${((slideIndex + 1) / quizSlides.length) * 100}%` }} /></div>
                  <div className="mt-5 grid gap-5 sm:mt-7 lg:gap-6">{currentSlide.steps.map(step => { const visibleOptions = (step.maleOptions && gender === "male" ? step.maleOptions : step.options).map(option => localizeFinderOption(option, step.key, isArabic)); const selectedValues = answerValues(answers[step.key]); const isAgreement = agreementStepKeys.includes(step.key); return <div key={step.key} className="min-w-0"><div><p className="text-[9px] font-bold uppercase tracking-[.16em] text-[#a7835c]">{localizeFinderEyebrow(step.eyebrow, isArabic)}</p><h3 className="mt-2 text-lg font-medium tracking-[-.03em] text-[#2d1b23] sm:text-xl">{localizeFinderQuestion(step.question, isArabic)}</h3><p className="mt-2 text-[11px] leading-5 text-[#9a858b]">{isArabic ? "اختر الإجابة الأقرب إلى شخصيتك." : "Choose the answer that feels most like you."}</p></div>{isAgreement ? <div className="mt-5"><ScalePicker options={visibleOptions} selectedValue={selectedValues[0]} onSelect={value => choose(step, value)} /></div> : <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-3">{visibleOptions.map(option => <OptionCard key={option.value} option={option} stepKey={step.key} selected={selectedValues.includes(option.value)} onSelect={value => choose(step, value)} isArabic={isArabic} />)}</div>}</div>; })}</div>
                </div>
              )}

              {view === "results" && (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-[#a7835c]"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#f4eadf]"><Check size={14} /></span><p className="text-[10px] font-bold uppercase tracking-[.2em]">{isArabic ? "اختيارك جاهز" : "Your edit is ready"}</p></div><h3 className="mt-4 text-2xl font-medium tracking-[-.04em] text-[#2d1b23] sm:text-3xl">{isArabic ? "ستة عطور لتجربتها أولاً" : "Six scents to try first"}</h3><p className="mt-2 hidden max-w-[520px] text-xs leading-5 text-[#806b72] sm:block">{isArabic ? "مرتبة وفق التفضيلات التي شاركتها." : "Ranked across the signals you shared."}</p></div><button type="button" onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-[#eadfe0] px-3 py-2 text-[10px] font-semibold text-[#8b6a47] transition hover:bg-[#fffaf6]"><RotateCcw size={12} /> {isArabic ? "ابدأ من جديد" : "Start over"}</button></div>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:mt-7 sm:grid-cols-4 sm:gap-3">{visibleResults.map(({ profile }) => <div key={profile.product.name} className="min-w-0"><ResultCard profile={profile} favorite={favorites.includes(profile.product.name)} onFavorite={() => onFavorite(profile.product)} /></div>)}</div>
                  {results.length > 4 && <div className="mt-5 flex justify-center"><button type="button" onClick={() => setShowAllResults(current => !current)} className="inline-flex items-center gap-2 rounded-full border border-[#eadfe0] px-4 py-2.5 text-[11px] font-semibold text-[#8b6a47] transition hover:bg-[#fffaf6]">{showAllResults ? (isArabic ? "عرض أقل" : "Show less") : (isArabic ? "عرض المزيد" : "View more")} <ArrowRight size={13} /></button></div>}
                  <div className="mt-7 hidden flex-wrap items-center justify-between gap-3 border-t border-[#eee2e0] pt-5 sm:flex"><span className="inline-flex items-center gap-2 text-[10px] text-[#8b777d]"><Sparkles size={13} className="text-[#a7835c]" /> {isArabic ? "نتيجتك هي نقطة البداية." : "Your match is a starting point."}</span><a href="#shop" className="inline-flex items-center gap-2 text-[11px] font-semibold text-[#8b6a47] no-underline hover:underline">{isArabic ? "تصفح جميع العطور" : "Browse all fragrances"} <ArrowRight size={13} /></a></div>
                </div>
              )}
            </div>
          </div>}
        </div>
      </div>
    </section>
  );
}
