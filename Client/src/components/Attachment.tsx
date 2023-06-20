import { IonCard, IonCardContent } from "@ionic/react";
import { Attachment } from "../../../shared/types";

const CAttachment: React.FC<{ attachment: Attachment; withThumbnail?: boolean; onlyThumbnail?: boolean }> = ({
	attachment,
	withThumbnail,
	onlyThumbnail,
}) => (
	<div style={{width: "100%"}}>
		{(withThumbnail || onlyThumbnail) &&
			(attachment.filename.endsWith(".png") ||
				attachment.filename.endsWith(".jpg") ||
				attachment.filename.endsWith(".jpeg") ||
				attachment.filename.endsWith(".gif")) && (
				<img
					src={attachment.url}
					height="auto"
					width="100%"
				/>
			)}
		{!onlyThumbnail && (
			<IonCard
				style={{
					margin: 0,
					marginBottom: 4,
					border: "1px solid var(--ion-color-light-tint)",
				}}>
				<IonCardContent>
					<span
						style={{
							color: "var(--ion-color-primary)",
						}}>
						{attachment.filename}
					</span>{" "}
					<span className="ion-float-right">{(attachment.size / 1024).toFixed(2)}Kb</span>
				</IonCardContent>
			</IonCard>
		)}
	</div>
);

export { CAttachment as ComponentAttachment };
