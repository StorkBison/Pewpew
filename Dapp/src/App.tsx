import { useEffect, useMemo, useState } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { getPhantomWallet } from "@solana/wallet-adapter-wallets";
import { ReactNotifications } from "react-notifications-component";
import Page from "./pages/Page";
import "@solana/wallet-adapter-react-ui/styles.css";
import "react-notifications-component/dist/theme.css";
import Header from "./components/Header";
import Loader from "./components/Loading";
import { clusterApiUrl } from "@solana/web3.js";

export default function App() {
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(
    () =>
      "https://thrumming-few-moon.solana-mainnet.quiknode.pro/809b8feff806c69b919f71f9a4bf0085681dd09a/",
    [network]
  );
  const wallets = useMemo(() => [getPhantomWallet()], []);
  const [isLoading, setIsLoading] = useState(true);

  const check = () => {
    if (document.readyState === "complete") {
      setIsLoading(false);
    } else {
      window.addEventListener("load", () => setIsLoading(false));
      return () =>
        document.removeEventListener("load", () => setIsLoading(false));
    }
  };
  useEffect(() => {
    setTimeout(check, 3000);
  }, [isLoading === false]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ReactNotifications />
          {isLoading ? (
            <Loader />
          ) : (
            <>
              <Header /> <Page />{" "}
            </>
          )}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
