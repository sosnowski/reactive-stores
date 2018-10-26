import { Injector, Injectable } from '@angular/core';
import { Store as CoreStore } from '../core/store';
import { SubStoreInfo } from '../core/metadata';

@Injectable()
export class Store<T extends object> extends CoreStore<T> {
    constructor(injector: Injector) {
        super(function (subStoreInfo: SubStoreInfo) {
            console.log(`Sub store factory for: ${this.id}, create sub store: ${subStoreInfo.property}`);
            return injector.get(subStoreInfo.SubStore);
        });
    }
}
