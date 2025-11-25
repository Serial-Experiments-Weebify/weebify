import { ConfigFactory } from '@nestjs/config';
import { readFileSync } from 'fs';

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

/**
 * Creates a configuration loader that reads environment variables from Docker secrets.
 * @param nameMap A record mapping environment variable names to Docker secret names
 */
export default function dockerSecrets<T extends string>(
    nameMap: Record<T, string>,
): ConfigFactory<Partial<Record<T, string>>> {
    return () => {
        const config: Partial<Record<T, string>> = {};

        for (const key in nameMap) {
            config[key] = tryReadDockerSecretSync(nameMap[key]);
        }

        return config;
    };
}
