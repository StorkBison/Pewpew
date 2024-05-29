import * as anchor from "@project-serum/anchor";

export const programId = new anchor.web3.PublicKey(
  "2wF4b65uTbnmP6hamyPWPU8qEF6kYpMhtCUP1HFzXR1G"
);
export const collection = new anchor.web3.PublicKey(
  "4xUot9XNkV38aup3rAAU2C8Wbo62p5BZozqG9YEtR26f" //"HoNaArAZ2Q5EbdvCVVrty3FZQhYkj1wBhqtSUUwfDcVQ"
);

export const fuelCreator = new anchor.web3.PublicKey(
  "EWGGFvW4bHsQMVP4V4p6GvqUJH7rKhq9wgtBmKdtvS5f"
);

export const creatorSigner = new anchor.web3.PublicKey(
  "8tWbqcXkX7vjxT9zo43WWRKxyyWa2X398tpMkGiJRG3r" // "8bT1cDpiYKCQBiKY46nWroLhQWVp1Bog4fhjSMPzHVpP"
);

export const TOKEN_METADATA_PROGRAM_ID = new anchor.web3.PublicKey(
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
);

export const confirmOption: anchor.web3.ConfirmOptions = {
  commitment: "finalized",
  preflightCommitment: "finalized",
  skipPreflight: false,
};

export const GLOBAL_SIZE = 8 + 32 * 4 + 8 * 8 + 1;
export const COLLECTION_DATA_SIZE = 280648;
