const form = document.querySelector("#chatForm");
const input = document.querySelector("#promptInput");
const messagesEl = document.querySelector("#messages");
const welcome = document.querySelector("#welcome");
const sendButton = document.querySelector("#sendButton");
const newChatButton = document.querySelector("#newChat");
const clearChatButton = document.querySelector("#clearChat");
const sidebar = document.querySelector("#sidebar");
const mobileMenu = document.querySelector("#mobileMenu");

let history = [];
let busy = false;

function scrollToBottom() {
  const conversation = document.querySelector("#conversation");
  conversation.scrollTop = conversation.scrollHeight;
}

function addMessage(role, content, isTyping = false) {
  const row = document.createElement("div");
  row.className = `message ${role}`;
  const avatar = document.createElement("div");
  avatar.className = "avatar";
  avatar.textContent = role === "assistant" ? "✳" : "●";
  const bubble = document.createElement("div");
  bubble.className = "bubble";
  if (isTyping) {
    bubble.innerHTML = '<div class="typing" aria-label="Seivy AI is thinking"><i></i><i></i><i></i></div>';
    row.dataset.typing = "true";
  } else {
    // textContent prevents model output from being interpreted as HTML.
    bubble.textContent = content;
  }
  row.append(avatar, bubble);
  messagesEl.appendChild(row);
  scrollToBottom();
  return row;
}

function setBusy(value) {
  busy = value;
  sendButton.disabled = value;
  sendButton.textContent = value ? "…" : "↑";
}

function resetChat() {
  history = [];
  messagesEl.replaceChildren();
  welcome.hidden = false;
  input.value = "";
  input.style.height = "auto";
  sidebar.classList.remove("open");
  input.focus();
}

async function sendMessage(text) {
  const content = text.trim();
  if (!content || busy) return;
  if (content.length > 4000) {
    addMessage("assistant", "Please keep each message under 4,000 characters.");
    return;
  }

  welcome.hidden = true;
  addMessage("user", content);
  history.push({ role: "user", content });
  input.value = "";
  input.style.height = "auto";
  setBusy(true);
  const typing = addMessage("assistant", "", true);

  try {
    // Send only recent messages to keep requests bounded.
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: history.slice(-20) })
    });
    const data = await response.json().catch(() => ({}));
    typing.remove();
    if (!response.ok) throw new Error(data.error || "Request failed. Please try again.");
    const reply = String(data.reply || "I couldn't create a reply. Please try again.");
    addMessage("assistant", reply);
    history.push({ role: "assistant", content: reply });
  } catch (error) {
    typing.remove();
    addMessage("assistant", `Sorry — ${error.message || "something went wrong"}`);
    // Keep the user message in history so they can retry by sending another message.
  } finally {
    setBusy(false);
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
});
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 160)}px`;
});
document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => sendMessage(button.dataset.prompt));
});
newChatButton.addEventListener("click", resetChat);
clearChatButton.addEventListener("click", resetChat);
mobileMenu.addEventListener("click", () => sidebar.classList.toggle("open"));
document.addEventListener("click", (event) => {
  if (window.innerWidth <= 760 && sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) && !mobileMenu.contains(event.target)) {
    sidebar.classList.remove("open");
  }
});
