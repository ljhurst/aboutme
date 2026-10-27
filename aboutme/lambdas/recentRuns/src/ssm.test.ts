import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createParameterStore, parameterNameFromEnv } from './ssm.js';

interface Call {
    names: string[];
    withDecryption: boolean | undefined;
}

const fakeClient = (values: Record<string, string>) => {
    const calls: Call[] = [];
    const client = {
        send: async (command: { input: { Names: string[]; WithDecryption?: boolean } }) => {
            calls.push({
                names: command.input.Names,
                withDecryption: command.input.WithDecryption,
            });
            const known = command.input.Names.filter((name) => name in values);
            return {
                Parameters: known.map((name) => ({ Name: name, Value: values[name] })),
                InvalidParameters: command.input.Names.filter((name) => !(name in values)),
            };
        },
    };
    return { client: client as never, calls };
};

describe('createParameterStore', () => {
    it('fetches the requested parameters with decryption', async () => {
        const { client, calls } = fakeClient({ '/a': '1', '/b': '2' });

        const result = await createParameterStore(client).getParameters(['/a', '/b']);

        assert.equal(result.get('/a'), '1');
        assert.equal(result.get('/b'), '2');
        assert.deepEqual(calls, [{ names: ['/a', '/b'], withDecryption: true }]);
    });

    it('reuses cached values on later calls', async () => {
        const { client, calls } = fakeClient({ '/a': '1' });
        const store = createParameterStore(client);

        await store.getParameters(['/a']);
        await store.getParameters(['/a']);

        assert.equal(calls.length, 1);
    });

    it('fetches only the names it does not hold yet', async () => {
        const { client, calls } = fakeClient({ '/a': '1', '/b': '2' });
        const store = createParameterStore(client);

        await store.getParameters(['/a']);
        const result = await store.getParameters(['/a', '/b']);

        assert.deepEqual(calls[1]?.names, ['/b']);
        assert.equal(result.get('/b'), '2');
    });

    it('names every parameter that has no value', async () => {
        const { client } = fakeClient({ '/a': '1' });

        await assert.rejects(
            createParameterStore(client).getParameters(['/a', '/missing', '/also-missing']),
            /\/missing, \/also-missing/,
        );
    });
});

describe('parameterNameFromEnv', () => {
    it('returns the parameter name from the environment', () => {
        process.env.TEST_PARAM = '/aboutme/x';
        assert.equal(parameterNameFromEnv('TEST_PARAM'), '/aboutme/x');
        delete process.env.TEST_PARAM;
    });

    it('fails when the variable is not set', () => {
        delete process.env.TEST_PARAM;
        assert.throws(() => parameterNameFromEnv('TEST_PARAM'), /TEST_PARAM/);
    });
});
