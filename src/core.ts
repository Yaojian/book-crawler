import * as xl from "exceljs";
import fs from "fs";
import { SamplingCounter } from "./utils";

export const Sites = Object.freeze({
  douban: "douban" as const,
  dangdang: "dangdang" as const,
  fake: "fake" as const,
});

type SiteTypes = typeof Sites;
export type Site = SiteTypes[keyof SiteTypes];

/** 针对特定目标站点的选项. */
export interface ISiteOpts {
  runUrls?: boolean;
  runBooks?: boolean;
  runXlsx?: boolean;
  urlsFile: string;
  booksFile: string;
  xlsxFile: string;
  sampling?: number;
}

/** 应用程序的命令行参数. */
export interface IAppArgs extends ISiteOpts {
  site: Site;
}

/** Represents a url with user-specific information. */
export interface IUrl {
  url: string;
  info?: string;
}

/** 代表一个列表页的内容。 */
export interface IListPage {
  /** 该列表页包含的书籍的详情页链接 */
  bookUrls: string[];
  /** 列表的 “后页” 链接. */
  nextUrl: string | undefined;
}

export interface IBookInfo {
  isbn: string;
  title: string;
  rating?: string;
  props?: string[];
  category?: string;
}

export interface IBook extends IBookInfo {
  url: string;
}

/** 加载书籍链接文件. */
export function loadUrls(urlsFile: string): IUrl[] {
  const content = fs.readFileSync(urlsFile, { encoding: "utf-8" });
  const json = JSON.parse(content);

  // validate the json format
  if (!Array.isArray(json)) throw new Error(`Invalid refs file [${urlsFile}].`);
  if (json.length > 0) {
    const first = json[0];
    if (first.url === undefined) throw new Error(`Invalid refs file [${urlsFile}].`);
  }

  return json;
}

/** 加载书籍信息文件. */
export function loadBooks(booksFile: string): IBook[] {
  const content = fs.readFileSync(booksFile, { encoding: "utf-8" });
  const json = JSON.parse(content);

  // validate the json format
  if (!Array.isArray(json)) throw new Error(`Invalid books file [${booksFile}].`);
  if (json.length > 0) {
    const first = json[0];
    if (first.title === undefined) throw new Error(`Invalid books file [${booksFile}].`);
  }

  return json;
}

export async function xlWriteBooks(books: IBook[], fileName: string, opts?: Pick<ISiteOpts, "sampling">) {
  const xlWorkbook = new xl.Workbook();
  const xlSheet = xlWorkbook.addWorksheet("books");

  const c = new SamplingCounter(opts?.sampling);
  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    // console.log(`processing book:`, book);
    // if (!book.isbn) console.log(`book [${i}] without isbn:`, book);

    const row = xlSheet.getRow(i + 1);

    row.getCell(1).value = book.isbn ?? "";
    row.getCell(2).value = book.title ?? "";
    row.getCell(3).value = book.rating ?? "";
    row.getCell(4).value = book.url ?? "";
    row.getCell(5).value = book.category ?? "";
    row.getCell(6).value = book.props?.join(",") ?? "";

    row.commit();

    if (c.enough()) break;
  }
  // xlSheet.commit();

  await xlWorkbook.xlsx.writeFile(fileName);
}

export interface IExecutionCallbacks {
  crawlUrls(opts: ISiteOpts): Promise<IUrl[]>;
  crawlBooks(urls: IUrl[], opts: ISiteOpts): Promise<IBook[]>;
}

export async function executeCore(callbacks: IExecutionCallbacks, opts: ISiteOpts): Promise<void> {
  let urls: IUrl[] | undefined = undefined;
  if (opts.runUrls) {
    urls = await callbacks.crawlUrls(opts);
    fs.writeFileSync(opts.urlsFile, JSON.stringify(urls), { encoding: "utf-8" });
  }

  let books: IBook[] | undefined = undefined;
  if (opts.runBooks) {
    if (urls === undefined) urls = loadUrls(opts.urlsFile);
    books = await callbacks.crawlBooks(urls, opts);
    fs.writeFileSync(opts.booksFile, JSON.stringify(books), { encoding: "utf-8" });
  }

  if (opts.runXlsx) {
    if (books === undefined) books = loadBooks(opts.booksFile);
    await xlWriteBooks(books, opts.xlsxFile, opts);
  }
}
