use anchor_lang::prelude::*;

mod state;
mod contexts;
mod processors;
mod error;

use contexts::*;

pub use error::ErrorCode;

declare_id!("9UCzUYTVHWZ1wEEv8r7RbDbqouiyEUxyuPfdSifg2KAu");

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8 + 8;

#[program]
pub mod quorum {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        processors::process_initialize(ctx)
    }

    pub fn create_poll(
        ctx: Context<CreatePoll>, 
        name: String, 
        description: String, 
        start_time: u64, 
        end_time: u64
    ) -> Result<()> {
        processors::process_create_poll(ctx, name, description, start_time, end_time)
    }

    pub fn register_candidate(
        ctx: Context<RegisterCandidate>, 
        poll_id: u64, 
        candidate_name: String
    ) -> Result<()> {
        processors::process_register_candidate(ctx, poll_id, candidate_name)
    }

    pub fn vote(
        ctx: Context<Vote>, 
        poll_id: u64, 
        candidate_id: u64
    ) -> Result<()> {
        processors::process_vote(ctx, poll_id, candidate_id)
    }

    pub fn delete_poll(ctx: Context<DeletePoll>) -> Result<()> {
        processors::process_delete_poll(ctx)
    }
}