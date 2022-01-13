# DynamoDB Text Search

---
**Disclaimer**

_This is a proof of concept._

DynamoDB is not a good fit for the job of text search.
Adding data to the index is extremely expensive, and fuzzy searching is not possible.

For production full text searching, I recommend [Elastic Search](https://www.elastic.co/) or [Postgres text search](https://www.postgresql.org/docs/current/textsearch.html).

---

## Usage
Create a DTS instance
```typescript
export const dts = new DynamoTextSearch({
  tableName: "DTS_example",
  region: "ap-southeast-2",
  // can be used if this table is shared with other entities
  keyPrefix: "",
});
```

Define an index
```typescript
export const myIndex: DTSIndex = {
  name: "myIndex",

  // optional, the larger this value the more partitions entities will be distributed across
  // raise to increase read and write throughput, at the cost of more RCUs during searches
  // default: 1
  // numShards: 1,

  // optional, specify custom characters to treat as a word boundary
  // delimiters: " .,;",

  // optional, specify characters to ignore from search input
  // ignoreChars: " .,:;!@#$%^&*()-+=_'",

  // optional, specify maximum number of searchable characters stored in each segment
  // maxSearchableLength: 50
};
```

Load some entries
```typescript
const dataItems = await loadMydata();

await Promise.all(
  dataItems.map(dataItem =>
    dts.addEntry({
      index: myIndex,
      entryText: dataItem.text,
      entry: dataItem,
    })
  )
)
```

Perform a search
```typescript
const searchResults = await dts.search({
  index: myIndex,
  searchText: "hello world",
  sortKey: "dateCreated",
});

console.log(`Found ${searchResults.length} items`);
console.log(searchResults);
```


See below for examples

## Setup

### Dynamo DB table
Create a table as per the configuration in `infra/dynamo-text-search/main.tf`

_OR_ use terraform to auto create the table:
```shell
cd infra
terraform init
terraform apply
cd ../
```

### Installing & running examples
I've included 2 test scripts, one to load the index with some data and another to perform a search.
The Bible (not sure which version...) is included as test data

1. Install dependencies `yarn install`
2. Load data `yarn example:load-bible`
   1. Load as much data as you would like, then cancel the ingest with ctrl-c
   2. If you let this run, the whole bible will be ingested. With a small number of WCUs provisioned this may take a few minutes.
   3. Ingesting the entire example dataset to an on-demand table costs about $1.50 USD
3. Search data `yarn example:search-bible "Abraham and Isaac"`

## Performance
Loading data can be slow. With a provisioned table at 10,000 WCUs I was able to ingest the bible in about 30 seconds.
Loading data is also quiet expensive, loading this example data set costs about $1.50 USD

Querying data is extremely fast, Once the data has been loaded RCUs can be increased to allow up to `numShards * 6,000` queries per second
There is no limit to the amount of data that can be stored in a single index, performance will remain constant with any size index.

Once data has been loaded, the number of shards cannot be changed - the data will have to be re-imported with a new index configuration.
