import { IonContent, IonInfiniteScroll, IonInfiniteScrollContent, IonPage } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { Post } from "../../../../shared/types";
import { ComponentLoader } from "../../components/Loader";
import { ComponentPost } from "../../components/Post";
import { ComponentPostCreate } from "../../components/ui/PostCreate";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const Page: React.FC = () => {
	const { token } = useContext(UserContext)!;
	const { setWindowTitle } = useContext(UIContext);

	setWindowTitle("Home");

	const [postList, setPostList] = useState<Post[]>();
	const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

	const fetchPosts = () => {
		WebSocketClient.sendAndListenPromise<{ posts: Post[] }, undefined>({
			request: "USER_POST_GET_TIMELINE",
			token,
			data: undefined,
		}).then(({ posts }) => {
			posts.reverse();
			setPostList(posts);

			setLastUpdated(Date.now());
		});
	};
	useEffect(() => {
		setTimeout(() => fetchPosts(), 2e3);
	}, [lastUpdated]);

	return (
		<IonPage>
			<IonContent>
				<ComponentPostCreate />
				{postList ? (
					postList.map(({ _id }) => (
						<ComponentPost
							key={_id!.toString("base64")}
							postId={_id!.toString()}
						/>
					))
				) : (
					<ComponentLoader />
				)}
				<IonInfiniteScroll
					onIonInfinite={(ev) => {
						setTimeout(() => ev.target.complete(), 500);
					}}>
					<IonInfiniteScrollContent />
				</IonInfiniteScroll>
			</IonContent>
		</IonPage>
	);
};

export { Page as PageHome };
