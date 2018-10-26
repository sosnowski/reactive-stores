import { getMetdata } from '../core/metadata';

const getStoreClasses = (StoreClass: any) => {
    const meta = getMetdata(StoreClass.prototype);
    return [StoreClass, ...meta.subStores.map(subStoreInfo => getStoreClasses(subStoreInfo.SubStore))];
};

export const provideAsRoot = (RootStoreClass: any) => {
    const subStoreClasses = getStoreClasses(RootStoreClass);
    return [RootStoreClass, ...subStoreClasses];
};
