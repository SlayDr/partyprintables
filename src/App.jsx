import { useState, useRef } from "react";

const FONTS = "https://fonts.googleapis.com/css2?family=Pacifico&family=Nunito:wght@400;600;700;800;900&display=swap";

/* ── Local game data generator (no API needed) ───────────────────────── */
function generateGameData(gameId, form) {
  const name = form.name || "the celebrant";
  const partner = form.partner || "";
  const age = form.age ? `${form.age}-year-old` : "";
  const hobbies = form.hobbies ? form.hobbies.split(/[,;]+/).map(s=>s.trim()).filter(Boolean) : ["music","cooking","travel"];
  const favs = form.favorites ? form.favorites.split(/[,;]+/).map(s=>s.trim()).filter(Boolean) : ["coffee","cats","Netflix"];
  const venue = form.venue || "home";
  const isCouple = ["wedding","anniversary"].includes(form.eventType);
  const isBaby = form.eventType === "baby_shower";
  const displayName = isCouple && partner ? `${name} & ${partner}` : name;

  // Build context-rich word list
  const rawWords = [
    name.split(" ")[0],
    ...(partner ? [partner.split(" ")[0]] : []),
    ...hobbies.slice(0,4),
    ...favs.slice(0,4),
    form.degree ? form.degree.split(" ")[0] : "",
    form.job ? form.job.split(" ")[0] : "",
    form.babyName || "",
    form.years ? `years${form.years}` : "",
    "party","celebrate","fun","love","friends","family",
  ].map(w=>w.toUpperCase().replace(/[^A-Z]/g,"")).filter(w=>w.length>=3);

  switch(gameId) {
    case "wordsearch":
      return { words: [...new Set(rawWords)].slice(0,14) };

    case "crossword":
      return {
        pairs: [
          { word: name.split(" ")[0].toUpperCase().replace(/[^A-Z]/g,""), clue: isCouple ? `First name of one half of the couple` : `First name of our celebrant(s)` },
          ...(partner ? [{ word: partner.split(" ")[0].toUpperCase().replace(/[^A-Z]/g,""), clue: `Their partner's first name` }] : []),
          ...(form.metStory ? [{ word: form.metStory.split(" ").find(w=>w.length>4)?.toUpperCase().replace(/[^A-Z]/g,"")||"LOVE", clue: `Related to how they met` }] : []),
          ...(form.degree ? [{ word: form.degree.split(" ")[0].toUpperCase().replace(/[^A-Z]/g,""), clue: `What ${name} studied` }] : []),
          ...(form.job ? [{ word: form.job.split(" ")[0].toUpperCase().replace(/[^A-Z]/g,""), clue: `${name}'s career or next chapter` }] : []),
          ...hobbies.slice(0,3).map(h=>({ word: h.toUpperCase().replace(/[^A-Z]/g,""), clue: isCouple ? `Something they love doing together` : `One of ${name}'s favorite hobbies` })),
          ...favs.slice(0,2).map(f=>({ word: f.toUpperCase().replace(/[^A-Z]/g,""), clue: `Something ${displayName} loves` })),
          { word: "CELEBRATE", clue: "What we're all here to do!" },
        ].filter(p=>p.word && p.word.length>=3).slice(0,10)
      };

    case "quiz":
      return {
        questions: isBaby ? [
          { question: `When is ${name}'s baby due?`, options: shuffle([form.dueDate||"April 2025","June 2025","August 2025","Next year"]), correct:"A" },
          { question: `What gender is the baby?`, options: shuffle([form.babyGender||"Surprise!","Boy","Girl","Twins!"]), correct:"A" },
          { question: `What is the baby's name (if known)?`, options: shuffle([form.babyName||"Still a secret!","Oliver","Sophie","James"]), correct:"A" },
          { question: `What is ${name}'s favorite thing?`, options: shuffle([favs[0]||"chocolate","salad","silence","cold weather"]), correct:"A" },
          { question: `What does ${name} love doing?`, options: shuffle([hobbies[0]||"relaxing","extreme sports","sky diving","tax returns"]), correct:"A" },
          { question: `Where is today's baby shower being held?`, options: shuffle([venue,"the moon","underwater","a volcano"]), correct:"A" },
          { question: `${name} is most excited about...`, options: shuffle(["becoming a mum","the sleepless nights","nappy changes","losing baby weight"]), correct:"A" },
          { question: `${name}'s friends would describe her as...`, options: shuffle(["amazing & glowing","always grumpy","never smiles","hates babies"]), correct:"A" },
        ] : isCouple ? [
          { question: `How did ${name} and ${partner||"their partner"} meet?`, options: shuffle([form.metStory||"through friends","online","at school","at work"]), correct:"A" },
          { question: `How long have they been together?`, options: shuffle([form.years?`${form.years} years`:"A few years","1 year","10 years","25 years"]), correct:"A" },
          { question: `What do they love doing together?`, options: shuffle([hobbies[0]||"travelling","arguing","doing taxes","ignoring each other"]), correct:"A" },
          { question: `What is their shared favorite thing?`, options: shuffle([favs[0]||"good food","broccoli","Mondays","early mornings"]), correct:"A" },
          { question: `Where is today's celebration?`, options: shuffle([venue,"outer space","underwater","a submarine"]), correct:"A" },
          { question: `${name} would describe ${partner||"their partner"} as...`, options: shuffle(["their soulmate","their nemesis","their accountant","their dentist"]), correct:"A" },
          { question: `Their friends would describe them as...`, options: shuffle(["couple goals","total opposites","always arguing","strangers"]), correct:"A" },
          { question: `One thing they always do together is...`, options: shuffle([hobbies[1]||hobbies[0]||"laugh together","fight over the remote","forget anniversaries","ignore each other"]), correct:"A" },
        ] : [
          { question: `What is ${name}'s favorite hobby?`, options: shuffle([hobbies[0]||"reading","skydiving","knitting","chess"]), correct:"A" },
          { question: `Which of these does ${name} love most?`, options: shuffle([favs[0]||"coffee","broccoli","silence","Mondays"]), correct:"A" },
          { question: `How old is ${name}${age?` (turning ${form.age})`:""}?`, options: shuffle([form.age||"forever young",String(Number(form.age||0)+5),String(Number(form.age||0)-2),"18 forever"]).slice(0,4), correct:"A" },
          { question: `${name} works as / studied...`, options: shuffle([form.job||form.degree||"something amazing","astronaut","professional napper","time traveller"]), correct:"A" },
          { question: `Which activity does ${name} enjoy?`, options: shuffle([hobbies[1]||hobbies[0]||"dancing","extreme ironing","yodelling","cloud watching"]), correct:"A" },
          { question: `${name} cannot live without their...`, options: shuffle([favs[0]||"coffee","darkness","boredom","bad music"]), correct:"A" },
          { question: `Where is today's celebration being held?`, options: shuffle([venue,"outer space","underwater","a volcano"]), correct:"A" },
          { question: `${name}'s friends would describe them as...`, options: shuffle(["amazing & fun","always grumpy","never laughs","dislikes parties"]), correct:"A" },
        ],
        answers: ["1-A","2-A","3-A","4-A","5-A","6-A","7-A","8-A"]
      };

    case "thisorthat":
      return {
        pairs: isCouple ? [
          { a: name, b: partner||"Partner", answer: "They'd both say themselves!" },
          { a: hobbies[0]||"Staying in", b: hobbies[1]||"Going out", answer: hobbies[0]||"Staying in" },
          { a: favs[0]||"Coffee", b: favs[1]||"Tea", answer: favs[0]||"Coffee" },
          { a: "Beach holiday 🏖️", b: "City break 🌆", answer: "Beach holiday 🏖️" },
          { a: "Cook at home 🍳", b: "Eat out 🍽️", answer: "Eat out 🍽️" },
          { a: "Movie night in 🎬", b: "Night out dancing 💃", answer: "Movie night in 🎬" },
          { a: "Morning person ☀️", b: "Night owl 🦉", answer: "Night owl 🦉" },
          { a: "Adventure 🧗", b: "Relaxation 🧘", answer: "Adventure 🧗" },
          { a: "Dogs 🐕", b: "Cats 🐱", answer: favs.join(" ").toLowerCase().includes("cat") ? "Cats 🐱" : "Dogs 🐕" },
          { a: "Sweet treats 🍰", b: "Savoury snacks 🧀", answer: "Sweet treats 🍰" },
        ] : isBaby ? [
          { a: "Boy 💙", b: "Girl 💗", answer: form.babyGender||"Surprise!" },
          { a: "Team No Sleep 😴", b: "Baby sleeps through", answer: "Team No Sleep 😴" },
          { a: "Natural birth", b: "C-section", answer: "Whatever's safest!" },
          { a: "Breastfeed", b: "Bottle feed", answer: "Whatever works!" },
          { a: "Classic name", b: "Unique name", answer: form.babyName?"Unique name":"Classic name" },
          { a: "Big family 👨‍👩‍👧‍👦", b: "Small family", answer: "Big family 👨‍👩‍👧‍👦" },
          { a: "Soft play 🎪", b: "Outdoor adventures 🌳", answer: "Outdoor adventures 🌳" },
          { a: "Baby showers 🎉", b: "Quiet time at home", answer: "Baby showers 🎉" },
          { a: `${name} handles night feeds`, b: `${partner||"Partner"} handles night feeds`, answer: `${partner||"Partner"} handles night feeds 😄` },
          { a: "Mum looks amazing", b: "Mum is exhausted", answer: "Mum looks amazing (always!)" },
        ] : [
          { a: hobbies[0]||"Music 🎵", b: hobbies[1]||"Sport ⚽", answer: hobbies[0]||"Music" },
          { a: favs[0]||"Coffee ☕", b: favs[1]||"Tea 🍵", answer: favs[0]||"Coffee" },
          { a: "Morning person ☀️", b: "Night owl 🦉", answer: "Night owl 🦉" },
          { a: "Beach holiday 🏖️", b: "City break 🌆", answer: "Beach holiday 🏖️" },
          { a: "Netflix night in 🎬", b: "Night out dancing 💃", answer: "Netflix night in 🎬" },
          { a: "Cook at home 🍳", b: "Eat out 🍽️", answer: "Eat out 🍽️" },
          { a: "Dogs 🐕", b: "Cats 🐱", answer: favs.join(" ").toLowerCase().includes("cat") ? "Cats 🐱" : "Dogs 🐕" },
          { a: "Summer ☀️", b: "Winter ❄️", answer: "Summer ☀️" },
          { a: "Text message 💬", b: "Phone call 📞", answer: "Text message 💬" },
          { a: "Sweet treats 🍰", b: "Savoury snacks 🧀", answer: "Sweet treats 🍰" },
        ],
        answers: isCouple
          ? [name, hobbies[0]||"Staying in", favs[0]||"Coffee", "Beach", "Eat out", "Movie night", "Night owl", "Adventure", "Dogs/Cats", "Sweet"]
          : isBaby
          ? [form.babyGender||"Surprise","No sleep","Whatever's safest","Whatever works","Name choice","Big family","Outdoors","Baby shower","Partner feeds","Always amazing"]
          : [hobbies[0]||"Music", favs[0]||"Coffee", "Night owl", "Beach", "Netflix", "Eat out", "Dogs/Cats", "Summer", "Text", "Sweet"]
      };

    case "trivia":
      return {
        questions: isCouple ? [
          { question: `Where did ${name} and ${partner||"their partner"} meet?`, options: shuffle([form.metStory||"through mutual friends","online","at school","at a party"]), correct:"A" },
          { question: `How long have ${name} & ${partner||"partner"} been together?`, options: shuffle([form.years?`${form.years} years`:"A few years","1 year","20 years","30 years"]), correct:"A" },
          { question: `What do they enjoy doing together?`, options: shuffle([hobbies[0]||"travelling","doing nothing","ignoring each other","arguing"]), correct:"A" },
          { question: `Their favorite thing together is...`, options: shuffle([favs[0]||"good food","watching paint dry","traffic jams","bad weather"]), correct:"A" },
          { question: `${name} would describe ${partner||"their partner"} as...`, options: shuffle(["my soulmate","my accountant","my nemesis","a stranger"]), correct:"A" },
          { question: `What is today's celebration for?`, options: shuffle([form.eventType.replace(/_/g," "),"board meeting","job interview","Monday blues"]), correct:"A" },
          { question: `Where is today's event?`, options: shuffle([venue,"the moon","a submarine","a haunted house"]), correct:"A" },
          { question: `Their guests would describe them as...`, options: shuffle(["total couple goals","always arguing","complete strangers","just flatmates"]), correct:"A" },
        ] : isBaby ? [
          { question: `When is ${name}'s baby due?`, options: shuffle([form.dueDate||"Spring 2025","Summer 2025","Autumn 2025","Winter 2025"]), correct:"A" },
          { question: `Is the baby a boy or a girl?`, options: shuffle([form.babyGender||"It's a surprise!","Boy","Girl","Twins"]), correct:"A" },
          { question: `What is the baby's name?`, options: shuffle([form.babyName||"Shhh, it's a secret!","Oliver","Charlotte","James"]), correct:"A" },
          { question: `What is ${name} most excited about?`, options: shuffle(["being a mum!","sleepless nights","nappy changes","losing sleep"]), correct:"A" },
          { question: `${name}'s favorite thing is...`, options: shuffle([favs[0]||"chocolate","cold showers","diets","Mondays"]), correct:"A" },
          { question: `${name} loves to...`, options: shuffle([hobbies[0]||"relax","do extreme sports","go sky diving","do taxes"]), correct:"A" },
          { question: `${name}'s friends describe her as...`, options: shuffle(["glowing & amazing","always tired","never smiles","hates babies"]), correct:"A" },
          { question: `Where is today's shower?`, options: shuffle([venue,"outer space","underwater","a treehouse"]), correct:"A" },
        ] : [
          { question: `What year was ${name} born?`, options: shuffle([String(new Date().getFullYear()-(Number(form.age)||30)),String(new Date().getFullYear()-(Number(form.age)||30)+2),String(new Date().getFullYear()-(Number(form.age)||30)-3),String(new Date().getFullYear()-(Number(form.age)||30)+5)]), correct:"A" },
          { question: `${name} is passionate about...`, options: shuffle([hobbies[0]||"life","extreme ironing","tightrope walking","mime"]), correct:"A" },
          { question: `${name} is crazy about...`, options: shuffle([favs[0]||"coffee","liver","cold showers","traffic jams"]), correct:"A" },
          { question: `${name} works as / studied...`, options: shuffle([form.job||form.degree||"something amazing","professional napper","time traveller","astronaut"]), correct:"A" },
          { question: `${name}'s friends would call them...`, options: shuffle(["amazing & fun","boring","grumpy","antisocial"]), correct:"A" },
          { question: `${name} would rather spend a day...`, options: shuffle([hobbies[0]||"relaxing","doing taxes","queueing","sleeping on concrete"]), correct:"A" },
          { question: `${name}'s can't-live-without item is...`, options: shuffle([favs[0]||"coffee",favs[1]||"books","misery","nothing"]), correct:"A" },
          { question: `Today's celebration venue is...`, options: shuffle([venue,"the moon","a submarine","a haunted castle"]), correct:"A" },
        ]
      };

    case "bingo":
      return {
        items: isCouple ? [
          `${name} blushes`, `${partner||"Partner"} cries`, "Someone gives terrible advice",
          "Best speech ever", "Embarrassing photo shown", "Someone mentions the ex",
          "Old love story told", `${name} & ${partner||"partner"} hold hands`, "Tears of joy",
          "Surprise guest arrives", "Best couple ever said",
          ...hobbies.map(h=>`${h} mentioned`),
          ...favs.map(f=>`${f} spotted`),
          "Group photo taken", "Food is amazing", "Music gets going",
          "Someone dances badly", "Story from first date", "Cake is cut",
          "Toast proposed", "Refill needed", "Games get competitive",
          `${name} laughs loudly`, "Party extended late", "Best night ever said",
          "Gift unwrapped slowly", "Someone's phone dies", "Kids start running around",
        ].slice(0,30) : isBaby ? [
          "Someone cries happy tears", "Baby name guessed right", "Mum looks radiant",
          "Nappy cake admired", "Gender reveal moment", "Advice no one asked for",
          "Sleepless nights mentioned", "Baby name debated", "Someone brings twins gift",
          "Old wives tale shared", "Labour story told",
          ...hobbies.map(h=>`${h} mentioned`),
          ...favs.map(f=>`${f} spotted`),
          "Group photo taken", "Cake is amazing", "Games get competitive",
          "Someone already pregnant too", "Mum gets emotional", "Nappy changing tips given",
          "Best wishes card signed", "Refill needed", "Baby shower bingo won",
          `${name} glows`, "Party extended", "Best shower ever said",
          "Gift not needed size", "Booties are adorable", "Confetti everywhere",
        ].slice(0,30) : [
          `${name} laughs`, "Someone cries happy tears", "Surprise guest arrives",
          "Best speech ever", "Terrible dance moves", "Someone checks their phone",
          "Food mentioned 3x", "Old photo shown", "Embarrassing story told",
          ...hobbies.map(h=>`${name} mentions ${h}`),
          ...favs.map(f=>`${f} spotted`),
          "Group photo taken", "Someone's late", "Cake is amazing",
          "Games get competitive", "Tears of joy", "Unexpected gift",
          "Music too loud", "Someone falls asleep", "Best party ever said",
          "Refill needed", "Toast proposed", "Childhood story told",
          `${name} blushes`, "Best dressed debate", "Party extended",
        ].slice(0,30)
      };

    case "fillinblank":
      return {
        sentences: isCouple ? [
          `${name} and ${partner||"their partner"} are happiest when ___.`,
          `You'll always find them with a ___ in hand.`,
          `Their superpower as a couple is ___.`,
          `The one thing they can't agree on is ___.`,
          `If they could travel anywhere together, they'd go to ___.`,
          `${name} always says "${partner||"partner"} is so ___."`,
          `Their friends would describe them as ___.`,
          `The secret to their relationship is ___.`,
          `${name}'s favorite thing about ${partner||"their partner"} is ___.`,
          `In 10 years, they'll be ___.`,
        ] : isBaby ? [
          `${name} is most excited about ___.`,
          `The baby is definitely getting ${name}'s ___.`,
          `${partner||"The partner"} is preparing by ___.`,
          `The baby's first word will probably be ___.`,
          `${name}'s birth plan includes ___.`,
          `Everyone is predicting the baby will look like ___.`,
          `The nursery theme is ___.`,
          `${name} has been craving ___ throughout the pregnancy.`,
          `The baby's future career will be ___.`,
          `${name} is glowing because of ___.`,
        ] : [
          `${name} is happiest when ___.`,
          `You'll always find ${name} with a ___ in hand.`,
          `${name}'s superpower is ___.`,
          `The one thing ${name} can't live without is ___.`,
          `If ${name} could travel anywhere, they'd go to ___.`,
          `${name}'s most used phrase is "___.`,
          `${name} would describe themselves as ___.`,
          `Everyone knows ${name} loves ___ more than anything.`,
          `${name}'s idea of a perfect day involves ___.`,
          `The one thing that always makes ${name} smile is ___.`,
        ],
        answers: isCouple
          ? [hobbies[0]||"being together", favs[0]||"coffee", "making each other laugh", "the TV remote", "somewhere tropical", "amazing", "couple goals", "communication", "their smile", "living the dream"]
          : isBaby
          ? ["becoming a mum", "good looks", "reading pregnancy books", "mama", "breathing!", `${name}`, "jungle animals", "chocolate", "doctor or artist", "pure joy"]
          : [hobbies[0]||"relaxing", favs[0]||"coffee", "making people laugh", favs[0]||"coffee", "somewhere tropical", "Oh my goodness!", "fun and fabulous", hobbies[0]||"good food", hobbies[1]||"good company", favs[1]||"a good laugh"]
      };

    case "scavenger":
      return {
        clues: [
          { clue: `I keep your food cold and your drinks chilled. Look inside me for your next clue!`, location: "Fridge" },
          { clue: `People sit on me to watch TV or chat. Look under my cushions!`, location: "Sofa" },
          { clue: `I have pages full of stories or photos. Find the clue inside the biggest one!`, location: "Bookshelf" },
          { clue: `You use me every morning to see how great you look. Check behind me!`, location: "Mirror" },
          { clue: `Plants, fresh air, and sunshine live here. Your clue is waiting outside!`, location: "Garden / Back door" },
          { clue: `I make your food hot and your kitchen smell amazing. Look on top of me!`, location: "Oven / Microwave" },
          { clue: `When you're tired, you lay your head on me. Look under my pillow!`, location: "Bed / Bedroom" },
          { clue: `The final clue leads you back to where the party started — where ${displayName} is waiting with a big smile!`, location: "Party area / living room" },
        ]
      };

    default:
      return {};
  }
}


function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

/* ── Event types ─────────────────────────────────────────────────────── */
const EVENT_TYPES = [
  { id: "birthday_kids", label: "Kids Birthday", emoji: "🎂" },
  { id: "birthday_adult", label: "Adult Birthday", emoji: "🥳" },
  { id: "baby_shower", label: "Baby Shower", emoji: "🍼" },
  { id: "wedding", label: "Wedding / Engagement", emoji: "💍" },
  { id: "anniversary", label: "Anniversary", emoji: "💑" },
  { id: "graduation", label: "Graduation", emoji: "🎓" },
  { id: "retirement", label: "Retirement", emoji: "🌴" },
  { id: "holiday", label: "Holiday Party", emoji: "🎄" },
  { id: "general", label: "General Party", emoji: "🎉" },
];

/* ── Games ───────────────────────────────────────────────────────────── */
const GAMES = [
  { id: "wordsearch", label: "Word Search", emoji: "🔍", desc: "Hidden words based on their favorite things" },
  { id: "crossword", label: "Crossword", emoji: "✏️", desc: "Clues all about the celebrant" },
  { id: "quiz", label: "Who Knows Them Best?", emoji: "🏆", desc: "Quiz questions about the celebrant(s)" },
  { id: "thisorthat", label: "This or That", emoji: "🤔", desc: "Fun preference choices about the celebrant" },
  { id: "trivia", label: "Celebrant Trivia", emoji: "💡", desc: "Facts and trivia about their life" },
  { id: "bingo", label: "Party Bingo", emoji: "🎱", desc: "Custom bingo cards for the event" },
  { id: "fillinblank", label: "Fill in the Blank", emoji: "😄", desc: "Funny sentences about the celebrant" },
  { id: "scavenger", label: "Scavenger Hunt", emoji: "🗺️", desc: "Custom clues for your venue" },
];

/* ── CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
@import url('${FONTS}');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --pink: #FF6B9D; --purple: #9B5DE5; --yellow: #FFE66D;
  --orange: #FF9A3C; --teal: #00C9A7; --blue: #4ECDC4;
  --dark: #2D1B69; --white: #FFFDF7;
  --grad: linear-gradient(135deg, #FF6B9D, #9B5DE5, #4ECDC4);
}
html { scroll-behavior: smooth; }
body {
  font-family: 'Nunito', sans-serif;
  background: var(--white);
  color: var(--dark);
  min-height: 100vh;
  color-scheme: light;
}
/* ── Nav ── */
.nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 100;
  background: rgba(255,253,247,0.92); backdrop-filter: blur(12px);
  border-bottom: 2px solid rgba(155,93,229,0.12);
  padding: 12px 24px; display: flex; align-items: center; justify-content: space-between;
}
.nav-logo { font-family: 'Pacifico', cursive; font-size: clamp(18px,4vw,26px); background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.nav-links { display: flex; gap: 8px; }
.nav-link { padding: 7px 16px; border-radius: 99px; font-weight: 800; font-size: 13px; cursor: pointer; border: none; background: none; color: var(--dark); transition: all 0.15s; }
.nav-link:hover { background: #f3e8ff; color: var(--purple); }
.nav-cta { background: var(--purple); color: white !important; }
.nav-cta:hover { background: #7c3aed !important; transform: scale(1.03); }
/* ── Hero ── */
.hero {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 100px 24px 60px;
  background: linear-gradient(160deg, #fff5fb 0%, #f3e8ff 40%, #e0f7f4 100%);
}
.hero-bg-shape { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; pointer-events: none; }
.confetti { position: absolute; width: 12px; height: 12px; border-radius: 2px; animation: confettiFall linear infinite; pointer-events: none; }
@keyframes confettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}
.hero-content { position: relative; z-index: 1; text-align: center; max-width: 760px; }
.hero-badge { display: inline-block; background: var(--yellow); color: var(--dark); border-radius: 99px; padding: 6px 18px; font-size: 13px; font-weight: 800; margin-bottom: 20px; box-shadow: 0 4px 14px rgba(255,230,109,0.5); }
.hero-title { font-family: 'Pacifico', cursive; font-size: clamp(36px, 8vw, 72px); line-height: 1.15; margin-bottom: 16px; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.hero-sub { font-size: clamp(15px, 3vw, 20px); color: #6b7280; font-weight: 600; margin-bottom: 36px; line-height: 1.6; }
.hero-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
.btn { padding: 14px 28px; border-radius: 99px; font-weight: 800; font-size: 16px; border: none; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px; }
.btn:active { transform: scale(0.97); }
.btn-primary { background: var(--grad); color: white; box-shadow: 0 8px 24px rgba(155,93,229,0.4); background-size: 200%; }
.btn-primary:hover { box-shadow: 0 12px 32px rgba(155,93,229,0.5); transform: translateY(-2px); }
.btn-secondary { background: white; color: var(--purple); border: 2.5px solid var(--purple); }
.btn-secondary:hover { background: #f3e8ff; transform: translateY(-2px); }
/* ── Sections ── */
.section { padding: 80px 24px; max-width: 1100px; margin: 0 auto; }
.section-label { font-size: 12px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; color: var(--purple); margin-bottom: 10px; }
.section-title { font-family: 'Pacifico', cursive; font-size: clamp(26px, 5vw, 44px); color: var(--dark); margin-bottom: 12px; }
.section-sub { font-size: 16px; color: #6b7280; font-weight: 600; max-width: 560px; line-height: 1.65; margin-bottom: 48px; }
/* ── How it works ── */
.steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 24px; }
.step-card { background: white; border-radius: 24px; padding: 28px 24px; border: 2.5px solid #f0e6ff; position: relative; overflow: hidden; transition: transform 0.2s, box-shadow 0.2s; }
.step-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(155,93,229,0.12); }
.step-num { font-family: 'Pacifico', cursive; font-size: 52px; opacity: 0.08; position: absolute; top: 8px; right: 16px; color: var(--purple); }
.step-icon { font-size: 36px; margin-bottom: 12px; }
.step-title { font-weight: 900; font-size: 17px; color: var(--dark); margin-bottom: 6px; }
.step-desc { font-size: 14px; color: #6b7280; font-weight: 600; line-height: 1.6; }
/* ── Games grid ── */
.games-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
.game-card { background: white; border-radius: 20px; padding: 22px 20px; border: 2.5px solid #f0e6ff; cursor: pointer; transition: all 0.2s; user-select: none; position: relative; overflow: hidden; }
.game-card::before { content: ''; position: absolute; inset: 0; background: var(--grad); opacity: 0; transition: opacity 0.2s; }
.game-card:hover::before { opacity: 0.04; }
.game-card:hover { border-color: var(--purple); transform: translateY(-3px); box-shadow: 0 12px 32px rgba(155,93,229,0.12); }
.game-card.selected { border-color: var(--purple); background: #f9f0ff; }
.game-card.selected::after { content: '✓'; position: absolute; top: 12px; right: 14px; background: var(--purple); color: white; width: 22px; height: 22px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; }
.game-emoji { font-size: 32px; margin-bottom: 10px; }
.game-title { font-weight: 900; font-size: 16px; color: var(--dark); margin-bottom: 4px; }
.game-desc { font-size: 13px; color: #6b7280; font-weight: 600; line-height: 1.5; }
/* ── Generator form ── */
.gen-wrap { background: linear-gradient(135deg, #fff5fb, #f3e8ff); border-radius: 32px; padding: 48px 40px; border: 2.5px solid #e9d5ff; max-width: 760px; margin: 0 auto; }
@media(max-width:600px) { .gen-wrap { padding: 28px 20px; } }
.gen-title { font-family: 'Pacifico', cursive; font-size: clamp(22px,5vw,34px); color: var(--dark); margin-bottom: 8px; }
.gen-sub { font-size: 15px; color: #6b7280; font-weight: 600; margin-bottom: 32px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
@media(max-width:540px) { .form-grid { grid-template-columns: 1fr; } }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group.full { grid-column: 1 / -1; }
label { font-size: 12px; font-weight: 900; color: var(--dark); letter-spacing: .05em; text-transform: uppercase; }
input, textarea, select {
  padding: 12px 14px; border-radius: 14px; border: 2px solid #e9d5ff;
  font-size: 15px; font-weight: 600; font-family: 'Nunito', sans-serif;
  color: #1a1a1a; background: white; outline: none; transition: border-color 0.15s;
  color-scheme: light; -webkit-text-fill-color: #1a1a1a;
}
input:focus, textarea:focus, select:focus { border-color: var(--purple); box-shadow: 0 0 0 3px rgba(155,93,229,0.12); }
textarea { resize: vertical; min-height: 90px; }
.event-type-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px,1fr)); gap: 10px; margin-bottom: 20px; }
.event-pill { padding: 10px 8px; border-radius: 14px; border: 2px solid #e9d5ff; background: white; cursor: pointer; text-align: center; font-size: 13px; font-weight: 800; color: var(--dark); transition: all 0.15s; user-select: none; }
.event-pill:hover { border-color: var(--purple); }
.event-pill.selected { border-color: var(--purple); background: #f9f0ff; color: var(--purple); }
.event-pill-emoji { font-size: 22px; display: block; margin-bottom: 4px; }
.game-select-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px,1fr)); gap: 8px; margin-bottom: 20px; }
.game-pill { padding: 10px 12px; border-radius: 12px; border: 2px solid #e9d5ff; background: white; cursor: pointer; font-size: 13px; font-weight: 800; color: var(--dark); transition: all 0.15s; user-select: none; display: flex; align-items: center; gap: 7px; }
.game-pill:hover { border-color: var(--purple); }
.game-pill.selected { border-color: var(--purple); background: #f9f0ff; color: var(--purple); }
/* ── Output / Print area ── */
.output-wrap { margin-top: 40px; }
.output-tabs { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
.output-tab { padding: 9px 18px; border-radius: 99px; font-weight: 800; font-size: 14px; border: 2px solid #e9d5ff; background: white; cursor: pointer; transition: all 0.15s; color: var(--dark); }
.output-tab.active { background: var(--purple); color: white; border-color: var(--purple); }
.print-sheet {
  background: white; border-radius: 20px; padding: 40px;
  border: 2.5px solid #e9d5ff; position: relative;
  font-family: 'Nunito', sans-serif;
}
.print-sheet h2 { font-family: 'Pacifico', cursive; font-size: 28px; color: var(--purple); margin-bottom: 6px; }
.print-sheet .sheet-sub { font-size: 14px; color: #9ca3af; font-weight: 700; margin-bottom: 24px; }
/* Word search grid */
.ws-grid { display: inline-grid; gap: 3px; margin: 16px 0; }
.ws-cell { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 14px; border: 1px solid #e9d5ff; border-radius: 4px; color: var(--dark); background: white; }
.ws-words { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
.ws-word { background: #f3e8ff; padding: 4px 12px; border-radius: 99px; font-size: 13px; font-weight: 800; color: var(--purple); }
/* Crossword */
.cw-grid { display: inline-grid; gap: 2px; margin: 16px 0; }
.cw-cell { width: 32px; height: 32px; border: 2px solid var(--dark); display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 13px; position: relative; background: white; }
.cw-cell.black { background: var(--dark); border-color: var(--dark); }
.cw-num { position: absolute; top: 1px; left: 2px; font-size: 8px; font-weight: 900; color: var(--purple); }
.cw-clues { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 16px; }
.cw-clue-group h4 { font-weight: 900; color: var(--dark); margin-bottom: 8px; }
.cw-clue { font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; }
/* Quiz */
.quiz-q { margin-bottom: 20px; }
.quiz-q-text { font-weight: 800; font-size: 15px; color: var(--dark); margin-bottom: 8px; }
.quiz-options { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.quiz-option { padding: 8px 14px; border-radius: 10px; border: 2px solid #e9d5ff; font-size: 13px; font-weight: 700; color: var(--dark); }
/* Bingo */
.bingo-grid { display: grid; grid-template-columns: repeat(5,1fr); gap: 4px; max-width: 340px; }
.bingo-cell { aspect-ratio: 1; border: 2px solid #e9d5ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 11px; font-weight: 800; color: var(--dark); padding: 4px; }
.bingo-cell.free { background: var(--purple); color: white; font-size: 12px; }
.bingo-header { display: grid; grid-template-columns: repeat(5,1fr); gap: 4px; max-width: 340px; margin-bottom: 4px; }
.bingo-letter { text-align: center; font-weight: 900; font-size: 18px; color: var(--purple); }
/* This or that */
.tot-pair { display: grid; grid-template-columns: 1fr auto 1fr; gap: 12px; align-items: center; margin-bottom: 12px; }
.tot-opt { padding: 12px 16px; border-radius: 14px; border: 2px solid #e9d5ff; text-align: center; font-weight: 800; font-size: 14px; color: var(--dark); }
.tot-vs { font-weight: 900; color: var(--purple); font-size: 14px; }
/* Fill in blank */
.fib-item { margin-bottom: 16px; font-size: 15px; font-weight: 700; color: var(--dark); line-height: 1.8; border-bottom: 1px solid #e9d5ff; padding-bottom: 12px; }
.fib-blank { display: inline-block; width: 120px; border-bottom: 2.5px solid var(--purple); margin: 0 4px; }
/* Scavenger hunt */
.sh-clue { padding: 14px 18px; border-radius: 14px; border: 2px solid #e9d5ff; margin-bottom: 10px; display: flex; gap: 12px; align-items: flex-start; }
.sh-num { font-family: 'Pacifico', cursive; font-size: 22px; color: var(--purple); flex-shrink: 0; }
.sh-text { font-weight: 700; font-size: 14px; color: var(--dark); line-height: 1.55; }
/* Favors section */
.favors-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px,1fr)); gap: 16px; }
.favor-card { background: white; border-radius: 20px; padding: 22px 20px; border: 2.5px solid #e9d5ff; transition: all 0.2s; }
.favor-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(155,93,229,0.1); }
.favor-emoji { font-size: 32px; margin-bottom: 10px; }
.favor-title { font-weight: 900; font-size: 16px; color: var(--dark); margin-bottom: 6px; }
.favor-ideas { list-style: none; }
.favor-ideas li { font-size: 13px; font-weight: 600; color: #6b7280; padding: 3px 0; display: flex; align-items: flex-start; gap: 6px; }
.favor-ideas li::before { content: '✦'; color: var(--purple); font-size: 9px; margin-top: 4px; flex-shrink: 0; }
/* Donation */
.donation-bar { background: linear-gradient(135deg, #fff5fb, #f3e8ff); border-radius: 24px; padding: 32px 36px; border: 2.5px solid #e9d5ff; text-align: center; max-width: 600px; margin: 0 auto; }
.donation-title { font-family: 'Pacifico', cursive; font-size: 24px; color: var(--dark); margin-bottom: 8px; }
.donation-sub { font-size: 15px; color: #6b7280; font-weight: 600; margin-bottom: 24px; }
.donation-amounts { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-bottom: 20px; }
.donation-amt { padding: 10px 22px; border-radius: 99px; border: 2.5px solid #e9d5ff; font-weight: 800; font-size: 15px; cursor: pointer; background: white; color: var(--dark); transition: all 0.15s; }
.donation-amt:hover, .donation-amt.selected { border-color: var(--purple); background: #f9f0ff; color: var(--purple); }
/* Loading */
.loading-wrap { text-align: center; padding: 48px 24px; }
.spinner { width: 48px; height: 48px; border: 5px solid #e9d5ff; border-top-color: var(--purple); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-family: 'Pacifico', cursive; font-size: 18px; color: var(--purple); }
/* Print button */
.print-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 20px; }
.btn-sm { padding: 10px 20px; font-size: 14px; }
/* Footer */
footer { background: var(--dark); color: white; padding: 40px 24px; text-align: center; }
.footer-logo { font-family: 'Pacifico', cursive; font-size: 24px; background: var(--grad); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 8px; }
.footer-sub { font-size: 13px; color: #9ca3af; font-weight: 600; }
/* Misc */
.divider { height: 4px; background: var(--grad); border-radius: 99px; margin: 0 24px; opacity: 0.2; }
@media print {
  .nav, .hero, .how-section, .games-section, .gen-form-section, footer, .print-actions, .output-tabs, .donation-section, .favors-section { display: none !important; }
  .print-sheet { border: none; padding: 20px; box-shadow: none; }
}
.ribbon { background: var(--grad); color: white; text-align: center; padding: 10px; font-weight: 800; font-size: 13px; }
`;

/* ── Word Search Generator ─────────────────────────────────────────── */
function generateWordSearch(words, size = 13) {
  const grid = Array.from({ length: size }, () => Array(size).fill(""));
  const placed = [];
  const dirs = [[0,1],[1,0],[1,1],[0,-1],[-1,0],[-1,-1],[1,-1],[-1,1]];
  const alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (const raw of words) {
    const word = raw.toUpperCase().replace(/[^A-Z]/g, "").slice(0, size);
    if (!word) continue;
    let ok = false;
    for (let attempt = 0; attempt < 80 && !ok; attempt++) {
      const [dr, dc] = dirs[Math.floor(Math.random() * dirs.length)];
      const r = Math.floor(Math.random() * size);
      const c = Math.floor(Math.random() * size);
      const fits = word.split("").every((ch, i) => {
        const nr = r + dr * i, nc = c + dc * i;
        return nr >= 0 && nr < size && nc >= 0 && nc < size &&
          (grid[nr][nc] === "" || grid[nr][nc] === ch);
      });
      if (fits) {
        word.split("").forEach((ch, i) => { grid[r + dr * i][c + dc * i] = ch; });
        placed.push(word); ok = true;
      }
    }
  }
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++)
      if (!grid[r][c]) grid[r][c] = alpha[Math.floor(Math.random() * 26)];
  return { grid, words: placed };
}

/* ── Simple Crossword ─────────────────────────────────────────────── */
function generateSimpleCrossword(pairs) {
  // pairs: [{word, clue}]
  const size = 15;
  const grid = Array.from({ length: size }, () => Array(size).fill(null));
  const placed = [];
  const center = Math.floor(size / 2);

  const tryPlace = (word, row, col, dir) => {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      const r = row + dr * i, c = col + dc * i;
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      if (grid[r][c] !== null && grid[r][c] !== word[i]) return false;
    }
    return true;
  };

  const place = (word, row, col, dir) => {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) grid[row + dr * i][col + dc * i] = word[i];
  };

  pairs.slice(0, 10).forEach((p, idx) => {
    const word = p.word.toUpperCase().replace(/[^A-Z]/g, "");
    if (!word) return;
    if (placed.length === 0) {
      place(word, center, center - Math.floor(word.length / 2), "across");
      placed.push({ word, clue: p.clue, row: center, col: center - Math.floor(word.length / 2), dir: "across", num: placed.length + 1 });
      return;
    }
    for (const prev of placed) {
      for (let ci = 0; ci < word.length; ci++) {
        for (let pi = 0; pi < prev.word.length; pi++) {
          if (word[ci] !== prev.word[pi]) continue;
          const newDir = prev.dir === "across" ? "down" : "across";
          const dr = prev.dir === "down" ? 1 : 0;
          const dc = prev.dir === "across" ? 1 : 0;
          const row = prev.row + dr * pi - (newDir === "down" ? ci : 0);
          const col = prev.col + dc * pi - (newDir === "across" ? ci : 0);
          if (tryPlace(word, row, col, newDir)) {
            place(word, row, col, newDir);
            placed.push({ word, clue: p.clue, row, col, dir: newDir, num: placed.length + 1 });
            return;
          }
        }
      }
    }
  });

  return { grid, placed };
}

/* ── Bingo generator ─────────────────────────────────────────────── */
function generateBingo(items) {
  const pool = [...items].sort(() => Math.random() - 0.5);
  const cells = pool.slice(0, 24);
  cells.splice(12, 0, "FREE SPACE");
  return cells;
}

/* ── Components ───────────────────────────────────────────────────── */
const Confetti = () => {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    color: ["#FF6B9D","#9B5DE5","#FFE66D","#FF9A3C","#00C9A7","#4ECDC4"][i % 6],
    size: 8 + Math.random() * 8,
    delay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 4}s`,
    rot: Math.random() * 360,
  }));
  return (
    <>
      {pieces.map((p, i) => (
        <div key={i} className="confetti" style={{
          left: p.left, background: p.color,
          width: p.size, height: p.size,
          animationDelay: p.delay, animationDuration: p.duration,
          transform: `rotate(${p.rot}deg)`,
        }} />
      ))}
    </>
  );
};

/* ── Game Sheets ──────────────────────────────────────────────────── */
function WordSearchSheet({ data, celebrant }) {
  const { grid, words } = generateWordSearch(data.words || []);
  return (
    <div className="print-sheet">
      <h2>🔍 Word Search</h2>
      <div className="sheet-sub">Find all the words about {celebrant}!</div>
      <div className="ws-grid" style={{ gridTemplateColumns: `repeat(${grid[0].length}, 28px)` }}>
        {grid.flat().map((ch, i) => <div key={i} className="ws-cell">{ch}</div>)}
      </div>
      <div className="ws-words">
        {words.map(w => <div key={w} className="ws-word">{w}</div>)}
      </div>
    </div>
  );
}

function CrosswordSheet({ data, celebrant }) {
  const { grid, placed } = generateSimpleCrossword(data.pairs || []);
  const across = placed.filter(p => p.dir === "across");
  const down = placed.filter(p => p.dir === "down");
  const numGrid = Array.from({ length: 15 }, () => Array(15).fill(null));
  placed.forEach(p => { numGrid[p.row][p.col] = p.num; });

  return (
    <div className="print-sheet">
      <h2>✏️ Crossword</h2>
      <div className="sheet-sub">All clues are about {celebrant}!</div>
      <div className="cw-grid" style={{ gridTemplateColumns: "repeat(15, 32px)" }}>
        {grid.flat().map((ch, i) => {
          const r = Math.floor(i / 15), c = i % 15;
          const num = numGrid[r][c];
          return (
            <div key={i} className={`cw-cell${ch === null ? " black" : ""}`}>
              {num && <span className="cw-num">{num}</span>}
              {ch !== null ? "" : ""}
            </div>
          );
        })}
      </div>
      <div className="cw-clues">
        <div className="cw-clue-group">
          <h4>→ ACROSS</h4>
          {across.map(p => <div key={p.num} className="cw-clue">{p.num}. {p.clue}</div>)}
        </div>
        <div className="cw-clue-group">
          <h4>↓ DOWN</h4>
          {down.map(p => <div key={p.num} className="cw-clue">{p.num}. {p.clue}</div>)}
        </div>
      </div>
    </div>
  );
}

function QuizSheet({ data, celebrant }) {
  return (
    <div className="print-sheet">
      <h2>🏆 Who Knows {celebrant} Best?</h2>
      <div className="sheet-sub">Answer the questions — who knows them most?</div>
      {(data.questions || []).map((q, i) => (
        <div key={i} className="quiz-q">
          <div className="quiz-q-text">{i + 1}. {q.question}</div>
          <div className="quiz-options">
            {(q.options || []).map((o, j) => (
              <div key={j} className="quiz-option">{String.fromCharCode(65 + j)}) {o}</div>
            ))}
          </div>
        </div>
      ))}
      {data.answers && (
        <div style={{ marginTop: 20, padding: 16, background: "#f9f0ff", borderRadius: 14, fontSize: 13, fontWeight: 700 }}>
          <strong style={{ color: "var(--purple)" }}>Answers:</strong> {data.answers.join(" | ")}
        </div>
      )}
    </div>
  );
}

function ThisOrThatSheet({ data, celebrant }) {
  return (
    <div className="print-sheet">
      <h2>🤔 This or That: {celebrant}</h2>
      <div className="sheet-sub">Guess which option {celebrant} would choose!</div>
      {(data.pairs || []).map((p, i) => (
        <div key={i} className="tot-pair">
          <div className="tot-opt">{p.a}</div>
          <div className="tot-vs">OR</div>
          <div className="tot-opt">{p.b}</div>
        </div>
      ))}
      {data.answers && (
        <div style={{ marginTop: 16, padding: 14, background: "#f9f0ff", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
          <strong style={{ color: "var(--purple)" }}>Answers:</strong> {data.answers.join(", ")}
        </div>
      )}
    </div>
  );
}

function BingoSheet({ data, celebrant }) {
  const cells = generateBingo(data.items || []);
  return (
    <div className="print-sheet">
      <h2>🎱 {celebrant} Bingo!</h2>
      <div className="sheet-sub">Mark off each square as it applies!</div>
      <div className="bingo-header">{"BINGO".split("").map((l, i) => <div key={i} className="bingo-letter">{l}</div>)}</div>
      <div className="bingo-grid">
        {cells.map((c, i) => (
          <div key={i} className={`bingo-cell${c === "FREE SPACE" ? " free" : ""}`}>{c}</div>
        ))}
      </div>
    </div>
  );
}

function FillBlankSheet({ data, celebrant }) {
  return (
    <div className="print-sheet">
      <h2>😄 Fill in the Blank</h2>
      <div className="sheet-sub">Complete the funny sentences about {celebrant}!</div>
      {(data.sentences || []).map((s, i) => (
        <div key={i} className="fib-item">
          {i + 1}. {s.replace("___", "")} <span className="fib-blank" />
        </div>
      ))}
      {data.answers && (
        <div style={{ marginTop: 16, padding: 14, background: "#f9f0ff", borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
          <strong style={{ color: "var(--purple)" }}>Answers:</strong> {data.answers.join(" | ")}
        </div>
      )}
    </div>
  );
}

function ScavengerSheet({ data, celebrant }) {
  return (
    <div className="print-sheet">
      <h2>🗺️ Scavenger Hunt</h2>
      <div className="sheet-sub">Follow the clues at {celebrant}'s party!</div>
      {(data.clues || []).map((c, i) => (
        <div key={i} className="sh-clue">
          <div className="sh-num">{i + 1}</div>
          <div>
            <div className="sh-text">{c.clue}</div>
            {c.location && <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>📍 {c.location}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

function TriviaSheet({ data, celebrant }) {
  return (
    <div className="print-sheet">
      <h2>💡 {celebrant} Trivia</h2>
      <div className="sheet-sub">Test your knowledge!</div>
      {(data.questions || []).map((q, i) => (
        <div key={i} className="quiz-q">
          <div className="quiz-q-text">{i + 1}. {q.question}</div>
          <div className="quiz-options">
            {(q.options || []).map((o, j) => (
              <div key={j} className="quiz-option">{String.fromCharCode(65 + j)}) {o}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Favor Ideas ─────────────────────────────────────────────────── */
const FAVOUR_CATEGORIES = [
  {
    emoji: "🎁", title: "Party Bag Essentials",
    ideas: ["Mini notebooks & pens", "Sticker sheets", "Temporary tattoos", "Mini puzzles or games", "Sweet treats in branded bags", "Personalised bookmarks"]
  },
  {
    emoji: "🍬", title: "Edible Favors",
    ideas: ["Custom cookie boxes", "Mini jars of sweets", "Personalised chocolate bars", "Cake pops in cellophane", "Popcorn bags with custom labels", "Branded candy bags"]
  },
  {
    emoji: "🌿", title: "Eco-Friendly",
    ideas: ["Seed packets to grow flowers", "Mini succulents in pots", "Beeswax wraps", "Bamboo utensil sets", "Wildflower seed bombs", "Reusable shopping bags"]
  },
  {
    emoji: "📸", title: "Keepsake Gifts",
    ideas: ["Mini photo frames", "Custom keyrings", "Personalised ornaments", "Memory jars with notes", "Custom magnets", "Engraved bookmarks"]
  },
  {
    emoji: "🎨", title: "Activity Favors",
    ideas: ["Colouring books (kids)", "DIY craft kits", "Mini paint sets", "Puzzle books", "Card games", "Origami kits"]
  },
  {
    emoji: "💅", title: "Pampering",
    ideas: ["Mini hand creams", "Lip balm sets", "Bath bomb singles", "Nail polish duos", "Mini perfume samples", "Scented candles"]
  },
];

/* ── Dynamic form fields per event type ──────────────────────────── */
function getEventFields(eventType) {
  const venue = { key:"venue", label:"Venue / Location", placeholder:"e.g. garden, pub, community hall" };
  const aboutAll = { key:"funFacts", label:"Tell Us All About the Celebrant", placeholder:"Funny stories, habits, memorable moments...", type:"textarea", full:true };

  const fields = {
    birthday_kids: [
      { key:"name", label:"Child's Name", placeholder:"e.g. Amara", required:true },
      { key:"age", label:"Turning How Old?", placeholder:"e.g. 7" },
      { key:"hobbies", label:"Favorite Activities", placeholder:"e.g. football, drawing, swimming" },
      { key:"favorites", label:"Favorite Things (characters, food, colours)", placeholder:"e.g. Peppa Pig, pizza, purple" },
      { key:"bestFriends", label:"Names of Close Friends", placeholder:"e.g. Maya, Leo, Zara" },
      venue,
      aboutAll,
    ],
    birthday_adult: [
      { key:"name", label:"Celebrant's Name", placeholder:"e.g. Funmi", required:true },
      { key:"age", label:"Milestone Age", placeholder:"e.g. 30, 40, 50" },
      { key:"hobbies", label:"Hobbies & Passions", placeholder:"e.g. wine tasting, hiking, yoga" },
      { key:"favorites", label:"Favorite Things", placeholder:"e.g. prosecco, true crime, sunsets" },
      { key:"job", label:"What Do They Do?", placeholder:"e.g. nurse, teacher, entrepreneur" },
      { key:"partner", label:"Partner / Spouse Name (if any)", placeholder:"e.g. David" },
      venue,
      aboutAll,
    ],
    baby_shower: [
      { key:"name", label:"Mum-to-Be's Name", placeholder:"e.g. Blessing", required:true },
      { key:"partner", label:"Partner / Dad's Name", placeholder:"e.g. Kelechi" },
      { key:"dueDate", label:"Baby's Due Date / Month", placeholder:"e.g. April 2025" },
      { key:"babyGender", label:"Baby's Gender (if known)", placeholder:"e.g. Girl, Boy, or Surprise!" },
      { key:"babyName", label:"Baby's Name (if chosen)", placeholder:"e.g. Zara, or keeping it secret!" },
      { key:"hobbies", label:"Mum's Hobbies & Interests", placeholder:"e.g. baking, reading, fitness" },
      { key:"favorites", label:"Mum's Favorite Things", placeholder:"e.g. chocolate, bubble baths, rom-coms" },
      venue,
      aboutAll,
    ],
    wedding: [
      { key:"name", label:"Bride's Name", placeholder:"e.g. Adaeze", required:true },
      { key:"partner", label:"Groom's / Partner's Name", placeholder:"e.g. Emmanuel", required:true },
      { key:"metStory", label:"How Did They Meet?", placeholder:"e.g. at university, on a dating app, through friends" },
      { key:"weddingDate", label:"Wedding Date", placeholder:"e.g. 14th June 2025" },
      { key:"hobbies", label:"Things They Love Doing Together", placeholder:"e.g. travelling, cooking, hiking" },
      { key:"favorites", label:"Shared Favorite Things", placeholder:"e.g. Italian food, sunsets, karaoke" },
      { key:"funFacts", label:"Funny or Sweet Stories About the Couple", placeholder:"e.g. she always steals the duvet, he proposed at their first holiday destination...", type:"textarea", full:true },
      venue,
    ],
    anniversary: [
      { key:"name", label:"First Person's Name", placeholder:"e.g. Ngozi", required:true },
      { key:"partner", label:"Partner's Name", placeholder:"e.g. Seun", required:true },
      { key:"years", label:"How Many Years Together?", placeholder:"e.g. 10, 25, 50" },
      { key:"metStory", label:"How Did They Meet?", placeholder:"e.g. childhood sweethearts, blind date, at work" },
      { key:"hobbies", label:"Things They Love Doing Together", placeholder:"e.g. dancing, travelling, gardening" },
      { key:"favorites", label:"Their Favorite Memories Together", placeholder:"e.g. honeymoon in Santorini, that camping disaster of 2015..." },
      { key:"funFacts", label:"Funny & Sweet Stories", placeholder:"e.g. he still can't cook her favorite meal, she always wins at cards...", type:"textarea", full:true },
      venue,
    ],
    graduation: [
      { key:"name", label:"Graduate's Name", placeholder:"e.g. Tolu", required:true },
      { key:"degree", label:"What Did They Study?", placeholder:"e.g. Medicine at UCL" },
      { key:"age", label:"Age (optional)", placeholder:"e.g. 22" },
      { key:"hobbies", label:"Hobbies & Interests", placeholder:"e.g. photography, football, coding" },
      { key:"favorites", label:"Favorite Things", placeholder:"e.g. Nando's, memes, road trips" },
      { key:"job", label:"What's Next? (job / plans)", placeholder:"e.g. starting at Goldman Sachs, travelling, medical residency" },
      venue,
      aboutAll,
    ],
    retirement: [
      { key:"name", label:"Retiree's Name", placeholder:"e.g. Margaret", required:true },
      { key:"age", label:"Age (optional)", placeholder:"e.g. 65" },
      { key:"job", label:"What Did They Do? (career)", placeholder:"e.g. Head teacher for 35 years" },
      { key:"years", label:"How Many Years in the Role?", placeholder:"e.g. 30 years" },
      { key:"hobbies", label:"Hobbies & Plans in Retirement", placeholder:"e.g. gardening, cruises, grandchildren" },
      { key:"favorites", label:"Favorite Things", placeholder:"e.g. tea, Coronation Street, golf" },
      venue,
      aboutAll,
    ],
    holiday: [
      { key:"name", label:"Host / Organiser's Name", placeholder:"e.g. The Johnson Family", required:true },
      { key:"hobbies", label:"Party Theme or Style", placeholder:"e.g. ugly jumper, Secret Santa, festive games" },
      { key:"favorites", label:"Group's Favorite Things", placeholder:"e.g. mince pies, mulled wine, charades" },
      venue,
      { key:"funFacts", label:"Tell Us About Your Group", placeholder:"e.g. annual work party, family Christmas, friends gathering...", type:"textarea", full:true },
    ],
    general: [
      { key:"name", label:"Celebrant / Host's Name", placeholder:"e.g. Chiamaka", required:true },
      { key:"age", label:"Age (optional)", placeholder:"e.g. 21" },
      { key:"hobbies", label:"Hobbies & Interests", placeholder:"e.g. cooking, music, fitness" },
      { key:"favorites", label:"Favorite Things", placeholder:"e.g. dogs, sushi, reality TV" },
      venue,
      aboutAll,
    ],
  };

  // Add anniversary to event types if not already there
  return fields[eventType] || fields.general;
}
export default function App() {
  const [screen, setScreen] = useState("home");
  const [form, setForm] = useState({ name: "", age: "", eventType: "birthday_kids", hobbies: "", favorites: "", funFacts: "", venue: "" });
  const [selectedGames, setSelectedGames] = useState(["wordsearch", "quiz", "thisorthat"]);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [gameData, setGameData] = useState({});
  const [activeTab, setActiveTab] = useState(null);
  const [donationAmt, setDonationAmt] = useState(null);
  const printRef = useRef();

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const toggleGame = id => setSelectedGames(g => g.includes(id) ? g.filter(x => x !== id) : [...g, id]);

  const handlePrint = () => {
    const eventLabel = {
      birthday_kids: "Birthday", birthday_adult: "Birthday",
      baby_shower: "Baby Shower", wedding: "Wedding",
      anniversary: "Anniversary", graduation: "Graduation",
      retirement: "Retirement", holiday: "Holiday Party", general: "Party",
    }[form.eventType] || "Party";
    const name = form.name?.trim() || "Celebrant";
    const partner = form.partner?.trim();
    const displayName = partner ? `${name} & ${partner}` : name;
    const gameLabel = GAMES.find(g => g.id === activeTab)?.label || "Games";
    const prevTitle = document.title;
    document.title = `${displayName}'s ${eventLabel} - ${gameLabel}`;
    window.print();
    setTimeout(() => { document.title = prevTitle; }, 1000);
  };

  const generate = () => {
    if (!form.name.trim()) { alert("Please enter the celebrant's name!"); return; }
    if (selectedGames.length === 0) { alert("Please select at least one game!"); return; }
    setLoading(true);
    setLoadingMsg(`Creating games for ${form.name}...`);
    const results = {};
    for (const gid of selectedGames) {
      try {
        results[gid] = generateGameData(gid, form);
      } catch (e) {
        results[gid] = { error: true };
      }
    }
    setGameData(results);
    setActiveTab(selectedGames[0]);
    setLoading(false);
    setScreen("output");
  };

  const renderSheet = (gid) => {
    const data = gameData[gid] || {};
    const name = form.name;
    if (data.error) return <div style={{ padding: 24, color: "#ef4444", fontWeight: 700 }}>⚠️ Could not generate this game. Please try again.</div>;
    switch (gid) {
      case "wordsearch": return <WordSearchSheet data={data} celebrant={name} />;
      case "crossword": return <CrosswordSheet data={data} celebrant={name} />;
      case "quiz": return <QuizSheet data={data} celebrant={name} />;
      case "thisorthat": return <ThisOrThatSheet data={data} celebrant={name} />;
      case "trivia": return <TriviaSheet data={data} celebrant={name} />;
      case "bingo": return <BingoSheet data={data} celebrant={name} />;
      case "fillinblank": return <FillBlankSheet data={data} celebrant={name} />;
      case "scavenger": return <ScavengerSheet data={data} celebrant={name} />;
      default: return null;
    }
  };

  return (
    <>
      <style>{CSS}</style>

      {/* Ribbon */}
      <div className="ribbon">🎉 100% Free · AI-Powered · Personalised for Every Party 🎈</div>

      {/* Nav */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => setScreen("home")} style={{ cursor: "pointer" }}>PartyPrintables</div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => { setScreen("home"); setTimeout(() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }), 100); }}>How it works</button>
          <button className="nav-link" onClick={() => { setScreen("home"); setTimeout(() => document.getElementById("favors")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Favor Ideas</button>
          <button className="nav-link nav-cta" onClick={() => setScreen("generator")}>Create Games 🎲</button>
        </div>
      </nav>

      {screen === "home" && (
        <>
          {/* Hero */}
          <section className="hero">
            <div className="hero-bg-shape" style={{ width: 600, height: 600, background: "#FF6B9D", top: -200, right: -200 }} />
            <div className="hero-bg-shape" style={{ width: 400, height: 400, background: "#9B5DE5", bottom: -100, left: -100 }} />
            <div className="hero-bg-shape" style={{ width: 300, height: 300, background: "#FFE66D", top: "30%", left: "10%" }} />
            <Confetti />
            <div className="hero-content">
              <div className="hero-badge">✨ Personalised party games in seconds</div>
              <h1 className="hero-title">Make Every Party Unforgettable!</h1>
              <p className="hero-sub">Enter details about the celebrant(s) and we'll instantly generate custom word searches, crosswords, quizzes and more — all personalised just for them.</p>
              <div className="hero-btns">
                <button className="btn btn-primary" onClick={() => setScreen("generator")}>🎲 Create My Games</button>
                <button className="btn btn-secondary" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button>
              </div>
            </div>
          </section>

          {/* How it works */}
          <section className="section" id="how">
            <div className="section-label">How it works</div>
            <h2 className="section-title">Ready in 3 easy steps 🎈</h2>
            <p className="section-sub">No design skills needed. Just fill in the details and download print-ready games instantly.</p>
            <div className="steps">
              {[
                { num: "1", icon: "📝", title: "Tell us about them", desc: "Enter the celebrant's name, age, hobbies and favorite things." },
                { num: "2", icon: "🤖", title: "AI creates the games", desc: "Our AI generates fully personalised, unique games in seconds." },
                { num: "3", icon: "🖨️", title: "Print & play!", desc: "Download or print straight from your browser. Zero fuss." },
                { num: "4", icon: "🎊", title: "Everyone wins!", desc: "Guests love personalised games. Make memories that last." },
              ].map(s => (
                <div key={s.num} className="step-card">
                  <div className="step-num">{s.num}</div>
                  <div className="step-icon">{s.icon}</div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-desc">{s.desc}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="divider" />

          {/* Games */}
          <section className="section" id="games">
            <div className="section-label">Available games</div>
            <h2 className="section-title">8 games, all personalised 🎯</h2>
            <p className="section-sub">Every game is generated fresh using details you provide — no two packs are ever the same.</p>
            <div className="games-grid">
              {GAMES.map(g => (
                <div key={g.id} className="game-card">
                  <div className="game-emoji">{g.emoji}</div>
                  <div className="game-title">{g.label}</div>
                  <div className="game-desc">{g.desc}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 36 }}>
              <button className="btn btn-primary" onClick={() => setScreen("generator")}>🎲 Start Creating</button>
            </div>
          </section>

          <div className="divider" />

          {/* Party Favors */}
          <section className="section favors-section" id="favors">
            <div className="section-label">Party favor ideas</div>
            <h2 className="section-title">Favor & Gift Ideas 🎁</h2>
            <p className="section-sub">Stuck on what to give guests? Here are ideas for every type of party, from kids' birthdays to weddings and everything in between.</p>
            <div className="favors-grid">
              {FAVOUR_CATEGORIES.map(f => (
                <div key={f.title} className="favor-card">
                  <div className="favor-emoji">{f.emoji}</div>
                  <div className="favor-title">{f.title}</div>
                  <ul className="favor-ideas">
                    {f.ideas.map(i => <li key={i}>{i}</li>)}
                  </ul>
                </div>
              ))}
            </div>

            {/* Gift ideas by event */}
            <div style={{ marginTop: 48 }}>
              <div className="section-label">Gifts by event type</div>
              <h3 style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: "var(--dark)", marginBottom: 24 }}>What to give at every occasion 🥳</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 16 }}>
                {[
                  { event: "Kids Birthday 🎂", ideas: ["Personalised water bottle", "Activity book set", "LEGO mini set", "Art & craft bundle", "Character backpack", "Sweet hamper"] },
                  { event: "Adult Birthday 🥳", ideas: ["Experience voucher (spa, cooking class)", "Personalised wine/spirit bottle", "Book by their favorite author", "Subscription box", "Custom jewellery", "Luxury candle set"] },
                  { event: "Baby Shower 🍼", ideas: ["Milestone blanket", "Personalised name puzzle", "Baby book keepsake", "Organic toiletries set", "Knitted booties", "Nappy cake"] },
                  { event: "Wedding 💍", ideas: ["Personalised champagne flutes", "Custom recipe book", "Experience day voucher", "Memory box", "Luxury kitchen gadget", "Weekend getaway voucher"] },
                  { event: "Graduation 🎓", ideas: ["Professional notebook set", "Smart luggage tag", "LinkedIn premium gift card", "Personalised pen", "Money wallet with cash", "Tech accessory bundle"] },
                  { event: "Retirement 🌴", ideas: ["Garden tools set", "World travel scratch map", "Books by bucket list destination", "Spa day experience", "Personalised memoir kit", "Cruise voucher"] },
                ].map(ev => (
                  <div key={ev.event} className="favor-card">
                    <div className="favor-title" style={{ fontSize: 15 }}>{ev.event}</div>
                    <ul className="favor-ideas" style={{ marginTop: 8 }}>
                      {ev.ideas.map(i => <li key={i}>{i}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="divider" />

          {/* Donation */}
          <section className="section donation-section" id="donate">
            <div className="donation-bar">
              <div className="donation-title">❤️ Enjoying PartyPrintables?</div>
              <p className="donation-sub">This tool is completely free. If it saved you time and made your party special, consider buying us a coffee! Every donation keeps this free for everyone.</p>
              <div className="donation-amounts">
                {["$2", "$5", "$10", "$20"].map(a => (
                  <button key={a} className={`donation-amt${donationAmt === a ? " selected" : ""}`} onClick={() => setDonationAmt(a)}>{a}</button>
                ))}
              </div>
              {donationAmt && (
                <button className="btn btn-primary" onClick={() => alert(`Thank you! Donation of ${donationAmt} — payment integration coming soon! 🙏`)}>
                  ☕ Donate {donationAmt}
                </button>
              )}
            </div>
          </section>
        </>
      )}

      {screen === "generator" && (
        <div style={{ paddingTop: 80 }}>
          <div className="section">
            <div className="gen-wrap">
              <div className="gen-title">🎉 Create Your Party Pack</div>
              <div className="gen-sub">Fill in the details below and we'll generate personalised games instantly.</div>

              {/* Event type */}
              <label style={{ display: "block", marginBottom: 10 }}>Event Type</label>
              <div className="event-type-grid">
                {EVENT_TYPES.map(e => (
                  <div key={e.id} className={`event-pill${form.eventType === e.id ? " selected" : ""}`} onClick={() => upd("eventType", e.id)}>
                    <span className="event-pill-emoji">{e.emoji}</span>
                    {e.label}
                  </div>
                ))}
              </div>

              {/* Main form — dynamic per event type */}
              <div className="form-grid">
                {getEventFields(form.eventType).map(field => (
                  <div key={field.key} className={`form-group${field.full ? " full" : ""}`}>
                    <label>{field.label}{field.required ? " *" : ""}</label>
                    {field.type === "textarea"
                      ? <textarea value={form[field.key]||""} onChange={e => upd(field.key, e.target.value)} placeholder={field.placeholder} />
                      : <input type={field.type||"text"} value={form[field.key]||""} onChange={e => upd(field.key, e.target.value)} placeholder={field.placeholder} />
                    }
                  </div>
                ))}
              </div>

              {/* Game selection */}
              <label style={{ display: "block", marginBottom: 10 }}>Select Games to Generate</label>
              <div className="game-select-grid">
                {GAMES.map(g => (
                  <div key={g.id} className={`game-pill${selectedGames.includes(g.id) ? " selected" : ""}`} onClick={() => toggleGame(g.id)}>
                    <span>{g.emoji}</span>{g.label}
                  </div>
                ))}
              </div>

              <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={generate}>
                ✨ Generate My Party Pack
              </button>
              <button className="btn btn-secondary" style={{ width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setScreen("home")}>
                ← Back
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(255,253,247,0.95)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="loading-wrap">
            <div className="spinner" />
            <div className="loading-text">{loadingMsg}</div>
            <div style={{ fontSize: 14, color: "#9ca3af", fontWeight: 700, marginTop: 8 }}>Creating personalised games just for {form.name}...</div>
          </div>
        </div>
      )}

      {screen === "output" && (
        <div style={{ paddingTop: 80 }}>
          <div className="section">
            <div style={{ marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <div>
                <h2 style={{ fontFamily: "'Pacifico', cursive", fontSize: 28, color: "var(--dark)", marginBottom: 4 }}>🎉 {form.name}'s Party Pack</h2>
                <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 700 }}>{selectedGames.length} games generated · Click a tab to view each game</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print This Game</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setScreen("generator")}>← Edit Details</button>
              </div>
            </div>

            {/* Tabs */}
            <div className="output-tabs">
              {selectedGames.map(gid => {
                const g = GAMES.find(x => x.id === gid);
                return (
                  <button key={gid} className={`output-tab${activeTab === gid ? " active" : ""}`} onClick={() => setActiveTab(gid)}>
                    {g?.emoji} {g?.label}
                  </button>
                );
              })}
            </div>

            {/* Active sheet */}
            <div ref={printRef}>
              {activeTab && renderSheet(activeTab)}
            </div>

            <div className="print-actions">
              <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨️ Print / Save as PDF</button>
              <button className="btn btn-secondary btn-sm" onClick={() => { setScreen("generator"); }}>🔄 Generate New Pack</button>
            </div>

            {/* Favor ideas teaser */}
            <div style={{ marginTop: 40, background: "linear-gradient(135deg,#fff5fb,#f3e8ff)", borderRadius: 20, padding: "28px 24px", border: "2px solid #e9d5ff" }}>
              <div style={{ fontFamily: "'Pacifico', cursive", fontSize: 22, color: "var(--dark)", marginBottom: 8 }}>🎁 Need Favor Ideas Too?</div>
              <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 700, marginBottom: 16 }}>Browse our curated party favor and gift ideas for every occasion.</div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setScreen("home"); setTimeout(() => document.getElementById("favors")?.scrollIntoView({ behavior: "smooth" }), 100); }}>
                Browse Favor Ideas →
              </button>
            </div>

            {/* Donation */}
            <div style={{ marginTop: 32 }}>
              <div className="donation-bar">
                <div className="donation-title">❤️ Did this save your party planning?</div>
                <p className="donation-sub">PartyPrintables is free. If you loved it, please consider a small donation to keep it running!</p>
                <div className="donation-amounts">
                  {["$2", "$5", "$10", "$20"].map(a => (
                    <button key={a} className={`donation-amt${donationAmt === a ? " selected" : ""}`} onClick={() => setDonationAmt(a)}>{a}</button>
                  ))}
                </div>
                {donationAmt && (
                  <button className="btn btn-primary" onClick={() => alert(`Thank you! Donation of ${donationAmt} — payment integration coming soon! 🙏`)}>
                    ☕ Donate {donationAmt}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-logo">PartyPrintables.co</div>
        <div className="footer-sub">Free personalised party games for every occasion · Made with ❤️</div>
        <div style={{ marginTop: 12, fontSize: 12, color: "#6b7280" }}>© 2025 PartyPrintables.co · Free to use · Powered by AI</div>
      </footer>
    </>
  );
}
