export const createSessionProvider = <T>(login: () => Promise<T>) => {
    let session: T | undefined;

    const getSession = async (): Promise<T> => {
        if (session === undefined) {
            session = await login();
        }

        return session;
    };

    const resetSession = (): void => {
        session = undefined;
    };

    return { getSession, resetSession };
};
