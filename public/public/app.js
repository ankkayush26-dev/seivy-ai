const chatForm = document.querySelector("#chat-form");
const chatInput = document.querySelector("#chat-input");
const chatMessages = document.querySelector("#chat-messages");

if (chatForm && chatInput && chatMessages) {
  chatForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = chatInput.value.trim();
    if (!message) return;

    chatMessages.insertAdjacentHTML(
      "beforeend",
      `<p><strong>You:</strong> ${escapeHtml(message)}</p>`
    );
    chatInput.value = "";

    const loading = document.createElement("p");
    loading.textContent = "Seivy AI is thinking...";
    chatMessages.appendChild(loading);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: message }]
        })
      });

      const data = await response.json();
      loading.textContent = response.ok
        ? `Seivy AI: ${data.reply || data.message || "No reply received."}`
        : `Error: ${data.error || "Request failed."}`;
    } catch {
      loading.textContent = "Connection error. Please try again.";
    }
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
