import { envVars, EnvVarsDefiniton, portNumber } from '../util/env';
import { Service } from 'typedi';

@Service()
export class ConfigService {
    static VARS = {
        // Web server config
        PORT: { transformer: portNumber, defaultValue: 3330 },

        // Auth config
        AUTH_JWT_KEY: { dockerSecretKey: 'authJwtKey' },

        // Database config
        MONGO: { dockerSecretKey: 'mongoConnection' },

        // S3 config
        S3_BUCKET: { defaultValue: 'weebify' },
        S3_ENDPOINT: {},
        S3_PORT: { transformer: portNumber },
        S3_ACCESS_KEY: { dockerSecretKey: 's3AccessKey' },
        S3_SECRET: { dockerSecretKey: 's3Secret' },
        S3_SSL: {
            transformer: (v: string) =>
                ['1', 'true', 'yes'].includes(v.toLowerCase()),
            defaultValue: false,
        },

        // MeiliSearch config
        SEARCH_HOST: {},
        SEARCH_KEY: {
            dockerSecretKey: 'searchKey',
        },
    } satisfies EnvVarsDefiniton;

    private _vars: ReturnType<typeof envVars<typeof ConfigService.VARS>>;
    constructor() {
        this._vars = envVars(ConfigService.VARS);
    }

    public get vars() {
        return this._vars;
    }
}
