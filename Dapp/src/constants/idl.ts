const IDL = {
  version: "0.1.0",
  name: "pewpewship",
  instructions: [
    {
      name: "initShipCollection",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rand",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "bump",
          type: "u8",
        },
        {
          name: "quanities",
          type: {
            vec: {
              defined: "Quanities",
            },
          },
        },
      ],
    },
    {
      name: "insertQuanities",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "quanities",
          type: {
            vec: {
              defined: "Quanities",
            },
          },
        },
      ],
    },
    {
      name: "updateQuanities",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "startTime",
          type: "i64",
        },
      ],
    },
    {
      name: "mintShip",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
        {
          name: "creatorSigner",
          isMut: false,
          isSigner: false,
        },
        {
          name: "mint",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenAccount",
          isMut: true,
          isSigner: false,
        },
        {
          name: "metadata",
          isMut: true,
          isSigner: false,
        },
        {
          name: "masterEdition",
          isMut: true,
          isSigner: false,
        },
        {
          name: "tokenMetadataProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "tokenProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
        {
          name: "rent",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "data",
          type: {
            defined: "Metadata",
          },
        },
      ],
    },
    {
      name: "closeAccount",
      accounts: [
        {
          name: "owner",
          isMut: true,
          isSigner: true,
        },
        {
          name: "collection",
          isMut: true,
          isSigner: false,
        },
      ],
      args: [],
    },
  ],
  accounts: [
    {
      name: "Collection",
      type: {
        kind: "struct",
        fields: [
          {
            name: "owner",
            type: "publicKey",
          },
          {
            name: "creatorSigner",
            type: "publicKey",
          },
          {
            name: "rand",
            type: "publicKey",
          },
          {
            name: "supply",
            type: "u64",
          },
          {
            name: "csupply",
            type: "u64",
          },
          {
            name: "canisterWritten",
            type: "u64",
          },
          {
            name: "startTime",
            type: "i64",
          },
          {
            name: "bump",
            type: "u8",
          },
          {
            name: "canisterMintkeys",
            type: {
              array: ["publicKey", 8500],
            },
          },
          {
            name: "canisterQuanities",
            type: {
              array: ["u8", 8500],
            },
          },
        ],
      },
    },
  ],
  types: [
    {
      name: "Quanities",
      type: {
        kind: "struct",
        fields: [
          {
            name: "mint",
            type: "publicKey",
          },
          {
            name: "value",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "Creator",
      type: {
        kind: "struct",
        fields: [
          {
            name: "address",
            type: "publicKey",
          },
          {
            name: "verified",
            type: "bool",
          },
          {
            name: "share",
            type: "u8",
          },
        ],
      },
    },
    {
      name: "Metadata",
      type: {
        kind: "struct",
        fields: [
          {
            name: "name",
            type: "string",
          },
          {
            name: "symbol",
            type: "string",
          },
          {
            name: "uri",
            type: "string",
          },
          {
            name: "sellerFeeBasisPoints",
            type: "u16",
          },
          {
            name: "creators",
            type: {
              vec: {
                defined: "Creator",
              },
            },
          },
          {
            name: "isMutable",
            type: "bool",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "TokenMintToFailed",
      msg: "Token mint to failed",
    },
    {
      code: 6001,
      name: "TokenSetAuthorityFailed",
      msg: "Token set authority failed",
    },
    {
      code: 6002,
      name: "TokenTransferFailed",
      msg: "Token transfer failed",
    },
    {
      code: 6003,
      name: "InvalidMintAccount",
      msg: "Invalid mint account",
    },
    {
      code: 6004,
      name: "ExceedAmount",
      msg: "Exceed amount",
    },
    {
      code: 6005,
      name: "NotTheTime",
      msg: "Should wait some time.",
    },
    {
      code: 6006,
      name: "InvalidOwner",
      msg: "Invalid Owner",
    },
    {
      code: 6007,
      name: "AlreadyMint",
      msg: "Already Minted",
    },
    {
      code: 6008,
      name: "NotAllowed",
      msg: "Not Allowed",
    },
    {
      code: 6009,
      name: "InsufficientCanisters",
      msg: "Insufficient Canisters",
    },
  ],
};

export default IDL;
