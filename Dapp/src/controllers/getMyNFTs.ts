import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { programs } from "@metaplex/js";
import { TOKEN_METADATA_PROGRAM_ID, fuelCreator } from "../constants/constants";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

const {
  metadata: { Metadata },
} = programs;

async function getMyNFTs(connect: Connection, wallet: WalletContextState) {
  const allTokens: any[] = [];
  const tokenAccounts = await connect.getParsedTokenAccountsByOwner(
    wallet.publicKey!,
    { programId: TOKEN_PROGRAM_ID }
  );
  for (let index = 0; index < tokenAccounts.value.length; index++) {
    try {
      const tokenAccount = tokenAccounts.value[index];
      const tokenAmount = tokenAccount.account.data.parsed.info.tokenAmount;
      if (tokenAmount.uiAmount === 1 && tokenAmount.decimals === 0) {
        let mint = new anchor.web3.PublicKey(
          tokenAccount.account.data.parsed.info.mint
        );
        let [pda] = await anchor.web3.PublicKey.findProgramAddress(
          [
            Buffer.from("metadata"),
            TOKEN_METADATA_PROGRAM_ID.toBuffer(),
            mint.toBuffer(),
          ],
          TOKEN_METADATA_PROGRAM_ID
        );

        let accountInfo: any = await connect.getParsedAccountInfo(pda);
        let metadata = new Metadata(
          wallet.publicKey?.toString()!,
          accountInfo.value
        );
        if (metadata.data.data.creators![0].address !== fuelCreator.toBase58())
          continue;

        await fetch(metadata.data.data.uri)
          .then((resp) => resp.json())
          .then((json) => {
            allTokens.push({
              mint: mint,
              account: tokenAccount.pubkey,
              quanity:
                json.attributes.find((o: any) => o.trait_type === "Quantity")
                  .value === "Full"
                  ? 4
                  : 1,
            });
          })
          .catch((error) => console.log(error));
      }
    } catch (e) {
      console.log(e);
      continue;
    }
  }
  allTokens.sort((a, b) => b.quanity - a.quanity);
  return allTokens;
}

export default getMyNFTs;
