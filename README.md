# Grey College JCR Website [![Build Status](https://travis-ci.org/ben-willis/grey-jcr.svg?branch=master)](https://travis-ci.org/ben-willis/grey-jcr)

This is the code running the [Grey JCR website](https://greyjcr.com). Making the website open source will hopefully provide an oportunity for Grey JCR members to get involved in the website. Feel free to install this on your local machine and play around with it.

## Getting Started

This application follows [12 factor](https://12factor.net/) principles. Instructions on how to install, run and develop this application are detailed below.

#### 1. Clone this project
Either use the command `git clone` from your command line or use the download link and extract the zip file.

#### 2. Install project dependencies
There are three core dependencies required to install this project:
 - Node.js - Use [Node Version Manager (nvm)](https://github.com/creationix/nvm/blob/master/README.md) to manage the version of node installed on your machine. Once nvm is installed simply go in to the root directory of this project and type `nvm use` to switch to the required version of node.js.
 - PostgreSQL 9.6 - Download from [here](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads). This is used to store most of the state of the application (users, debts, events etc.). Install postgres on your local machine and create an empty database called "grey".
 - Redis 3 - This is required to store user sessions. Simply install locally and make a note of the port it's running on (usually 6379).

After these navigate to the directory you've copied that application in to in your command line and run `npm install`. This will read from the "package.json" file and install all of the node dependencies.

#### 3. Create Environment File
Some environment variables are used by the app and are listed in a file called ".env" in the main directory of the site. You will need to create this file and define the following variables:
```
# This is used for storing user sessions can be any string
SESSION_SECRET=supersecretphrase

# Details for using the paypal API only required for developing the debts service
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

# Connection details for your local Postgres database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=grey
DB_USERNAME=postgres
DB_PASSWORD=password

# Connection details for redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Somewhere on your machine to store static files
FILES_DIRECTORY=/home/me/projects/grey-jcr/files/
```
Inside your files directory you will need the following folders: avatars, events, uploaded, manifestos.

#### 4. Build the application
This project is migrating to typescript so we need to transpile to regular javascript. To do this run `npm run build`. You'll need to rerun this after any changes you make. You can also run `npm run build-api` or `npm run build-ui` to build just the backend or frontend individually.

#### 5. Set up the Postgres database
To set up the database you need to create the tables and add your user (defined in .env) as the website editor. To do this run the following:

 1. `npm run migrate` - this will create the required tables in the database
 2. `npm run seed-postgres` - this will add the user defined in the .env file as the website editor

 Note the migrate step is required on installation and whenever there are any changes to the database. It is often useful to delete and recreate the "grey" database and run the migrations again to get a clean state.

#### 6. Running the app
Simply run `npm run start` to start the app. Then visit "localhost:3000" in your browser to view the site. To stop the app simple press ctrl+c in you terminal.

## Testing
The testing strategy is work in progress but in general we use two types of tests:

#### Unit Tests
To test the back end we use unit tests to test individual parts of the application (e.g. an endpoint or a single service function). These are either in the "test" directory or end with ".spec.ts". To run these use `npm run test` after building the application.

#### Visual Tests
There are no automated tests so we rely on manually checking. To do this with the new UI components run `npm run storybook` which will show "stories" for different components. These are described in the source code in files that end ".stories.tsx".

## Contributing
If you want to get involved in the website feel free to email me at [benwillis0612@gmail.com](mailto:benwillis0612@gmail.com) or the current website editor if you have any questions!

## Licence
The MIT License (MIT)
