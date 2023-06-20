import {
	IonCard,
	IonCardContent,
	IonContent,
	IonPage,
	IonRefresher,
	IonRefresherContent,
	IonSegment,
	IonSegmentButton,
} from "@ionic/react";
import { ReactNode, useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Post, RequestSubData, User } from "../../../../shared/types";
import { ComponentLoader } from "../../components/Loader";
import { ComponentPost } from "../../components/Post";
import { ComponentPostCreate } from "../../components/ui/PostCreate";
import { ComponentUser } from "../../components/User";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const Page: React.FC<{ userId: string }> = ({ userId }) => {
	const { setWindowTitle } = useContext(UIContext);
	const { token } = useContext(UserContext)!;

	const [page, setPage] = useState<ReactNode>();
	const [pageValue, setPageValue] = useState<"1" | "2" | "3">("1");

	const [user, setUser] = useState<User>();
	const [userFollowers, setUserFollowers] = useState<User[]>([]);
	const [userFollowing, setUserFollowing] = useState<User[]>([]);

	useEffect(() => {
		render();
		renderPage("1");
	}, [userId]);

	const render = async () => {
		const { user } = await WebSocketClient.sendAndListenPromise<{ user: User }>({
			request: "USER_PROFILE_GET",
			data: {
				userId,
			},
			token,
		});

		setUser(user);
		setWindowTitle(`Viewing: ${user?.displayName ?? user?.username}`);

		if (user.followers) {
			Promise.all(
				user.followers.map(
					async (user) =>
						(
							await WebSocketClient.sendAndListenPromise({
								request: "USER_PROFILE_GET",
								data: { userId: user },
								token,
							})
						).user
				)
			).then((users) => setUserFollowers(users));
		}
		if (user.following) {
			Promise.all(
				user.following.map(
					async (user) =>
						(
							await WebSocketClient.sendAndListenPromise({
								request: "USER_PROFILE_GET",
								data: { userId: user },
								token,
							})
						).user
				)
			).then((users) => setUserFollowing(users));
		}
	};

	const renderPage = (page: "1" | "2" | "3") => {
		if (page === "1") {
			setPage(<CTimeline userId={userId} />);
		} else if (page === "2") {
			setPage(
				<>
					{userFollowers.map((user) => (
						<Link
							style={{ textDecoration: "none" }}
							to={`/user/${user._id!.toString()}`}
							key={user._id!.toString()}>
							<ComponentUser user={user} />
						</Link>
					))}
				</>
			);
		}
	};

	return (
		<IonPage>
			<IonContent>
				<IonRefresher
					slot="fixed"
					onIonRefresh={(e) => {
						render().then(() => e.target.complete());
					}}>
					<IonRefresherContent />
				</IonRefresher>
				<ComponentUser
					user={user}
					withTrigger={true}
				/>
				<IonCard style={{ padding: 0 }}>
					<IonCardContent style={{ padding: 0 }}>
						<IonSegment
							scrollable={true}
							onIonChange={(e) => {
								renderPage(e.detail.value as any);
								setPageValue(e.detail.value as any);
							}}
							value={pageValue}>
							<IonSegmentButton value="1">Timeline</IonSegmentButton>
							{user?.followers && <IonSegmentButton value="2">Followers</IonSegmentButton>}
							{user?.following && <IonSegmentButton value="3">Following</IonSegmentButton>}
						</IonSegment>
					</IonCardContent>
				</IonCard>
				{page}
			</IonContent>
		</IonPage>
	);
};

const CTimeline: React.FC<{ userId: string }> = ({ userId }) => {
	const { showToast } = useContext(UIContext);
	const { token, user: sessionUser } = useContext(UserContext)!;

	const [user, setUser] = useState<User>();
	const [postList, setPostList] = useState<Post[]>();

	useEffect(() => {
		render();
	}, [userId]);

	const render = async () => {
		const { user } = await WebSocketClient.sendAndListenPromise<{ user: User }>({
			request: "USER_PROFILE_GET",
			data: {
				userId,
			},
			token,
		});

		setUser(user);

		const { posts, error } = await WebSocketClient.sendAndListenPromise<{ posts: Post[] } & RequestSubData>({
			request: "USER_POST_GET_ALL",
			data: {
				userId,
			},
			token,
		});
		if (error) {
			showToast(error);
			return setPostList([]);
		}

		posts.reverse();
		setPostList(posts);
	};

	return (
		<>
			{user?._id!.toString() === sessionUser?._id?.toString() && (
				<ComponentPostCreate
					onPostCreate={(p) => {
						setPostList([p, ...(postList ?? [])]);
					}}
				/>
			)}
			{postList ? (
				postList.map(({ _id }) => (
					<ComponentPost
						key={_id!.toString("base64")}
						postId={_id!.toString()}
						onPostRemove={(o) => {
							setPostList(postList.filter((post) => post._id!.toString() !== o.postId));
						}}
					/>
				))
			) : (
				<ComponentLoader />
			)}
		</>
	);
};
export { Page as PageUserDetails };
