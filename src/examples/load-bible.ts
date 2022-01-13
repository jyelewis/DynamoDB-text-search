import fs from "fs/promises";
import pMap from "p-map";
import { bibleIndex, dts } from "./common";

async function main() {
  // load and clean data
  const bibleBuff = await fs.readFile(
    __dirname + "/../../example-data/bible.txt"
  );
  const bibleLines = bibleBuff
    .toString()
    .split("\n")
    .map((x) => x.trim())
    .filter((x) => x);

  // bulk import data,
  await pMap(
    bibleLines,
    (line: string, index: number) => {
      if (index % 500 === 0) {
        console.log(`${index} items loaded`);
      }

      return dts.addEntry({
        index: bibleIndex,
        entryText: line,
        entry: {
          lineNum: index + 1,
        },
      });
    },
    {
      concurrency: 5,
    }
  );
}

main().catch(console.error);
