 # Grey College JCR Website

This is the code running the [Grey JCR website](https://greyjcr.com). Making the website open source will hopefully provide an oportunity for Grey JCR members to get involved in the website. Feel free to install this on your local machine and play around with it. So far the website has been tested on Windows and Ubuntu.

## Installation

#### Clone this project
Either use the command `git clone` from your command line or use the download link and extract the zip file.

#### Install node.js, npm and required packages
Download node.js and node package manager from [here](https://nodejs.org/en/download/) and install them. Open up your console or node.js command prompt, navigate to the website's folder and enter the command `npm install`. This installs all the required packages. You also need to install Knex globally using the command `npm install knex -g`.

#### Install PostgreSQL and create database grey
Download PostgreSQL from [here](https://www.postgresql.org/download/). Create a new database for the website and optionally a new user. There are some useful tutorials on how to do this  [here](https://wiki.postgresql.org/wiki/Detailed_installation_guides).

#### Create Environment File
Create a file called ".env" in the main directory of the site. It should look something like this:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grey
DB_USERNAME=grey
DB_PASSWORD=password

DB_TEST=grey-test

SESSION_SECRET=supersecretphrase

PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=EOJ2S-Z6OoN_le_KS1d75wsZ6y0SFdVsY9183IvxFyZp
PAYPAL_CLIENT_SECRET=EClusMEUk8e9ihI7ZdVLF5cZ6y0SFdVsY9183IvxFyZp

CIS_USERNAME=hsdz38
CIS_NAME=Ben Willis
CIS_EMAIL=b.c.willis@durham.ac.uk

EMAIL_HOST=smtp.dur.ac.uk
EMAIL_PORT=587
EMAIL_USERNAME=hsdz38
EMAIL_PASSWORD=password
```

#### Create tables and add data to the database
First you need to run `npm run migrate-postgres`. This will create the required tables in  the databse you created. Next you need to run `npm run seed-postgres` to add yourself as the website editor.

#### Starting the app
Use the command `npm run start` to start the website then visit "localhost:3000" in your browser

## Install Using docker
Installation using docker is easier.

#### Clone this project
As before clone this project

#### Install Docker and Docker Compose
There are some instructions [here](https://docs.docker.com/compose/install/#install-compose).

#### Starting the app
Simply run `docker-compose up -d` to start the app in the background. You can then run `docker-compose logs -f` to follow the logs. As before visit "localhost:3000" in your browser to view the site.

## Tests
Tests are currently lacking at the moment. To run the tests that do exist you then need to create the tables using the command `npm run migrate-test`.

You also need to install mocha globally with the command `npm install mocha -g`.

To run the tests use the command `npm run test`.

## Contributors
If you want to get involved in the website please email me at [benwillis0612@gmail.com](mailto:benwillis0612@gmail.com) and I can help you get started.

## Licence
The MIT License (MIT)
