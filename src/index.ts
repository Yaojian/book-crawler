import { crawlerProgram } from "./cmd-args";
import { IAppArgs, Sites } from "./core";
import { execute as dangdangExecute } from "./dangdang/dangdang";
import { execute as doubanExecute } from "./douban/douban";

async function main() {
  const program = crawlerProgram(async (args) => {
    await execute(args);
  });
  await program.parseAsync(process.argv);
}

async function execute(appArgs: IAppArgs) {
  const { site } = appArgs;
  console.log(`Processing ${site}:`, appArgs);

  switch (site) {
    case Sites.douban:
      await doubanExecute(appArgs);
      break;
    case Sites.dangdang:
      await dangdangExecute(appArgs);
      break;
    case Sites.fake:
      // nothing to do
      break;
    default:
      throw new Error(`Unknown site [${site}].`);
  }
}

main().catch((err) => {
  console.log(err);
});
