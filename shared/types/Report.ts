import { ObjectId } from "mongodb";

export type Report = {
	/**
	 * id of this report
	 *
	 * @name _id
	 */
	_id?: ObjectId;
	/**
	 * id of the reported content, valid for User, Post, Comment, ChatMessage and Attachment
	 *
	 * @name contentId
	 */
	contentId: string;
	/**
	 * id of the reporting user
	 *
	 * @name reporterId
	 */
	reporterId: string;
	/**
	 * reported reason
	 *
	 * @name reason
	 */
	reason: string;
	/**
	 * report current status
	 *
	 * @name status
	 */
	status: "checking" | "resolved" | "rejected";
	/**
	 * report timestamp
	 *
	 * @name timestamp
	 */
	timestamp: number;
};
