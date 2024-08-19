// WebSocket client

import { timeAgo } from "./timeAgo.js";

const connectionButton = document.getElementById("connection-button");
const sendButton = document.getElementById("send-button");
const messagesContainer = document.getElementById("messages-container");
const messageInputArea = document.getElementById("message-input-area");

connectionButton.textContent = "connect";
sendButton.textContent = "send";
messageInputArea.setAttribute("disabled", "");

let socketOpen = false;
let hasEvents = false;

const userId = Math.ceil(Math.random() * 100); // TODO: improve random Id generator to prevent collisions

function openConnection() {
	if (!socketOpen) {
		// TODO: handle login?

		connectionButton.textContent = "";
		connectionButton.setAttribute("aria-busy", "true");

		const endpoint = "ws://chat.rilae.com";

		const socket = new WebSocket(endpoint);

		socket.addEventListener("open", () => {
			socketOpen = true;
			connectionButton.setAttribute("aria-busy", "false");
			connectionButton.textContent = "disconnect";
			messageInputArea.removeAttribute("disabled");
			console.log("connection opened");

			if (messageInputArea.value.trim() !== "" && socketOpen) {
				sendButton.removeAttribute("disabled");
			} else {
				sendButton.setAttribute("disabled", "");
			}

			if (!hasEvents) {
				hasEvents = true;
				function sendMessage() {
					console.log(socket);
					if (messageInputArea.value.trim() !== "") {
						const message = {
							user: userId,
							timeStamp: new Date(),
							message: messageInputArea.value.trim(),
						};

						socket.send(JSON.stringify(message));
						messageInputArea.value = "";
						sendButton.setAttribute("disabled", "");
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
						sendButton.setAttribute("disabled", "");
						messageInputArea.setAttribute("disabled", "");
					} else {
						console.log("connection not closed");
					}
				}

				sendButton.addEventListener("click", sendMessage);
				connectionButton.addEventListener("click", closeConnection);
				messageInputArea.addEventListener("input", () => {
					messageInputArea.style.height = "";
					messageInputArea.style.height = messageInputArea.scrollHeight + "px";
					if (messageInputArea.value.trim() !== "" && socketOpen) {
						sendButton.removeAttribute("disabled");
					} else {
						sendButton.setAttribute("disabled", "");
					}
				});

				messageInputArea.addEventListener("keydown", (e) => {
					if (e.key === "Enter" && e.shiftKey) {
						sendMessage();
					}
				});

				connectionButton.removeEventListener("click", openConnection);
			}
		});

		socket.addEventListener("message", (event) => {
			try {
				const messageContent = JSON.parse(event.data);
				const div = document.createElement("div");
				const metadata = document.createElement("div");
				const user = document.createElement("span");
				const timeStamp = document.createElement("time");
				div.classList.add("chat-message");
				user.classList.add("chat-message-user");
				timeStamp.classList.add("chat-message-timestamp");

				div.textContent = messageContent.message;
				user.textContent = `from ${messageContent.user === userId ? `${messageContent.user} (You)` : messageContent.user}`;
				const messageDate = timeAgo(new Date(messageContent.timeStamp));

				timeStamp.textContent = messageDate;
				timeStamp.setAttribute("datetime", messageContent.timeStamp);

				metadata.appendChild(user);
				metadata.appendChild(timeStamp);

				div.appendChild(metadata);

				if (messageContent.user === userId) {
					div.classList.add("self-message");
				} else {
					div.classList.add("others-message");
				}
				messagesContainer.appendChild(div);
				messagesContainer.scrollTop = messagesContainer.scrollHeight;
			} catch (err) {
				console.error("Error while parsing incoming message: ", err);
			}
		});

		socket.addEventListener("error", (err) => {
			console.log(err);
			connectionButton.setAttribute("aria-busy", "false");
			connectionButton.textContent = "error";
			connectionButton.classList.add("secondary");
			connectionButton.setAttribute("disabled", "");
		});
	}
}

// Interval to check and replace timestamp every minute
setInterval(() => {
	const messages = document.getElementById("messages-container").children;

	for (const message of messages) {
		if (message.id !== "disclaimer") {
			const timeStamp = message.getElementsByTagName("time")[0];
			timeStamp.textContent = timeAgo(
				new Date(timeStamp.getAttribute("datetime")),
			);
		}
	}
}, 60000);

connectionButton.addEventListener("click", openConnection);
