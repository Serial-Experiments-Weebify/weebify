import { envVars, portNumber } from "../util/env";
import { Service } from "typedi"

@Service()
export class ConfigService {
    static VARS = {
        // Web server config
        PORT: { transformer: portNumber, defaultValue: 3330 },
        // Database config
        MONGO: { defaultValue: null },
        // S3 config
        S3_ENDPOINT: { defaultValue: null },
        S3_PORT: { transformer: portNumber, defaultValue: null },
        S3_ACCESS_KEY: { defaultValue: '', },
        S3_SECRET: { defaultValue: '', },
        S3_SSL: { transformer: (v: string) => ['1', 'true', 'yes'].includes(v.toLowerCase()), defaultValue: false }
    };

    private _vars: ReturnType<typeof envVars<typeof ConfigService.VARS>>
    constructor() {
        this._vars = envVars(ConfigService.VARS);
    }

    public get vars() {
        return this._vars;
    }
}