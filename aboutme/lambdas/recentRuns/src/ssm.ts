import { GetParametersCommand, SSMClient } from '@aws-sdk/client-ssm';

export const createParameterStore = (client: Pick<SSMClient, 'send'>) => {
    // Warm invocations reuse values instead of calling SSM every time.
    const cache = new Map<string, string>();

    const getParameters = async (names: readonly string[]): Promise<Map<string, string>> => {
        const missing = names.filter((name) => !cache.has(name));

        if (missing.length > 0) {
            const response = await client.send(
                new GetParametersCommand({ Names: missing, WithDecryption: true }),
            );

            for (const { Name, Value } of response.Parameters ?? []) {
                if (Name && Value) {
                    cache.set(Name, Value);
                }
            }

            const unset = missing.filter((name) => !cache.has(name));
            if (unset.length > 0) {
                throw new Error(`SSM parameters have no value: ${unset.join(', ')}`);
            }
        }

        return new Map(names.map((name) => [name, cache.get(name) as string]));
    };

    return { getParameters };
};

export const { getParameters } = createParameterStore(new SSMClient({}));

export const parameterNameFromEnv = (variable: string): string => {
    const name = process.env[variable];

    if (!name) {
        throw new Error(`Missing environment variable: ${variable}`);
    }

    return name;
};
