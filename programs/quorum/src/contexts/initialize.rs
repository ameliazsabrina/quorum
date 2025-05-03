use anchor_lang::prelude::*;
use crate::state::{Counter, Registrations};
use crate::ANCHOR_DISCRIMINATOR_SIZE;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        init, 
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8,
        seeds = [b"counter"],
        bump 
    )]
    pub counter: Account<'info, Counter>,
    
    #[account(
        init, 
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8,
        seeds = [b"registrations"],
        bump 
    )]
    pub registrations: Account<'info, Registrations>,
    
    pub system_program: Program<'info, System>
} 