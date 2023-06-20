import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { userGetHandler } from "..";
import { User } from "../../../../shared/types/User";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<User>("Users");

const handler: RequestHandler<{ username: string; password: string }> = async ({ d }) => {
	const existingUser = await Col.findOne({
		username: d!.username,
	});

	if (existingUser) {
		return {
			status: "not ok",
			error: "Username taken",
		};
	}

	const result = await Col.insertOne({
		_metadata: {
			views: 0,
		},
		_role: "user",
		timestamp: Date.now(),
		username: d!.username,
		password: createHash("sha256")
			.update(process.env.AUTH_SEED! + d!.password)
			.digest("hex"),
	});
	const user = (await userGetHandler({ user: result.insertedId.toString() })) as User;

	// prettier-ignore
	return result.insertedId ? {
		status: "ok",
		user,
		token: jwt.sign(
			{
				whoami: result.insertedId.toString(),
			},
			process.env.AUTH_TOKEN!,
			{ expiresIn: "3d" }
		),
	} : {
		status: "not ok",
		error: "Failed to register account",
	};
};

export { handler as registerHandler };
