// Frontend chat logic for Echo's browser UI.
// This file runs in the browser, not on the server.
const chatForm = document.getElementById("chat-form");
const messageInput = document.getElementById("message-input");
const chatBox = document.getElementById("chat-box");
const resetButton = document.getElementById("reset-chat");

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

  // Show the user's message in the chat box right away
  const userMessageElement = document.createElement("p");
  userMessageElement.textContent = `You: ${userMessage}`;
  chatBox.appendChild(userMessageElement);

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

  // Show Echo's reply in the chat box
  const botMessageElement = document.createElement("p");
  botMessageElement.textContent = `Echo: ${data.reply}`;
  chatBox.appendChild(botMessageElement);
});

// Upon click, send a message to the console
resetButton.addEventListener("click", async (event) => {
  console.log ("The reset button has been pressed.");
  });
