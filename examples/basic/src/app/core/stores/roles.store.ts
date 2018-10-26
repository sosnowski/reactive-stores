import { Injectable } from '@angular/core';
import { SubStore } from '../../../store/angular/sub-store';
import { State,  Action } from '../../../store/core/decorators';

export interface RolesState {
    id: string;
    canEdit: boolean;
    canRead: boolean;
    canAdmin: boolean;
}
@Injectable()
export class RolesStore extends SubStore<RolesState> {
    @State()
    private state: RolesState = {
        id: 'RolesState',
        canEdit: false,
        canRead: false,
        canAdmin: false
    };

    @Action()
    setCanEdit() {
        this.state.canEdit = true;
    }
}
