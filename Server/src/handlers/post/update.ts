import { ObjectId } from "mongodb";
import { Post } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Post>("Posts");

const handler: RequestHandler<Post> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	if (d!.ownerId !== user) {
		return {
			status: "not ok",
			error: "Unauthorized",
		};
	}

	const post = d as Post;
	const postId = d?._id?.toString();
	delete post._id;

	const result = await Col.updateOne(
		{
			_id: new ObjectId(postId),
		},
		{
			$set: post,
		}
	);

	// prettier-ignore
	return result.modifiedCount > 0 ? {
		status: "ok",
		post: Object.assign({ _id: postId }, post),
	} : {
		status: "not ok",
		error: "Failed to update post",
	};
};

export { handler as postUpdateHandler };
