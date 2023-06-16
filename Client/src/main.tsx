import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { UIProvider } from "./context/UIContext";
import { WebSocketClient } from "./websocket";

const container = document.getElementById("root");
const root = createRoot(container!);
WebSocketClient.get();

root.render(
	<UIProvider>
		<React.StrictMode>
			<App />
		</React.StrictMode>
	</UIProvider>
);
