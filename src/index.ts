import { crawlDoubanSite } from "./douban/douban";
import * as fs from "fs";
import { jsonOutputPath, xlOutputPath } from "./common";
import { xlWriteBooks } from "./transforms";

async function crawl() {
  const books = await crawlDoubanSite();
  const json = JSON.stringify(books);
  fs.writeFileSync(jsonOutputPath, json, { encoding: "utf-8" });

  await xlWriteBooks(books, xlOutputPath);
}

crawl().catch((err) => console.log(err));
