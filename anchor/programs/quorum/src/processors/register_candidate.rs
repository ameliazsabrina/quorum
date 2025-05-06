use anchor_lang::prelude::*;
use crate::contexts::RegisterCandidate;
use crate::error::ErrorCode;

pub fn process_register_candidate(
    ctx: Context<RegisterCandidate>, 
    poll_id: u64, 
    candidate_name: String
) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let candidate = &mut ctx.accounts.candidate;
    let registrations = &mut ctx.accounts.registrations;

    if poll.id != poll_id {
        return Err(ErrorCode::InvalidPollId.into())
    }

    if candidate.has_registered {
        return Err(ErrorCode::CandidateAlreadyRegistered.into())
    }

    registrations.count += 1;

    candidate.cid = registrations.count;
    candidate.poll_id = poll_id;
    candidate.name = candidate_name;
    candidate.has_registered = true;

    Ok(())
} 