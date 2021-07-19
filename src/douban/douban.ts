import cheerio from "cheerio";
import { IBook, IBookInfo } from "../common";
import { fetchUrl } from "../utils";
import http2 from "http2";

export const DoubanConfig = {
  siteUrl: "http://book.douban.com",
  /** 第一个列表页 URI*/
  firstListUrl: "http://book.douban.com/tag/%E4%BA%BA%E7%89%A9%E4%BC%A0%E8%AE%B0?start=0",

  selectors: {
    /** 列表页的选择器. */
    listPage: {
      /** 获取书籍列表, 返回一个数组, 每个元素代表一本书.*/
      books: "#subject_list .subject-item .info h2 a",
      /** 从列表页获取 “后页”, 形如：<a href="/tag/人物传记?start=20&type=T">后页</a> */
      next: "#subject_list > div.paginator > span.next > a",
    },
    detailPage: {
      title: "#wrapper > h1 > span",
      info: "#info",
      rating: "#interest_sectl > div > div.rating_self.clearfix > strong",
    },
  },
};

export async function crawlDoubanSite(): Promise<IBook[]> {
  // 获取所有的书的详情页的链接
  const bookUrls = await collectBookUrls(DoubanConfig.firstListUrl);
  // 爬取每本书的详情页
  return await crawlBooks(bookUrls);
}

/** 代表一个列表页的内容。 */
interface IListContent {
  /** 该列表页包含的书籍的详情页链接 */
  bookUrls: string[];
  /** 列表的 “后页” 链接. */
  nextListUrl: string | undefined;
}

/** 处理所有列表页，返回一个包含所有书籍的 url 的数组. */
async function collectBookUrls(firstListUrl: string): Promise<string[]> {
  let url: string = firstListUrl;

  const result: string[] = [];

  while (url) {
    console.log(`processing list: ${url}`);

    const res = await fetchUrl(url);
    const listPageResult: IListContent = await parseListHtml(res.data);
    const { bookUrls, nextListUrl } = listPageResult;
    result.push(...bookUrls);

    if (!nextListUrl || nextListUrl === url) break;
    url = nextListUrl;
  }

  return result;
}

/** 处理一个列表页. */
export function parseListHtml(html: string): IListContent {
  const $ = cheerio.load(html);

  // 处理列表项
  const $bookEls = $(DoubanConfig.selectors.listPage.books);
  const bookUrls: string[] = [];
  $bookEls.each((index, el: any) => {
    const uri = el.attribs["href"];
    bookUrls.push(uri);
  });

  // 处理"后页"
  const $nextLinkEl = $(DoubanConfig.selectors.listPage.next);
  const href = $nextLinkEl?.attr("href") ?? ""; // /tag/人物传记?start=20&amp;type=T;
  const nextListPageUri = concatUri(href);

  return { bookUrls, nextListUrl: nextListPageUri };
}

export async function crawlBooks(bookUrls: string[]): Promise<IBook[]> {
  const books: IBook[] = [];

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i];
    try {
      console.log(`process book (${i}/${bookUrls.length}): ${url}`);

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

const isbnLabel = "ISBN: ";

/** 处理书籍详情页. */
export function parseBookHtml(html: string): IBookInfo {
  const $ = cheerio.load(html);

  const title = $(DoubanConfig.selectors.detailPage.title).text(); // <span property="v:itemreviewed">陈延年：站着从容就义</span>
  const rating = $(DoubanConfig.selectors.detailPage.rating).text().trim();

  const infoText = $(DoubanConfig.selectors.detailPage.info).text();
  const props = normalizeProps(infoText);

  const isbnItem = props.find((line) => line.startsWith(isbnLabel));
  const isbn = isbnItem?.substring(isbnLabel.length) ?? "";

  return { title, rating, isbn, props };
}

/** 移除空行 */
function normalizeProps(infoText: string): string[] {
  return infoText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

function concatUri(pathComponent: string | undefined): string | undefined {
  if (!pathComponent) return undefined;
  return encodeURI(DoubanConfig.siteUrl + pathComponent);
}
