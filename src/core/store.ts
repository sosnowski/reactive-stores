import { MetadaRecord, getMetdata, SubStoreInfo, StateInfo } from './metadata';
import { BehaviorSubject, Observable, ReplaySubject } from 'rxjs';
import { Action, StoreFactory } from './interfaces';
import { StateProxy } from './proxy';
import { freezeState } from './freeze';

export abstract class Store<T extends object> {

    protected metaData: MetadaRecord;
    protected subStores!: Map<keyof T, Store<any>>;
    protected updatesSubject!: ReplaySubject<T>;
    protected updates$!: Observable<T>;

    protected stateProxy?: StateProxy<T>;
    protected isActionPending = false;
    protected root?: Store<any>;
    protected initialState?: T;
    protected id = this.constructor.name;

    get updates() {
        return this.updates$;
    }

    constructor(subStoreFactory: StoreFactory) {
        console.log(`Call ${this.id} - Constructor`);
        this.metaData = getMetdata(this);
        const { actions, subStores, state } = this.metaData;

        this.createStateField(state);
        this.createActions(actions);
        this.createUpdatesStream();
        this.createSubStores(subStoreFactory, subStores);
    }

    protected init(initialState: T) {
        console.log(`Call ${this.id} - init`);

        this.initialState = initialState;

        const initState = this.getInitialState();

        if (!initState) {
            throw new Error('No initial state provided!');
        }

        const newProxy = this.createStateProxy(initState);
        this.setProxy(newProxy);
    }

    private setProxy(stateProxy: StateProxy<T>, notify: boolean = false) {
        console.log(`Call ${this.id} - setProxy`);
        const { state } = this.metaData;
        this.stateProxy = stateProxy;
        this.subStores.forEach((store, key: keyof T) => {
            store.setProxy(stateProxy.getOrCreateSubState(key), notify);
        });

        const newState = this.stateProxy.calculateNewState();
        if (newState) {
            this.emitStateUpdate(newState);
        }
    }

    private getInitialState(): T {
        console.log(`Call ${this.id} - getState`);
        const { state: stateInfo } = this.metaData;
        const state = (this as any)[stateInfo.field];
        if (!state) {
            throw new Error(`Initial state is missing in store ${this.constructor.name}!`);
        }
        this.subStores.forEach((store, key) => {
            state[key] = store.getInitialState();
        });
        return state;
    }

    private createStateProxy(rawState: T): StateProxy<T> {
        console.log(`Call ${this.id} - createStateProxy`);
        return new StateProxy(rawState);
    }

    private setRoot(root: Store<any>) {
        console.log(`Call ${this.id} - setRoot`);
        this.root = root;
    }

    private createStateField(state: StateInfo) {
        Object.defineProperty(this, state.field, {
            get: () => {
                if (this.stateProxy) {
                    return this.stateProxy.proxy;
                }
                return this.initialState;
            },
            set: (value: T) => {
                this.init(value);
            }
        });
    }

    private createActions(actions: string[]) {
        console.log(`Call ${this.id} - createActions`);
        actions.forEach(actionKey => {
            const me = (this as any);
            if (!me[actionKey]) {
                throw new Error(`Missing action method for ${actionKey}`);
            }
            me[actionKey] = me.executeAction.bind(this, me[actionKey]);
        });
    }

    private createSubStores(factory: StoreFactory, subStores: SubStoreInfo[]) {
        console.log(`Call ${this.id} - createSubStores`);
        this.subStores = new Map();
        subStores.forEach(subStoreData => {
            if (this.subStores.has(subStoreData.property as keyof T)) {
                throw new Error(`Duplicated propery name ${subStoreData.property} for sub store`);
            }
            const subStore = factory.call(this, subStoreData);
            subStore.setRoot(this.root || this);
            this.subStores.set(subStoreData.property as keyof T, subStore);

            Object.defineProperty(this, subStoreData.property, {
                get() {
                    return this.subStores.get(subStoreData.property);
                }
            });
        });
    }

    private createUpdatesStream(): void {
        console.log(`Call ${this.id} - createUpdateStream`);
        this.updatesSubject = new ReplaySubject<T>(1);
        this.updates$ = this.updatesSubject.asObservable();
    }

    private executeAction(action: Action, ...args: any[]) {
        console.log(`Call ${this.id} - executeAction - ${action.name}`);
        if (!this.stateProxy) { throw new Error(`State is not set in the store!`); }
        if (this.stateProxy.isModified) {
            throw new Error(`Error in Action ${action.name}! State has been modified outside of action!`);
        }
        if (this.isActionPending) {
            throw new Error(`Error in Action ${action.name}: Other action is already pending`);
        }
        this.isActionPending = true;
        const result: T | undefined = action.apply(this, args);
        this.isActionPending = false;
        this.onActionFinished();
    }

    private onActionFinished() {
        console.log(`Call ${this.id} - onActionFinished`);
        if (this.root) {
            this.root.onActionFinished();
        } else {
            this.checkForChangesAndEmit();
            this.stateProxy.refreshState();
        }
    }

    private checkForChangesAndEmit() {
        console.log(`Call ${this.id} - checkForChangesAndEmit`);
        if (this.stateProxy && this.stateProxy.isModified) {
            this.subStores.forEach((store) => {
                store.checkForChangesAndEmit();
            });

            const newState = this.stateProxy.calculateNewState();
            if (newState) {
                this.emitStateUpdate(newState);
            }
        }
    }

    private emitStateUpdate(state: T) {
        console.log(`Call ${this.id} - emitStatusUpdate`);
        const { state: stateInfo } = this.metaData;
        this.updatesSubject.next(stateInfo.freeze ? freezeState(state) : state);
    }
}
