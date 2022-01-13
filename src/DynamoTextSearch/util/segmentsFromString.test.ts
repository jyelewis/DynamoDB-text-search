import {segmentsFromString} from "./segmentsFromString";

describe("segmentsFromString", () => {
  it("basic", () => {
    expect(segmentsFromString("Hello world", " ", " ", 8)).toEqual(["hellowo", "world"]);

    expect(segmentsFromString("Hello world, hows it going", " ,", " ,", 15)).toEqual([
      "helloworldho",
      "worldhowsit",
      "howsitgoing",
      "itgoing",
      "going"
    ]);
  });
})