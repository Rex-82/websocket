// WebSocket client

const openConnButton = document.createElement("button");
const closeConnButton = document.createElement("button");
const sendButton = document.createElement("button");

openConnButton.textContent = "open connection";
document.body.appendChild(openConnButton);

closeConnButton.textContent = "close connection";
document.body.appendChild(closeConnButton);

sendButton.textContent = "send 'hello world'";
document.body.appendChild(sendButton);

let socketOpen = false;
let hasEvents = false;
openConnButton.addEventListener("click", () => {
	if (!socketOpen) {
		const endpoint = "ws://127.0.0.1:8080";

		const socket = new WebSocket(endpoint);

		socket.addEventListener("open", (event) => {
			socketOpen = true;
			console.log("connection opened");
			if (!hasEvents) {
				hasEvents = true;
				function sendMessage() {
					console.log(socket);
					socket.send("hello world!");
				}

				function closeConnection() {
					socket.close();
					if (socket.CLOSED) {
						console.log("connection closed");
						sendButton.removeEventListener("click", sendMessage);
						closeConnButton.removeEventListener("click", closeConnection);
						hasEvents = false;
						socketOpen = false;
					} else {
						console.log("connection not closed");
					}
				}

				sendButton.addEventListener("click", sendMessage);
				closeConnButton.addEventListener("click", closeConnection);
			}
		});

		socket.addEventListener("message", (event) => {
			console.log(event);
		});
	}
});
