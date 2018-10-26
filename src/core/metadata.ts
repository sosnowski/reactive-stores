import 'reflect-metadata';

const metaKey = Symbol('stores_metadata');

export interface SubStoreInfo {
    property: string;
    SubStore: any;
}

export interface StateInfo {
    field: string;
    freeze: boolean;
}

export interface MetadaRecord {
  state: StateInfo;
  actions: any[];
  subStores: SubStoreInfo[];
  isSubStore: boolean;
}

export const getMetdata = (target: any): MetadaRecord => {
  if (Reflect.hasMetadata(metaKey, target)) {
    return Reflect.getMetadata(metaKey, target);
  }
  return {
    state: { field: '', freeze: false },
    actions: [],
    subStores: [],
    isSubStore: false
  };
};

export const setMetadata = (target: any, data: MetadaRecord) => {
  Reflect.defineMetadata(metaKey, data, target);
};
