import { ObjectId } from "mongodb";
import { Attachment } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Attachment>("Attachments");

const handler: RequestHandler<{
	attachments: string[];
}> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const attachments = await Col.find({
		_id: {
			$in: d!.attachments.map((atm) => new ObjectId(atm)),
		},
	}).toArray();

	return {
		status: "ok",
		attachments,
	};
};

export { handler as attachmentGetHandler };
