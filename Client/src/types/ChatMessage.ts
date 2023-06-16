export type ChatMessage = {
	/**
	 * id of chat message
	 *
	 * @name _id
	 */
	_id: string;
	/**
	 * id of the sending user,
	 *
	 * @name sender
	 */
	senderId: string;
	/**
	 * content of this message
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
	 * reference to another message
	 *
	 * @name reference
	 */
	reference?: string;
	/**
	 * message creation timestamp
	 *
	 * @name timestamp
	 */
	timestamp: number;
};
