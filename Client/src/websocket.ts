import AppConfig from "../../shared/config";
import { RequestData, RequestSubData, REQUEST_TYPE } from "../../shared/types";

export class WebSocketClient {
	static #isReady = false;
	static #ws?: WebSocket;

	static get = async () => {
		if (this.#ws) {
			while (!this.#isReady) {
				console.info(`Waiting 500ms for connection to be ready`);
				await new Promise((res) => setTimeout(res, 500));
			}
			return this.#ws;
		}

		this.#ws = new WebSocket("wss://ionic-server-production.up.railway.app");

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
			this.#isReady = true;

			console.info(`[ws] Connected to ${this.#ws!!.url}`);

			this.#ws!!.onmessage = ({ data }) => {
				const z = AppConfig._deserialize(data) as RequestData;
				const res = new RequestData(z.r, z.d, 0);

				console.info("[ws]", res.d.error ?? res.d.status);
			};
		};

		return this.#ws;
	};

	/**
	 * Send data with given request type
	 *
	 * @name send
	 * @static
	 * @returns {void}
	 */
	static send = (o: {
		request: keyof typeof REQUEST_TYPE;
		data: { [key: string]: unknown };
		user?: string;
	}): void => {
		const { request, data, user } = o;

		this.get().then((ws) => ws.send(new RequestData(REQUEST_TYPE[request], data, 0, user).toString()));
	};

	/**
	 * Append a socket listener for given request type
	 *
	 * @name listen
	 * @static
	 * @returns {void}
	 */
	static listen = <T = RequestSubData>(o: {
		request: keyof typeof REQUEST_TYPE;
		callback: (d: T) => unknown;
	}): void => {
		const { request, callback } = o;

		const listener = ({ data }: MessageEvent): void => {
			const { d, r } = AppConfig._deserialize(data) as RequestData;

			if (r === REQUEST_TYPE[request]) {
				callback(d as T);
			}
		};

		this.get().then((ws) => ws.addEventListener("message", listener));
	};

	/**
	 * Append a one-of socket listener for given request type, with timeout if defined
	 *
	 * @name listenOnce
	 * @static
	 * @returns {void}
	 */
	static listenOnce = <T = RequestSubData>(o: {
		request: keyof typeof REQUEST_TYPE;
		callback: (d: T) => unknown;
		identifier: number;
		timeout?: number;
	}): void => {
		const { request, callback, timeout, identifier } = o;

		const listener = ({ data }: MessageEvent): void => {
			const { d, r, i } = AppConfig._deserialize(data) as RequestData;

			if (!(r === REQUEST_TYPE[request] && identifier === i)) {
				return;
			}

			callback(d as T);

			this.get().then((ws) => ws.removeEventListener("message", listener));
		};

		setTimeout(() => this.get().then((ws) => ws.removeEventListener("message", listener)), timeout ?? 60e3);

		this.get().then((ws) => ws.addEventListener("message", listener));
	};

	/**
	 * Send data and listen for response of given request type once as a promise
	 *
	 * @name sendAndListenPromise
	 * @static
	 */
	static sendAndListenPromise = <T = RequestSubData, Y = { [key: string]: unknown }>(o: {
		request: keyof typeof REQUEST_TYPE;
		data: Y;
		token?: string;
		timeout?: number;
	}): Promise<T> =>
		new Promise((resolve, reject) => {
			const { data, token, request, timeout } = o;
			const identifier = Math.random() * Date.now();

			const listener = ({ data }: MessageEvent): void => {
				const { d, r, i } = AppConfig._deserialize(data) as RequestData;

				if (r === REQUEST_TYPE[request] && i === identifier) {
					this.get().then((ws) => ws.removeEventListener("message", listener));

					return resolve(d as T);
				}
			};

			setTimeout(() => {
				this.get().then((ws) => ws.removeEventListener("message", listener));

				reject("Timedout");
			}, timeout ?? 60e3);

			this.get().then((ws) => {
				ws.addEventListener("message", listener);
				ws.send(new RequestData(REQUEST_TYPE[request], data, identifier, token).toString());
			});
		});
}
