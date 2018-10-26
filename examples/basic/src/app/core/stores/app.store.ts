import { Injector, Injectable } from '@angular/core';
import { Store } from '../../../store/angular/store';
import { State,  Action, SubStore } from '../../../store/core/decorators';
import { UserState, UserStore } from './user.store';

/**
 * Define a state interface to keep type safety
 */
export interface AppState {
    id: string;
    currentDate: Date;
    user?: UserState;
    displayMessage: boolean;
    counter: number;
}

/**
 * Store is simply a class that integrates easily with
 * Angular dependency injection system
 * So remember to use @Injectable
 */
@Injectable()
export class AppStore extends Store<AppState> {

    /**
     * Define initial state for the store
     */
    @State()
    private state: AppState = {
        id: 'AppStore',
        currentDate: new Date(),
        displayMessage: true,
        counter: 5
    };

    /**
     * @SubStore decorator us used to connect SubStore with it's Parent.
     */
    @SubStore(UserStore) user!: UserStore;

    /**
     * State can only be modified with actions
     * Action is simply a store method, marked with @Action decorator
     */
    @Action()
    incrementCounter(n: number = 1) {
        /**
         * You can modify state directly, don't have to worry about immutability
         * Stora will take care of it for you
         */
        this.state.counter += n;
    }

    @Action()
    decrementCounter(n: number = 1) {
        this.state.counter -= n;
    }
}
