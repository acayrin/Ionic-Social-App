import { NavContext } from "@ionic/react";
import React from "react";

const NavLink: React.FC<{ children: React.ReactNode; to: string }> = ({ children, to }) => {
	const { navigate } = React.useContext(NavContext);

	return (
		<a
			style={{ color: "var(--ion-color-primary)" }}
			onClickCapture={(e) => {
				e.stopPropagation();
				e.preventDefault();
				navigate(to);
			}}>
			{children}
		</a>
	);
};

export { NavLink as ComponentNavLink };
