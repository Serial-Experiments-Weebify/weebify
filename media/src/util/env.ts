
export function portNumber(v: string): number {
    const p = parseInt(v);
    if (isNaN(p)) throw "Conversion to int failed";
    return p;
}

export function envVar<T>(name: string, transformer: (v: string) => T, defaultValue: T | null = null): T {
    const v = process.env[name];
    if (typeof v != 'string') {
        if (defaultValue !== null) return defaultValue;
        throw `Missing enviroment variable ${name}`;
    }

    try {
        return transformer(v);
    } catch (error) {
        throw { msg: 'transformer failed', error };
    }
}


export type EnvVarsDefiniton = { [key: string]: { transformer?: (v: string) => any, defaultValue: any | null } };

export function envVars<T extends EnvVarsDefiniton>(variables: T):
    { [K in keyof T]: T[K]['transformer'] extends Object ? ReturnType<T[K]['transformer']> : string } {
    const result: { [K in keyof T]: T[K]['transformer'] extends Object ? ReturnType<T[K]['transformer']> : string } = {} as any;
    for (const [name, { transformer = (v: string) => v, defaultValue }] of Object.entries(variables)) {
        const v = process.env[name];
        if (v === undefined) {
            if (defaultValue !== null) {
                //@ts-ignore
                result[name] = defaultValue;
            } else {
                throw `Missing enviroment variable ${name}`;
            }
        } else {
            try {
                //@ts-ignore
                result[name] = transformer(v);
            } catch (error) {
                throw { msg: 'transformer failed', error };
            }
        }
    }
    return result;
}
