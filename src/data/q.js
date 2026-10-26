export const questionProblems = [];

export function pack(rows) {
  return rows.map(([q, options, answer, tip], index) => {
    if (!q || !tip) questionProblems.push(`Missing text at row ${index + 1}: ${q}`);
    if (!Array.isArray(options) || options.length !== 4) {
      questionProblems.push(`Need 4 options: ${q}`);
    } else if (new Set(options).size !== 4) {
      questionProblems.push(`Duplicate options: ${q}`);
    } else if (!options.includes(answer)) {
      questionProblems.push(`Answer not in options: ${q} => ${answer}`);
    }
    return { q, options, answer, tip };
  });
}

export const LEVELS = {
  easy: { label: "आसान", emoji: "🌱" },
  mid: { label: "मध्यम", emoji: "🌟" },
  hard: { label: "थोड़ा ऊँचा", emoji: "🏆" },
};

export const CATEGORIES = {
  bharat: {
    id: "bharat",
    label: "भारत",
    title: "भारत देश",
    emoji: "🇮🇳",
    note: "नेता, तिरंगा, त्योहार, नदियाँ और आज़ादी की कहानियाँ।",
    tint: "#FF8A3D",
    soft: "#FFF1E4",
  },
  up: {
    id: "up",
    label: "उत्तर प्रदेश",
    title: "उत्तर प्रदेश",
    emoji: "🕌",
    note: "लखनऊ, मुख्यमंत्री, ताज, काशी और यूपी कब बना।",
    tint: "#F2547D",
    soft: "#FFE9F0",
  },
  bihar: {
    id: "bihar",
    label: "बिहार",
    title: "बिहार",
    emoji: "🌾",
    note: "पटना, मुख्यमंत्री, बिहार दिवस, छठ और नालंदा।",
    tint: "#1FA971",
    soft: "#E6F8EF",
  },
  awareness: {
    id: "awareness",
    label: "जान-पहचान",
    title: "जान-पहचान",
    emoji: "🌈",
    note: "रोज़ की बातें, मौसम, जानवर, छोटी साइंस और अच्छी आदतें।",
    tint: "#1AA7E0",
    soft: "#E7F6FD",
  },
  mix: {
    id: "mix",
    label: "मिला-जुला",
    title: "मिला-जुला दोहराव",
    emoji: "🎲",
    note: "पुरानी ज़रूरी बातें फिर से, ताकि धीरे-धीरे याद रह जाएँ।",
    tint: "#7C6BF2",
    soft: "#F1EEFF",
  },
};
