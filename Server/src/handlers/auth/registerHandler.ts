import { createHash } from "crypto";
import { Db } from "../../modules/database";
import { RequestData } from "../../types";
import { User } from "../../types/User";
import { RequestHandler } from "../../types/_RequestHandler";
import { REQUEST_TYPE } from "../../types/_RequestType";

const Col = Db.collection("Users");

export const registerHandler: RequestHandler<{ username: string; password: string }> = async (data, ws) => {
	const existingUser = await Col.findOne<User>({
		username: data.username,
	});

	if (existingUser) {
		return ws.send(
			new RequestData(REQUEST_TYPE.AUTH_REGISTER, {
				status: "not ok",
				error: "Username taken",
			}).toString()
		);
	}

	const result = await Col.insertOne({
		_metadata: {
			views: 0,
		},
		_role: "user",
		timestamp: Date.now(),
		username: data.username,
		password: createHash("sha256")
			.update(process.env.AUTH_SEED + data.password)
			.digest("hex"),
	} as User);

	if (result.insertedId) {
		ws.send(
			// TODO: generate token
			new RequestData(REQUEST_TYPE.AUTH_REGISTER, {
				status: "ok",
				token: "TEST",
			}).toString()
		);
	} else {
		ws.send(
			new RequestData(REQUEST_TYPE.AUTH_REGISTER, {
				status: "not ok",
				error: "Failed to register account",
			}).toString()
		);
	}
};
