import { ObjectId } from "mongodb";
import { Report, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const ColR = Db.collection<Report>("Reports");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler<Report> = async ({ d, user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const userObj = await ColU.findOne({
		_id: new ObjectId(user),
	});

	if (userObj?._role === "user")
		return {
			status: "not ok",
			error: "Unauthorized",
		};

	const report = d as Report;
	const reportId = d?._id?.toString();
	delete report._id;

	const result = await ColR.updateOne(
		{
			_id: new ObjectId(reportId),
		},
		{
			$set: report,
		}
	);

	return result.modifiedCount > 0
		? {
				status: "ok",
				report: Object.assign(report, { _id: reportId }),
		  }
		: {
				status: "not ok",
				error: "Failed to update report",
		  };
};

export { handler as reportUpdateHandler };
