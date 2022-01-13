
export type DTSIndexedItem = {
  indexShard: string;
  entryTextSegment: string;
  entryText: string;
  entryId: string;
  entry: undefined | any;
  ttl?: number;
};