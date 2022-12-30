import { Service, Inject } from "typedi";
import { ConfigService } from "./config.service";

import { Client } from "minio";


@Service()
export class S3Service {
    protected s3c: Client;

    constructor(@Inject() cfg: ConfigService) {
        const { vars } = cfg;

        this.s3c = new Client({
            endPoint: vars.S3_ENDPOINT,
            useSSL: vars.S3_SSL,
            port: vars.S3_PORT,

            accessKey: vars.S3_ACCESS_KEY,
            secretKey: vars.S3_SECRET,
        });
    }

    protected async bucketsPresent(buckets: string[]) {
        const bucketsAvailable = (await this.s3c.listBuckets()).map(x => x.name);
        const missingBuckets = buckets.filter(x => !bucketsAvailable.includes(x));

        if (missingBuckets.length == 0) {
            console.log('All required buckets present');
            return true;
        } else {
            console.error('Missing the following buckets:');
            console.error(missingBuckets);
            return false;
        }
    }

    public async verify() {
        return await this.bucketsPresent(['pfp', 'media']);
    }

    public async uploadBuffer(bucket: string, key: string, buffer: Buffer) {
        return await this.s3c.putObject(bucket, key, buffer);
    }
}