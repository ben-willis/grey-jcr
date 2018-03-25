# Grey College JCR Website

This is the code running the [Grey JCR website](https://greyjcr.com). Making the website open source will hopefully provide an oportunity for Grey JCR members to get involved in the website. Feel free to install this on your local machine and play around with it. So far the website has been tested on Windows and Ubuntu.

## Installation

This application runs inside a docker container defined in the Dockerfile. The external dependencies are defined in docker-compose.yml.

#### Clone this project
Either use the command `git clone` from your command line or use the download link and extract the zip file.

#### Install Docker and Docker Compose
Instructions can be found here [here](https://docs.docker.com/compose/install/#install-compose).

#### Create Environment File
Create a file called ".env" in the main directory of the site. It should look something like this:
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

#### Set up the Postgres database
To set up the database you need to create the tables and add your user (defined in .env) as the website editor. To do this run `docker-compose run app npm run migrate-postgres`. This will create the required tables in the databse. Next you need to run `docker-compose run app npm run seed-postgres` to add yourself as the website editor. Note these steps are only required on installation and if you delete the postgres-data directory.

#### Starting the app
Simply run `docker-compose up -d` to start the app in the background. You can then run `docker-compose logs -f` to follow the logs. As before visit "localhost:3000" in your browser to view the site.

## Tests
There are currently some tests in the test directory but how to run them has yet to be defined.

## Contributors
If you want to get involved in the website feel free to email me at [benwillis0612@gmail.com](mailto:benwillis0612@gmail.com) or the current website editor if you have any questions!

## Licence
The MIT License (MIT)
