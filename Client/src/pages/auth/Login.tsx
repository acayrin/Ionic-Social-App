import { Preferences } from "@capacitor/preferences";
import {
	InputChangeEventDetail,
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonImg,
	IonInput,
	IonItem,
	IonLabel,
	IonSkeletonText,
	NavContext,
} from "@ionic/react";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";
import { sha256 } from "js-sha256";
import "./Auth.css";

const Login: React.FC = () => {
	const { setUser, setToken } = useContext(UserContext)!;
	const { navigate } = useContext(NavContext);
	const { setWindowTitle } = useContext(UIContext);

	setWindowTitle("Login");

	const [inUsername, setInUsername] = useState<string>("");
	const [inPassword, setInPassword] = useState<string>("");
	const [txtResponse, setTxtResponse] = useState<string>("");

	// input change event handler
	const evUsername = ({ value }: InputChangeEventDetail) => setInUsername(value ?? "");
	const evPassword = ({ value }: InputChangeEventDetail) => setInPassword(value ?? "");

	// button submit event handler
	const evBtnClick = () => {
		if (inUsername?.length === 0 || inPassword?.length === 0) {
			return setTxtResponse("Invalid username or password");
		}

		WebSocketClient.sendAndListenPromise({
			request: "AUTH_LOGIN",
			data: {
				username: inUsername,
				password: sha256(inPassword),
			},
		}).then((d) => {
			if (d.status === "not ok") {
				setTxtResponse(d.error!!);
			} else {
				Preferences.set({
					key: "whoami",
					value: d.token,
				}).then(() => {
					setToken(d.token);
					setUser(d.userId);
					navigate("/");
				});
			}
		});
	};

	return (
		<div className="card-container">
			<IonCard className="card">
				<IonCardHeader className="card-header">
					<IonCardTitle>
						<IonImg
							className="card-logo"
							src="https://media.discordapp.net/attachments/1062430575438344264/1119141610878410812/168689454478416718.png">
							<IonSkeletonText />
						</IonImg>
						<h1>Login</h1>
					</IonCardTitle>
					<IonCardSubtitle>
						<p>Login to start chatting</p>
						<p style={{ color: "#ff3b3b" }}>{txtResponse}</p>
					</IonCardSubtitle>
				</IonCardHeader>
				<IonCardContent className="ion-text-center">
					<div className="card-input-container">
						<IonItem>
							<IonLabel position="floating">Username</IonLabel>
							<IonInput
								onIonInput={({ detail }) => evUsername(detail)}
								placeholder="Your username"
							/>
						</IonItem>
						<IonItem>
							<IonLabel position="floating">Password</IonLabel>
							<IonInput
								type="password"
								onIonInput={({ detail }) => evPassword(detail)}
								placeholder="Your password"
							/>
						</IonItem>
					</div>
					<IonButton
						onClick={evBtnClick}
						expand="block">
						Submit
					</IonButton>
					<div style={{ paddingTop: "1rem" }}>
						Don't have an account? <Link to="/register">Register here</Link>
					</div>
				</IonCardContent>
			</IonCard>
		</div>
	);
};

export { Login as PageAuthLogin };
