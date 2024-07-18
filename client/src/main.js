// WebSocket client

import { timeAgo } from "./timeAgo.js";

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
		const userId = Math.ceil(Math.random() * 100);

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
						const message = {
							user: userId,
							timeStamp: new Date(),
							message: messageInputArea.value.trim(),
						};

						socket.send(JSON.stringify(message));
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
				user.textContent = `from ${messageContent.user}`;
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
			} catch (err) {
				console.error("Error while parsing incoming message: ", err);
			}
		});
	}
}

setInterval(() => {
	const messages = document.getElementById("messages-container").children;

	for (const message of messages) {
		const timeStamp = message.getElementsByTagName("time")[0];
		timeStamp.textContent = timeAgo(
			new Date(timeStamp.getAttribute("datetime")),
		);
	}
}, 5000);

connectionButton.addEventListener("click", openConnection);
