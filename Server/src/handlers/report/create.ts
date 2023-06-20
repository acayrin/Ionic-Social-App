import { Report } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const Col = Db.collection<Report>("Reports");

const handler: RequestHandler<{ contentId: string; reason: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const result = await Col.insertOne({
		contentId: d!.contentId,
		reason: d!.reason,
		reporterId: user,
		status: "checking",
		timestamp: Date.now(),
	});

	return result.insertedId
		? {
				status: "ok",
				report: result.insertedId,
		  }
		: {
				status: "not ok",
				error: "Failed to create report",
		  };
};

export { handler as reportCreateHandler };
