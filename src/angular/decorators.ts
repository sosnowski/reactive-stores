import { Store } from './store';
import { map } from 'rxjs/operators';
import { Component } from '@angular/core';
import { OperatorFunction } from 'rxjs';

type StoreSelector<T> = (component: any) => T;
type Mapper<T, R> = (value: T, index: number) => R;

export const StoreValue = <T extends object, R>(
    storeField: string | StoreSelector<Store<T>>, mapFunction: Mapper<T, R> | OperatorFunction<any, any>[]) => {
    return (targetPrototype: any, targetName: string) => {

    };
};

export const StoreSelect = <T extends object = any, R = any>(
    storeField: string | StoreSelector<Store<T>>, mapFunction: Mapper<T, R> | OperatorFunction<any, any>[]) => {
    return (targetPrototype: any, targetName: string) => {
        const hiddenkey = Symbol(name);
        const toPipe = Array.isArray(mapFunction) ? mapFunction : [ map(mapFunction) ];
        Object.defineProperty(targetPrototype, targetName, {
            get() {
                if (!this[hiddenkey]) {
                    const store = typeof storeField === 'string' ? this[storeField] : storeField(this);
                    if (!store || !(store instanceof Store)) {
                        throw new Error(`Store not found in the component!`);
                    }

                    this[hiddenkey] = store.updates.pipe(...toPipe);
                }
                return this[hiddenkey];
            }
        });
    };
};
