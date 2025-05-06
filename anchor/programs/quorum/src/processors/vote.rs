use anchor_lang::prelude::*;
use crate::contexts::Vote;
use crate::error::ErrorCode;

pub fn process_vote(
    ctx: Context<Vote>, 
    poll_id: u64, 
    candidate_id: u64
) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let candidate = &mut ctx.accounts.candidate;
    let voter = &mut ctx.accounts.voter;
    let current_time = Clock::get()?.unix_timestamp as u64;
    
    if poll.id != poll_id {
        return Err(ErrorCode::InvalidPollId.into()) 
    }

    if candidate.has_registered == false {
        return Err(ErrorCode::CandidateNotRegistered.into())
    }   

    if voter.has_voted {
        return Err(ErrorCode::VoterAlreadyVoted.into())
    }

    if current_time < poll.start_date {
        return Err(ErrorCode::PollNotStarted.into())
    }

    if current_time > poll.end_date {
        return Err(ErrorCode::PollHasEnded.into())
    }

    voter.cid = candidate_id;
    voter.poll_id = poll_id;
    voter.has_voted = true;

    candidate.votes += 1;

    Ok(())
} 