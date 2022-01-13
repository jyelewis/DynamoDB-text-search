import { bibleIndex, dts } from "./common";

// provide text string as second argument
// e.g. 'node dist/examples/search-bible "Jesus said"'

async function main() {
  const searchText = process.argv[2];
  const start = Date.now();
  const items = await dts.search({
    index: bibleIndex,
    searchText,
    sortKey: "lineNum",
  });
  const time = Date.now() - start;

  console.log(`Found ${items.length} items in ${time}ms`);

  const formattedResponse = items.map(
    (item) => `Line ${item.entry?.lineNum} - ${item.entryText}`
  );
  console.log(formattedResponse.join("\n"));
}

main().catch(console.error);
