import "colors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { ServerOptions, WebSocketServer } from "ws";
import AppConfig from "../../shared/config";
import { RequestData, RequestHandler } from "../../shared/types/index";
import { REQUEST_TYPE } from "../../shared/types/_RequestType";
import {
	attachmentCreateHandler,
	attachmentDeleteHandler,
	attachmentGetHandler,
	loginHandler,
	postCreateHandler,
	postDeleteHandler,
	postGetAllHandler,
	postGetHandler,
	postGetTimelineHandler,
	postReactionAddHandler,
	postReactionRemoveHandler,
	postUpdateHandler,
	registerHandler,
	renewHandler,
	reportDeleteHandler,
	reportGetAllHandler,
	reportGetHandler,
	reportUpdateHandler,
	userFollowerAddHandler,
	userFollowerRemoveHandler,
	userGetAnyHandler,
	userGetHandler,
	userUpdateHandler,
} from "./handlers";
import { reportCreateHandler } from "./handlers/report/create";
dotenv.config();

class Logger {
	static #base = [new Date().toISOString().gray];
	static #stdout = (...msg: string[]) => process?.stdout?.write(`${msg.join(" ")}\n`) ?? console.log(msg.join(" "));

	static info(...msg: string[]) {
		this.#stdout([...this.#base, ...msg].join(" "));
	}

	static warn(...msg: string[]) {
		this.#stdout([...this.#base, ...msg].join(" ").yellow);
	}

	static error(...msg: string[]) {
		this.#stdout([...this.#base, ...msg].join(" ").red);
	}
}

new (class AssSocketServer {
	#opt: ServerOptions;
	#wss: WebSocketServer;

	constructor(o: ServerOptions) {
		this.#opt = o;
		this.#wss = new WebSocketServer(o);

		this.#wss.once("listening", () => Logger.info(`[WSS] Started on ${process.env.PORT ?? 3000}`.green));
		this.#wss.on("error", console.error);
		this.#wss.on("connection", (ws, req) => {
			Logger.info("[+]".green, req.socket.remoteAddress ?? "unknown");

			ws.on("close", () => Logger.info("[-]".red, req.socket.remoteAddress ?? "unknown"));
			ws.on("message", (msg) => {
				// try to read given data
				let data: RequestData<any>;
				try {
					data = AppConfig._deserialize(msg.toString("utf-8")) as RequestData;
				} catch {
					return new RequestData(REQUEST_TYPE.ERROR, {
						status: "not ok",
						error: "Invalid request",
					}).send(ws);
				}
				const { r, d, t, i } = data!;

				// try to validate user
				let user: string | undefined;
				try {
					user = (jwt.verify(t!, process.env.AUTH_TOKEN!) as { whoami: string }).whoami;
				} catch (e) {
					// ignored
				}

				Logger.info(
					"[?]",
					req.socket.remoteAddress?.padEnd(15, " ") ?? "unknown".padEnd(15, " "),
					r?.toString().padEnd(5, " "),
					user?.slice(0, 8) ?? "".padEnd(8, " "),
					d && JSON.stringify(d).slice(0, 40).padEnd(43, ".")
				);

				let task: RequestHandler<any, unknown> | undefined = undefined;
				switch (r) {
					// Auth
					case REQUEST_TYPE.AUTH_LOGIN: {
						task = loginHandler;
						break;
					}
					case REQUEST_TYPE.AUTH_REGISTER: {
						task = registerHandler;
						break;
					}
					case REQUEST_TYPE.AUTH_RENEW: {
						task = renewHandler;
						break;
					}
					// Posts
					case REQUEST_TYPE.USER_POST_CREATE: {
						task = postCreateHandler;
						break;
					}
					case REQUEST_TYPE.USER_POST_GET: {
						task = postGetHandler;
						break;
					}
					case REQUEST_TYPE.USER_POST_DELETE: {
						task = postDeleteHandler;
						break;
					}
					case REQUEST_TYPE.USER_POST_UPDATE: {
						task = postUpdateHandler;
						break;
					}
					case REQUEST_TYPE.USER_POST_GET_ALL: {
						task = postGetAllHandler;
						break;
					}
					case REQUEST_TYPE.USER_POST_GET_TIMELINE: {
						task = postGetTimelineHandler;
						break;
					}
					// Reactions
					case REQUEST_TYPE.USER_REACTION_ADD: {
						task = postReactionAddHandler;
						break;
					}
					case REQUEST_TYPE.USER_REACTIOM_REMOVE: {
						task = postReactionRemoveHandler;
						break;
					}
					// Attachments
					case REQUEST_TYPE.USER_ATTACHMENT_ADD: {
						task = attachmentCreateHandler;
						break;
					}
					case REQUEST_TYPE.USER_ATTACHMENT_GET: {
						task = attachmentGetHandler;
						break;
					}
					case REQUEST_TYPE.USER_ATTACHMENT_REMOVE: {
						task = attachmentDeleteHandler;
						break;
					}
					// Profile
					case REQUEST_TYPE.USER_PROFILE_GET_ANY: {
						task = userGetAnyHandler;
						break;
					}
					case REQUEST_TYPE.USER_PROFILE_GET: {
						task = userGetHandler;
						break;
					}
					case REQUEST_TYPE.USER_PROFILE_FOLLOWER_ADD: {
						task = userFollowerAddHandler;
						break;
					}
					case REQUEST_TYPE.USER_PROFILE_FOLLOWER_REMOVE: {
						task = userFollowerRemoveHandler;
						break;
					}
					case REQUEST_TYPE.USER_PROFILE_SETTINGS_UPDATE: {
						task = userUpdateHandler;
						break;
					}
					// Reports
					case REQUEST_TYPE.USER_REPORTS_ADD: {
						task = reportCreateHandler;
						break;
					}
					case REQUEST_TYPE.USER_REPORTS_UPDATE: {
						task = reportUpdateHandler;
						break;
					}
					case REQUEST_TYPE.USER_REPORTS_REMOVE: {
						task = reportDeleteHandler;
						break;
					}
					case REQUEST_TYPE.USER_REPORTS_GET: {
						task = reportGetHandler;
						break;
					}
					case REQUEST_TYPE.USER_REPORTS_GET_ALL: {
						task = reportGetAllHandler;
						break;
					}
				}
				if (task) {
					const result = task({ d, user });

					if (result instanceof Promise) {
						result
							.then((data) => {
								new RequestData(r, data, i).send(ws);
							})
							.catch((e) => {
								console.error(e);
								new RequestData(
									r,
									{
										status: "not ok",
										error: (e as Error).message,
									},
									i
								).send(ws);
							});
					} else {
						new RequestData(r, result, i).send(ws);
					}
				}
			});
		});
	}
})({
	host: "127.0.0.1",
	port: Number(process.env.PORT ?? 3000),
	clientTracking: true,
	perMessageDeflate: false,
});
