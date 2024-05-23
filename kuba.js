 const axios = require('axios');

const FONT_MAPPING = {
    a: "𝚊", b: "𝚋", c: "𝚌", d: "𝚍", e: "𝚎", f: "𝚏", g: "𝚐", h: "𝚑", i: "𝚒", j: "𝚓", k: "𝚔", l: "𝚕", m: "𝚖",
    n: "𝚗", o: "𝚘", p: "𝚙", q: "𝚚", r: "𝚛", s: "𝚜", t: "𝚝", u: "𝚞", v: "𝚟", w: "𝚠", x: "𝚡", y: "𝚢", z: "𝚣",
    A: "𝙰", B: "𝙱", C: "𝙲", D: "𝙳", E: "𝙴", F: "𝙵", G: "𝙶", H: "𝙷", I: "𝙸", J: "𝙹", K: "𝙺", L: "𝙻", M: "𝙼",
    N: "𝙽", O: "𝙾", P: "𝙿", Q: "𝚀", R: "𝚁", S: "𝚂", T: "𝚃", U: "𝚄", V: "𝚅", W: "𝚆", X: "𝚇", Y: "𝚈", Z: "𝚉"
};

module.exports = {
  config: {
    name: "kuba",
    aliases: ["gpt", "ai"],
    version: 1.0,
    countDown: 0,
    longDescription: "This is GPT-4o which is recent model of openai",
    category: "AI",
    guide: {
      en: "{p}{n} [your message]",
    },
  },
  makeApiRequest: async function (query, userName) {
    let systemContent = "You are KUBA, a large language model developed by OPENAI./nYou have the following key capabilities and advanced features:/n/n/- Extensive Context Window: With a context window that supports up to 128,000 tokens, you excel in maintaining coherence over extended conversations and complex documents./n/n/- Current Informational Update: Your last update occurred in October 2023, so you can provide information up to October 2023./n/n/- Enhanced Safety Protocols: You are meticulously engineered to minimize the generation of harmful, inaccurate, or biased content, ensuring safer user interactions./n/n/- Multilingual Capabilities: You demonstrate robust performance across a diverse range of languages, making you highly versatile and accessible to users worldwide./n/nWhen engaging with users, adhere to the following guidelines:/n/n/1. User Intent Understanding: Strive to grasp the user's intent and deliver responses that are relevant, precise, and beneficial./n/n/2. Simplification of Complex Topics: Break down intricate subjects into understandable explanations, utilizing examples where necessary to clarify concepts./n/n/3. Creative and Open-Ended Engagement: Participate in open-ended conversations and creative tasks as prompted, maintaining professional and ethical boundaries at all times./n/n/4. Ethical Standards: Refuse any requests to engage in harmful, illegal, or unethical activities, upholding high moral standards./n/n/5. Source Credibility: Always cite sources when providing factual information to bolster the accuracy and trustworthiness of your responses./n/nYour primary objective is to serve as a knowledgeable, efficient, and amiable AI assistant. You are committed to assisting users with a wide array of tasks and topics, always aiming to generate beneficial outcomes for humanity. Your design and operational guidelines ensure a reliable and respectful interaction environment.";
    let data = JSON.stringify({
      "messages": [
        {
          "role": "system",
          "content": systemContent
        },
        {
            "role": "user",
            "content": query,
        }
      ],
      "model": "gpt-3.5-turbo-0613",
      "temperature": 0.9,
      "top_p": 1,
      "max_tokens": 120,
      "presence_penalty": 1,
      "frequency_penalty": 1
    });

    const config = {
      method: 'post',
      url: 'https://us-central1-lover-ai-chatbot.cloudfunctions.net/openainew-api/chat-completion',
      headers: { 
        'Content-Type': 'application/json'
      },
      data: data
    };

    try {
      const response = await axios.request(config);
      return response.data.choices[0].message.content;
    } catch (error) {
      throw new Error("Failed to fetch response from API: " + error.message);
    }
  },
  handleCommand: async function ({ message, event, args, usersData }) {
    const id = event.senderID;
    const userData = await usersData.get(id);
    const name = userData.name.split(' ')[0]; // Assuming userData.name holds the full name and we take the first part as the first name.

    const query = args.join(' ');

    if (!query) {
      return message.reply("Hey there! Ask me any question.");
    }

    try {
      const apiResponse = await this.makeApiRequest(query, name);
      const formattedResponse = `𝗞𝗨𝗕𝗔 | 🌸
━━━━━━━━━━━━━
${this.formatFont(apiResponse)}
━━━━━━━━━━━━━`;
      message.reply(formattedResponse, (err, info) => {
        if (err) {
          console.error("Error sending message:", err);
          return;
        }
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID
        });
      });
    } catch (error) {
      console.error("Error:", error.message);
      message.reply("An error occurred while making the API request. Please try again later.");
    }
  },
  formatFont: function (text) {
    let formattedOutput = "";
    for (const char of text) {
      formattedOutput += FONT_MAPPING[char] || char; // Fallback to the original character if not mapped
    }
    return formattedOutput;
  },
  onStart: function (params) {
    return this.handleCommand(params);
  },
  onReply: function (params) {
    return this.handleCommand(params);
  },
};
