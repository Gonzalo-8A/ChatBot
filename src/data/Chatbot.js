/* global define, self */

import { searchYouTube } from "../helpers/searchYoutube.js";

const phraseToIntent = {
  en: {
    hello: "greet",
    hi: "greet",
    hey: "greet",
    "how are you": "ask_status",
    "flip a coin": "coin",
    coin: "coin",
    "roll a dice": "dice",
    "what is the date today": "date",
    date: "date",
    today: "tdate",
    "tell me a joke": "joke",
    joke: "joke",
    play: "music",
    "play music": "music",
    "i want": "music",
    "put on": "music",
    "listen to": "music",
    thank: "thanks",
    goodbye: "goodbye",
    bye: "goodbye",
    "give me a unique id": "uuid",
    id: "uuid",
  },
  es: {
    hola: "greet",
    buenas: "greet",
    "como estas": "ask_status",
    "lanzar una moneda": "coin",
    moneda: "coin",
    "tirar un dado": "dice",
    dado: "dice",
    "que dia es hoy": "date",
    hoy: "date",
    fecha: "date",
    "cuentame un chiste": "joke",
    chiste: "joke",
    pon: "music",
    "pon musica": "music",
    quiero: "music",
    escuchar: "music",
    gracias: "thanks",
    adios: "goodbye",
    "dame un id único": "uuid",
  },
};

const intentResponses = {
  greet: () => ({ translationKey: "greetings.hello" }),
  ask_status: () => ({ translationKey: "greetings.how_are_you" }),
  coin: () => ({
    translationKey:
      Math.random() < 0.5 ? "coin_throw.heads" : "coin_throw.tails",
  }),
  dice: () => {
    const number = Math.floor(Math.random() * 6) + 1;
    return { translationKey: "dice_throw.result", variables: { number } };
  },
  date: () => {
    const now = new Date();
    return {
      translationKey: "today.date",
      variables: {
        month: `months.${now.getMonth()}`,
        day: now.getDate(),
      },
    };
  },
  joke: () => {
    const jokeKey =
      Chatbot.jokes[Math.floor(Math.random() * Chatbot.jokes.length)];
    return { translationKey: jokeKey };
  },
  music: async (msg) => {
    const keywords = [
      "play",
      "i want",
      "put on",
      "listen to",
      "pon",
      "quiero",
      "escuchar",
    ];
    let query = msg.toLowerCase();
    for (const word of keywords) query = query.replace(word, "");
    query = query.trim();
    const capitalizedQuery = query.replace(/\b\w/g, (char) =>
      char.toUpperCase()
    );
    try {
      const { videoId, title } = await searchYouTube(query);
      const embedUrl = `https://www.youtube.com/embed/${videoId}`;
      const html = `
        <div style="margin-bottom: 10px">🎵 <strong>${
          title || capitalizedQuery
        }</strong></div>
        <iframe width="100%" height="315" src="${embedUrl}?autoplay=1" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
        </iframe>`;
      return { message: html };
    } catch {
      return { translationKey: "errors.video_not_found", variables: { query } };
    }
  },
  thanks: () => ({ translationKey: "greetings.thanks" }),
  goodbye: () => ({ translationKey: "greetings.goodbye" }),
  uuid: () => ({
    translationKey: "misc.unique_id",
    variables: { id: crypto.randomUUID() },
  }),
};

export const Chatbot = {
  jokes: [
    "jokes.atoms",
    "jokes.scarecrow",
    "jokes.spaghetti",
    "jokes.pterodactyl",
    "jokes.math_book",
    "jokes.anti_gravity",
  ],

  unsuccessfulResponse: { translationKey: "default.unknown" },
  emptyMessageResponse: { translationKey: "default.empty" },

  async getResponseAsync(message) {
    const result = this.getResponse(message);
    const resolved = result instanceof Promise ? await result : result;
    await new Promise((r) => setTimeout(r, 1000));
    return resolved;
  },

  getResponse(message) {
    if (!message) return this.emptyMessageResponse;

    const normalized = message
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

    const musicKeywords = [
      "play",
      "pon",
      "escuchar",
      "quiero",
      "i want",
      "listen to",
      "put on",
    ];

    const containsMusicKeyword = musicKeywords.some((keyword) =>
      normalized.includes(keyword)
    );

    if (containsMusicKeyword) {
      const query = normalized
        .replace(new RegExp(musicKeywords.join("|"), "g"), "")
        .trim();
      if (query) {
        console.log("Detected intent: music, query:", query);
        const responseFn = intentResponses["music"];
        return typeof responseFn === "function"
          ? responseFn(message)
          : responseFn;
      }
    }

    for (const lang in phraseToIntent) {
      let bestMatch = { phrase: null, rating: 0 };
      for (const phrase in phraseToIntent[lang]) {
        const rating = this.compareTwoStrings(normalized, phrase);
        if (rating > bestMatch.rating) {
          bestMatch = { phrase, rating };
        }
      }

      if (bestMatch.rating > 0.6) {
        const intent = phraseToIntent[lang][bestMatch.phrase];
        const responseFn = intentResponses[intent];
        return typeof responseFn === "function"
          ? responseFn(message)
          : responseFn;
      }
    }

    return this.unsuccessfulResponse;
  },

  compareTwoStrings(first, second) {
    first = first.replace(/\s+/g, "");
    second = second.replace(/\s+/g, "");
    if (first === second) return 1;
    if (first.length < 2 || second.length < 2) return 0;
    const firstBigrams = new Map();
    for (let i = 0; i < first.length - 1; i++) {
      const bigram = first.substring(i, i + 2);
      firstBigrams.set(bigram, (firstBigrams.get(bigram) || 0) + 1);
    }
    let intersection = 0;
    for (let i = 0; i < second.length - 1; i++) {
      const bigram = second.substring(i, i + 2);
      const count = firstBigrams.get(bigram) || 0;
      if (count > 0) {
        firstBigrams.set(bigram, count - 1);
        intersection++;
      }
    }
    return (2.0 * intersection) / (first.length + second.length - 2);
  },

  stringSimilarity(mainString, targets) {
    const ratings = [];
    let bestIndex = 0;
    for (let i = 0; i < targets.length; i++) {
      const current = targets[i];
      const rating = this.compareTwoStrings(mainString, current);
      ratings.push({ target: current, rating });
      if (rating > ratings[bestIndex].rating) bestIndex = i;
    }
    return { ratings, bestMatchIndex: bestIndex };
  },
};

(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define([], factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.Chatbot = factory();
    root.chatbot = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
  return Chatbot;
});
