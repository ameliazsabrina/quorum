use anchor_lang::prelude::*;
use crate::state::{Poll, Counter};
use crate::ANCHOR_DISCRIMINATOR_SIZE;

#[derive(Accounts)]
pub struct CreatePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init, 
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8 + Poll::INIT_SPACE,
        seeds = [counter.count.to_le_bytes().as_ref()],
        bump 
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [b"counter"],
        bump 
    )]
    pub counter: Account<'info, Counter>,
    
    pub system_program: Program<'info, System>
} 