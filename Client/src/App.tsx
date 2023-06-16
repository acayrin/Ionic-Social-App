import { IonApp, IonRouterOutlet, IonTabBar, IonTabs, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route } from "react-router-dom";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/display.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";

/* Theme variables */
import { useContext } from "react";
import UIContext from "./context/UIContext";
import { AuthLogin } from "./pages/auth/Login";
import { AuthRegister } from "./pages/auth/Register";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
	const { showTabs, setShowTabs } = useContext(UIContext);
	const tabBarStyle = showTabs ? undefined : { display: "none" };

	return (
		<IonApp>
			<IonReactRouter>
				<IonTabs>
					<IonRouterOutlet>
						<Route
							exact
							path="/login"
							render={() => {
								setShowTabs(false);

								return <AuthLogin />;
							}}
						/>
						<Route
							exact
							path="/register"
							render={() => {
								setShowTabs(false);

								return <AuthRegister />;
							}}
						/>
						<Route
							exact
							path="/">
							<Redirect to="/login" />
						</Route>
					</IonRouterOutlet>
					<IonTabBar
						slot="bottom"
						style={tabBarStyle}>
						<div>{/* TODO: Add main buttons here */}</div>
					</IonTabBar>
				</IonTabs>
			</IonReactRouter>
		</IonApp>
	);
};

export default App;
