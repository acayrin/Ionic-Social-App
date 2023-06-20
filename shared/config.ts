import { serialize, deserialize } from "bson";

const AppConfig = {
	defaultAvatar: "https://cdn.discordapp.com/emojis/851121668746772510.webp",
	attachments: {
		maxSize: 25 * 1024 * 1024,
		maxAmount: 10,
		deniedMimeTypes: ["application/vnd.microsoft.portable-executable"],
	},
	// defaultAvatar: "",
	// app
	_serialize: JSON.stringify,
	_deserialize: JSON.parse,
};

export default AppConfig;
