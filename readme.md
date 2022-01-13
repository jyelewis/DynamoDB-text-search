# DynamoDB Text Search

---
**Disclaimer**

_This is a proof of concept._

DynamoDB is not a good fit for the job of text search.
Adding data to the index is extremely expensive, and fuzzy searching is not possible.

For production full text searching, I recommend [Elastic Search](https://www.elastic.co/) or [Postgres text search](https://www.postgresql.org/docs/9.5/textsearch.html).

---

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

### Installing & running
I've included 2 test scripts, one to load the index with some data and another to perform a search.
The Bible (not sure which version...) is included as test data

1. Install dependencies `yarn install`
2. Load data `yarn example:load-bible`
3. Search data `yarn example:search-bible "Abraham and Isaac"`
