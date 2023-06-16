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
	IonRouterLink,
} from "@ionic/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WebSocketClient } from "../../websocket";
import "./Auth.css";

const toZZZZ = async (input: string) => {
	const z = new TextEncoder().encode(input);
	const zz = await crypto.subtle.digest("SHA-256", z);
	const zzz = Array.from(new Uint8Array(zz));

	return zzz.map((z) => z.toString(16).padStart(2, "0")).join("");
};
const Register: React.FC = () => {
	document.title = "Auth | Register";

	const [inUsername, setInUsername] = useState<string | null | undefined>();
	const [inPassword, setInPassword] = useState<string | null | undefined>();
	const [inPassConf, setInPassConf] = useState<string | null | undefined>();
	const [txtResponse, setTxtResponse] = useState<string>("");

	// input change event handler
	const evUsername = ({ value }: InputChangeEventDetail) => setInUsername(value);
	const evPassword = ({ value }: InputChangeEventDetail) => setInPassword(value);
	const evPassConf = ({ value }: InputChangeEventDetail) => setInPassConf(value);

	// button submit event handler
	const evBtnClick = () => {
		if (inUsername?.length === 0 || inPassword?.length === 0) {
			return setTxtResponse("Invalid username or password");
		}
		if (inPassword !== inPassConf) {
			return setTxtResponse("Password mismatched");
		}

		toZZZZ(inPassword!!).then((zzzz) => {
			WebSocketClient.send("AUTH_REGISTER", {
				username: inUsername,
				password: zzzz,
			});
			WebSocketClient.listenOnce("AUTH_REGISTER", (d) => {
				if (d.status === "not ok") {
					setTxtResponse(d.error!!);
				} else {
					alert("success");
				}
			});
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
					<IonItem>
						<IonLabel position="floating">Username</IonLabel>
						<IonInput onIonChange={({ detail }) => evUsername(detail)} />
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Password</IonLabel>
						<IonInput
							type="password"
							onIonChange={({ detail }) => evPassword(detail)}
						/>
					</IonItem>
					<IonItem>
						<IonLabel position="floating">Confirm Password</IonLabel>
						<IonInput
							type="password"
							onIonChange={({ detail }) => evPassConf(detail)}
						/>
					</IonItem>
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

export { Register as AuthRegister };
