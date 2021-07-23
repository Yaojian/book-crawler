import cheerio from "cheerio";
import { executeCore, IBook, IBookInfo, IExecutionCallbacks, IListPage, ISiteOpts, IUrl } from "../core";
import { fetchUrl, SamplingCounter } from "../utils";
import { configs } from "./configs";

export async function execute(opts: ISiteOpts): Promise<void> {
  const callbacks: IExecutionCallbacks = { crawlUrls, crawlBooks };
  await executeCore(callbacks, opts);
}

/** 处理所有列表页，返回一个包含所有书籍的 url 的数组. */
async function crawlUrls(opts?: Pick<ISiteOpts, "sampling">): Promise<IUrl[]> {
  const allBookUrls: string[] = [];

  const c = new SamplingCounter(opts?.sampling);
  let listUrl: string = configs.firstListUrl;
  while (listUrl) {
    console.log(`processing list: ${listUrl}`);

    const res = await fetchUrl(listUrl);
    const listPageResult: IListPage = await parseListPage(res.data);
    const { bookUrls, nextUrl } = listPageResult;
    allBookUrls.push(...bookUrls);

    if (!nextUrl || nextUrl === listUrl) break;
    listUrl = nextUrl;

    if (c.enough()) break;
  }

  return allBookUrls.map((url) => ({ url }));
}

/** 处理一个列表页. */
export function parseListPage(html: string): IListPage {
  const $ = cheerio.load(html);

  // 处理列表项
  const $bookEls = $(configs.selectors.listPage.books);
  const bookUrls: string[] = [];
  $bookEls.each((index, el: any) => {
    const uri = el.attribs["href"];
    bookUrls.push(uri);
  });

  // 处理"后页"
  const $nextLinkEl = $(configs.selectors.listPage.next);
  const href = $nextLinkEl?.attr("href") ?? ""; // /tag/人物传记?start=20&amp;type=T;
  const nextListPageUri = concatUri(href);

  return { bookUrls, nextUrl: nextListPageUri };
}

export async function crawlBooks(bookUrls: IUrl[], opts?: Pick<ISiteOpts, "sampling">): Promise<IBook[]> {
  const books: IBook[] = [];
  const c = new SamplingCounter(opts?.sampling);

  for (let i = 0; i < bookUrls.length; i++) {
    const url = bookUrls[i].url;
    try {
      console.log(`process book (${i}/${bookUrls.length}): ${url}`);

      const res = await fetchUrl(url);
      const info = parseBookPage(res.data);
      const book = { ...info, url };
      books.push(book);
    } catch (e) {
      console.log(e);
    }
    if (c.enough()) break;
  }

  return books;
}

const isbnLabel = "ISBN: ";

/** 处理书籍详情页. */
export function parseBookPage(html: string): IBookInfo {
  const $ = cheerio.load(html);

  const title = $(configs.selectors.detailPage.title).text(); // <span property="v:itemreviewed">陈延年：站着从容就义</span>
  const rating = $(configs.selectors.detailPage.rating).text().trim();

  const infoText = $(configs.selectors.detailPage.info).text();
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
  return encodeURI(configs.siteUrl + pathComponent);
}
