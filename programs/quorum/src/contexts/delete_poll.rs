use anchor_lang::prelude::*;
use crate::state::poll::Poll;

#[derive(Accounts)]
pub struct DeletePoll<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        close = user,
        seeds = [poll.id.to_le_bytes().as_ref()],
        bump
    )]
    pub poll: Account<'info, Poll>,
} 