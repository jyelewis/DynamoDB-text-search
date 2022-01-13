import { DTSIndex, DynamoTextSearch } from "../DynamoTextSearch";

export const dts = new DynamoTextSearch({
  tableName: "DTS_example",
  region: "ap-southeast-2",
  // can be used if this table is shared with other entities
  keyPrefix: "",
});

export const bibleIndex: DTSIndex = {
  name: "bible",

  // optional, the larger this value the more partitions entities will be distributed across
  // raise to increase read and write throughput, at the cost of more RCUs during searches
  // default: 1
  numShards: 5,

  // optional, specify custom characters to treat as a word boundary
  // delimiters: " .,;",

  // optional, specify characters to ignore from search input
  // ignoreChars: " .,:;!@#$%^&*()-+=_'",

  // optional, specify maximum number of searchable characters stored in each segment
  // maxSearchableLength: 50
};
