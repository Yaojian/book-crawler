import * as fs from "fs";
import { jsonOutputPath, xlOutputPath } from "./common";
import { xlWriteBooks } from "./transforms";
import { crawlDangdangSite } from "./dangdang/dangdang";

async function crawl() {
  // const books = await crawlDoubanSite();
  const books = await crawlDangdangSite();
  const json = JSON.stringify(books);
  fs.writeFileSync(jsonOutputPath, json, { encoding: "utf-8" });

  await xlWriteBooks(books, xlOutputPath);
}

crawl().catch((err) => console.log(err));
