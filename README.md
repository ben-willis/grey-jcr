# Grey JCR Website

This is the javascript code running the Grey JCR website.

## Installation

1. a) Install node.js and npm
   b) Run npm install and install knex/mocha (or chai?) for tests
2. Install PostgreSQL and create database grey
3. Install sqlite for tests
3. Create .env file
4. a) Migtate tables npm migrate-postgres
   b) Edit db/seed/admin.js and add seed data

## Running the website
npm run start
go to localhost:3000
