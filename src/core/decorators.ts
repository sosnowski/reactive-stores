import { MetadaRecord, StateInfo, getMetdata, setMetadata } from './metadata';

export const State = (config?: StateInfo) => {
  return (prototype: any, propertyKey: string) => {
    const meta: MetadaRecord = getMetdata(prototype);
    meta.state = {
        freeze: false,
        field: propertyKey,
        ...(config || {}),
    };
    setMetadata(prototype, meta);
  };
};

export const Action = () => {
  return (prototype: any, propertyKey: string) => {
    const meta: MetadaRecord = getMetdata(prototype);
    meta.actions.push(propertyKey);
    setMetadata(prototype, meta);
  };
};

export const SubStore = (SubStoreClass: any) => {
    return (prototype: any, propertyKey: string) => {
        const meta: MetadaRecord = getMetdata(prototype);
        meta.subStores.push({
            property: propertyKey,
            SubStore: SubStoreClass
        });
        setMetadata(prototype, meta);
    };
};
