import { Injectable } from '@angular/core';
import { SubStore } from '../../../store/angular/sub-store';
import { State,  Action, SubStore as SubStoreDec } from '../../../store/core/decorators';
import { RolesState, RolesStore } from './roles.store';

export interface UserState {
    id: string;
    name: string;
    lastName: string;
    age: number;
    roles?: RolesState;
}


@Injectable()
export class UserStore extends SubStore<UserState> {

    @State()
    private state: UserState = {
        id: 'UserState',
        name: 'Damian',
        lastName: 'Sosnowski',
        age: 32
    };

    @SubStoreDec(RolesStore)
    roles!: RolesStore;

    @Action()
    setName(name: string) {
        this.state.name = name;
    }
}
