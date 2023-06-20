import { FilePicker, PickedFile } from "@capawesome/capacitor-file-picker";
import {
	InputChangeEventDetail,
	IonButton,
	IonCard,
	IonCardContent,
	IonCol,
	IonGrid,
	IonIcon,
	IonRow,
	IonTextarea,
} from "@ionic/react";
import { closeOutline, fileTrayFullOutline } from "ionicons/icons";
import { useContext, useRef, useState } from "react";
import AppConfig from "../../../../shared/config";
import { Attachment, Post, RequestSubData } from "../../../../shared/types";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const CPostCreate: React.FC<{ placeholder?: string; referenceId?: string; onPostCreate?: (post: Post) => unknown }> = ({
	placeholder,
	referenceId,
	onPostCreate,
}) => {
	const { token, user } = useContext(UserContext)!;
	const { showToast } = useContext(UIContext);

	const [postContent, setPostContent] = useState<string>("");
	const [uploadList, setUploadList] = useState<PickedFile[]>([]);

	const refTextarea = useRef<HTMLIonTextareaElement>(null);
	const refBtnStatus = useRef<HTMLIonButtonElement>(null);

	const createPost = (attachments?: Attachment[]) => {
		if (uploadList.length === 0 && postContent.length === 0) {
			refBtnStatus.current!.disabled = false;

			return showToast("Post cannot be empty");
		}

		WebSocketClient.sendAndListenPromise<{ post: Post } & RequestSubData, Post>({
			request: "USER_POST_CREATE",
			token,
			data: referenceId
				? {
						_type: "reference",
						referenceId,
						ownerId: user!._id!.toString(),
						content: postContent,
						timestamp: Date.now(),
						attachments: attachments?.map((atm) => atm._id!.toString()) ?? [],
				  }
				: {
						_type: "standalone",
						visibility: "all",
						ownerId: user!._id!.toString(),
						content: postContent,
						timestamp: Date.now(),
						attachments: attachments?.map((atm) => atm._id!.toString()) ?? [],
				  },
		}).then(({ post, error }) => {
			if (error) {
				return showToast(error);
			}

			setPostContent("");
			setUploadList([]);
			refTextarea.current!!.value = "";
			refBtnStatus.current!!.disabled = false;

			if (onPostCreate) onPostCreate(post);
		});
	};

	// input change event handler
	const evPostContentChange = ({ value }: InputChangeEventDetail) => setPostContent(value ?? "");
	const evPostSubmit = () => {
		refBtnStatus.current!!.disabled = true;

		if (uploadList.length > 0) {
			WebSocketClient.sendAndListenPromise<
				{ attachments: Attachment[] } & RequestSubData,
				{ files: PickedFile[] }
			>({
				request: "USER_ATTACHMENT_ADD",
				data: {
					files: uploadList,
				},
				token,
			}).then(({ attachments, error }) => {
				if (error) {
					return showToast(error);
				}

				createPost(attachments);
			});
		} else {
			createPost();
		}
	};
	const evPostAttachmentSelect = () => {
		FilePicker.pickFiles({
			multiple: true,
			readData: true,
		}).then(({ files }) => {
			if (files.length > AppConfig.attachments.maxAmount) {
				files = files.slice(0, AppConfig.attachments.maxAmount);
				showToast(`Maximum upload is ${AppConfig.attachments.maxAmount}`);
			}
			setUploadList(
				files.filter((file) => {
					if (AppConfig.attachments.deniedMimeTypes.includes(file.mimeType)) {
						showToast(`${file.name} unsupported file upload`);
						return false;
					}
					if (file.size > AppConfig.attachments.maxSize) {
						showToast(`${file.name} is larger than 25Mb limit`);
						return false;
					}
					return true;
				})
			);
		});
	};

	return (
		<IonCard>
			<IonCardContent>
				<IonTextarea
					ref={refTextarea}
					label={placeholder ?? "What's in your mind?"}
					labelPlacement="floating"
					fill="outline"
					onIonInput={({ detail }) => evPostContentChange(detail)}
					counter={true}
					maxlength={400}
					counterFormatter={(inputLength, maxLength) => `${maxLength - inputLength} characters remaining`}
				/>
				<IonGrid style={{ padding: 0, margin: -4, marginTop: 10, marginBottom: -8 }}>
					<IonRow>
						<IonCol style={{ padding: 0, margin: 0 }}>
							<IonButton
								fill="clear"
								onClick={evPostAttachmentSelect}>
								<IonIcon icon={fileTrayFullOutline} />
							</IonButton>
						</IonCol>
						<IonCol
							style={{ padding: 0, margin: 0 }}
							size="auto">
							<IonButton
								ref={refBtnStatus}
								onClick={evPostSubmit}
								fill="clear">
								Post
							</IonButton>
						</IonCol>
					</IonRow>
				</IonGrid>
				{uploadList.length > 0 && (
					<div style={{ marginTop: 12, marginBottom: 4 }}>
						{uploadList.map((upload, index) => (
							<IonCard
								key={upload.name}
								style={{
									margin: 0,
									marginBottom: 4,
									border: "1px solid var(--ion-color-light-tint)",
								}}>
								<IonCardContent>
									{upload.name.slice(0, 24).padEnd(upload.name.length < 24 ? 0 : 27, ".")}{" "}
									<span className="ion-float-right">
										{(upload.size / 1024).toFixed(2)}Kb
										<IonIcon
											onClick={() => {
												const list = [...uploadList];
												uploadList.splice(index, 1);
												list.splice(index, 1);
												setUploadList(list);
											}}
											icon={closeOutline}
											style={{
												marginLeft: 4,
												height: 20,
												width: 20,
												color: "red",
												display: "inline-block",
												verticalAlign: "middle",
											}}
										/>
									</span>
								</IonCardContent>
							</IonCard>
						))}
					</div>
				)}
			</IonCardContent>
		</IonCard>
	);
};

export { CPostCreate as ComponentPostCreate };
