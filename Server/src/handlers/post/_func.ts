import { Post } from "../../../../shared/types";
import { Db } from "../../modules/database";

const Col = Db.collection<Post>("Posts");

const get = async (postId: string) => {
	return await Col.find({
		referenceId: postId,
	}).toArray();
};
export const getReferencesOfPost = async (postId: string) => {
	const fetch = await get(postId);

	const posts: Post[] = fetch;
	for (const post of fetch) {
		posts.push(...(await get(post._id.toString())));
	}

	return posts;
};
