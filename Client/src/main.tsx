import { createRoot } from "react-dom/client";
import App from "./App";
import { UIProvider } from "./context/UIContext";
import { UserProvider } from "./context/UserContext";
import { WebSocketClient } from "./websocket";

const container = document.getElementById("root");
const root = createRoot(container!);

WebSocketClient.get();

root.render(
	<UserProvider>
		<UIProvider>
			<App />
		</UIProvider>
	</UserProvider>
);
