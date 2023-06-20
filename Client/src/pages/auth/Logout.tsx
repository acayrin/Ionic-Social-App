import { Preferences } from "@capacitor/preferences";
import { NavContext } from "@ionic/react";
import { useContext, useEffect } from "react";
import UserContext from "../../context/UserContext";

const Page: React.FC = () => {
	const { setToken } = useContext(UserContext)!;
	const { navigate } = useContext(NavContext);

	useEffect(() => {
		Preferences.remove({
			key: "whoami",
		}).then(() => {
			setToken("");
			navigate("/login");
		});
	});
	return <></>;
};

export { Page as PageLogout };
