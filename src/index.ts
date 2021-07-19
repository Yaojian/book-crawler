import { crawlDoubanSite } from "./douban/douban";
import * as fs from "fs";
import { jsonOutputPath } from "./common";

async function crawl() {
  const bookInfos = await crawlDoubanSite();
  const json = JSON.stringify(bookInfos);
  fs.writeFileSync(jsonOutputPath, json, { encoding: "utf-8" });
}

crawl().catch((err) => console.log(err));
