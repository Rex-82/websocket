import { WebSocketServer } from "ws";

import path from "node:path";
import express from "express";
const app = express();

app.use("/", express.static(path.resolve(import.meta.dirname, "./client")));

const expressServer = app.listen(8080); // regular http server using node express which serves your webpage

expressServer.on("upgrade", async function upgrade(request, socket, head) {
	//handling upgrade(http to websocekt) event

	//emit connection when request accepted
	wsServer.handleUpgrade(request, socket, head, function done(ws) {
		wsServer.emit("connection", ws, request);
	});
});

// TODO: keep messages history

// TODO: Send history to new connecting user

// TODO: Handle custom sessions(?)

const wsServer = new WebSocketServer({
	port: 9898,
}); // a websocket server

wsServer.on("connection", (ws) => {
	// what should a websocket do on connection
	ws.on("message", (msg) => {
		// what to do on message event
		for (const client of wsServer.clients) {
			console.log(msg);
			client.send(msg.toString());
		}
	});
});
