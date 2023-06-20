import { ObjectId } from "mongodb";
import { Post } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Post>("Posts");

const handler: RequestHandler<{ postId: string; userId: string; emoji?: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };
    
	if (!d!.postId || !user) {
		return {
			status: "not ok",
			error: "Invalid request",
		};
	}

	const result = await Col.updateOne(
		{
			_id: new ObjectId(d!.postId),
		},
		{
			$push: {
				reactions: {
					userId: d!.userId ?? user,
					emoji: d!.emoji ?? "👍",
				},
			},
		}
	);

	const post = await Col.findOne({
		_id: new ObjectId(d!.postId),
	});

	// prettier-ignore
	return result.modifiedCount > 0 ? {
		status: "ok",
        reactions: post?.reactions ?? []
	} : {
		status: "not ok",
		error: "Failed to add reaction",
	};
};

export { handler as postReactionAddHandler };
