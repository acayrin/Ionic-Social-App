import {
	IonActionSheet,
	IonCard,
	IonCardContent,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonIcon,
} from "@ionic/react";
import { ellipsisVerticalOutline } from "ionicons/icons";
import moment from "moment";
import { useContext, useEffect, useState } from "react";
import { Post, Report, RequestSubData, User } from "../../../../shared/types";
import { ComponentNavLink } from "../../components/ui/NavLink";
import UIContext from "../../context/UIContext";
import UserContext from "../../context/UserContext";
import { WebSocketClient } from "../../websocket";

const CPReports: React.FC = () => {
	const { token } = useContext(UserContext)!;
	const { showToast } = useContext(UIContext);
	const [reports, setReports] = useState<Report[]>([]);

	useEffect(() => {
		WebSocketClient.sendAndListenPromise<{ reports: Report[] } & RequestSubData, undefined>({
			request: "USER_REPORTS_GET_ALL",
			data: undefined,
			token,
		}).then(({ reports, error }) => {
			if (error) {
				return showToast(error);
			}
			setReports(reports);
		});
	}, []);

	return (
		<>
			{reports.map((report) => (
				<CPReport
					key={report._id!.toString()}
					report={report}
				/>
			))}
		</>
	);
};

const CPReport: React.FC<{ report: Report }> = ({ report }) => {
	const { token, user } = useContext(UserContext)!;
	const { showToast } = useContext(UIContext);
	const [reportedContent, setReportedContent] = useState<Post | User>();
	const [reportActionOpen, setReportActionOpen] = useState(false);

	useEffect(() => {
		WebSocketClient.sendAndListenPromise({
			request: "USER_POST_GET",
			data: {
				postId: report.contentId,
			},
			token,
		}).then(({ post }) => {
			if (post) {
				return setReportedContent(post);
			}

			WebSocketClient.sendAndListenPromise({
				request: "USER_PROFILE_GET",
				data: {
					userId: report.contentId,
				},
				token,
			}).then(({ user }) => setReportedContent(user));
		});
	}, []);

	return (
		<IonCard>
			<IonCardHeader>
				<IonCardTitle
					style={{
						color: report.status === "resolved" ? "green" : report.status === "rejected" && "red",
					}}>
					Report - {report.status.toUpperCase()}
				</IonCardTitle>
				<IonCardSubtitle>
					{moment(report.timestamp).toISOString()}
					{user?._role !== "user" && (
						<IonIcon
							icon={ellipsisVerticalOutline}
							style={{ height: 16, width: 16, verticalAlign: "middle", display: "inline-blockk" }}
							className="ion-float-right"
							onClick={() => setReportActionOpen(true)}
						/>
					)}
				</IonCardSubtitle>
			</IonCardHeader>
			<IonCardContent>
				{(reportedContent as Post)?._type && (
					<p>
						Content:{" "}
						<ComponentNavLink to={`/post/${reportedContent!._id!.toString()}`}>a message</ComponentNavLink>
					</p>
				)}
				{(reportedContent as User)?.username && (
					<p>
						Content:{" "}
						<ComponentNavLink to={`/user/${reportedContent!._id!.toString()}`}>a user</ComponentNavLink>
					</p>
				)}
				<p>Reason:</p>
				{report.reason}
			</IonCardContent>
			<IonActionSheet
				isOpen={reportActionOpen}
				onIonActionSheetDidDismiss={(e) => {
					setReportActionOpen(false);

					if (!e.detail.data) return;
					report.status = e.detail.data;

					WebSocketClient.sendAndListenPromise({
						request: "USER_REPORTS_UPDATE",
						data: report,
						token,
					}).then(({ report, error }) => {
						if (error) {
							return showToast(error);
						}
					});
				}}
				header="Report options"
				buttons={[
					{
						text: "Set as Resolved",
						data: "resolved",
					},
					{
						text: "Set as Rejected",
						data: "rejected",
					},
					{
						text: "Set as Checking",
						data: "checking",
					},
				]}
			/>
		</IonCard>
	);
};

export { CPReports };
