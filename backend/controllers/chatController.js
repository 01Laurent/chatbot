// const Chat = require("../models/chat");
// const OpenAI = require("openai");
// const { report } = require("../routes/chatRoutes");

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// // predefined responses
// const companyFAQs = [
//     {
//         question: /delivery\s+(time|duration|how long)/i,
//         answer: "Our deliveries typically take between 24 to 72 hours depending on your location.",
//     },
//     {
//         question: /working\s+hours|open\s+hours|when\s+are\s+you\s+open/i,
//         answer: "We are open from 8Am to 6PM, Monday through Friday.",
//     },
//     {
//         question: /contact\s+(info|details)|how\s+do\s+i\s+reach\s+you/i,
//         answer: "you can reach us at support@medlink.com or call +254 751 602 579.",
//     },
//     {
//         question: /track\s+order|where\s+is\s+my\s+delivery/i,
//         answer: "You can track your order using the tracking link sent to your email or SMS after dispatch.",
//     },
//     {
//         question: /return\s+policy|how\s+to\s+return/i,
//         answer: "We accept returns within 7 days of delivery. Items must be unused and in original packaging.",
//     },
// ];

// function getCompanyResponse(message) {
//     for (const faq of companyFAQs) {
//         if (faq.question.test(message)) {
//             return faq.answer;
//         }
//     }
//     return null;
// }

// exports.handleChat = async (req, res) => {
//   const { message } = req.body;
//   try {
//     const companyAnswer = getCompanyResponse(message);

//     if (companyAnswer) {
//         await Chat.create({ userMessage: message, botReply: companyAnswer});
//         return res.json({ reply: companyAnswer });
//     }

//     console.log("No match, calling openAI..");

//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful logistics assistant." },
//         { role: "user", content: message },
//       ],
//     });

//     const botReply = response.data.choices[0].message.content;

//     await Chat.create({ userMessage: message, botReply });
//     res.json({ reply: botReply });

//   } catch (err) {
//     console.error("OpenAI API Error:", err.message);
//     res.status(500).json({ error: "OpenAI API failed" });
//   }
// };


const Chat = require("../models/chat");
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// More robust FAQ matchers with broader patterns
const companyFAQs = [
  {
    question: /delivery.*(time|duration|how long|takes)/i,
    answer: "Our deliveries typically take between 24 to 72 hours depending on your location.",
  },
  {
    question: /(working|opening|business)\s+(hours|times)|when.*(open|close)/i,
    answer: "We are open from 8AM to 6PM, Monday through Friday.",
  },
  {
    question: /(contact|reach|get in touch|support).*?(info|email|phone|number)?/i,
    answer: "You can reach us at support@medlink.com or call +254 751 602 579.",
  },
  {
    question: /(track|where is|find).*?(order|delivery)/i,
    answer: "You can track your order using the tracking link sent to your email or SMS after dispatch.",
  },
  {
    question: /return.*(policy|item|how)/i,
    answer: "We accept returns within 7 days of delivery. Items must be unused and in original packaging.",
  },
];

// Match helper
function getCompanyResponse(message) {
  const normalized = message.toLowerCase().trim();
  for (const faq of companyFAQs) {
    if (faq.question.test(normalized)) {
      console.log(`Matched FAQ pattern: ${faq.question}`);
      return faq.answer;
    }
  }
  console.log("No company FAQ match found.");
  return null;
}

exports.handleChat = async (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message format" });
  }

  try {
    const companyAnswer = getCompanyResponse(message);

    if (companyAnswer) {
      await Chat.create({ userMessage: message, botReply: companyAnswer });
      return res.json({ reply: companyAnswer });
    }

    console.log("No match, using OpenAI fallback...");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful logistics assistant." },
        { role: "user", content: message },
      ],
    });

    const botReply = response.choices?.[0]?.message?.content?.trim() || "Sorry, I couldn't understand that.";

    await Chat.create({ userMessage: message, botReply });
    res.json({ reply: botReply });
  } catch (err) {
    console.error("OpenAI API Error:", err);
    res.status(500).json({ error: "Something went wrong with the assistant." });
  }
};
