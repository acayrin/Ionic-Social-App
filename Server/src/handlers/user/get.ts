import { ObjectId } from "mongodb";
import { Post, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const ColP = Db.collection<Post>("Posts");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler<{ userId: string }> = async ({ d, user }) => {
	const id = d?.userId ?? user;

	try {
		const user = await ColU.findOne(
			{
				_id: new ObjectId(id),
			},
			{
				projection: {
					_metadata: 0,
					password: 0,
				},
			}
		);
		const posts = await ColP.find({
			ownerId: id,
		}).toArray();

		return {
			status: "ok",
			user: user
				? Object.assign(user, {
						postCount: posts.length,
				  })
				: null,
		};
	} catch {
		return {
			status: "not ok",
			error: "Invalid argument",
		};
	}
};

export { handler as userGetHandler };
