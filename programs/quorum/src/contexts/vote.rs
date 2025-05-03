use anchor_lang::prelude::*;
use crate::state::{Poll, Candidate, Voter};
use crate::ANCHOR_DISCRIMINATOR_SIZE;

#[derive(Accounts)]
#[instruction(poll_id: u64, candidate_id: u64)]
pub struct Vote<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],   
        bump 
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        mut,
        seeds = [
            poll.id.to_le_bytes().as_ref(), 
            candidate_id.to_le_bytes().as_ref()
        ],
        bump 
    )]
    pub candidate: Account<'info, Candidate>,

    #[account(
        init, 
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 16, 
        seeds = [
            b"voter",
            poll_id.to_le_bytes().as_ref(),
            user.key().as_ref()
        ],
        bump 
    )]
    pub voter: Account<'info, Voter>,
    
    pub system_program: Program<'info, System>
} 