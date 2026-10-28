import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { createSessionProvider } from './garmin-session.js';

describe('createSessionProvider', () => {
    it('logs in once and reuses the session', async () => {
        let logins = 0;
        const { getSession } = createSessionProvider(async () => ({ id: ++logins }));

        const first = await getSession();
        const second = await getSession();

        assert.equal(first, second);
        assert.equal(logins, 1);
    });

    it('retries the login after a failure', async () => {
        let attempts = 0;
        const { getSession } = createSessionProvider(async () => {
            attempts += 1;
            if (attempts === 1) {
                throw new Error('bad login');
            }
            return { attempts };
        });

        await assert.rejects(getSession, /bad login/);
        const session = await getSession();

        assert.equal(session.attempts, 2);
    });

    it('logs in again after the session is reset', async () => {
        let logins = 0;
        const { getSession, resetSession } = createSessionProvider(async () => ({ id: ++logins }));

        const first = await getSession();
        resetSession();
        const second = await getSession();

        assert.notEqual(first, second);
        assert.equal(logins, 2);
    });
});
