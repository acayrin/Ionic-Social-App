import {
	IonContent,
	IonHeader,
	IonLabel,
	IonPage,
	IonRefresher,
	IonRefresherContent,
	IonSegment,
	IonSegmentButton,
} from "@ionic/react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User } from "../../../../shared/types";
import { ComponentUser } from "../../components/User";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const Page: React.FC = () => {
	const { token } = useContext(UserContext)!;
	const [listRandomUsers, setListRandomUsers] = useState<User[]>();
	const [listFollowingUsers, setListFollowingUsers] = useState<User[]>();
	const [listFollowerUsers, setListFollowerUsers] = useState<User[]>();

	const [page, setPage] = useState<ReactNode>(null);
	const [pageValue, setPageValue] = useState<"v1" | "v2" | "v3">();

	useEffect(() => {
		render();
	}, []);

	useEffect(() => {
		let list: User[] = listRandomUsers ?? [];
		if (pageValue === "v2") list = listFollowingUsers ?? [];
		else if (pageValue === "v3") list = listFollowerUsers ?? [];

		setPage(
			list.map((user) => (
				<Link
					style={{ textDecoration: "none" }}
					to={`/user/${user._id!.toString()}`}
					key={user._id!.toString()}>
					<ComponentUser user={user} />
				</Link>
			))
		);
	}, [pageValue]);

	const render = async (forced = false) => {
		if (forced) {
			setListRandomUsers(undefined);
			setListFollowingUsers(undefined);
			setListFollowerUsers(undefined);
		}

		// random
		const { users } = await WebSocketClient.sendAndListenPromise<{ users: User[] }, undefined>({
			request: "USER_PROFILE_GET_ANY",
			data: undefined,
			token,
		});
		setListRandomUsers(users);
		setPageValue("v1");

		const { user } = await WebSocketClient.sendAndListenPromise<{ user: User }, undefined>({
			request: "USER_PROFILE_GET",
			data: undefined,
			token,
		});

		// following
		if (user.following) {
			const users = await Promise.all(
				user.following.map(
					async (uf) =>
						(
							await WebSocketClient.sendAndListenPromise<{ user: User }>({
								request: "USER_PROFILE_GET",
								data: {
									userId: uf,
								},
								token,
							})
						).user
				)
			);
			setListFollowingUsers(users);
		}
		// follower
		if (user.followers) {
			const users = await Promise.all(
				user.followers.map(
					async (uf) =>
						(
							await WebSocketClient.sendAndListenPromise<{ user: User }>({
								request: "USER_PROFILE_GET",
								data: {
									userId: uf,
								},
								token,
							})
						).user
				)
			);
			setListFollowerUsers(users);
		}
	};

	return (
		<IonPage>
			<IonHeader>
				<IonSegment
					value={pageValue}
					scrollable={true}
					onIonChange={(e) => setPageValue(e.detail.value as any)}>
					<IonSegmentButton value="v1">
						<IonLabel style={{ fontSize: 11 }}>People you may know</IonLabel>
					</IonSegmentButton>
					<IonSegmentButton value="v2">
						<IonLabel style={{ fontSize: 11 }}>Following</IonLabel>
					</IonSegmentButton>
					<IonSegmentButton value="v3">
						<IonLabel style={{ fontSize: 11 }}>Followers</IonLabel>
					</IonSegmentButton>
				</IonSegment>
			</IonHeader>
			<IonContent>
				<IonRefresher
					slot="fixed"
					onIonRefresh={(e) => {
						render(true).then(() => e.detail.complete());
					}}>
					<IonRefresherContent />
				</IonRefresher>
				{page}
			</IonContent>
		</IonPage>
	);
};

export { Page as PageExplore };
