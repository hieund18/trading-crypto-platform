CREATE database wallet_service;
use wallet_service;

create table wallets(
	id varchar(50) primary key,
    user_id varchar(50) unique COLLATE utf8mb4_unicode_ci,
    balance decimal(30, 6) default 0
);

create table wallet_transactions(
	id varchar(50) primary key,
    user_id varchar(50) not null,
    type varchar(20),
    amount decimal(30, 6) default 0,
    balance_before decimal(30, 6),
    balance_after decimal(30, 6),
    created_at datetime
);

create table withdrawals(
	id varchar(50) primary key,
    user_id varchar(50) not null,
    bank_name VARCHAR(100),
    bank_account VARCHAR(50),
    amount decimal(30, 6),
    status varchar(20),
    created_at datetime
);

create table transfers(
	id varchar(50) primary key,
    from_user_id varchar(50) not null,
    to_user_id varchar(50) not null,
    amount decimal(30, 6),
    created_at datetime
);