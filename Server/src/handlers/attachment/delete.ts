import { ObjectId } from "mongodb";
import { Attachment } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Attachment>("Attachments");

const handler: RequestHandler<{
	attachments: string[];
}> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };
    

	const attachments = await Col.deleteMany({
		_id: {
			$in: d!.attachments.map((atm) => new ObjectId(atm)),
		},
	});

	if (attachments.deletedCount === d!.attachments.length) {
		return {
			status: "ok",
		};
	} else if (attachments.deletedCount > 0) {
		return {
			status: "ok",
			message: "Incorrect deletion count, proceeded anyway",
		};
	} else {
		return {
			status: "not ok",
			error: "Failed to remove attachment",
		};
	}
};

export { handler as attachmentDeleteHandler };
