pub mod utils;
use anchor_lang::prelude::*;
use anchor_spl::token::{self, Burn, Token};
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

declare_id!("2wF4b65uTbnmP6hamyPWPU8qEF6kYpMhtCUP1HFzXR1G");

#[program]
pub mod pewpewship {
    use super::*;

    pub fn init_ship_collection(
        ctx: Context<InitShipCollection>,
        _bump: u8,
        quanities: Vec<Quanities>,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection.load_init()?;
        collection.owner = ctx.accounts.owner.key();
        collection.rand = ctx.accounts.rand.key();
        collection.creator_signer = ctx.accounts.creator_signer.key();
        collection.bump = _bump;
        collection.supply = 2500;
        collection.start_time = 1677078000;
        collection.csupply = 0;

        let mut count = 0usize;
        loop {
            if count >= quanities.len() {
                break;
            }
            collection.canister_mintkeys[count] = quanities[count].mint;
            collection.canister_quanities[count] = quanities[count].value;
            count += 1;
        }
        collection.canister_written = count as u64;

        Ok(())
    }

    pub fn insert_quanities(
        ctx: Context<InsertQuanities>,
        quanities: Vec<Quanities>,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection.load_mut()?;

        let mut count = 0usize;
        let mut iter_count = collection.canister_written as usize;
        loop {
            if count >= quanities.len() {
                break;
            }
            collection.canister_mintkeys[iter_count] = quanities[count].mint;
            collection.canister_quanities[iter_count] = quanities[count].value;
            count += 1;
            iter_count += 1;
        }
        collection.canister_written += count as u64;
        Ok(())
    }

    pub fn update_quanities(
        ctx: Context<UpdateQuanities>,
        start_time: i64,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection.load_mut()?;
        collection.start_time = start_time;
        Ok(())
    }

    pub fn mint_ship<'a, 'b, 'c, 'info>(
        ctx: Context<'_, '_, '_, 'info, MintShip<'info>>,
        _data: Metadata,
        _security_code: u8,
    ) -> Result<()> {
        let collection = &mut ctx.accounts.collection.load_mut()?;
        let seeds = &[collection.rand.as_ref(), &[collection.bump]];
        let mint: state::Mint = state::Mint::unpack(&ctx.accounts.mint.data.borrow())?;
        let clock = Clock::get()?.unix_timestamp;

        // if clock < collection.start_time {
        //     return err!(CollectionError::NotTheTime);
        // }
        if mint.decimals != 0 {
            return err!(CollectionError::InvalidMintAccount);
        }
        if mint.supply != 0 {
            return err!(CollectionError::InvalidMintAccount);
        }
        if collection.supply < collection.csupply + 1 {
            return err!(CollectionError::ExceedAmount);
        }

        // let mut count = 0usize;
        // let mut can_mint = 0u8;
        // let remaining_accounts = &ctx.remaining_accounts;
        // loop {
        //     if count >= remaining_accounts.len() {
        //         break;
        //     }
        //     let burn_token_mint = &remaining_accounts[count];
        //     let burn_token_account = &remaining_accounts[count + 1];
        //     let mut checkcount = 0usize;

        //     loop {
        //         if checkcount >= collection.canister_written as usize {
        //             break;
        //         }

        //         if collection.canister_mintkeys[checkcount] == *burn_token_mint.key {
        //             can_mint += collection.canister_quanities[checkcount];
        //             break;
        //         }
        //         checkcount += 1;
        //     }
        //     let cpi_accounts = Burn {
        //         mint: burn_token_mint.clone(),
        //         from: burn_token_account.clone(),
        //         authority: ctx.accounts.owner.to_account_info().clone(),
        //     };
        //     token::burn(
        //         CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        //         1,
        //     )?;
        //     count += 2;
        // }
        // if can_mint != 4 {
        //     return err!(CollectionError::InsufficientCanisters);
        // }
        let name = format!("Pew Pew Ship #{}", (collection.csupply + 1).to_string());
        let symbol = format!("PEWPEWSHIP");
        let uri = format!("https://violet-junior-xerinae-72.mypinata.cloud/ipfs/Qmciupfco2mWxjPTRnsExo4ShdtXje1BP3zseMJscpNCX9/{}.json", (collection.csupply + 1).to_string());

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
            ],
            &[seeds],
        )?;
        collection.csupply += 1;
        Ok(())
    }

    pub fn close_account(_ctx: Context<CloseCollection>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitShipCollection<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(zero)]
    collection: AccountLoader<'info, Collection>,
    /// CHECK: account constraints checked in account trait
    #[account(seeds=[(*rand).key.as_ref()], bump)]
    creator_signer: AccountInfo<'info>,
    /// CHECK: account constraints checked in account trait
    rand: UncheckedAccount<'info>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InsertQuanities<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut)]
    collection: AccountLoader<'info, Collection>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateQuanities<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut)]
    collection: AccountLoader<'info, Collection>,
}

#[derive(Accounts)]
pub struct CloseCollection<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut, close=owner, has_one=owner)]
    collection: AccountLoader<'info, Collection>,
}

#[derive(Accounts)]
pub struct UpdateCollection<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(mut)]
    collection: AccountLoader<'info, Collection>,
    system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MintShip<'info> {
    #[account(mut)]
    owner: Signer<'info>,

    #[account(mut)]
    collection: AccountLoader<'info, Collection>,

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

#[account(zero_copy)]
pub struct Collection {
    pub owner: Pubkey,
    pub creator_signer: Pubkey,
    pub rand: Pubkey,
    pub supply: u64,
    pub csupply: u64,
    pub canister_written: u64,
    pub start_time: i64,
    pub bump: u8,
    pub canister_mintkeys: [Pubkey; 8500],
    pub canister_quanities: [u8; 8500],
}

impl Default for Collection {
    #[inline]
    fn default() -> Collection {
        Collection {
            owner: Pubkey::default(),
            creator_signer: Pubkey::default(),
            rand: Pubkey::default(),
            supply: 2500 as u64,
            csupply: 0 as u64,
            canister_written: 0 as u64,
            start_time: 1677078000 as i64,
            bump: 0 as u8,
            canister_mintkeys: [Pubkey::default(); 8500],
            canister_quanities: [0 as u8; 8500],
        }
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Quanities {
    pub mint: Pubkey,
    pub value: u8,
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
    NotTheTime,

    #[msg("Invalid Owner")]
    InvalidOwner,

    #[msg("Already Minted")]
    AlreadyMint,

    #[msg("Not Allowed")]
    NotAllowed,

    #[msg("Insufficient Canisters")]
    InsufficientCanisters,
}
