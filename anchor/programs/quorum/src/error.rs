use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Start date must be before end date")]
    StartDateAfterEndDate,
    
    #[msg("Invalid poll id")]
    InvalidPollId,
    
    #[msg("Poll ended")]
    PollEnded,
    
    #[msg("Candidate already registered")]
    CandidateAlreadyRegistered,
    
    #[msg("Candidate not registered")]
    CandidateNotRegistered,
    
    #[msg("Voter already voted")]
    VoterAlreadyVoted,
    
    #[msg("Poll not started")]
    PollNotStarted,
    
    #[msg("Poll has ended")]
    PollHasEnded,
} 