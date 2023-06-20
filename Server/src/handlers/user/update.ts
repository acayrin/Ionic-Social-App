import { ObjectId } from "mongodb";
import { userGetHandler } from ".";
import { User, UserUpdateOptions } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<User>("Users");

const handler: RequestHandler<UserUpdateOptions> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	if (d?.password) {
		const userObj = await Col.findOne({ _id: new ObjectId(user) });
		if (userObj?.password !== d.password) {
			return {
				status: "not ok",
				error: "Password mismatched",
			};
		}
	}

	const result = await Col.updateOne(
		{
			_id: new ObjectId(user),
		},
		{
			$set: d,
		}
	);

	// prettier-ignore
	return result.modifiedCount > 0 ? await userGetHandler({ user }) : {
        status: "not ok",
        error: "Failed to update profile"
    };
};

export { handler as userUpdateHandler };
