import {
  HydrationBoundary,
  QueryClient,
  QueryClientProvider,
  type DehydratedState,
} from "@tanstack/react-query";
import { type AppType } from "next/dist/shared/lib/utils";
import { useState } from "react";
import "~/styles/globals.css";

const MyApp: AppType<{ dehydratedState: DehydratedState }> = ({
  Component,
  pageProps,
}) => {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <HydrationBoundary state={pageProps.dehydratedState}>
        <Component {...pageProps} />
      </HydrationBoundary>
    </QueryClientProvider>
  );
};

export default MyApp;
