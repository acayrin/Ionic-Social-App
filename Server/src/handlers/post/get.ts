import { ObjectId } from "mongodb";
import { Post, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";
import { getReferencesOfPost } from "./_func";

const ColP = Db.collection<Post>("Posts");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler<{ postId: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const post = await ColP.findOne({
		_id: new ObjectId(d!.postId),
	});

	// post reference count
	if (post) {
		post._references = await getReferencesOfPost(d!.postId);
	}

	// post visibility is "self"
	if (post?._type === "standalone" && post.ownerId !== user) {
		if (post?.visibility === "self") {
			return {
				status: "not ok",
				error: "Post is hidden by user",
			};
		}

		// post visibility is "friends"
		if (post?.visibility === "follower") {
			const owner = await ColU.findOne({ _id: new ObjectId(post.ownerId) });

			if (owner?.followers?.indexOf(user) === -1) {
				return {
					status: "not ok",
					error: "Post is hidden by user",
				};
			}
		}
	}

	// default post visibility is "all"
	return {
		status: "ok",
		post,
	};
};

export { handler as postGetHandler };
