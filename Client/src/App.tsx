import {
	IonApp,
	IonIcon,
	IonLabel,
	IonRouterOutlet,
	IonTabBar,
	IonTabButton,
	IonTabs,
	setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { globeOutline, home, personCircleOutline, settingsOutline } from "ionicons/icons";
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
import { Preferences } from "@capacitor/preferences";
import { useContext, useEffect } from "react";
import UIContext from "./context/UIContext";
import UserContext from "./context/UserContext";
import { PageAuthLogin } from "./pages/auth/Login";
import { PageLogout } from "./pages/auth/Logout";
import { PageAuthRegister } from "./pages/auth/Register";
import { PageExplore } from "./pages/explore/Explore";
import { PageHome } from "./pages/home/Home";
import { PagePostDetails } from "./pages/post/Post";
import { PageSettings } from "./pages/settings/Settings";
import { PageUserDetails } from "./pages/user/User";
import "./theme/variables.css";
import { WebSocketClient } from "./websocket";
import { User } from "../../shared/types";

setupIonicReact();

const App: React.FC = () => {
	const { token, setToken, setUser, user } = useContext(UserContext)!;
	const { showTabs, setShowTabs } = useContext(UIContext);
	const tabBarStyle = showTabs ? undefined : { display: "none" };

	useEffect(() => {
		Preferences.get({ key: "whoami" }).then(({ value }) => {
			WebSocketClient.sendAndListenPromise<{ user: User; token: string }>({
				request: "AUTH_RENEW",
				data: {},
				token: value ?? undefined,
			}).then(({ user, token }) => {
				setUser(user);
				setToken(token);
			});
		});
	}, [token]);

	return (
		<IonApp>
			{token ? (
				<IonReactRouter>
					<IonTabs>
						<IonRouterOutlet>
							{/* auto redirect */}
							<Route
								exact
								path={["*"]}>
								<Redirect to="/home" />
							</Route>
							<Route
								exact
								path={["/login", "/register", "/"]}>
								<Redirect to="/home" />
							</Route>
							<Route
								exact
								path={["/logout"]}
								render={() => {
									setShowTabs(false);
									return <PageLogout />;
								}}
							/>

							{/* invisible pages */}
							<Route
								exact
								path="/user/:userId"
								render={(a) => {
									setShowTabs(true);
									return <PageUserDetails userId={a.match.params.userId} />;
								}}
							/>
							<Route
								exact
								path="/post/:postId"
								render={(a) => {
									setShowTabs(true);
									return <PagePostDetails postId={a.match.params.postId} />;
								}}
							/>

							{/* default pages */}
							<Route
								exact
								path="/home"
								render={() => {
									setShowTabs(true);
									return <PageHome />;
								}}
							/>
							<Route
								exact
								path="/explore"
								render={() => {
									setShowTabs(true);
									return <PageExplore />;
								}}
							/>
							<Route
								exact
								path="/settings"
								render={(a) => {
									setShowTabs(true);
									return <PageSettings />;
								}}
							/>
						</IonRouterOutlet>
						<IonTabBar
							slot="bottom"
							style={tabBarStyle}>
							<IonTabButton
								tab="home"
								href="/home">
								<IonIcon
									aria-hidden="true"
									icon={home}
								/>
								<IonLabel>Home</IonLabel>
							</IonTabButton>
							<IonTabButton
								tab="explore"
								href={`/explore`}>
								<IonIcon
									aria-hidden="true"
									icon={globeOutline}
								/>
								<IonLabel>Explore</IonLabel>
							</IonTabButton>
							<IonTabButton
								tab="profile"
								href={`/user/${user?._id?.toString()}`}>
								<IonIcon
									aria-hidden="true"
									icon={personCircleOutline}
								/>
								<IonLabel>Profile</IonLabel>
							</IonTabButton>
							<IonTabButton
								tab="settings"
								href="/settings">
								<IonIcon
									aria-hidden="true"
									icon={settingsOutline}
								/>
								<IonLabel>Settings</IonLabel>
							</IonTabButton>
						</IonTabBar>
					</IonTabs>
				</IonReactRouter>
			) : (
				<IonReactRouter>
					<IonRouterOutlet>
						<Route
							exact
							path="/register"
							render={() => <PageAuthRegister />}
						/>
						<Route
							exact
							path="/login"
							render={() => <PageAuthLogin />}
						/>
						<Route
							exact
							path="/">
							<Redirect to="/login" />
						</Route>
					</IonRouterOutlet>
				</IonReactRouter>
			)}
		</IonApp>
	);
};

export default App;
