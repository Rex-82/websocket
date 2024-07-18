// WebSocket client

const connectionButton = document.getElementById("connection-button");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const messageInputArea = document.getElementById("message-input-area");

connectionButton.textContent = "connect";
sendButton.textContent = "send";

let socketOpen = false;
let hasEvents = false;

function openConnection() {
	if (!socketOpen) {
		connectionButton.textContent = "";
		connectionButton.setAttribute("aria-busy", "true");

		const endpoint = "ws://127.0.0.1:8080";

		const socket = new WebSocket(endpoint);

		socket.addEventListener("open", () => {
			socketOpen = true;
			connectionButton.setAttribute("aria-busy", "false");
			connectionButton.textContent = "disconnect";
			console.log("connection opened");
			if (!hasEvents) {
				hasEvents = true;
				function sendMessage() {
					console.log(socket);
					if (messageInputArea.value.trim() !== "") {
						socket.send(messageInputArea.value.trim());
						messageInputArea.value = "";
					}
				}

				function closeConnection() {
					socket.close();
					if (socket.CLOSED) {
						console.log("connection closed");
						sendButton.removeEventListener("click", sendMessage);
						connectionButton.removeEventListener("click", closeConnection);
						connectionButton.addEventListener("click", openConnection);
						hasEvents = false;
						socketOpen = false;
						connectionButton.textContent = "connect";
					} else {
						console.log("connection not closed");
					}
				}

				sendButton.addEventListener("click", sendMessage);
				connectionButton.addEventListener("click", closeConnection);
				messageInputArea.addEventListener("input", () => {
					if (messageInputArea.value.trim() !== "") {
						sendButton.removeAttribute("disabled");
					} else {
						sendButton.setAttribute("disabled", "");
					}
				});

				connectionButton.removeEventListener("click", openConnection);
			}
		});

		socket.addEventListener("message", (event) => {
			const div = document.createElement("div");
			div.classList.add("chat-message");
			div.textContent = event.data;
			messagesContainer.prepend(div);
		});
	}
}

connectionButton.addEventListener("click", openConnection);
