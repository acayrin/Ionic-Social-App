import { ObjectId } from "mongodb";
import { Post, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";
import { getReferencesOfPost } from "./_func";

const ColP = Db.collection<Post>("Posts");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler = async ({ user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const userObj = await ColU.findOne({ _id: new ObjectId(user) });
	const userPosts = await ColP.find({
		ownerId: user,
	}).toArray();
	const viewablePosts: Post[] = [...userPosts];

	if (userObj?.following) {
		await Promise.all(
			userObj.following.map(async (followingUser) => {
				const followingUserPost = await ColP.find({
					ownerId: followingUser,
				}).toArray();
				const followingUserObj = await ColU.findOne({
					_id: new ObjectId(followingUser),
				});

				viewablePosts.push(
					...followingUserPost.filter((post) => {
						if (
							post._type === "reference" ||
							post.visibility === "self" || // visibility is self, ignore
							(post.visibility === "follower" && followingUserObj?.followers?.indexOf(user) === -1) // visibility is friends and not friended with owner, ignore
						) {
							return false;
						}

						return true;
					})
				);
			})
		);
	}

	const posts = await Promise.all(
		viewablePosts.map(async (post) => {
			const _references = await getReferencesOfPost(post._id!.toString());

			return Object.assign(post, { _references }) as Post;
		})
	);
    posts.sort((p1, p2) => p1.timestamp - p2.timestamp);
    
	return {
		status: "ok",
		posts,
	};
};

export { handler as postGetTimelineHandler };
