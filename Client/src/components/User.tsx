import { FilePicker } from "@capawesome/capacitor-file-picker";
import {
	IonActionSheet,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonCol,
	IonGrid,
	IonIcon,
	IonImg,
	IonRow,
} from "@ionic/react";
import { ellipsisVerticalOutline } from "ionicons/icons";
import { useContext, useEffect, useState } from "react";
import AppConfig from "../../../shared/config";
import { RequestAttachment, User } from "../../../shared/types";
import UIContext from "../context/UIContext";
import UserContext from "../context/UserContext";
import { WebSocketClient } from "../websocket";
import { ComponentReport } from "./ui/ReportModal";
import "./User.css";

const CUser: React.FC<{ user?: User; withTrigger?: boolean }> = ({ user: userRef, withTrigger }) => {
	const [user, setUser] = useState(userRef);
	const [userActionIsOpen, setUserActionIsOpen] = useState(false);

	const { showToast } = useContext(UIContext);
	const { user: sessionUser, token } = useContext(UserContext)!;

	const [reportModalOpen, setReportModalOpen] = useState(false);

	const isFollowingUser = () => sessionUser && user?.followers?.includes(sessionUser._id!.toString());
	const evActionDismiss = (action: "follow" | "unfollow" | "report") => {
		if (action === "report") {
			return setReportModalOpen(true);
		}
		WebSocketClient.sendAndListenPromise<{ user: User }>({
			request: action === "follow" ? "USER_PROFILE_FOLLOWER_ADD" : "USER_PROFILE_FOLLOWER_REMOVE",
			data: {
				userId: user!._id!.toString(),
			},
			token,
		}).then(({ user }) => {
			setUser(user);
			showToast(`Follow status for ${user?.displayName ?? user?.username} updated successully`);
		});
	};

	useEffect(() => {
		setUser(userRef);
	}, [userRef]);

	const handleProfileBanner = () => {
		if (user?._id!.toString() === sessionUser?._id!.toString()) {
			FilePicker.pickImages({
				multiple: false,
				readData: true,
			}).then(async ({ files }) => {
				WebSocketClient.sendAndListenPromise<{ attachments: RequestAttachment[] }>({
					request: "USER_ATTACHMENT_ADD",
					data: {
						files,
					},
					token,
				}).then(({ attachments }) => {
					WebSocketClient.sendAndListenPromise<{ user: User }>({
						request: "USER_PROFILE_SETTINGS_UPDATE",
						data: {
							bannerUrl: attachments.at(0)!.url,
						},
						token,
					}).then(({ user }) => {
						setUser(user);

						showToast(`Uploaded ${attachments.length} files`);
					});
				});
			});
		}
	};
	const handleProfileAvatar = () => {
		if (user?._id!.toString() === sessionUser?._id?.toString()) {
			FilePicker.pickImages({
				multiple: false,
				readData: true,
			}).then(async ({ files }) => {
				WebSocketClient.sendAndListenPromise<{ attachments: RequestAttachment[] }>({
					request: "USER_ATTACHMENT_ADD",
					data: {
						files,
					},
					token,
				}).then(({ attachments }) => {
					WebSocketClient.sendAndListenPromise<{ user: User }>({
						request: "USER_PROFILE_SETTINGS_UPDATE",
						data: {
							avatarUrl: attachments.at(0)!.url,
						},
						token,
					}).then(({ user }) => {
						setUser(user);

						showToast(`Uploaded ${attachments.length} files`);
					});
				});
			});
		}
	};

	return (
		<>
			<IonCard>
				<div className="profile-banner-wrapper">
					<div
						onClick={() => withTrigger && handleProfileBanner()}
						className="profile-banner"
						style={{
							backgroundImage: `url(${
								user?.bannerUrl ?? "https://ionicframework.com/docs/img/demos/card-media.png"
							})`,
						}}
					/>
				</div>
				<IonCardHeader>
					<span
						className="profile-avatar-wrapper"
						onClick={() => withTrigger && handleProfileAvatar()}>
						<div
							style={{
								backgroundImage: `url(${user?.avatarUrl ?? AppConfig.defaultAvatar})`,
							}}
							className="profile-avatar"
						/>
					</span>
					<IonGrid className="profile-grid">
						<IonRow>
							<IonCol className="profile-title">
								<span>
									<IonCardTitle>{user?.displayName ?? user?.username}</IonCardTitle>
									<IonCardSubtitle>@{user?.username}</IonCardSubtitle>
								</span>
							</IonCol>
							<IonCol
								size="auto"
								style={{ padding: 0 }}>
								{user?._id!.toString() !== sessionUser?._id!.toString() && (
									<IonIcon
										onClick={(e) => {
											e.preventDefault();
											e.stopPropagation();
											setUserActionIsOpen(true);
										}}
										style={{ height: 20, width: 20, marginTop: 12 }}
										icon={ellipsisVerticalOutline}
									/>
								)}
							</IonCol>
						</IonRow>
					</IonGrid>
				</IonCardHeader>
				<IonCardContent>
					<IonGrid>
						<IonRow>
							<IonCol className="ion-text-left">
								<b>{user?.postCount ?? 0}</b> posts
							</IonCol>
							<IonCol className="ion-text-center">
								<b>{user?.followers?.length ?? 0}</b> followers
							</IonCol>
							<IonCol className="ion-text-right">
								<b>{user?.following?.length ?? 0}</b> following
							</IonCol>
						</IonRow>
					</IonGrid>
				</IonCardContent>
			</IonCard>
			<IonActionSheet
				isOpen={userActionIsOpen}
				header="User action"
				onIonActionSheetDidDismiss={(e) => {
					setUserActionIsOpen(false);
					evActionDismiss(e.detail.data.action);
					e.preventDefault();
					e.stopPropagation();
				}}
				buttons={[
					{
						text: "Report",
						data: {
							action: "report",
						},
					},
					isFollowingUser()
						? {
								text: "Unfollow",
								role: "destructive",
								data: {
									action: "unfollow",
								},
						  }
						: {
								text: "Follow",
								data: {
									action: "follow",
								},
						  },
				]}
			/>
			<ComponentReport
				contentId={user?._id?.toString()}
				modalOpen={reportModalOpen}
				modalClose={setReportModalOpen}
			/>
		</>
	);
};

export { CUser as ComponentUser };
