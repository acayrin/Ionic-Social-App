import { Db } from "../../modules/database";
import { RequestHandler, RequestData, REQUEST_TYPE } from "../../types";
import { User } from "../../types/User";
import { createHash } from "crypto";

const Col = Db.collection("Users");

export const loginHandler: RequestHandler<{ username: string; password: string }> = async (data, ws) => {
	const existingUser = await Col.findOne<User>({
		username: data.username,
	});

	// check for password
	if (
		!existingUser ||
		existingUser.password !==
			createHash("sha256")
				.update(process.env.AUTH_SEED + data.password)
				.digest("hex")
	) {
		return ws.send(
			new RequestData(REQUEST_TYPE.AUTH_LOGIN, {
				status: "not ok",
				error: "Invalid username or password",
			}).toString()
		);
	}

	// TODO: generate token
	ws.send(
		new RequestData(REQUEST_TYPE.AUTH_LOGIN, {
			status: "ok",
			token: "TEST",
		}).toString()
	);
};
