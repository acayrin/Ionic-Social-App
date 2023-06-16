export class RequestData {
	r: number;
	d: RequestSubData;

	toString = () => JSON.stringify({ r: this.r, d: this.d });

	constructor(r: number, d: RequestSubData) {
		this.r = r;
		this.d = d;
	}
}

export type RequestSubData = {
	status?: "ok" | "not ok";
	error?: string;
	[key: string]: unknown;
};
