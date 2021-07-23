import { Command, Option } from "commander";
import { IAppArgs, Site } from "./core";

type ProgramExecutor = (args: IAppArgs) => Promise<void>;

/**
 * 创建命令行参数分析器.
 * 动作:
 * * urls: 爬取列表, 获取列表页，分析列表页上的书籍链接，并且将链接放置到一个 array 中.
 * * books: 爬取书籍, 针对书籍 urls, 爬取每个 url, 分析页面，并且将结果保存到一个数组中.
 * * xlsx: 转换输出, 针对书籍爬取的结果，转换格式，将结果保存到对应的文件中.
 * @example
  book-crawler douban urls --urls-file douban-urls.json
  book-crawler douban books --urls-file douban-urls.json --books-file douban-books.json
  book-crawler douban xlsx --books-file douban-books.json --xlsx-file douban-books.xlsx
  book-crawler douban run --urls-file douban-urls.json --books-file douban-books.json --xlsx-file douban-books.xlsx

  book-crawler urls dangdang --urls-file dangdang-urls.json
  book-crawler books dangdang --urls-file dangdang-book-urls.json --books-file dangdang-books.json
  book-crawler xlsx dangdang --books-file dangdang-books.json --xlsx-file dangdang-books.xlsx
  book-crawler run dangdang --urls-file dangdang-urls.json --books-file dangdang-books.json --xlsx-file dangdang-books.xlsx
*/
export function crawlerProgram(executor?: ProgramExecutor): Command {
  const urlsOption = new Option("-uf, --urls-file [urlsFile]", "json 格式的书籍链接文件.").default("book-urls.json");
  const booksOption = new Option("-bf, --books-file [booksFile]", "json 格式的书籍信息文件.").default("books.json");
  const xlsxOption = new Option("-xf, --xlsx-file [xlsxFile]", "Excel 格式的书籍信息文件.").default("books.xlsx");
  const samplingOption = new Option(
    "-s, --sampling <sampling>",
    "设定采样数量，通常用于测试, 0 表示无限制."
  ).argParser<number>((value) => parseInt(value));

  const program = new Command().version("0.0.1").description("书籍信息爬虫.");

  const douban = program.command("douban").description("爬取 豆瓣网");
  addCommonSubCommands(douban, "douban");

  const dangdang = program.command("dangdang").description("爬取 当当网");
  addCommonSubCommands(dangdang, "dangdang");

  const fake = program.command("fake").description("不爬取，用于演示命令行参数解析.");
  addCommonSubCommands(fake, "fake");

  return program;

  function addCommonSubCommands(siteCmd: Command, site: Site) {
    const urlsCmd = siteCmd
      .command("urls")
      .description("获取 json 格式的书籍详情页地址.")
      .addOption(urlsOption)
      .addOption(samplingOption)
      .action(async (opts) => {
        if (executor) await executor({ site, ...opts, runUrls: true });
      });
    const booksCmd = siteCmd
      .command("books")
      .description("获取 json 格式的书籍信息.")
      .addOption(urlsOption)
      .addOption(booksOption)
      .addOption(samplingOption)
      .action(async (opts) => {
        if (executor) await executor({ site, ...opts, runBooks: true });
      });
    const xlsxCmd = siteCmd
      .command("xlsx")
      .description("将 json 格式的书籍信息转换为 Excel 格式.")
      .addOption(booksOption)
      .addOption(xlsxOption)
      .addOption(samplingOption)
      .action(async (opts) => {
        if (executor) await executor({ site, ...opts, runXlsx: true });
      });
    const runCmd = siteCmd
      .command("run")
      .description("依次执行命令 list, books, xlsx.")
      .addOption(urlsOption)
      .addOption(booksOption)
      .addOption(xlsxOption)
      .addOption(samplingOption)
      .action(async (opts) => {
        if (executor) await executor({ site, ...opts, runUrls: true, runBooks: true, runXlsx: true });
      });
    return { urlsCmd, booksCmd, xlsxCmd, runCmd };
  }
}
