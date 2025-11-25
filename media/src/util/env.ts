import { readFileSync } from 'fs';

export function portNumber(v: string): number {
    const p = parseInt(v);
    if (isNaN(p)) throw 'Conversion to int failed';
    return p;
}

export type EnvVarsDefiniton = {
    [key: string]: {
        transformer?: (v: string) => any;
        dockerSecretKey?: string;
        defaultValue?: unknown;
    };
};

function tryReadDockerSecretSync(key: string): string | undefined {
    try {
        const value = readFileSync(`/run/secrets/${key}`, 'utf8');
        return value.trim();
    } catch (err) {
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
            console.error(`Error reading docker secret ${key}:`, err);
        }
        return undefined;
    }
}

export function envVars<T extends EnvVarsDefiniton>(
    variables: T,
): {
    [K in keyof T]: T[K]['transformer'] extends object
        ? ReturnType<T[K]['transformer']>
        : string;
} {
    const result: {
        [K in keyof T]: T[K]['transformer'] extends object
            ? ReturnType<T[K]['transformer']>
            : string;
    } = {} as any;
    for (const [
        name,
        { transformer = (v: string) => v, defaultValue, dockerSecretKey },
    ] of Object.entries(variables)) {
        let dockerValue: string | undefined = undefined;

        if (dockerSecretKey) {
            dockerValue = tryReadDockerSecretSync(dockerSecretKey);
        }

        const envValue = process.env[name];

        if (dockerValue && envValue) {
            console.warn(
                `Docker secret '${dockerSecretKey}' is overriding '${name}'`,
            );
        }

        let value = dockerValue ?? envValue;

        if (value === undefined) {
            if (defaultValue !== undefined) {
                result[name as keyof T] = defaultValue as any;
            } else {
                throw `Missing enviroment variable ${name}`;
            }
        } else {
            try {
                result[name as keyof T] = transformer(value);
            } catch (error) {
                throw { msg: 'transformer failed', error };
            }
        }
    }
    return result;
}
