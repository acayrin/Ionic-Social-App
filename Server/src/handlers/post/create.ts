import { Post } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Post>("Posts");

const handler: RequestHandler<Post> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const post = Object.assign({ ownerId: user }, d as Post);
	const result = await Col.insertOne(post);

	// prettier-ignore
	return result.insertedId ? {
		status: "ok",
		post,
	} : {
		status: "not ok",
		error: "Failed to create post",
	};
};

export { handler as postCreateHandler };
