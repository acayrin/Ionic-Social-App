import {
	IonActionSheet,
	IonButton,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCol,
	IonGrid,
	IonIcon,
	IonImg,
	IonRow,
	IonSkeletonText,
	IonTextarea,
	NavContext,
} from "@ionic/react";
import {
	ellipsisVerticalOutline,
	globeOutline,
	heartDislikeOutline,
	heartOutline,
	lockClosedOutline,
	peopleOutline,
	returnUpForwardOutline,
} from "ionicons/icons";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import AppConfig from "../../../shared/config";
import { Attachment, Post, PostStandalone, RequestSubData, User } from "../../../shared/types";
import UIContext from "../context/UIContext";
import UserContext from "../context/UserContext";
import { WebSocketClient } from "../websocket";
import { ComponentAttachment } from "./Attachment";
import "./Post.css";
import { ComponentNavLink } from "./ui/NavLink";
import { ComponentReport } from "./ui/ReportModal";

const CPost: React.FC<{
	postId?: string;
	onPostRemove?: (o: { postId: string; count: { posts: number; references: number } }) => unknown;
}> = ({ postId, onPostRemove }) => {
	const { showToast } = useContext(UIContext);
	const { user, token } = useContext(UserContext)!;
	const { navigate } = useContext(NavContext);

	const [post, setPost] = useState<Post>();
	const [postOwner, setPostOwner] = useState<User>();
	const [postNewContent, setPostNewContent] = useState<string>("");
	const [postReactions, setPostReactions] = useState<{ userId: string }[]>([]);
	const [postAttachments, setPostAttachments] = useState<Attachment[]>([]);

	const [postIsDeleted, setPostIsDeleted] = useState(false);
	const [postActionIsOpen, setPostActionIsOpen] = useState(false);
	const [postActionEdit, setPostActionEdit] = useState(false);
	const [postVisibilityToggleOpen, setPostVisibilityToggleOpen] = useState(false);

	const [referencePost, setReferencePost] = useState<Post>();
	const [referencePostOwner, setReferencePostOwner] = useState<User>();

	const [reportModalOpen, setReportModalOpen] = useState(false);

	const evPostEditCancel = () => setPostActionEdit(false);
	const evPostEditSubmit = () => {
		if (postNewContent.length === 0 || postNewContent === post!.content) {
			return showToast("Cannot be same or empty");
		}

		WebSocketClient.sendAndListenPromise<{ post: Post } & RequestSubData, Post>({
			request: "USER_POST_UPDATE",
			data: Object.assign(post!, {
				content: postNewContent,
			}),
			token,
		}).then(({ post, error }) => {
			if (error) {
				showToast(error);
				return;
			}
			setPostActionEdit(false);
			setPostNewContent(post.content ?? "");
			showToast("Updated post!");
		});
	};
	const evPostActionDismiss = (data: { [key: string]: unknown }) => {
		switch (data.action) {
			case "delete": {
				WebSocketClient.sendAndListenPromise<
					{
						count: { posts: number; references: number };
					} & RequestSubData
				>({
					request: "USER_POST_DELETE",
					data: {
						postId: post?._id!.toString(),
					},
					token,
				}).then(({ count, error }) => {
					if (error) {
						showToast(error);
						return;
					}

					setPostIsDeleted(true);
					showToast(`Removed ${count.posts} post and ${count.references} comments`);

					if (onPostRemove) onPostRemove({ postId: postId!, count });
				});
				break;
			}
			case "edit": {
				setPostActionEdit(true);
				break;
			}
			case "report": {
				setReportModalOpen(true);
				break;
			}
		}
	};
	const evPostOwnerClick = () =>
		!postActionIsOpen && !postIsDeleted && !postActionEdit && navigate(`/post/${post?._id!.toString()}`);

	const checkHasReaction = () =>
		postReactions?.find((reaction) => reaction.userId === user?._id!.toString()) !== undefined;
	const evPostReactionChange = () => {
		WebSocketClient.sendAndListenPromise<{ reactions: { userId: string; emoji: string }[] } & RequestSubData>({
			request: checkHasReaction() ? "USER_REACTIOM_REMOVE" : "USER_REACTION_ADD",
			data: {
				postId: post!._id!.toString(),
			},
			token,
		}).then(({ reactions, error }) => {
			if (error) {
				return showToast(error);
			}

			setPostReactions(reactions);
		});
	};
	const postVisibilityOptions = () => {
		const p = post as PostStandalone;

		if (p.visibility === "all") {
			return [
				{
					text: "Follower",
					data: "follower",
				},
				{
					text: "Self",
					data: "self",
				},
			];
		} else if (p.visibility === "follower") {
			return [
				{
					text: "Everyone",
					data: "all",
				},
				{
					text: "Self",
					data: "self",
				},
			];
		} else {
			return [
				{
					text: "Everyone",
					data: "all",
				},
				{
					text: "Follower",
					data: "follower",
				},
			];
		}
	};
	const evPostVisibilityChange = (visibility: "all" | "follower" | "self") => {
		if (post?._type === "reference" || !visibility) return;

		WebSocketClient.sendAndListenPromise<{ post: Post } & RequestSubData, Post>({
			request: "USER_POST_UPDATE",
			data: Object.assign(post!, { visibility }),
			token,
		}).then(({ post, error }) => {
			if (error) {
				return showToast(error);
			}

			setPost(post);
		});
	};

	// render
	useEffect(() => {
		WebSocketClient.sendAndListenPromise<{ post: Post } & RequestSubData>({
			request: "USER_POST_GET",
			data: {
				postId,
			},
			token,
		}).then(({ post, error }) => {
			if (error) {
				return showToast(`Failed to fetch post`);
			}
			setPost(post);
			setPostReactions(post.reactions ?? []);
			setPostNewContent(post.content ?? "");

			WebSocketClient.sendAndListenPromise<{ user: User }>({
				request: "USER_PROFILE_GET",
				data: {
					userId: post?.ownerId,
				},
				token,
			}).then(({ user }) => setPostOwner(user));

			// get post attachments
			if (post.attachments) {
				WebSocketClient.sendAndListenPromise<{ attachments: Attachment[] }>({
					request: "USER_ATTACHMENT_GET",
					data: {
						attachments: post.attachments,
					},
					token,
				}).then(({ attachments }) => {
					setPostAttachments(attachments);
				});
			}

			// get post referencing post
			if (post._type === "reference" && post.referenceId) {
				WebSocketClient.sendAndListenPromise<{ post: Post }>({
					request: "USER_POST_GET",
					data: {
						postId: post.referenceId,
					},
					token,
				}).then(({ post }) => {
					setReferencePost(post);

					WebSocketClient.sendAndListenPromise<{ user: User }>({
						request: "USER_PROFILE_GET",
						data: {
							userId: post.ownerId,
						},
						token,
					}).then(({ user }) => {
						setReferencePostOwner(user);
					});
				});
			}
		});
	}, [postId]);

	return post && postOwner ? (
		<IonCard onClick={evPostOwnerClick}>
			<IonCardHeader>
				<IonCardSubtitle>
					{post._type === "reference" && (
						<div style={{ marginBottom: 12, marginLeft: 16 }}>
							<IonIcon
								icon={returnUpForwardOutline}
								style={{ display: "inline-block", verticalAlign: "middle" }}
							/>{" "}
							<ComponentNavLink to={`/post/${post.referenceId}`}>
								@{referencePostOwner?.username}{" "}
								{referencePost
									?.content!.slice(0, 30)
									.padEnd(referencePost.content?.length! < 30 ? 0 : 33, ".")}
							</ComponentNavLink>
						</div>
					)}
					{postOwner ? (
						<ComponentNavLink to={`/user/${postOwner?._id?.toString()}`}>
							<div
								style={{
									height: "2.5rem",
									width: "2.5rem",
									borderRadius: "100%",
									overflow: "hidden",
									marginRight: 8,
									verticalAlign: "middle",
									display: "inline-block",
								}}>
								<IonImg src={postOwner?.avatarUrl ?? AppConfig.defaultAvatar} />
							</div>
							{postOwner?.displayName ?? postOwner?.username}
						</ComponentNavLink>
					) : (
						"Unknown"
					)}
					<span
						style={{
							marginLeft: 4,
							fontSize: ".66rem",
							lineHeight: "2.5rem",
						}}>
						{moment(post?.timestamp).fromNow()}
					</span>
					{post?._type === "standalone" && (
						<IonIcon
							style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 4, height: "2rem" }}
							onClick={(e) => {
								e.preventDefault();
								e.stopPropagation();
								if (post.ownerId === user?._id!.toString()) {
									setPostVisibilityToggleOpen(true);
								}
							}}
							icon={
								post.visibility === "all"
									? globeOutline
									: post.visibility === "follower"
									? peopleOutline
									: lockClosedOutline
							}
						/>
					)}
					{postOwner?._id?.toString() === user?._id!.toString() && !postIsDeleted && (
						<IonIcon
							onClick={(e) => {
								setPostActionIsOpen(true);
								e.stopPropagation();
							}}
							style={{ float: "right" }}
							icon={ellipsisVerticalOutline}
						/>
					)}
				</IonCardSubtitle>
			</IonCardHeader>
			<IonCardContent>
				{postActionEdit ? (
					<div>
						<IonTextarea
							fill="outline"
							value={postNewContent}
							onIonInput={({ detail }) => setPostNewContent(detail.value ?? "")}
							counter={true}
							maxlength={400}
							counterFormatter={(inputLength, maxLength) =>
								`${maxLength - inputLength} characters remaining`
							}
						/>
						<IonButton
							fill="clear"
							onClick={evPostEditSubmit}
							className="ion-float-right">
							Update
						</IonButton>
						<IonButton
							fill="clear"
							onClick={evPostEditCancel}
							className="ion-float-right">
							Cancel
						</IonButton>
					</div>
				) : (
					<>
						<p style={{ whiteSpace: "pre-line" }}>{post?.content}</p>

						{postAttachments.length > 0 && <CPostAttachments attachments={postAttachments} />}

						<div style={{ fontSize: 16, marginTop: 20, marginBottom: 48 }}>
							<span
								className="ion-float-left"
								onClick={(e) => {
									e.stopPropagation();
									evPostReactionChange();
								}}>
								<span style={{ display: "inline-block", verticalAlign: "middle" }}>
									{postReactions?.length ?? 0}{" "}
								</span>
								<IonIcon
									icon={checkHasReaction() ? heartDislikeOutline : heartOutline}
									style={{
										display: "inline-block",
										verticalAlign: "middle",
										marginLeft: 6,
										marginRight: 14,
									}}
								/>
							</span>
							<span className="ion-float-right">{post?._references?.length ?? 0} comments</span>
						</div>
					</>
				)}
			</IonCardContent>
			<IonActionSheet
				isOpen={postActionIsOpen}
				header="Post options"
				onIonActionSheetDidDismiss={(e) => {
					e.preventDefault();
					e.stopPropagation();
					setPostActionIsOpen(false);
					evPostActionDismiss(e.detail.data);
				}}
				buttons={[
					{
						text: "Delete",
						role: "destructive",
						data: {
							action: "delete",
						},
					},
					{
						text: "Edit",
						data: {
							action: "edit",
						},
					},
					{
						text: "Report",
						data: {
							action: "report",
						},
					},
				]}
			/>
			{post?._type === "standalone" && (
				<IonActionSheet
					isOpen={postVisibilityToggleOpen}
					header="Post visibility options"
					onIonActionSheetDidDismiss={(e) => {
						setPostVisibilityToggleOpen(false);
						evPostVisibilityChange(e.detail.data);
					}}
					buttons={postVisibilityOptions()}
				/>
			)}
			<ComponentReport
				modalOpen={reportModalOpen}
				modalClose={setReportModalOpen}
				contentId={post._id!.toString()}
			/>
		</IonCard>
	) : (
		<CPostSkeleton />
	);
};

const CPostAttachments: React.FC<{ attachments: Attachment[] }> = ({ attachments }) => (
	<>
		<IonGrid style={{ padding: 0 }}>
			<IonRow className="grid-scroll">
				{attachments.map((attachment) => (
					<IonCol
						key={attachment.filename}
						style={{ width: "300px", padding: 0 }}
						size="auto">
						<a
							style={{
								textDecoration: "none",
								color: "var(--ion-color-primary)",
								width: "100%",
							}}
							href={attachment.url}
							target="_blank">
							<ComponentAttachment
								attachment={attachment}
								onlyThumbnail={true}
							/>
						</a>
					</IonCol>
				))}
			</IonRow>
		</IonGrid>
		{attachments.map((attachment) => (
			<a
				style={{
					textDecoration: "none",
					color: "var(--ion-color-primary)",
					width: "100%",
				}}
				key={attachment.filename}
				href={attachment.url}
				target="_blank">
				<ComponentAttachment
					attachment={attachment}
					withThumbnail={false}
				/>
			</a>
		))}
	</>
);

const CPostSkeleton: React.FC = () => (
	<IonCard>
		<IonCardHeader>
			<IonCardSubtitle>
				<IonGrid style={{ margin: 0, padding: 0 }}>
					<IonRow>
						<IonCol
							size="auto"
							style={{ paddingLeft: 0 }}>
							<IonSkeletonText style={{ height: "2.5rem", width: "2.5rem", display: "inline-block" }} />
						</IonCol>
						<IonCol style={{ paddingRight: 0 }}>
							<IonSkeletonText style={{ height: "2.5rem", display: "inline-block" }} />
						</IonCol>
					</IonRow>
				</IonGrid>
			</IonCardSubtitle>
		</IonCardHeader>
		<IonCardContent>
			<IonSkeletonText />

			<IonSkeletonText style={{ marginTop: 8 }} />
		</IonCardContent>
	</IonCard>
);

export { CPost as ComponentPost };
