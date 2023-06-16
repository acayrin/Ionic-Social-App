export type Comment = {
	/**
	 * id of this comment
	 *
	 * @name _id
	 */
	_id: string;
	/**
	 * comment owner user id
	 *
	 * @name owner
	 */
	owner: string;
	/**
	 * message content of this post
	 *
	 * @name content
	 */
	content?: string;
	/**
	 * list of attachments _ids
	 *
	 * @name attachments
	 */
	attachments?: string[];
	/**
	 * list of reactions
	 *
	 * @name reactions
	 */
	reactions?: {
		emoji: string;
		userId: string;
	}[];
};
