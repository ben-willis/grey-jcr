import { NestFactory } from '@nestjs/core';
import path from "path";
import { createConnections } from 'typeorm';

import { AppModule } from './app.module';

require('dotenv').config({path: path.join(__dirname, "./../.env")});

const portToRunOn = "3000";

async function bootstrap() {
    // Create typeorm db connections
    await createConnections();

    // Create the new Nest Application
    const nestApp = await NestFactory.create(AppModule);

    // Set up the legacy app with the Nest Application
    const legacyApp = require("./app");
    legacyApp.set("port", portToRunOn);
    nestApp.use(legacyApp);

    // Attach the socket io listener
    const io = require("./helpers/socketApi").io;
    io.attach(nestApp.getHttpServer());
    
    // Listen for incoming connections
    await nestApp.listen(portToRunOn);
}

bootstrap().catch(console.log);
