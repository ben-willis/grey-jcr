import { NestFactory } from '@nestjs/core';
import path from "path";
import { createConnections } from 'typeorm';

require('dotenv').config({path: path.join(__dirname, "./../.env")});

import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import session from 'express-session';
import passport from 'passport';

const RedisStore = require('connect-redis')(session);
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

    // Set up some things for the Nest App.
    nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
    nestApp.use(session({
        store: new RedisStore({host: process.env.REDIS_HOST, port: process.env.REDIS_PORT}),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 14*24*60*60*1000 }
    }));
    nestApp.use(passport.initialize());
    nestApp.use(passport.session());
    

    // Attach the socket io listener
    const io = require("./helpers/socketApi").io;
    io.attach(nestApp.getHttpServer());
    
    // Listen for incoming connections
    await nestApp.listen(portToRunOn);
}

bootstrap().catch(console.log);
