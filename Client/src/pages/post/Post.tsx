import { IonContent, IonPage } from "@ionic/react";
import { useContext, useEffect, useState } from "react";
import { Post } from "../../../../shared/types";
import { ComponentPost } from "../../components/Post";
import { ComponentPostCreate } from "../../components/ui/PostCreate";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const Page: React.FC<{ postId: string }> = ({ postId }) => {
	const { token } = useContext(UserContext)!;
	const { setWindowTitle } = useContext(UIContext);

	const [post, setPost] = useState<Post | undefined>();

	// set post
	useEffect(() => {
		render(true);
	}, [postId]);

	const render = (force = false) => {
		if (force) {
			setPost(undefined);
		}

		WebSocketClient.sendAndListenPromise<{ post: Post }>({
			request: "USER_POST_GET",
			data: {
				postId,
			},
			token,
		}).then(({ post }) => {
			post._references?.reverse();

			setPost(post);
			setWindowTitle(`Viewing: ${post?.content?.slice(0, 20)}`);
		});
	};

	return (
		<IonPage>
			<IonContent>
				<ComponentPost postId={post?._id?.toString()} />
				<ComponentPostCreate
					placeholder="Comment"
					referenceId={postId}
					onPostCreate={() => render()}
				/>
				{post?._references?.map((refPost) => (
					<ComponentPost
						key={refPost._id!.toString()}
						postId={refPost._id!.toString()}
						onPostRemove={() => render()}
					/>
				))}
			</IonContent>
		</IonPage>
	);
};

export { Page as PagePostDetails };
