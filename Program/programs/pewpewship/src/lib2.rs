pub mod utils;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token};
use borsh::{BorshDeserialize, BorshSerialize};

use {
    anchor_lang::{
        solana_program::{program::invoke_signed, program_pack::Pack, system_instruction},
        AnchorDeserialize, AnchorSerialize, Key,
    },
    crate::utils::*,
    mpl_token_metadata::instruction::{
        create_master_edition_v3, create_metadata_accounts_v2, update_metadata_accounts,
    },
    spl_token::state,
};

declare_id!("71vDh8NVpZtCUG6JWg45Ma6wxBjneiWSPWqJCWjDbEsH");

#[program]
pub mod pewpewship {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, _bump: u8, start_time: i64) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        collection.owner = ctx.accounts.owner.key();
        collection.creator_signer = ctx.accounts.creator_signer.key();
        collection.bump = _bump;
        collection.rand = ctx.accounts.rand.key();
        collection.start_time = start_time;
        collection.supply = 2500;
        collection.csupply = 0;
        Ok(())
    }

    pub fn mint_ship(ctx: Context<MintShip>, _data: Metadata) -> Result<()> {
        let collection = &mut ctx.accounts.collection;
        let seeds = &[collection.rand.as_ref(), &[collection.bump]];
        let mint: state::Mint = state::Mint::unpack(&ctx.accounts.mint.data.borrow())?;
        let clock = Clock::get()?.unix_timestamp;
        if clock < collection.start_time {
            return err!(CollectionError::ExceedTime);
        }

        if mint.decimals != 0 {
            return err!(CollectionError::InvalidMintAccount);
        }
        if mint.supply != 0 {
            return err!(CollectionError::InvalidMintAccount);
        }

        if collection.supply < collection.csupply + 1 {
            return err!(CollectionError::ExceedAmount);
        }

        let name = format!("Pew Pew Ship #{}", (collection.csupply + 1).to_string());
        let symbol = format!("PEWPEWSHIP");
        let uri = format!("https://violet-junior-xerinae-72.mypinata.cloud/ipfs/Qmcb41bQDXzPBy1Gs5oJ3uVphyNw1i4Uu42TAnfTLS8c15/{}.json", (collection.csupply + 1).to_string());
        spl_token_mint_to(TokenMintToParams {
            mint: ctx.accounts.mint.clone(),
            account: ctx.accounts.token_account.clone(),
            owner: ctx.accounts.owner.clone(),
            token_program: ctx.accounts.token_program.clone(),
            amount: 1 as u64,
        })?;

        let mut creators: Vec<mpl_token_metadata::state::Creator> =
            vec![mpl_token_metadata::state::Creator {
                address: ctx.accounts.creator_signer.key(),
                verified: true,
                share: 0,
            }];
        for c in _data.creators {
            creators.push(mpl_token_metadata::state::Creator {
                address: c.address,
                verified: false,
                share: c.share,
            });
        }

        invoke_signed(
            &create_metadata_accounts_v2(
                *ctx.accounts.token_metadata_program.key,
                *ctx.accounts.metadata.key,
                *ctx.accounts.mint.key,
                *ctx.accounts.owner.key,
                *ctx.accounts.owner.key,
                *ctx.accounts.creator_signer.key,
                (*name).to_string(),
                (*symbol).to_string(),
                (*uri).to_string(),
                Some(creators),
                300,
                true,
                true,
                None,
                None,
            ),
            &[
                ctx.accounts.metadata.to_account_info().clone(),
                ctx.accounts.mint.to_account_info().clone(),
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.creator_signer.to_account_info().clone(),
                ctx.accounts
                    .token_metadata_program
                    .to_account_info()
                    .clone(),
                ctx.accounts.token_program.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
                ctx.accounts.rent.to_account_info().clone(),
                collection.to_account_info().clone(),
            ],
            &[seeds],
        )?;

        invoke_signed(
            &&create_master_edition_v3(
                *ctx.accounts.token_metadata_program.key,
                *ctx.accounts.master_edition.key,
                *ctx.accounts.mint.key,
                *ctx.accounts.creator_signer.key,
                *ctx.accounts.owner.key,
                *ctx.accounts.metadata.key,
                *ctx.accounts.owner.key,
                None,
            ),
            &[
                ctx.accounts.master_edition.to_account_info().clone(),
                ctx.accounts.mint.to_account_info().clone(),
                ctx.accounts.owner.to_account_info().clone(),
                ctx.accounts.metadata.to_account_info().clone(),
                ctx.accounts.creator_signer.to_account_info().clone(),
                ctx.accounts.token_program.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
                ctx.accounts.rent.to_account_info().clone(),
                collection.to_account_info().clone(),
            ],
            &[seeds],
        )?;

        invoke_signed(
            &update_metadata_accounts(
                *ctx.accounts.token_metadata_program.key,
                *ctx.accounts.metadata.key,
                *ctx.accounts.creator_signer.key,
                None,
                None,
                Some(true),
            ),
            &[
                ctx.accounts
                    .token_metadata_program
                    .to_account_info()
                    .clone(),
                ctx.accounts.creator_signer.to_account_info().clone(),
                ctx.accounts.metadata.to_account_info().clone(),
                collection.to_account_info().clone(),
            ],
            &[seeds],
        )?;

        collection.csupply += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(init, payer=owner, space=8 + 32 * 3 + 8 * 3 + 1)]
    collection: Account<'info, Collection>,
    /// CHECK: account constraints checked in account trait
    #[account(seeds=[(*rand).key.as_ref()], bump)]
    creator_signer: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    rand: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintShip<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(mut)]
    collection: Account<'info, Collection>,

    /// CHECK: account constraints checked in account trait
    #[account()]
    creator_signer: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(mut,owner=spl_token::id())]
    mint: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(mut,owner=spl_token::id())]
    token_account: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(mut)]
    metadata: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(mut)]
    master_edition: UncheckedAccount<'info>,

    /// CHECK: account constraints checked in account trait
    #[account(address=mpl_token_metadata::id())]
    token_metadata_program: UncheckedAccount<'info>,
    token_program: Program<'info, Token>,
    system_program: Program<'info, System>,
    rent: Sysvar<'info, Rent>,
}

#[account()]
#[derive(Default, Debug)]
pub struct Collection {
    pub owner: Pubkey,
    pub creator_signer: Pubkey,
    pub supply: u64,
    pub csupply: u64,
    pub start_time: i64,
    pub rand: Pubkey,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Creator {
    pub address: Pubkey,
    pub verified: bool,
    pub share: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Default)]
pub struct Metadata {
    pub name: String,
    pub symbol: String,
    pub uri: String,
    pub seller_fee_basis_points: u16,
    pub creators: Vec<Creator>,
    pub is_mutable: bool,
}

#[error_code]
pub enum CollectionError {
    #[msg("Token mint to failed")]
    TokenMintToFailed,

    #[msg("Token set authority failed")]
    TokenSetAuthorityFailed,

    #[msg("Token transfer failed")]
    TokenTransferFailed,

    #[msg("Invalid mint account")]
    InvalidMintAccount,

    #[msg("Exceed amount")]
    ExceedAmount,

    #[msg("Should wait some time.")]
    ExceedTime,

    #[msg("Invalid Owner")]
    InvalidOwner,

    #[msg("Already Minted")]
    AlreadyMint,

    #[msg("Not Allowed")]
    NotAllowed,

    #[msg("Insufficient Canisters")]
    InsufficientCanisters,
}
