import { IonCard, IonCardContent, IonItemGroup, IonItemDivider, IonLabel, IonItem, IonInput } from "@ionic/react";
import { useContext, useState, useEffect } from "react";
import { User, RequestSubData, UserUpdateOptions } from "../../../../shared/types";
import { ComponentNavLink } from "../../components/ui/NavLink";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";
import { sha256 } from "js-sha256";

const CPNormal: React.FC = () => {
	const { showToast } = useContext(UIContext);
	const { user, setUser, token } = useContext(UserContext)!;

	const [inputEmailAddress, setInputEmailAddress] = useState("");
	const [inputDisplayName, setInputDisplayName] = useState("");
	const [inputPassword, setInputPassword] = useState("");
	const [inputPasswordOld, setInputPasswordOld] = useState("");
	const [inputPasswordConfirm, setInputPasswordConfirm] = useState("");

	useEffect(() => {
		setInputEmailAddress(user!.emailAddress!);
		setInputDisplayName(user!.displayName!);
	}, []);

	const evUserUpdate = () => {
		WebSocketClient.sendAndListenPromise<{ user: User } & RequestSubData, UserUpdateOptions>({
			request: "USER_PROFILE_SETTINGS_UPDATE",
			data: {
				displayName: inputDisplayName,
				emailAddress: inputEmailAddress,
			},
			token,
		}).then(({ user, error }) => {
			if (error) {
				return showToast(error);
			}

			setUser(user);
			showToast(`Updated profile`);
		});
	};
	const evUserPassUpdate = () => {
		if (inputPassword.length <= 12 || inputPasswordConfirm.length <= 12 || inputPasswordOld.length <= 12) {
			return showToast("Password must be at least 12 characters long");
		}
		if (inputPasswordOld === inputPassword) {
			return showToast(`Password unchanged`);
		}
		if (inputPassword !== inputPasswordConfirm) {
			return showToast(`Password mismatched`);
		}
		WebSocketClient.sendAndListenPromise<{ user: User } & RequestSubData, UserUpdateOptions>({
			request: "USER_PROFILE_SETTINGS_UPDATE",
			data: {
				password: sha256(inputPassword),
			},
		}).then(({ user, error }) => {
			if (error) {
				return showToast(error);
			}

			setUser(user);
		});
	};

	return (
		<IonCard>
			<IonCardContent>
				<IonItemGroup>
					<IonItemDivider>
						<IonLabel>Update your profile</IonLabel>
					</IonItemDivider>
					<IonItem style={{ border: "1px solid var(--ion-color-light-tint)" }}>
						<IonInput
							label="Email Address"
							labelPlacement="floating"
							onIonInput={({ detail }) => {
								setInputEmailAddress(detail.value ?? "");
							}}
							value={inputEmailAddress}
						/>
					</IonItem>
					<IonItem style={{ border: "1px solid var(--ion-color-light-tint)" }}>
						<IonInput
							label="Display Name"
							labelPlacement="floating"
							onIonInput={({ detail }) => {
								setInputDisplayName(detail.value ?? "");
							}}
							value={inputDisplayName}
						/>
					</IonItem>
					<IonItem>
						<IonLabel
							style={{ color: "var(--ion-color-primary)" }}
							onClick={evUserUpdate}>
							Update
						</IonLabel>
					</IonItem>
				</IonItemGroup>
				<IonItemGroup style={{ marginTop: 42 }}>
					<IonItemDivider>
						<IonLabel>Change password</IonLabel>
					</IonItemDivider>
					<IonItem style={{ border: "1px solid var(--ion-color-light-tint)" }}>
						<IonInput
							label="Old Password"
							labelPlacement="floating"
							onIonInput={({ detail }) => {
								setInputPasswordOld(detail.value ?? "");
							}}
						/>
					</IonItem>
					<IonItem style={{ border: "1px solid var(--ion-color-light-tint)" }}>
						<IonInput
							label="New Password"
							labelPlacement="floating"
							onIonInput={({ detail }) => {
								setInputPassword(detail.value ?? "");
							}}
						/>
					</IonItem>
					<IonItem style={{ border: "1px solid var(--ion-color-light-tint)" }}>
						<IonInput
							label="Confirm Password"
							labelPlacement="floating"
							onIonInput={({ detail }) => {
								setInputPasswordConfirm(detail.value ?? "");
							}}
						/>
					</IonItem>
					<IonItem>
						<IonLabel
							style={{ color: "var(--ion-color-primary)" }}
							onClick={evUserPassUpdate}>
							Update
						</IonLabel>
					</IonItem>
				</IonItemGroup>
				<IonItem style={{ marginTop: 42 }}>
					<ComponentNavLink to={"/logout"}>Logout</ComponentNavLink>
				</IonItem>
			</IonCardContent>
		</IonCard>
	);
};

const toZZZZ = async (input: string) => {
	const z = new TextEncoder().encode(input);
	const zz = await crypto.subtle.digest("SHA-256", z);
	const zzz = Array.from(new Uint8Array(zz));

	return zzz.map((z) => z.toString(16).padStart(2, "0")).join("");
};

export { CPNormal };
