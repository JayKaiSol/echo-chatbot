// Frontend chat logic for Echo's browser UI.
// This file runs in the browser, not on the server.
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const resetButton = document.getElementById("reset-chat");
const sendButton = document.getElementById("submit-user-message");

// When the user submits the form, send the message and display the reply
chatForm.addEventListener("submit", async (event) => {
  // Stop the browser's normal form submission behaviour
  event.preventDefault();

  // Read and clean the user's input
  const userMessage = messageInput.value.trim();

  // Ignore blank messages
  if (!userMessage) {
    return;
  }

  // Clear the input immediately so the UI feels responsive
  messageInput.value = "";

  // Disable the send button following a sent message
  sendButton.disabled = true;
  sendButton.textContent = "Thinking...";

  // Show the user's message in the chat box right away
  const userMessageElement = document.createElement("p");
  userMessageElement.textContent = `You: ${userMessage}`;
  chatBox.appendChild(userMessageElement);

  // Send an "Echo is thinking..." message in the chat box.
  const botThinkingElement = document.createElement("p");
  botThinkingElement.textContent = `Echo is thinking...`;
  chatBox.appendChild(botThinkingElement);

  try {
  // Send the user's message to the backend /chat route
  const response = await fetch("/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    // Put the user's message into the JSON request body
    body: JSON.stringify({
      message: userMessage,
    }),
  });

  // Read the server's JSON response
  const data = await response.json();

  // Remove the "Echo is thinking..." line from the chat box.
  chatBox.removeChild(botThinkingElement);

  // Show Echo's reply in the chat box
  const botMessageElement = document.createElement("p");
  botMessageElement.textContent = `Echo: ${data.reply}`;
  chatBox.appendChild(botMessageElement);

  // Re-enable the send button to respond to Echo
  sendButton.disabled = false;
  sendButton.textContent = "Send";
  }

  catch (error) {
    sendButton.disabled = false;
    sendButton.textContent = "Send";
  }

});

// Upon click, reset the chat and send a message to the console
resetButton.addEventListener("click", async (event) => {
  await fetch("/reset", {
    method: "POST",
  });
  chatBox.innerHTML = "";
  console.log("reset clicked")
  });
