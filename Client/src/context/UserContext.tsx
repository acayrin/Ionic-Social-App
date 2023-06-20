import React, { ReactNode } from "react";
import { User } from "../../../shared/types";
import { WebSocketClient } from "../websocket";

export const UserContext = React.createContext<
	| {
			token: string | undefined;
			setToken: React.Dispatch<React.SetStateAction<string | undefined>>;
			user: User | undefined;
			setUser: React.Dispatch<React.SetStateAction<User | undefined>>;
	  }
	| undefined
>(undefined);
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [token, setToken] = React.useState<string | undefined>();
	const [user, setUser] = React.useState<User | undefined>();

	React.useEffect(() => {
		WebSocketClient.sendAndListenPromise({
			request: "USER_PROFILE_GET",
			data: undefined,
			token,
		}).then(({ user }) => setUser(user));
	}, [token]);

	const state = React.useMemo(
		() => ({
			token,
			setToken,
			user,
			setUser,
		}),
		undefined
	);

	return <UserContext.Provider value={state}>{children}</UserContext.Provider>;
};

export default UserContext;
