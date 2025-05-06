use anchor_lang::prelude::*;
use crate::contexts::delete_poll::DeletePoll;

pub fn process_delete_poll(_ctx: Context<DeletePoll>) -> Result<()> {
    Ok(())
}
