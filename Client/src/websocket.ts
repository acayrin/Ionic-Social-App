import { RequestData, RequestSubData, REQUEST_TYPE } from "./types";

export class WebSocketClient {
	static #ws?: WebSocket;

	static get = () => {
		if (this.#ws) {
			return this.#ws;
		}

		this.#ws = new WebSocket("ws://127.0.0.1:3000");

		this.#ws.onerror = (err) => {
			console.error(err);
			console.info("[ws] Encoutered an error. Retrying after 5 seconds...");

			this.#ws = undefined;

			setTimeout(() => this.get(), 1e3);
		};

		this.#ws.onclose = () => {
			this.#ws = undefined;
			console.info("[ws] Disconnected. Retrying after 5 seconds...");

			this.#ws = undefined;

			setTimeout(() => this.get(), 1e3);
		};

		this.#ws.onopen = () => {
			console.info(`[ws] Connected to ${this.#ws!!.url}`);

			this.#ws!!.onmessage = ({ data }) => {
				const z = JSON.parse(data) as RequestData;
				const res = new RequestData(z.r, z.d);

				console.info("[ws]", res.d.error);
			};
		};

		return this.#ws;
	};

	static send = (reqType: keyof typeof REQUEST_TYPE, data: { [key: string]: unknown }) => {
		this.get().send(new RequestData(REQUEST_TYPE[reqType], data).toString());
	};

	/**
	 * Append a socket listener for given request type
	 *
	 * @name listen
	 * @static
	 * @param {keyof typeof REQUEST_TYPE} reqType
	 * @param {(d: RequestSubData) => unknown} cb
	 * @returns {void}
	 */
	static listen = <T = RequestSubData>(reqType: keyof typeof REQUEST_TYPE, cb: (d: T) => unknown): void => {
		const listener = ({ data }: MessageEvent): void => {
			const { d, r } = JSON.parse(data) as RequestData;

			if (r === REQUEST_TYPE[reqType]) {
				cb(d as T);
			}
		};

		this.get().addEventListener("message", listener);
	};

	/**
	 * Append a one-of socket listener for given request type, with timeout if defined
	 *
	 * @name listenOnce
	 * @static
	 * @param {keyof typeof REQUEST_TYPE} reqType
	 * @param {(d: RequestSubData) => unknown} cb
	 * @param {number} timeout?
	 * @returns {void}
	 */
	static listenOnce = <T = RequestSubData>(
		reqType: keyof typeof REQUEST_TYPE,
		cb: (d: T) => unknown,
		timeout: number = 60
	): void => {
		const listener = ({ data }: MessageEvent): void => {
			const { d, r } = JSON.parse(data) as RequestData;

			if (r === REQUEST_TYPE[reqType]) {
				cb(d as T);

				return this.get().removeEventListener("message", listener);
			}

			setTimeout(() => this.get().removeEventListener("message", listener), timeout);
		};

		this.get().addEventListener("message", listener);
	};
}
