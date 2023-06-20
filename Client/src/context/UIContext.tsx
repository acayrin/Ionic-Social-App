import { IonContent, IonToast } from "@ionic/react";
import React, { ReactNode, useMemo } from "react";

export const UIContext = React.createContext<{
	showTabs: boolean;
	setShowTabs: React.Dispatch<React.SetStateAction<boolean>>;
	windowTitle: string;
	setWindowTitle: React.Dispatch<React.SetStateAction<string>>;
	showToast: (message: string) => void;
}>({} as any);
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [showTabs, setShowTabs] = React.useState(true);
	const [windowTitle, setWindowTitle] = React.useState("");

	const [toastIsOpen, setToastIsOpen] = React.useState(false);
	const [toastMessage, setToastMessage] = React.useState("");

	const showToast = (message: string) => {
		setToastIsOpen(true);
		setToastMessage(message);
	};

	const state = useMemo(
		() => ({
			showTabs,
			setShowTabs,
			windowTitle,
			setWindowTitle,
			showToast,
		}),
		undefined
	);

	React.useEffect(() => {
		document.title = windowTitle;
	}, [windowTitle]);

	return (
		<UIContext.Provider value={state}>
			<IonToast
				duration={2500}
				isOpen={toastIsOpen}
				onIonToastDidDismiss={() => setToastIsOpen(false)}
				message={toastMessage}
			/>
			{children}
		</UIContext.Provider>
	);
};

export default UIContext;
