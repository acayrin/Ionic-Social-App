import { createHash } from "crypto";
import jwt from "jsonwebtoken";
import { userGetHandler } from "..";
import { RequestHandler } from "../../../../shared/types/index";
import { User } from "../../../../shared/types/User";
import { Db } from "../../modules/database/index";

const Col = Db.collection<User>("Users");

const handler: RequestHandler<{ username: string; password: string }> = async ({ d }) => {
	const existingUser = await Col.findOne({
		username: d!.username,
	});

	// check for password
	if (
		!existingUser ||
		existingUser.password !==
			createHash("sha256")
				.update(process.env.AUTH_SEED! + d!.password)
				.digest("hex")
	) {
		return {
			status: "not ok",
			error: "Invalid username or password",
		};
	}

	return {
		status: "ok",
		user: await userGetHandler({ user: existingUser._id.toString() }),
		token: jwt.sign(
			{
				whoami: existingUser._id.toString(),
			},
			process.env.AUTH_TOKEN!,
			{ expiresIn: "3d" }
		),
	};
};

export { handler as loginHandler };
