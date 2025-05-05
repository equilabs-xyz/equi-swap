// src/main.tsx
import ReactDOM from "react-dom/client";
import "./index.css";

import "@solana/wallet-adapter-react-ui/styles.css";
import "@/lib/i18n";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";

import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from "@solana/wallet-adapter-wallets";

const endpoint = "https://api.mainnet-beta.solana.com";

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()];
import { ThemeProvider } from "@/components/theme-provider";

import TabbedLayout from "@/layout/TabbedLayout";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <TabbedLayout />
            <Toaster richColors position="top-right" />
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  </QueryClientProvider>,
  // </React.StrictMode>
);
