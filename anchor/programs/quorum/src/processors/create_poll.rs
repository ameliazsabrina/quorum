use anchor_lang::prelude::*;
use crate::contexts::CreatePoll;
use crate::error::ErrorCode;

pub fn process_create_poll(
    ctx: Context<CreatePoll>, 
    name: String, 
    description: String, 
    start_time: u64, 
    end_time: u64
) -> Result<()> {
    let poll = &mut ctx.accounts.poll;
    let counter = &mut ctx.accounts.counter;
    
    if start_time >= end_time {
        return Err(ErrorCode::StartDateAfterEndDate.into())
    }

    poll.id = counter.count;
    poll.name = name;
    poll.description = description;
    poll.start_date = start_time;
    poll.end_date = end_time;
    poll.candidates = 0;
    
    counter.count += 1;
    
    Ok(())
} 