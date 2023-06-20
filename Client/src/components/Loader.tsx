import { IonCard, IonCardContent, IonSpinner } from "@ionic/react";

const CLoader: React.FC = () => (
	<IonCard>
		<IonCardContent style={{ textAlign: "center" }}>
			<IonSpinner name="circular" />
		</IonCardContent>
	</IonCard>
);

export { CLoader as ComponentLoader };
