import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { DTSIndex } from "./types/DTSIndex";
import { v4 as uuidv4 } from "uuid";
import { segmentsFromString } from "./util/segmentsFromString";
import { randomBetween } from "./util/randomBetween";
import { cleanTextForSearching } from "./util/cleanTextForSearching";
import { DTSIndexedItem } from "./types/DTSIndexedItem";
import { currentUnixTimestamp } from "./util/currentUnixTimestamp";
import { DTSConfig } from "./types/DTSConfig";

const defaultDelimiters = " .,;";
const defaultIgnoreChars = " .,:;!@#$%^&*()-+=_'";
const defaultMaxSearchableLength = 50;

export class DynamoTextSearch {
  private readonly db: DynamoDBDocument;

  public constructor(public readonly config: DTSConfig) {
    const client = new DynamoDBClient({
      region: this.config.region,
    });
    this.db = DynamoDBDocument.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }

  public async search<T extends object>({
    index,
    searchText,
    sortKey,
  }: {
    index: DTSIndex;
    searchText: string;
    sortKey?: string;
  }): Promise<DTSIndexedItem[]> {
    const fullIndex = this.indexWithDefaults(index);
    // search all shards in parallel

    let rawItems: DTSIndexedItem[] = [];
    await Promise.all(
      new Array(index.numShards).fill(null).map(async (_, i) => {
        const res = await this.db.query({
          TableName: this.config.tableName,
          KeyConditionExpression:
            "#indexShard = :indexShard and begins_with(#entryTextSegment, :search)",
          ExpressionAttributeNames: {
            "#indexShard": "indexShard",
            "#entryTextSegment": "entryTextSegment",
          },
          ExpressionAttributeValues: {
            ":indexShard": `${this.config.keyPrefix}${index.name}#${i + 1}`,
            ":search": cleanTextForSearching(searchText, fullIndex.ignoreChars),
          },
        });

        if (!res.Items) {
          console.error(res);
          throw new Error("Bad response when querying");
        }

        rawItems = rawItems.concat(res.Items as any);
      })
    );

    const deDupedItems = Array.from(new Set(rawItems));

    if (!sortKey) {
      return deDupedItems;
    }

    // TODO: support other sort value types
    // assuming sort value is a number
    deDupedItems.sort(
      (a, b) =>
        ((a as any)[sortKey] as number) - ((b as any)[sortKey] as number)
    );

    return deDupedItems;
  }

  public async addEntry({
    index,
    entryText,
    entry,
    delimiters,
    ttlSeconds,
  }: {
    index: DTSIndex;
    entryText: string;
    entry?: object;
    delimiters?: string;
    ttlSeconds?: number;
  }): Promise<void> {
    const fullIndex = this.indexWithDefaults(index);
    delimiters = delimiters || defaultDelimiters;

    const entryId = uuidv4();

    // split up searchText into items
    // limit at 25 so we can insert in a single batch write command
    const segments = segmentsFromString(
      entryText,
      delimiters,
      fullIndex.ignoreChars,
      fullIndex.maxSearchableLength
    ).slice(0, 25);

    const indexItems = segments
      .filter((x) => x)
      .map(
        (entryTextSegment) =>
          ({
            // store on a random shard
            indexShard: `${this.config.keyPrefix}${index.name}#${randomBetween(
              1,
              index.numShards || 1
            )}`,
            entryTextSegment,
            entryText,
            entry,
            entryId,
            ttl: ttlSeconds ? currentUnixTimestamp() + ttlSeconds : undefined,
          } as DTSIndexedItem)
      );

    if (indexItems.length === 0) {
      // nothing to store!
      return;
    }

    await this.db.batchWrite({
      RequestItems: {
        [this.config.tableName]: indexItems.map((item) => ({
          PutRequest: {
            Item: item,
          },
        })),
      },
    });
  }

  private indexWithDefaults(index: DTSIndex): Required<DTSIndex> {
    return {
      numShards: 1,
      delimiters: defaultDelimiters,
      ignoreChars: defaultIgnoreChars,
      maxSearchableLength: defaultMaxSearchableLength,
      ...index,
    };
  }
}
