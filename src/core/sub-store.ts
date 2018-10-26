import { Store } from './store';

export class SubStore<T extends object> extends Store<T> {
    init(initialState: T) {
        this.initialState = initialState;
    }
}
