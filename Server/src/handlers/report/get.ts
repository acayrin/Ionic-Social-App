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

	const report = await ColR.findOne({
		_id: new ObjectId(d!.reportId),
	});

	if (userObj?._role === "user" && user !== report?.reporterId) {
		return {
			status: "not ok",
			error: "Unauthorized",
		};
	}

	return {
		status: "ok",
		report,
	};
};

export { handler as reportGetHandler };
