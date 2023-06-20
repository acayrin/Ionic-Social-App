import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import { RequestHandler } from "../../../../shared/types/index";
import { User } from "../../../../shared/types/User";
import { Db } from "../../modules/database/index";

const Col = Db.collection<User>("Users");

const handler: RequestHandler = async ({ user }) => {
	if (!user)
		return {
			status: "not ok",
			error: "Unauthorized",
		};

	const existingUser = await Col.findOne(
		{
			_id: new ObjectId(user),
		},
		{
			projection: {
				password: 0,
				_metadata: 0,
			},
		}
	);

	// prettier-ignore
	return existingUser ? {
		status: "ok",
		user: existingUser,
		token: jwt.sign(
			{
				whoami: existingUser._id.toString(),
			},
			process.env.AUTH_TOKEN!,
			{ expiresIn: "3d" }
		),
	} : {
		status: "not ok",
		error: "Invalid user",
	};
};

export { handler as renewHandler };
