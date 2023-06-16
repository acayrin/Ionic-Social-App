import React, { ReactNode, useMemo } from "react";

export const UIContext = React.createContext<any>(undefined);
export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [showTabs, setShowTabs] = React.useState(true);
	const state = useMemo(
		() => ({
			showTabs,
			setShowTabs,
		}),
		[showTabs]
	);

	return <UIContext.Provider value={state}>{children}</UIContext.Provider>;
};

export default UIContext;
