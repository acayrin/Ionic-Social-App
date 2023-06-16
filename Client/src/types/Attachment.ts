export type Attachment = {
	/**
	 * id of attachment
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
		 * number of downloads
		 *
		 * @name downloads
		 */
		downloads: number;
		/**
		 * number of views
		 *
		 * @name views
		 */
		views: number;
	};
	/**
	 *  name of the attachment
	 *
	 * @name filename
	 */
	filename: string;
	/**
	 * uploaded timestamp
	 *
	 * @name timestamp
	 */
	timestamp: number;
	/**
	 * owning user _id
	 *
	 * @name ownerId
	 */
	ownerId: string;
	/**
	 * path to the attachment
	 *
	 * @name path
	 */
	path: string;
	/**
	 *  content of the attachment
	 *
	 * @name file
	 */
	file: Buffer;
};
