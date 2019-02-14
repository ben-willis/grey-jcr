cd grey-jcr-new

rm -rf package
tar -xf grey-jcr.tgz
cp .env package/
cd package
nvm use
npm install --production
npm run migrate

# Restart the new app
pm2 delete grey-jcr
pm2 start ./bin/www -n grey-jcr