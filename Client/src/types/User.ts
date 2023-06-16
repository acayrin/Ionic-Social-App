export type User = {
	/**
	 * user id
	 *
	 * @name _id
	 */
	_id: any;
	/**
	 * role of the user
	 *
	 * @name _role
	 */
	_role: "user" | "moderator" | "administrator";
	/**
	 * metadata
	 *
	 * @name _metadata
	 */
	_metadata: {
		views: number; // account views
	};
	/**
	 * account username
	 *
	 * @name username
	 */
	username: string;
	/**
	 * salted SHA256 password hash
	 *
	 * @name password
	 */
	password: string;
	/**
	 * account email address
	 *
	 * @name emailAddress
	 */
	emailAddress?: string;
	/**
	 * account display name
	 *
	 * @name displayName
	 */
	displayName?: string;
	/**
	 * list of follower user ids
	 *
	 * @name followers
	 */
	followers?: string[];
	/**
	 * list of following user ids
	 *
	 * @name following
	 */
	following?: string[];
	/**
	 * email verification state
	 *
	 * @name isEmailVerified
	 */
	isEmailVerified?: boolean;
	/**
	 * account creation timestamp
	 *
	 * @name timestamp
	 */
	timestamp: number;
};
