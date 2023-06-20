import { ObjectId } from "mongodb";
import { Report, User } from "../../../../shared/types/index";
import { RequestHandler } from "../../../../shared/types/_RequestHandler";
import { Db } from "../../modules/database/index";

const ColR = Db.collection<Report>("Reports");
const ColU = Db.collection<User>("Users");

const handler: RequestHandler = async ({ user }) => {
	if (!user) return { status: "not ok", error: "Unauthorized" };

	const userObj = await ColU.findOne({
		_id: new ObjectId(user),
	});

	const condition =
		userObj!._role === "user"
			? {
					reporterId: user,
			  }
			: {};
	const reports = await ColR.find(condition).toArray();

	return {
		status: "ok",
		reports,
	};
};

export { handler as reportGetAllHandler };
