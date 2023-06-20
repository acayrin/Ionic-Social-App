import { ObjectId } from "mongodb";
import { userGetHandler } from "./index";
import { User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<User>("Users");

const handler: RequestHandler<{ userId: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const resultTargetUser = await Col.updateOne(
		{
			_id: new ObjectId(d!.userId),
		},
		{
			$push: {
				followers: user,
			},
		}
	);
	const resultCurrentUser = await Col.updateOne(
		{
			_id: new ObjectId(user),
		},
		{
			$push: {
				following: d!.userId,
			},
		}
	);

	// TODO: scuff, should revert if needed

	return resultTargetUser.modifiedCount > 0 && resultCurrentUser.modifiedCount > 0
		? await userGetHandler({ user: d!.userId })
		: {
				status: "not ok",
				error: "Failed to add follow entry",
		  };
};

export { handler as userFollowerAddHandler };
