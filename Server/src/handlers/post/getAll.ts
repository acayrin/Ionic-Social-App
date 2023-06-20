import { ObjectId } from "mongodb";
import { Post, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";
import { getReferencesOfPost } from "./_func";

const ColP = Db.collection<Post>("Posts");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler<{ userId: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const userPosts = await ColP.find({
		ownerId: d?.userId ?? user,
	}).toArray();
	const viewablePosts: Post[] = [...userPosts];

	// if fetching posts of another user
	if (d?.userId && d.userId !== user) {
		const owner = await ColU.findOne({ _id: new ObjectId(d.userId) });

		viewablePosts.length = 0;
		viewablePosts.push(
			...userPosts.filter((post) => {
				if (
					post._type === "reference" ||
					post.visibility === "self" || // visibility is self, ignore
					(post.visibility === "follower" && owner?.followers?.indexOf(user) === -1) // visibility is friends and not friended with owner, ignore
				) {
					return false;
				}

				return true;
			})
		);
	}

	const posts = await Promise.all(
		viewablePosts.map(async (post) => {
			const _references = await getReferencesOfPost(post._id!.toString());

			return Object.assign(post, { _references }) as Post;
		})
	);
	return {
		status: "ok",
		posts,
	};
};

export { handler as postGetAllHandler };
