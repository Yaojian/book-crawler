import { processDoubanSite } from "./douban/douban";

async function main() {
  await processDoubanSite();
}

main().catch((err) => console.log(err));
