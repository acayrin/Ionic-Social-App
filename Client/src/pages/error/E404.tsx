import {
	IonCard,
	IonCardHeader,
	IonCardSubtitle,
	IonCardTitle,
	IonImg,
	IonSkeletonText,
	NavContext,
} from "@ionic/react";
import { useContext } from "react";
import "./auth/Auth.css";

const E404: React.FC = () => {
	document.title = "Error | 404";

	const { navigate } = useContext(NavContext);
	setTimeout(() => {
		navigate("/");
	}, 3e3);

	return (
		<div className="card-container">
			<IonCard className="card">
				<IonCardHeader className="card-header">
					<IonCardTitle>
						<IonImg
							className="card-logo"
							src="https://media.discordapp.net/attachments/1062430575438344264/1119141610878410812/168689454478416718.png">
							<IonSkeletonText />
						</IonImg>
						<h1>404</h1>
					</IonCardTitle>
					<IonCardSubtitle>That doesn't look right</IonCardSubtitle>
				</IonCardHeader>
			</IonCard>
		</div>
	);
};

export { E404 as PageError404 };
