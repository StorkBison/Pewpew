import * as anchor from "@project-serum/anchor";
import { Connection, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  programId,
  confirmOption,
  collection,
  TOKEN_METADATA_PROGRAM_ID,
  creatorSigner,
} from "../constants/constants";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintLayout,
  Token,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import IDL from "../constants/idl";

export async function mintFuel(
  connection: Connection,
  wallet: any,
  amount: number
) {
  let data = {
    name: "PewPewShip #1",
    symbol: "PEWPEWSHIP",
    uri: "res",
    sellerFeeBasisPoints: 300,
    creators: [
      {
        address: new anchor.web3.PublicKey(
          "HzMy94dee8ibBzon4gswHsnZeBHYfEpVYQvEMNqV82yW"
        ),
        verified: false,
        share: 100,
      },
    ],
    isMutable: true,
    collection: "PewpewShip",
  };
  const provider = new anchor.Provider(
    connection,
    wallet as any,
    confirmOption
  );
  const program = new anchor.Program(IDL as any, programId, provider);

  let bulkinstructions = [];
  let signerSet = [];

  for (var i = 0; i < amount; i++) {
    let instructions = [];
    const mint = anchor.web3.Keypair.generate();
    const mintRent = await connection.getMinimumBalanceForRentExemption(
      MintLayout.span
    );
    instructions.push(
      anchor.web3.SystemProgram.createAccount({
        fromPubkey: wallet.publicKey!,
        newAccountPubkey: mint.publicKey,
        lamports: mintRent,
        space: MintLayout.span,
        programId: TOKEN_PROGRAM_ID,
      })
    );
    instructions.push(
      Token.createInitMintInstruction(
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        0,
        wallet.publicKey!,
        wallet.publicKey!
      )
    );
    let ata = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint.publicKey,
      wallet.publicKey!
    );
    instructions.push(
      Token.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint.publicKey,
        ata,
        wallet.publicKey!,
        wallet.publicKey!
      )
    );
    let metadata = (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];
    let master_edition = (
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("metadata"),
          TOKEN_METADATA_PROGRAM_ID.toBuffer(),
          mint.publicKey.toBuffer(),
          Buffer.from("edition"),
        ],
        TOKEN_METADATA_PROGRAM_ID
      )
    )[0];

    instructions.push(
      program.instruction.mintShip(data, {
        accounts: {
          owner: wallet.publicKey!,
          collection: collection,
          creatorSigner: creatorSigner,
          mint: mint.publicKey,
          tokenAccount: ata,
          metadata: metadata,
          masterEdition: master_edition,
          tokenMetadataProgram: TOKEN_METADATA_PROGRAM_ID,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: anchor.web3.SystemProgram.programId,
          rent: SYSVAR_RENT_PUBKEY,
        },
      })
    );

    bulkinstructions.push(instructions);
    signerSet.push([mint]);
  }

  await sendTransactions(
    connection,
    wallet,
    bulkinstructions,
    signerSet
  );
}

export enum SequenceType {
  Sequential,
  Parallel,
  StopOnFailure,
}

interface BlockhashAndFeeCalculator {
  blockhash: anchor.web3.Blockhash;
  feeCalculator: anchor.web3.FeeCalculator;
}

export const sendTransactions = async (
  connection: Connection,
  wallet: any,
  instructionSet: anchor.web3.TransactionInstruction[][],
  signersSet: anchor.web3.Keypair[][],
  sequenceType: SequenceType = SequenceType.Parallel,
  commitment: anchor.web3.Commitment = "singleGossip",
  block?: BlockhashAndFeeCalculator
): Promise<string[] | number> => {
  if (!wallet.publicKey) throw new WalletNotConnectedError();

  const unsignedTxns: anchor.web3.Transaction[] = [];

  if (!block) {
    block = await connection.getRecentBlockhash(commitment);
  }

  for (let i = 0; i < instructionSet.length; i++) {
    const instructions = instructionSet[i];
    const signers = signersSet[i];

    if (instructions.length === 0) {
      continue;
    }

    let transaction = new anchor.web3.Transaction();
    instructions.forEach((instruction) => transaction.add(instruction));
    transaction.recentBlockhash = block.blockhash;
    transaction.setSigners(
      // fee payed by the wallet owner
      wallet.publicKey,
      ...signers.map((s) => s.publicKey)
    );

    if (signers.length > 0) {
      transaction.partialSign(...signers);
    }

    unsignedTxns.push(transaction);
  }

  const signedTxns = await wallet.signAllTransactions(unsignedTxns);

  const pendingTxns: Promise<{ txid: string; slot: number }>[] = [];

  let breakEarlyObject = { breakEarly: false, i: 0 };
  // console.log(
  //   'Signed txns length',
  //   signedTxns.length,
  //   'vs handed in length',
  //   instructionSet.length,
  // );

  const txIds = [];
  for (let i = 0; i < signedTxns.length; i++) {
    const signedTxnPromise = sendSignedTransaction({
      connection,
      signedTransaction: signedTxns[i],
    });

    try {
      const { txid } = await signedTxnPromise;
      txIds.push(txid);
    } catch (error) {
      // console.error(error)
      // @ts-ignore
      failCallback(signedTxns[i], i);
      if (sequenceType === SequenceType.StopOnFailure) {
        breakEarlyObject.breakEarly = true;
        breakEarlyObject.i = i;
      }
    }

    if (sequenceType !== SequenceType.Parallel) {
      try {
        await signedTxnPromise;
      } catch (e) {
        console.log("Caught failure", e);
        if (breakEarlyObject.breakEarly) {
          console.log("Died on ", breakEarlyObject.i);
          return breakEarlyObject.i; // Return the txn we failed on by index
        }
      }
    } else {
      pendingTxns.push(signedTxnPromise);
    }
  }

  if (sequenceType !== SequenceType.Parallel) {
    await Promise.all(pendingTxns);
  }

  return txIds;
};
export const getUnixTs = () => {
  return new Date().getTime() / 1000;
};

const DEFAULT_TIMEOUT = 15000;

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendSignedTransaction({
  signedTransaction,
  connection,
  timeout = DEFAULT_TIMEOUT,
}: {
  signedTransaction: anchor.web3.Transaction;
  connection: Connection;
  sendingMessage?: string;
  sentMessage?: string;
  successMessage?: string;
  timeout?: number;
}): Promise<{ txid: string; slot: number }> {
  const rawTransaction = signedTransaction.serialize();
  const startTime = getUnixTs();
  let slot = 0;
  const txid: anchor.web3.TransactionSignature =
    await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
    });

  // console.log('Started awaiting confirmation for', txid);

  let done = false;
  (async () => {
    while (!done && getUnixTs() - startTime < timeout) {
      connection.sendRawTransaction(rawTransaction, {
        skipPreflight: true,
      });
      await sleep(500);
    }
  })();
  try {
    const confirmation = await awaitTransactionSignatureConfirmation(
      txid,
      timeout,
      connection,
      "recent",
      true
    );

    if (!confirmation)
      throw new Error("Timed out awaiting confirmation on transaction");

    if (confirmation.err) {
      console.error(confirmation.err);
      throw new Error("Transaction failed: Custom instruction error");
    }

    slot = confirmation?.slot || 0;
  } catch (err: any) {
    console.error("Timeout Error caught", err);
    if (err.timeout) {
      throw new Error("Timed out awaiting confirmation on transaction");
    }
    let simulateResult: anchor.web3.SimulatedTransactionResponse | null = null;
    try {
      simulateResult = (
        await simulateTransaction(connection, signedTransaction, "single")
      ).value;
    } catch (e) {}
    if (simulateResult && simulateResult.err) {
      if (simulateResult.logs) {
        for (let i = simulateResult.logs.length - 1; i >= 0; --i) {
          const line = simulateResult.logs[i];
          if (line.startsWith("Program log: ")) {
            throw new Error(
              "Transaction failed: " + line.slice("Program log: ".length)
            );
          }
        }
      }
      throw new Error(JSON.stringify(simulateResult.err));
    }
    // throw new Error('Transaction failed');
  } finally {
    done = true;
  }

  // console.log('Latency', txid, getUnixTs() - startTime);
  return { txid, slot };
}

async function awaitTransactionSignatureConfirmation(
  txid: anchor.web3.TransactionSignature,
  timeout: number,
  connection: Connection,
  commitment: anchor.web3.Commitment = "recent",
  queryStatus = false
): Promise<anchor.web3.SignatureStatus | null | void> {
  let done = false;
  let status: anchor.web3.SignatureStatus | null | void = {
    slot: 0,
    confirmations: 0,
    err: null,
  };
  let subId = 0;
  status = await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      if (done) {
        return;
      }
      done = true;
      // console.log('Rejecting for timeout...');
      reject({ timeout: true });
    }, timeout);
    try {
      subId = connection.onSignature(
        txid,
        (result, context) => {
          done = true;
          status = {
            err: result.err,
            slot: context.slot,
            confirmations: 0,
          };
          if (result.err) {
            // console.log('Rejected via websocket', result.err);
            reject(status);
          } else {
            // console.log('Resolved via websocket', result);
            resolve(status);
          }
        },
        commitment
      );
    } catch (e) {
      done = true;
      console.error("WS error in setup", txid, e);
    }
    while (!done && queryStatus) {
      // eslint-disable-next-line no-loop-func
      (async () => {
        try {
          const signatureStatuses = await connection.getSignatureStatuses([
            txid,
          ]);
          status = signatureStatuses && signatureStatuses.value[0];
          if (!done) {
            if (!status) {
              // console.log('REST null result for', txid, status);
            } else if (status.err) {
              // console.log('REST error for', txid, status);
              done = true;
              reject(status.err);
            } else if (!status.confirmations) {
              // console.log('REST no confirmations for', txid, status);
            } else {
              // console.log('REST confirmation for', txid, status);
              done = true;
              resolve(status);
            }
          }
        } catch (e) {
          if (!done) {
            // console.log('REST connection error: txid', txid, e);
          }
        }
      })();
      await sleep(2000);
    }
  });

  //@ts-ignore
  if (connection._signatureSubscriptions[subId])
    connection.removeSignatureListener(subId);
  done = true;
  // console.log('Returning status', status);
  return status;
}

async function simulateTransaction(
  connection: Connection,
  transaction: anchor.web3.Transaction,
  commitment: anchor.web3.Commitment
): Promise<
  anchor.web3.RpcResponseAndContext<anchor.web3.SimulatedTransactionResponse>
> {
  // @ts-ignore
  transaction.recentBlockhash = await connection._recentBlockhash(
    // @ts-ignore
    connection._disableBlockhashCaching
  );

  const signData = transaction.serializeMessage();
  // @ts-ignore
  const wireTransaction = transaction._serialize(signData);
  const encodedTransaction = wireTransaction.toString("base64");
  const config: any = { encoding: "base64", commitment };
  const args = [encodedTransaction, config];

  // @ts-ignore
  const res = await connection._rpcRequest("simulateTransaction", args);
  if (res.error) {
    throw new Error("failed to simulate transaction: " + res.error.message);
  }
  return res.result;
}

export const updateQuanities = async (conn: any, wallet: any) => {
  const provider = new anchor.Provider(conn, wallet, confirmOption);
  const program = new anchor.Program(IDL as any, programId, provider);
  const txId = await program.rpc.updateQuanities(new anchor.BN(1777078000), {
    accounts: {
      owner: wallet.publicKey!,
      collection: collection,
    },
  });
  return null;
};

export const getCollectionInfo = async (conn: any, wallet: any) => {
  const provider = new anchor.Provider(conn, wallet, confirmOption);
  const program = new anchor.Program(IDL as any, programId, provider);
  const res = await program.account.collection.fetch(collection);
  console.log(
    res.startTime * 1,
    res.supply * 1,
    res.csupply * 1,
    res.canisterWritten * 1
  );
};
