import log4js from "log4js";

log4js.configure({
    appenders: {
        stdout: { type: 'stdout' }
    },
    categories: {
        default: {
            appenders: ['stdout'],
            level: 'all'
        }
    }
});

const logger = log4js.getLogger();
console.log = logger.info.bind(logger);
console.warn = logger.warn.bind(logger);
console.error = logger.error.bind(logger);

import express from "express";

export const app = express();
app.set('trust proxy', 'loopback, linklocal, uniquelocal')

import mongoose from "mongoose";
mongoose.set('strictQuery', false);

