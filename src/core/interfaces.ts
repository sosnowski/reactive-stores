import { SubStoreInfo } from './metadata';
import { Store } from './store';

export type Action = <T>(...args: any[]) => T;

export type StoreFactory = <T extends object = any>(storeInfo: SubStoreInfo) => Store<T>;
