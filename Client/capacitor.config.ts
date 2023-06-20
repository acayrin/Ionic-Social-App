import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
	appId: "com.Client",
	appName: "Client",
	webDir: "dist",
	server: {
		androidScheme: "https",
	},
};

export default config;
