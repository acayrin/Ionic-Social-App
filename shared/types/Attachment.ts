import { ObjectId } from "mongodb";

export type Attachment = {
	/**
	 * id of attachment
	 *
	 * @name _id
	 */
	_id?: ObjectId;
	/**
	 * metadata
	 *
	 * @name _metadata
	 */
	_metadata?: {
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
	 * size of attachment
	 *
	 * @name size
	 */
	size: number;
	/**
	 * url path to the attachment
	 *
	 * @name url
	 */
	url: string;
	/**
	 * proxied url path to the attachment
	 *
	 * @name proxy_url
	 */
	proxy_url: string;
	/**
	 *  content of the attachment
	 *
	 * @name file
	 */
	file?: Buffer;
};
