import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export default function WalletConnect(): JSX.Element {
  const wallet = useWallet();
  return (
    <WalletMultiButton>
      {!wallet.connected && "Connect Wallet"}
    </WalletMultiButton>
  );
}
