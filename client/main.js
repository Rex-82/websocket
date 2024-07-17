// WebSocket client

const endpoint = "ws://127.0.0.1:32885";
const socket = new WebSocket(endpoint);

socket.send("hello world!");
socket.close();
