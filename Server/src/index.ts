import { WebSocketServer } from "ws";
import { loginHandler } from "./handlers/auth/loginHandler";
import { registerHandler } from "./handlers/auth/registerHandler"
import { RequestMessage } from "./types/_RequestMessage";
import { REQUEST_TYPE } from "./types/_RequestType";
import dotenv from "dotenv";
dotenv.config();

const wss = new WebSocketServer({
	host: "127.0.0.1",
	port: 3000,
});

wss.once("listening", () => {
	process.stdout.write(`started on ${process.env.PORT ?? 3000}\n`);
});
wss.on("error", console.error);
wss.on("connection", (ws) => {
	process.stdout.write(`${ws.url ?? "Unknown"} connected\n`);

	ws.on("message", (msg) => {
		try {
			const { r, d } = JSON.parse((msg as Buffer).toString()) as RequestMessage;

			switch (r) {
				case REQUEST_TYPE.AUTH_LOGIN: {
					loginHandler(d, ws);
					break;
				}
				case REQUEST_TYPE.AUTH_REGISTER: {
					registerHandler(d, ws);
					break;
				}
			}
		} catch {
			ws.send(
				JSON.stringify({
					r: 1,
					d: {
						status: 1,
						error: "Invalid request",
					},
				})
			);
		}
	});
});
