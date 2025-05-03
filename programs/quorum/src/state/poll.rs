use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Poll {
    pub id: u64,
    #[max_len(280)]
    pub name: String,
    #[max_len(1000)]
    pub description: String,
    pub start_date: u64,
    pub end_date: u64,
    pub candidates: u64,
} 