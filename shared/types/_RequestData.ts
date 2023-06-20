import { WebSocket as WS } from "ws";
import AppConfig from "../config";

export class RequestData<T = RequestSubData> {
	/**
	 * request type
	 *
	 * @name r
	 */
	r: number;
	/**
	 * data to send
	 *
	 * @name d
	 */
	d: T;
	/**
	 * user token
	 *
	 * @name t
	 */
	t?: string;
	/**
	 * request identifier
	 *
	 * @name i
	 */
	i?: number;

	toString = () =>
		AppConfig._serialize({
			r: this.r,
			d: this.d,
			t: this.t,
			i: this.i,
		});

	send = (ws: WS | WebSocket) =>
		ws.send(
			AppConfig._serialize({
				r: this.r,
				d: this.d,
				t: this.t,
				i: this.i,
			})
		);

	constructor(r: number, d: T, i?: number, t?: string) {
		this.r = r;
		this.d = d;
		this.i = i;
		this.t = t;
	}
}

export type RequestSubData = {
	status?: "ok" | "not ok";
	error?: string;
	[key: string]: any;
};
