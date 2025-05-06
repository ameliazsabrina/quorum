use anchor_lang::prelude::*;
use crate::contexts::Initialize;

pub fn process_initialize(ctx: Context<Initialize>) -> Result<()> {
    let counter = &mut ctx.accounts.counter;
    counter.count = 0;

    let registrations = &mut ctx.accounts.registrations;
    registrations.count = 0;
    
    Ok(())
} 