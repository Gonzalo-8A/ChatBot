/* global define, self */

import { searchYouTube } from "../helpers/searchYoutube.js";

export const Chatbot = {
  defaultResponses: {
    "hello": () => ({ translationKey: "greetings.hello" }),
    "hi": () => ({ translationKey: "greetings.hello" }),
    "hey": () => ({ translationKey: "greetings.hello" }),
    "how are you": () => ({ translationKey: "greetings.how_are_you" }),
    "flip a coin": function () {
      const isHeads = Math.random() < 0.5;
      return {
        translationKey: isHeads ? "coin_throw.heads" : "coin_throw.tails"
      };
    },
    "roll a dice": function () {
      const number = Math.floor(Math.random() * 6) + 1;
      return {
        translationKey: "dice_throw.result",
        variables: { number }
      };
    },
    "what is the date today": function () {
      const now = new Date();
      const monthIndex = now.getMonth();
      return {
        translationKey: "today.date",
        variables: {
          month: `months.${monthIndex}`,
          day: now.getDate()
        }
      };
    },
    "date": function () {
      const now = new Date();
      const monthIndex = now.getMonth();
      return {
        translationKey: "today.date",
        variables: {
          month: `months.${monthIndex}`,
          day: now.getDate()
        }
      };
    },
    "tell me a joke": function () {
      const jokeKey = Chatbot.jokes[Math.floor(Math.random() * Chatbot.jokes.length)];
      return { translationKey: jokeKey };
    },
    "joke": function () {
      const jokeKey = Chatbot.jokes[Math.floor(Math.random() * Chatbot.jokes.length)];
      return { translationKey: jokeKey };
    },
    "play music": async function (message) {
      const keywords = ["play", "i want", "put on", "listen to"];
      let query = message.toLowerCase();

      for (const word of keywords) {
        query = query.replace(word, "");
      }
      query = query.trim();
      const capitalizedQuery = query.replace(/\b\w/g, (char) => char.toUpperCase());

      try {
        const { videoId, title } = await searchYouTube(query);
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        console.log(title)
        const html = `
          <div style="margin-bottom: 10px">🎵 <strong>${title || capitalizedQuery}</strong></div>
          <iframe width="100%" height="315" src="${embedUrl}?autoplay=1" title="YouTube video player" frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
          </iframe>
        `;
        return { message: html };
      // eslint-disable-next-line no-unused-vars
      } catch (error) {
        return { translationKey: "errors.video_not_found", variables: { query } };
      }
    },
    "thank": () => ({ translationKey: "greetings.thanks" }),
    "goodbye bye": () => ({ translationKey: "greetings.goodbye" }),
    "give me a unique id": function () {
      return {
        translationKey: "misc.unique_id",
        variables: { id: crypto.randomUUID() }
      };
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

  addResponses: function (additionalResponses) {
    this.additionalResponses = {
      ...this.additionalResponses,
      ...additionalResponses,
    };
  },

  async getResponseAsync(message) {
    // Ejecutar getResponse, esperando si devuelve Promise
    const result = this.getResponse(message);
    const resolved = result instanceof Promise ? await result : result;
    // Simular delay
    await new Promise((r) => setTimeout(r, 1000));
    return resolved;
  },

  getResponse: function (message) {
    if (!message) return this.emptyMessageResponse;
    const lowerCaseMessage = message.toLowerCase();
    if (
      lowerCaseMessage.includes("play") ||
      lowerCaseMessage.includes("i want") ||
      lowerCaseMessage.includes("put on") ||
      lowerCaseMessage.includes("listen to")
    ) {
      return this.defaultResponses["play music"](message);
    }
    // Procesar matemáticas
    const normalized = this.normalizeMathPhrase(message);
    if (this.isMathExpression(normalized)) {
      try {
        const result = new Function(`return ${normalized}`)();
        return {
          translationKey: "math.result",
          variables: { result }
        };
      } catch {
        return { translationKey: "math.error" };
      }
    }
    const responses = {
      ...this.defaultResponses,
      ...this.additionalResponses,
    };
    const { ratings, bestMatchIndex } = this.stringSimilarity(
      message,
      Object.keys(responses)
    );
    const bestRating = ratings[bestMatchIndex].rating;
    if (bestRating <= 0.3) {
      return this.unsuccessfulResponse;
    }
    const key = ratings[bestMatchIndex].target;
    const resp = responses[key];
    const result = typeof resp === "function" ? resp(message) : resp;
    return result;
  },

  isMathExpression: function (msg) {
    return /^[\d+\-*/().\s]+$/.test(msg);
  },

  normalizeMathPhrase: function (message) {
    let expr = message.toLowerCase();
    expr = expr
      .replace(/what is|what's|whats/gi, "")
      .replace(/plus/gi, "+")
      .replace(/minus/gi, "-")
      .replace(/times|multiplied by/gi, "*")
      .replace(/divided by|over/gi, "/")
      .replace(/equals|equal to/gi, "=");
    const wordToNumber = {
      zero: 0, one: 1, two: 2, three: 3, four: 4,
      five: 5, six: 6, seven: 7, eight: 8, nine: 9,
      ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
      fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
    };
    for (const word in wordToNumber) {
      expr = expr.replace(new RegExp(`\\b${word}\\b`, 'gi'), wordToNumber[word]);
    }
    return expr.trim();
  },

  compareTwoStrings: function (first, second) {
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

  stringSimilarity: function (mainString, targets) {
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

// UMD export
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
