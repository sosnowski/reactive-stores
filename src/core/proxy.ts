const canBeWrapped = (target: any) => !!target && typeof target === 'object' && !(target instanceof Date);

export class StateProxy<T extends object> {
    parent?: StateProxy<any>;
    proxy: T;
    state: T;
    newState?: T;
    changes: Partial<T> = {};
    isModified = false;
    children: { [P in keyof T]?: StateProxy<any> } = {};

    constructor(data: T, parent?: StateProxy<any>) {
        console.log(`Proxy ${(data as any).id} - Constructor`);
        this.parent = parent;
        this.state = data;
        this.proxy = new Proxy(data, {
            set: (source: T, key: keyof T, value: any, proxy: any) => {
                this.changes[key] = value;
                this.setModified();
                return true;
            },
            get: (source: T, key: keyof T, proxy: any) => {
                if (this.changes.hasOwnProperty(key)) { return this.changes[key]; }
                if (this.children.hasOwnProperty(key)) { return this.children[key].proxy; }
                if (this.state.hasOwnProperty(key) && canBeWrapped(this.state[key])) {
                    return this.createSubState(key);
                }
                return this.state[key];
            }
        });
    }

    setModified() {
        console.log(`Proxy ${(this.state as any).id} - setModified`);
        this.isModified = true;
        this.newState = undefined;
        if (this.parent) {
            this.parent.setModified();
        }
    }

    createSubState(key: keyof T) {
        console.log(`Proxy ${(this.state as any).id} - createSubState`);
        if (this.children.hasOwnProperty(key)) {
            throw new Error(`Substate for ${key} already exists!`);
        }
        if (!this.state.hasOwnProperty(key) || !canBeWrapped(this.state[key])) {
            throw new Error(`Value for ${key} cannot be wrapped as sub state!`);
        }
        this.children[key] = new StateProxy(this.state[key] as any, this);
        return this.children[key];
    }

    getOrCreateSubState(key: keyof T): StateProxy<any> {
        console.log(`Proxy ${(this.state as any).id} - getOrCreateSubState`);
        if (this.children.hasOwnProperty(key)) {
            return this.children[key];
        }
        return this.createSubState(key);
    }

    refreshState() {
        console.log(`Proxy ${(this.state as any).id} - refreshState`);
        if (!this.isModified) {
            console.log(`Not modified, don't refresh`);
            return;
        }
        this.state = Object.assign(
            Array.isArray(this.state) ? [] : {},
            this.state,
            this.changes
        );
        this.newState = undefined;
        this.isModified = false;
        Object.keys(this.children).forEach(childKey => {
            (this.children as any)[childKey].refreshState();
        });
    }

    calculateNewState() {
        console.log(`Proxy ${(this.state as any).id} - calculateNewState`);
        if (!this.isModified) {
            return this.state;
        }
        if (!this.newState) {
            console.log(`Proxy ${(this.state as any).id} - No new State Cached - calculate new one`);
            const subStates: any = {};
            Object.keys(this.children).forEach(childKey => {
                subStates[childKey] = (this.children as any)[childKey].calculateNewState();
            });
            this.newState = Object.assign(
                Array.isArray(this.state) ? [] : {},
                this.state,
                this.changes,
                subStates
            );
        }
        return this.newState;
    }
}
