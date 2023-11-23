import {ReactNode} from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";


const queryCleint = new QueryClient();

export const QueryProvider = ({ children }: {children: ReactNode}) => {
	return (
			<QueryClientProvider client={queryCleint}>
				{children}
			</QueryClientProvider>
	);
};