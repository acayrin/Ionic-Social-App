import { ObjectId } from "mongodb";
import { Post } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";
import { getReferencesOfPost } from "./_func";

const Col = Db.collection<Post>("Posts");

const handler: RequestHandler<{ postId: string }> = async ({ d, user }) => {
	const foundPost = await Col.findOne({
		_id: new ObjectId(d!.postId),
	});

	if (!user || !foundPost || foundPost.ownerId !== user) {
		return {
			status: "not ok",
			error: "Unauthorized",
		};
	}

	const deletePost = await Col.deleteOne({
		_id: new ObjectId(d!.postId),
	});

	if (deletePost.deletedCount > 0) {
		let deleteReferencedPosts = 0;
		for (const post of await getReferencesOfPost(d!.postId)) {
			deleteReferencedPosts += (
				await Col.deleteOne({
					_id: post._id,
				})
			).deletedCount;
		}

		return {
			status: "ok",
			count: {
				posts: deletePost.deletedCount,
				references: deleteReferencedPosts,
			},
		};
	}

	return {
		status: "not ok",
		error: "Failed to delete",
	};
};

export { handler as postDeleteHandler };
