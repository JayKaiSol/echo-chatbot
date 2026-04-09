// Shared chat service for talking to Ollama.
// Other parts of the app call this file when they need Echo's reply.
export async function getBotReply(messages) {
  // Send the conversation history to Ollama's local chat API
  const response = await fetch("http://localhost:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "gemma3:4b",
      messages,
      stream: false,
    }),
  });

  // Stop and throw an error if Ollama returns a bad HTTP response
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }

  // Read Ollama's JSON response and extract the reply text
  const data = await response.json();
  const botReply = data.message.content;

  // Give the reply text back to whatever part of the app called this function
  return botReply;
}
