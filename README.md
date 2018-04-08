# Grey College JCR Website [![Build Status](https://travis-ci.org/ben-willis/grey-jcr.svg?branch=master)](https://travis-ci.org/ben-willis/grey-jcr)

This is the code running the [Grey JCR website](https://greyjcr.com). Making the website open source will hopefully provide an oportunity for Grey JCR members to get involved in the website. Feel free to install this on your local machine and play around with it.

## Installation

This application follows [12 factor](https://12factor.net/) principles and runs inside a docker container defined in the Dockerfile. The external dependencies are defined in docker-compose.yml. Instrcutions on how to install, run and develop this application are detailed below.

#### 1. Clone this project
Either use the command `git clone` from your command line or use the download link and extract the zip file.

#### 2. Install Docker and Docker Compose
These are the only two requirements for this projects. Instructions on how to install them can be found [here](https://docs.docker.com/compose/install/#install-compose).

There appears to be [a bug in docker-compose v1.19.0](https://github.com/docker/compose/issues/5686) so v1.18.0 is recommended.

#### 3. Create Environment File
Some environment variables are passed in to the container in the docker-compose.yml, others are listed in a file called ".env" in the main directory of the site. You will need to create this file and define the following variables:
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
```

#### 4. Set up the Postgres database
To set up the database you need to create the tables and add your user (defined in .env) as the website editor. To do this run `docker-compose run app npm run migrate-postgres`. This will create the required tables in the databse. Next you need to run `docker-compose run app npm run seed-postgres` to add yourself as the website editor. Note these steps are only required on installation and if you delete the postgres-data directory.

#### 5. Running the app
Simply run `docker-compose up` to start the app in the foreground. Then visit "localhost:3000" in your browser to view the site. To stop the app simple press ctrl+c.

## Development Tips
Here are a few tips and tricks that will allow you to develop:

 - If you make any changes to any config or any of the source code you will need to run `docker-compose build` to rebuild the images
 - You can run the app in the background using `docker-compose up -d`. You can then follow the logs with `docker-compose logs -f` and stop the app with `docker-compose down`.
 - If you need to gain access to the postgres database cli run `docker-compose exec postgres psql -U grey`.

More to be added...

## Tests
There are currently some tests in the test directory but how to run them has yet to be defined.

## Contributors
If you want to get involved in the website feel free to email me at [benwillis0612@gmail.com](mailto:benwillis0612@gmail.com) or the current website editor if you have any questions!

## Licence
The MIT License (MIT)
