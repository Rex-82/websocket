import { WebSocketServer } from "ws";
import path from "node:path";
import express from "express";
const app = express();

app.use("/", express.static(path.resolve(import.meta.dirname, "../client")));

const expressServer = app.listen(9876); // regular http server using node express which serves your webpage

const wsServer = new WebSocketServer({
	port: 8080,
}); // a websocket server

wsServer.on("connection", (ws) => {
	// what should a websocket do on connection
	ws.on("message", (msg) => {
		// what to do on message event
		for (const client of wsServer.clients) {
			client.send(msg.toString());
		}
	});
});

expressServer.on("upgrade", async function upgrade(request, socket, head) {
	//handling upgrade(http to websocekt) event

	// accepts half requests and rejects half. Reload browser page in case of rejection

	if (Math.random() > 0.5) {
		return socket.end("HTTP/1.1 401 Unauthorized\r\n", "ascii"); //proper connection close in case of rejection
	}

	//emit connection when request accepted
	wsServer.handleUpgrade(request, socket, head, function done(ws) {
		wsServer.emit("connection", ws, request);
	});
});
