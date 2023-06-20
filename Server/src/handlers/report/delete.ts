import { ObjectId } from "mongodb";
import { Report, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const ColR = Db.collection<Report>("Reports");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler<{ reportId: string }> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const userObj = await ColU.findOne({
		_id: new ObjectId(user),
	});

	if (userObj?._role === "user") {
		const result = await ColR.findOne({
			_id: new ObjectId(d!.reportId),
		});

		if (result?.reporterId !== user) {
			return {
				status: "not ok",
				error: "Unauthorized",
			};
		}
	}

	const deleted = await ColR.deleteOne({
		_id: new ObjectId(d!.reportId),
	});

	return deleted.deletedCount > 0
		? {
				status: "ok",
				count: deleted.deletedCount,
		  }
		: {
				status: "not ok",
				error: "Failed to delete report",
		  };
};

export { handler as reportDeleteHandler };
