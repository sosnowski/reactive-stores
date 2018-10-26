export const freezeState = <T extends object>(state: T): T => {
    const keys = Object.getOwnPropertyNames(state);
    for (const key of keys) {
        const value = (state as any)[key];
        (state as any)[key] = value && typeof value === 'object' ? freezeState<any>(value) : value;
    }
    return Object.freeze(state);
}