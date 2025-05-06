use anchor_lang::prelude::*;
use crate::state::{Poll, Candidate, Registrations};
use crate::ANCHOR_DISCRIMINATOR_SIZE;

#[derive(Accounts)]
#[instruction(poll_id: u64)]
pub struct RegisterCandidate<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [poll_id.to_le_bytes().as_ref()],
        bump 
    )]
    pub poll: Account<'info, Poll>,

    #[account(
        init, 
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + 8 + Candidate::INIT_SPACE,
        seeds = [
            poll.id.to_le_bytes().as_ref(), 
            (registrations.count + 1).to_le_bytes().as_ref()
        ],
        bump 
    )]
    pub candidate: Account<'info, Candidate>,
    
    #[account(mut)]
    pub registrations: Account<'info, Registrations>,
    
    pub system_program: Program<'info, System>
} 