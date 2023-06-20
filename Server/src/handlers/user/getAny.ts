import { ObjectId } from "mongodb";
import { Post, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const ColP = Db.collection<Post>("Posts");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler = async ({ user }) => {
	const following = (
		await ColU.findOne({
			_id: new ObjectId(user),
		})
	)?.following;

	const users = await ColU.aggregate([{ $sample: { size: 20 } }])
		.project({
			_role: 0,
			_metadata: 0,
			password: 0,
			emailAddress: 0,
		})
		.toArray();

	const usersWithPosts = await Promise.all(
		users.map(async (user) => {
			const posts = await ColP.find({
				ownerId: user._id.toString(),
			}).toArray();

			return Object.assign(user, { postCount: posts.length }) as User;
		})
	);

	return {
		status: "ok",
		users: usersWithPosts.filter(
			(uwp) => uwp._id!.toString() !== user && !following?.includes(uwp._id!.toString())
		),
	};
};

export { handler as userGetAnyHandler };
