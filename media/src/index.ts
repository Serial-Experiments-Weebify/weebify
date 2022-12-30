import 'reflect-metadata';
import { config } from 'dotenv'
import { connect } from 'mongoose';
import { Container } from "typedi";

//config express and mongoose
config();
import { app } from "./conf"
import { media } from './controllers/media';
import { ConfigService } from './services/config.service';
import { S3Service } from './services/s3.service';

app.use('/media', media);

async function main() {
    const { vars } = Container.get(ConfigService);
    const s3 = Container.get(S3Service);

    console.log('Connectiong to DB...');
    const connection = await connect(vars.MONGO);
    console.log('Database connected');

    console.log('Testing S3...');
    if (!await s3.verify()) return;

    app.listen(vars.PORT);
    console.log(`Listening on ${vars.PORT}`);
}

main();
