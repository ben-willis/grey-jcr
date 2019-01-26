# Grey College JCR Website [![Build Status](https://travis-ci.org/ben-willis/grey-jcr.svg?branch=master)](https://travis-ci.org/ben-willis/grey-jcr)

This is the code running the [Grey JCR website](https://greyjcr.com). Making the website open source will hopefully provide an oportunity for Grey JCR members to get involved in the website. Feel free to install this on your local machine and play around with it.

## Installation

This application follows [12 factor](https://12factor.net/) principles. Instrcutions on how to install, run and develop this application are detailed below.

#### 1. Clone this project
Either use the command `git clone` from your command line or use the download link and extract the zip file.

#### 2. Install project dependencies
There are three core dependencies required to install this project:
 - Node.js - Use [nvm](https://github.com/creationix/nvm/blob/master/README.md) to manage the version of node installed. Once nvm is installed simply go in to the root directory of this project and type `nvm use` to switch to the correct version of node.js.
 - PostgreSQL 9.6 - Download from [here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
 - Redis 3

After install these run `npm install` to install the required node dependencies.

#### 3. Create Environment File
Some environment variables are used by the app and are listed in a file called ".env" in the main directory of the site. You will need to create this file and define the following variables:
```
# This is used for storing user sessions
SESSION_SECRET=supersecretphrase

# Details for using the paypal API
PAYPAL_MODE=sandbox
PAYPAL_CLIENT_ID=EOJ2S-Z6OoN_le_KS1d75wsZ6y0SFdVsY9183IvxFyZp
PAYPAL_CLIENT_SECRET=EClusMEUk8e9ihI7ZdVLF5cZ6y0SFdVsY9183IvxFyZp

# Your Durham details, these are used to set you up as the website editor in your local installation
CIS_USERNAME=hsdz38
CIS_NAME=Ben Willis
CIS_EMAIL=b.c.willis@durham.ac.uk

# These are used by the website to send booking confirmation emails etc
EMAIL_HOST=smtp.dur.ac.uk
EMAIL_PORT=587
EMAIL_USERNAME=hsdz38
EMAIL_PASSWORD=password

# Connection details for Postgres database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grey
DB_USERNAME=grey
DB_PASSWORD=password

# Connection details for redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Somewhere to store static files (avatars, manifestos etc)
FILES_DIRECTORY=/home/me/projects/grey-jcr/files/
```

#### 4. Set up the Postgres database
To set up the database you need to create the tables and add your user (defined in .env) as the website editor. To do this run the following:

 1. `npm run migrate-postgres` - this will create the required tables in the database
 2. `npm run seed-postgres` - this will add the user defined in the .env file as the website editor

 Note these steps are only required on installation and if you delete the postgres-data directory.

#### 5. Running the app
Simply run `npm run start` to start the app in the foreground. Then visit "localhost:3000" in your browser to view the site. To stop the app simple press ctrl+c.

## Development Tips
Here are a few tips and tricks that will allow you to develop:

 - If you need to gain access to the postgres database cli run `psql -U grey`.

More to be added...

## Tests
There are currently some tests in the test directory which can be run with something like `npm run test`.

## Contributors
If you want to get involved in the website feel free to email me at [benwillis0612@gmail.com](mailto:benwillis0612@gmail.com) or the current website editor if you have any questions!

## Licence
The MIT License (MIT)
