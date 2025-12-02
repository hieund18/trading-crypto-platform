create database order_service;
use order_service;

create table assets(
	id nvarchar(50) primary key,
    user_id nvarchar(50) not null,
    coin_id varchar(20) not null,
    quantity DECIMAL(30, 6) not null,
    buy_price DECIMAL(30, 6) not null
);

create table trade_histories(
	id nvarchar(50) primary key,
    user_id nvarchar(50) not null,
    coin_id varchar(20) not null,
    type nvarchar(10),
    quantity DECIMAL(30, 6) not null,
    price DECIMAL(30, 6) not null,
    amount DECIMAL(30, 6) not null,
    created_at datetime
);