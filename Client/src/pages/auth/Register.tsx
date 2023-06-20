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
	NavContext,
} from "@ionic/react";
import { sha256 } from "js-sha256";
import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";
import "./Auth.css";

const Register: React.FC = () => {
	const { setUser, setToken } = useContext(UserContext)!;
	const { navigate } = useContext(NavContext);
	const { setWindowTitle } = useContext(UIContext);

	setWindowTitle("Register");

	const [inUsername, setInUsername] = useState<string>("");
	const [inPassword, setInPassword] = useState<string>("");
	const [inPassConf, setInPassConf] = useState<string>("");
	const [txtResponse, setTxtResponse] = useState<string>("");

	// input change event handler
	const evUsername = ({ value }: InputChangeEventDetail) => setInUsername(value ?? "");
	const evPassword = ({ value }: InputChangeEventDetail) => setInPassword(value ?? "");
	const evPassConf = ({ value }: InputChangeEventDetail) => setInPassConf(value ?? "");

	// button submit event handler
	const evBtnClick = () => {
		if (inUsername?.length === 0 || inPassword?.length === 0 || inPassConf?.length === 0) {
			return setTxtResponse("Invalid username or password");
		}
		if (inPassword !== inPassConf) {
			return setTxtResponse("Password mismatched");
		}

		WebSocketClient.sendAndListenPromise({
			request: "AUTH_REGISTER",
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
					setUser(d.user);
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
							src="https://media.discordapp.net/attachments/1062430575438344264/1119141610878410812/168689454478416718.png"
						/>
						<h1>Register</h1>
					</IonCardTitle>
					<IonCardSubtitle>
						<p>Register your account today!</p>
						<p style={{ color: "#ff3b3b" }}>{txtResponse}</p>
					</IonCardSubtitle>
				</IonCardHeader>
				<IonCardContent className="ion-text-center">
					<div className="card-input-container">
						<IonItem>
							<IonLabel position="floating">Username</IonLabel>
							<IonInput onIonInput={({ detail }) => evUsername(detail)} />
						</IonItem>
						<IonItem>
							<IonLabel position="floating">Password</IonLabel>
							<IonInput
								type="password"
								onIonInput={({ detail }) => evPassword(detail)}
							/>
						</IonItem>
						<IonItem>
							<IonLabel position="floating">Confirm Password</IonLabel>
							<IonInput
								type="password"
								onIonInput={({ detail }) => evPassConf(detail)}
							/>
						</IonItem>
					</div>
					<IonButton
						onClick={evBtnClick}
						expand="block">
						Submit
					</IonButton>
					<div style={{ paddingTop: "1rem" }}>
						Already have an account? <Link to="/login">Login here</Link>
					</div>
				</IonCardContent>
			</IonCard>
		</div>
	);
};

export { Register as PageAuthRegister };
