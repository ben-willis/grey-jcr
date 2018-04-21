cd grey-jcr
docker load -i ./greyjcr_app.tar
docker-compose up -d
docker-compose run app npm run migrate-postgres