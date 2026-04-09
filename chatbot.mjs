// Terminal version of Echo.
// This file handles the command-line chat flow and uses the shared chat service.
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { logInfo, logError, logDebug } from "./logger.mjs";
import { getBotReply } from "./services/chat.mjs";

// Set up the terminal input/output interface
const rl = readline.createInterface({ input, output });

// Conversation history for the terminal session.
// This persists until the terminal app closes.
const messages = [
  {
    // System message = Echo's identity and baseline behaviour
    role: "system",
    content: `Your name is Echo. You are a personal AI assistant. Be helpful, clear, conversational, and concise.`,
  },
];

// Log that the terminal app has started
logInfo("Application started");

// Main terminal chat loop:
// keep asking for input, process it, get Echo's reply, and repeat until exit
while (true) {
  try {
    // Wait for the user to type a message in the terminal
    const userInput = await rl.question("You: ");
    // Let the user close the terminal chat with one of the exit words
    if (["exit", "later", "disappear"].includes(userInput.toLowerCase())) {
      logInfo("Application closed by user");
      console.log("Echo: See you later, Jay!");
      break;
    }

    const lowerInput = userInput.toLowerCase();

    // Detect simple date/time questions and answer them in code
    // instead of sending them to the model
    const wantsDateOrTime =
      lowerInput.includes("date") ||
      lowerInput.includes("time") ||
      lowerInput.includes("day is it") ||
      lowerInput.includes("what day is it") ||
      lowerInput.includes("what time is it");

    // If the user asks for the date or time, reply immediately and skip Ollama
    if (wantsDateOrTime) {
      const currentDateTime = new Date().toLocaleString("en-GB", {
        dateStyle: "full",
        timeStyle: "short",
      });

      logDebug(`Date/time requested: ${currentDateTime}`);
      console.log(`Echo: The current date and time is ${currentDateTime}.`);
      continue;
    }

    logDebug(`User message: ${userInput}`);

    // Add the user's message to the terminal conversation history
    messages.push({
      role: "user",
      content: userInput,
    });

    // Use the shared chat service to get Echo's reply from the full conversation history
    const botReply = await getBotReply(messages);

    logDebug(`Bot reply: ${botReply}`);
    console.log(`Echo: ${botReply}`);

    // Add Echo's reply to the terminal conversation history
    messages.push({
      role: "assistant",
      content: botReply,
    });
  } catch (error) {
    // If something fails during the chat loop, log it and show a friendly message
    logError(`Chat loop failed: ${error.message}`);
    console.log("Echo: Something went wrong, Jay. Check app.log.");
  }
}
// Close the terminal interface when the loop ends
rl.close();
