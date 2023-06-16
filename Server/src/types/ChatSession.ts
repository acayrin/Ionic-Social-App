export type ChatSession = {
	/**
	 * id of chat session
	 *
	 * @name _id
	 */
	_id: string;
	/**
	 * metadata
	 *
	 * @name _metadata
	 */
	_metadata: {
		/**
		 * creation timestamp
		 *
		 * @name timestamp
		 */
		timestamp: number;
	};
	/**
	 * name of the chat session / groupname of the chat session / group
	 *
	 * @name name
	 */
	name?: string;
	/**
	 * description of the chat session / group
	 *
	 * @name description
	 */
	description?: string;
	/**
	 * list of included user _ids
	 *
	 * @name targets
	 */
	targets: string[];
	/**
	 * list of message ids
	 *
	 * @name messages
	 */
	messages: string[];
};
