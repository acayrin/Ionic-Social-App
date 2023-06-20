import {
	IonButton,
	IonCard,
	IonCardContent,
	IonContent,
	IonHeader,
	IonInput,
	IonItem,
	IonItemGroup,
	IonLabel,
	IonModal,
	IonTextarea,
	IonTitle,
	IonToolbar,
} from "@ionic/react";
import { useContext, useState } from "react";
import { RequestSubData } from "../../../../shared/types";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const CReport: React.FC<{
	contentId?: string;
	modalOpen: boolean;
	modalClose: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ contentId, modalOpen, modalClose }) => {
	const { user, token } = useContext(UserContext)!;
	const { showToast } = useContext(UIContext);

	const [reportReason, setReportReason] = useState("");
	const reportSubmit = () => {
		WebSocketClient.sendAndListenPromise<
			{ report: TemplateStringsArray } & RequestSubData,
			{ contentId: string; reason: string }
		>({
			request: "USER_REPORTS_ADD",
			data: {
				contentId: contentId!,
				reason: reportReason,
			},
			token,
		}).then(({ report, error }) => {
			if (error) {
				return showToast(error);
			}

			showToast(`Created report ${report}`);
			modalClose(false);
		});

		modalClose(false);
	};

	return (
		<IonModal isOpen={modalOpen}>
			<IonHeader>
				<IonToolbar>
					<IonTitle>Report</IonTitle>
					<IonButton
						slot="end"
						onClick={() => modalClose(false)}>
						Close
					</IonButton>
				</IonToolbar>
			</IonHeader>
			<IonContent>
				<IonCard>
					<IonCardContent>
						<IonItemGroup>
							<IonItem>
								<IonLabel>Content ID</IonLabel>
								<IonInput
									disabled={true}
									value={contentId}
								/>
							</IonItem>
							<IonItem>
								<IonLabel>Reporter ID</IonLabel>
								<IonInput
									disabled={true}
									value={user!._id!.toString()}
								/>
							</IonItem>
							<IonItem>
								<IonTextarea
									label="Reason"
									labelPlacement="floating"
									placeholder="Please state your reason"
									style={{ height: 300 }}
									onIonInput={(e) => setReportReason(e.detail.value!)}
								/>
							</IonItem>
							<IonItem>
								<IonButton onClick={reportSubmit}>Submit</IonButton>
							</IonItem>
						</IonItemGroup>
					</IonCardContent>
				</IonCard>
			</IonContent>
		</IonModal>
	);
};

export { CReport as ComponentReport };
