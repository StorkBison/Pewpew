import { useState, useEffect } from "react";
import * as anchor from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import IDL from "../constants/idl";
import { programId, confirmOption, collection } from "../constants/constants";

function useCollection(connect: Connection) {
  const [wallet, _] = useState(anchor.web3.Keypair.generate());
  const provider = new anchor.Provider(connect, wallet as any, confirmOption);
  const [supply, setSupply] = useState(0);
  const [csupply, setCSupply] = useState(0);
  const [starts, setStart] = useState(0);

  const program = new anchor.Program(IDL as any, programId, provider);
  useEffect(() => {
    (async () => {
      const res = await program.account.collection.fetch(collection);
      setSupply(res.supply);
      setCSupply(res.csupply);
      setStart(res.startTime);
    })();
  });

  return {
    supply: supply,
    csupply: csupply,
    starts,
  };
}

export default useCollection;
