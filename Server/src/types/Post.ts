export type Post = {
	/**
	 * id of this post
	 *
	 * @name _id
	 */
	_id: string;
	/**
	 * id of the owning user
	 *
	 * @name owner
	 */
	ownerId: string;
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
		/**
		 * UTF-8 emoji
		 *
		 * @name emoji
		 */
		emoji: string;
		/**
		 * reacting user
		 *
		 * @name userId
		 */
		userId: string;
	}[];
	/**
	 *  list of comment _ids
	 *
	 * @name comments
	 */
	comments?: string[];
};
