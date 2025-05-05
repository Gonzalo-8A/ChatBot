/* global define, self */

import { searchYouTube } from "../helpers/searchYoutube.js";

const phraseToIntent = {
  en: {
    "hello": "greet",
    "hi": "greet",
    "hey": "greet",
    "how are you": "ask_status",
    "flip a coin": "coin",
    "roll a dice": "dice",
    "what is the date today": "date",
    "date": "date",
    "tell me a joke": "joke",
    "joke": "joke",
    "play music": "music",
    "i want": "music",
    "put on": "music",
    "listen to": "music",
    "thank": "thanks",
    "goodbye bye": "goodbye",
    "give me a unique id": "uuid"
  },
  es: {
    "hola": "greet",
    "buenas": "greet",
    "cómo estás": "ask_status",
    "lanzar una moneda": "coin",
    "moneda": "coin",
    "tirar un dado": "dice",
    "dado": "dice",
    "qué día es hoy": "date",
    "hoy": "date",
    "fecha": "date",
    "cuéntame un chiste": "joke",
    "chiste": "joke",
    "pon música": "music",
    "quiero": "music",
    "escuchar": "music",
    "gracias": "thanks",
    "adiós": "goodbye",
    "dame un id único": "uuid"
  }
};

const intentResponses = {
  greet: () => ({ translationKey: "greetings.hello" }),
  ask_status: () => ({ translationKey: "greetings.how_are_you" }),
  coin: () => ({
    translationKey: Math.random() < 0.5 ? "coin_throw.heads" : "coin_throw.tails"
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
        day: now.getDate()
      }
    };
  },
  joke: () => {
    const jokeKey = Chatbot.jokes[Math.floor(Math.random() * Chatbot.jokes.length)];
    return { translationKey: jokeKey };
  },
  music: (msg) => Chatbot.defaultResponses["play music"](msg),
  thanks: () => ({ translationKey: "greetings.thanks" }),
  goodbye: () => ({ translationKey: "greetings.goodbye" }),
  uuid: () => ({
    translationKey: "misc.unique_id",
    variables: { id: crypto.randomUUID() }
  })
};

export const Chatbot = {
  defaultResponses: {
    "play music": async function (message) {
      const keywords = ["play", "i want", "put on", "listen to", "pon", "quiero", "escuchar"];
      let query = message.toLowerCase();
      for (const word of keywords) query = query.replace(word, "");
      query = query.trim();
      const capitalizedQuery = query.replace(/\b\w/g, (char) => char.toUpperCase());
      try {
        const { videoId, title } = await searchYouTube(query);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        const html = `
          <div style="margin-bottom: 10px">🎵 <strong>${title || capitalizedQuery}</strong></div>
          <iframe width="100%" height="315" src="${embedUrl}?autoplay=1" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
          </iframe>`;
        return { message: html };
      } catch {
        return { translationKey: "errors.video_not_found", variables: { query } };
      }
    }
  },

  jokes: [
    "jokes.atoms",
    "jokes.scarecrow",
    "jokes.spaghetti",
    "jokes.pterodactyl",
    "jokes.math_book",
    "jokes.anti_gravity"
  ],

  additionalResponses: {},

  unsuccessfulResponse: { translationKey: "default.unknown" },
  emptyMessageResponse: { translationKey: "default.empty" },

  addResponses(additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses
    };
  },

  async getResponseAsync(message) {
    const result = this.getResponse(message);
    const resolved = result instanceof Promise ? await result : result;
    await new Promise((r) => setTimeout(r, 1000));
    return resolved;
  },

  getResponse(message) {
    if (!message) return this.emptyMessageResponse;
    const normalized = message.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (const lang in phraseToIntent) {
      for (const phrase in phraseToIntent[lang]) {
        if (normalized.includes(phrase)) {
          const intent = phraseToIntent[lang][phrase];
          const responseFn = intentResponses[intent];
          return typeof responseFn === "function" ? responseFn(message) : responseFn;
        }
      }
    }

    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses
    };
    const { ratings, bestMatchIndex } = this.stringSimilarity(message, Object.keys(responses));
    const bestRating = ratings[bestMatchIndex].rating;
    if (bestRating <= 0.3) return this.unsuccessfulResponse;
    const key = ratings[bestMatchIndex].target;
    const resp = responses[key];
    return typeof resp === "function" ? resp(message) : resp;
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
  }
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
