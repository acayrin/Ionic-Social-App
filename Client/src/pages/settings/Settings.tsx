import { IonContent, IonHeader, IonPage, IonSegment, IonSegmentButton } from "@ionic/react";
import { ReactNode, useContext, useEffect, useState } from "react";
import UserContext from "../../context/UserContext";
import { CPNormal } from "./CPNormal";
import { CPReports } from "./CPReports";

const Page: React.FC = () => {
	const [page, setPage] = useState<ReactNode>();
	const [pageValue, setPageValue] = useState<any>("1");
	const { user } = useContext(UserContext)!;

	useEffect(() => {
		render("1");
	}, []);
	const render = (page: "1" | "2" | "3" | "4") => {
		setPageValue(page);

		if (page === "1") {
			setPage(<CPNormal />);
		} else if (page === "2") {
			setPage(<CPReports />);
		}
	};

	return (
		<IonPage>
			<IonContent>
				<IonHeader>
					<IonSegment
						scrollable={true}
						onIonChange={(e) => render(e.detail.value as any)}
						value={pageValue}>
						<IonSegmentButton
							value="1"
							style={{ fontSize: 12 }}>
							Account settings
						</IonSegmentButton>
						<IonSegmentButton
							value="2"
							style={{ fontSize: 12 }}>
							Reports
						</IonSegmentButton>
						{user?._role === "moderator" ||
							(user?._role === "administrator" && (
								<IonSegmentButton
									value="3"
									style={{ fontSize: 12 }}>
									Moderation
								</IonSegmentButton>
							))}
						{user?._role === "administrator" && (
							<IonSegmentButton
								value="4"
								style={{ fontSize: 12 }}>
								Administrator
							</IonSegmentButton>
						)}
					</IonSegment>
				</IonHeader>
				{page}
			</IonContent>
		</IonPage>
	);
};
export { Page as PageSettings };
