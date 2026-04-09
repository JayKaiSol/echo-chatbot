// Web server entry point for Echo's browser UI.
// This file serves the frontend and handles chat requests from the browser.
import express from "express";
import { getBotReply } from "./services/chat.mjs";

// Express app setup
const app = express();
const PORT = 3000;

// Middleware:
// - express.json() lets the server read JSON sent from the browser
// - express.static('public') serves the frontend files
app.use(express.json());
app.use(express.static("public"));

// Server-side conversation memory for the web chat.
// This stays in memory while the Node server is running.
const messages = [
  {
    // System message = Echo's identity and baseline behaviour
    role: "system",
    content:
      "Your name is Echo. You are a personal AI assistant. Be helpful, clear, conversational, and concise.",
  },
];

// Chat route:
// Receives a user message from the browser, gets Echo's reply, and sends it back as JSON.
app.post("/chat", async (request, response) => {
  try {
    // Read the message sent from script.js in the browser
    const userMessage = request.body.message;

    // Add the user's new message to the ongoing server-side conversation history
    messages.push({
      role: "user",
      content: userMessage,
    });

    // Send the full conversation history to the shared chat service and wait for Echo's reply
    const botReply = await getBotReply(messages);

    // Store Echo's reply as part of the conversation history
    messages.push({
      role: "assistant",
      content: botReply,
    });

    // Send Echo's reply back to the browser
    response.json({
      reply: botReply,
    });
  } catch (error) {
    // If anything fails, return a 500 error response to the browser
    response.status(500).json({
      reply: "Something went wrong.",
    });
  }
});

// Start the web server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
