import { IBook, IBookInfo } from "../common";
import { fetchUrl, removeSpaces } from "../utils";
import cheerio from "cheerio";
import http2 from "http2";
import * as fs from "fs";
import iconv from "iconv-lite";

interface ICategory {
  readonly category: string;
  readonly href: string;
}

export const DangdangConfig = {
  siteUrl: "http://category.dangdang.com",
  categories: [
    { category: "科学家", href: "cp01.38.16.00.00.00.html" },
    { category: "女性人物", href: "cp01.38.07.00.00.00.html" },
    { category: "财经人物", href: "cp01.38.01.00.00.00.html" },
    { category: "历代帝王", href: "cp01.38.02.00.00.00.html" },
    { category: "历史人物", href: "cp01.38.06.00.00.00.html" },
    { category: "政治人物", href: "cp01.38.05.00.00.00.html" },
    { category: "领袖首脑", href: "cp01.38.03.00.00.00.html" },
    { category: "自传", href: "cp01.38.25.00.00.00.html" },
    { category: "军事人物", href: "cp01.38.04.00.00.00.html" },
    { category: "国学大师", href: "cp01.38.17.00.00.00.html" },
    { category: "体育明星", href: "cp01.38.19.00.00.00.html" },
    { category: "艺术家", href: "cp01.38.15.00.00.00.html" },
    { category: "文学家", href: "cp01.38.14.00.00.00.html" },
    { category: "人物合集", href: "cp01.38.21.00.00.00.html" },
    { category: "影视明星", href: "cp01.38.18.00.00.00.html" },
    { category: "哲学家", href: "cp01.38.10.00.00.00.html" },
    { category: "学者", href: "cp01.38.27.00.00.00.html" },
    { category: "宗教人物", href: "cp01.38.09.00.00.00.html" },
    { category: "画传", href: "cp01.38.26.00.00.00.html" },
    { category: "教育家", href: "cp01.38.12.00.00.00.html" },
    { category: "人文/社会学家", href: "cp01.38.11.00.00.00.html" },
    { category: "法律人物", href: "cp01.38.08.00.00.00.html" },
    { category: "语言文字学家", href: "cp01.38.13.00.00.00.html" },
    { category: "其他人物传记", href: "cp01.38.28.00.00.00.html" },
    { category: "建筑设计师", href: "cp01.38.91.00.00.00.html" },
    { category: "家族研究/谱系", href: "cp01.38.23.00.00.00.html" },
    { category: "年谱", href: "cp01.38.24.00.00.00.html" },
    { category: "传记的研究与编写", href: "cp01.38.22.00.00.00.html" },
  ] as ReadonlyArray<ICategory>,
  selectors: {
    /** 列表页的选择器. */
    listPage: {
      /** 获取书籍列表, 返回一个数组, 每个元素代表一本书.*/
      books: ".bigimg > li> p.name > a",
      /** 从列表页获取 “后页”, 形如：<a href="/pg3-cp01.38.07.00.00.00.html" title="下一页">下一页</a> */
      next: ".paging > ul> li.next > a",
    },
    detailPage: {
      title: "#product_info > div.name_info > h1",
      info: "#detail_describe > ul",
      rating: "#comment_percent",
      isbn: "#detail_describe > ul >li",
    },
  },
};

interface IBookUrlInfo {
  category: ICategory;
  bookUrl: string;
}

export async function crawlDangdangSite(): Promise<IBook[]> {
  // 获取所有的书的详情页的链接
  const bookUrlInfos = await collectBookUrlInfos(DangdangConfig.categories);
  console.log(bookUrlInfos);
  fs.writeFileSync("dangdang-book-url-info.json", JSON.stringify(bookUrlInfos), "utf-8");
  // 爬取每本书的详情页
  return await crawlBooks(bookUrlInfos);
}

export async function collectBookUrlInfos(categories: ReadonlyArray<ICategory>): Promise<IBookUrlInfo[]> {
  const allBookUrlInfos: IBookUrlInfo[] = [];
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const bookUrlInfos = await collectBookUrlInfosForCategory(category);
    allBookUrlInfos.push(...bookUrlInfos);
  }
  return allBookUrlInfos;
}

/** 代表一个列表页的内容。 */
interface IListContent {
  /** 该列表页包含的书籍的详情页链接 */
  bookUrls: string[];
  /** 列表的 “后页” 链接. */
  nextListUrl: string | undefined;
}

export async function collectBookUrlInfosForCategory(category: ICategory): Promise<IBookUrlInfo[]> {
  console.log(`processing category: ${category.category}`);

  let url: string = categoryUrl(category);

  const allBookUrls: string[] = [];

  while (url) {
    console.log(`processing category ${category.category} list: ${url}`);

    const res = await fetchUrl(url);
    const { bookUrls, nextListUrl } = await parseListHtml(res.data);
    // console.log(`bookUrls for category: ${category.category}\n`, bookUrls);
    allBookUrls.push(...bookUrls);

    if (!nextListUrl || nextListUrl === url) break;
    url = nextListUrl;
  }

  console.log(`allBookUrls\n`, allBookUrls);

  return allBookUrls.map((bookUrl) => ({ category, bookUrl }));
}

function categoryUrl(category: ICategory): string {
  const href = category.href;
  let result = href.substring(0, href.length - ".html".length);
  result = DangdangConfig.siteUrl + "/" + result;
  // 增加 "当当发货","只看有货"
  result = result + "-f0%7C0%7C1%7C0%7C0%7C1%7C0%7C0%7C0%7C0%7C0%7C0%7C0%7C0%7C0.html";
  return result;
}

export function parseListHtml(html: string): IListContent {
  const $ = cheerio.load(html);

  // 处理列表项
  const $bookEls = $(DangdangConfig.selectors.listPage.books);
  const bookUrls: string[] = [];
  $bookEls.each((index, el: any) => {
    const uri = el.attribs["href"];
    bookUrls.push(`http:${uri}`);
  });

  // 处理"后页"
  const $nextLinkEl = $(DangdangConfig.selectors.listPage.next);
  const href = $nextLinkEl?.attr("href") ?? "";
  const nextListPageUri = concatUri(href);

  return { bookUrls, nextListUrl: nextListPageUri };
}

export async function crawlBooks(bookUrlInfos: IBookUrlInfo[]): Promise<IBook[]> {
  const books: IBook[] = [];

  for (let i = 0; i < bookUrlInfos.length; i++) {
    const url = bookUrlInfos[i].bookUrl;
    try {
      console.log(`process book (${i}/${bookUrlInfos.length}): ${url}`);

      const res = await fetchUrl(url);
      if (res.status != http2.constants.HTTP_STATUS_OK) {
        // noinspection ExceptionCaughtLocallyJS
        throw new Error(`Error response status ${res.status} for ${url}.`);
      }
      const info = parseBookHtml(res.data);
      const book = { ...info, url };
      books.push(book);
    } catch (e) {
      console.log(e);
    }
  }

  return books;
}

const isbnReg = /\d{9,}/g;

/** 处理书籍详情页. */
export function parseBookHtml(html: string): IBookInfo {
  const $ = cheerio.load(html);

  const rawTitle = $(DangdangConfig.selectors.detailPage.title).text();
  const title = removeSpaces(rawTitle);

  const rating = $(DangdangConfig.selectors.detailPage.rating).text().trim();

  const infoText = $(DangdangConfig.selectors.detailPage.info).text();
  const props = [infoText];

  const isbnMatch = isbnReg.exec(infoText);
  const isbn = Array.isArray(isbnMatch) && isbnMatch.length > 0 ? isbnMatch[0] : "";

  return { title, rating, isbn, props };
}

function concatUri(pathComponent: string | undefined): string | undefined {
  if (!pathComponent) return undefined;
  return encodeURI(DangdangConfig.siteUrl + pathComponent);
}
