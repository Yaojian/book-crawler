import cheerio from "cheerio";
import { executeCore, IBook, IBookInfo, IExecutionCallbacks, IListPage, ISiteOpts, IUrl } from "../core";
import { fetchUrl, removeSpaces, SamplingCounter } from "../utils";
import { configs, ICategory } from "./configs";

export async function execute(opts: ISiteOpts): Promise<void> {
  const callbacks: IExecutionCallbacks = { crawlUrls, crawlBooks };
  await executeCore(callbacks, opts);
}

async function crawlUrls(opts?: Pick<ISiteOpts, "sampling">): Promise<IUrl[]> {
  const result: IUrl[] = [];
  const c = new SamplingCounter(opts?.sampling);
  // 针对每个类别，得到该类别的所有书籍链接（包括首个列表页及后续列表页）
  for (let i = 0; i < configs.categories.length; i++) {
    const urls = await crawlCategoryUrls(configs.categories[i], opts);
    result.push(...urls);

    if (c.enough()) break;
  }

  return result;
}

export async function crawlCategoryUrls(category: ICategory, opts?: Pick<ISiteOpts, "sampling">): Promise<IUrl[]> {
  console.log(`processing category: ${category.name}`);
  const allBookUrls: string[] = [];

  const c = new SamplingCounter(opts?.sampling);
  let listUrl = categoryFirstUrl(category);
  while (listUrl) {
    console.log(`processing category ${category.name} url: ${listUrl}`);

    const res = await fetchUrl(listUrl);
    const { bookUrls, nextUrl } = await parseListPage(res.data);
    allBookUrls.push(...bookUrls);

    if (!nextUrl || nextUrl === listUrl) break;
    listUrl = nextUrl;

    if (c.enough()) break;
  }

  // associate category to each bookUrl
  return allBookUrls.map((bookUrl) => ({ url: bookUrl, info: category.name }));
}

export function parseListPage(html: string): IListPage {
  const $ = cheerio.load(html);

  // 处理列表项
  const $bookEls = $(configs.selectors.listPage.books);
  const bookUrls: string[] = [];
  $bookEls.each((index, el: any) => {
    const uri = el.attribs["href"];
    bookUrls.push(`http:${uri}`);
  });

  // 处理"后页"
  const $nextLinkEl = $(configs.selectors.listPage.next);
  const href = $nextLinkEl?.attr("href") ?? "";
  const nextListPageUri = `${configs.siteUrl}/${href}`;

  return { bookUrls, nextUrl: nextListPageUri };
}

/** 返回某类别的首个列表页的 url. */
function categoryFirstUrl(category: ICategory): string {
  const href = category.href;
  let result = href.substring(0, href.length - ".html".length);
  result = configs.siteUrl + "/" + result;
  // 增加 "当当发货","只看有货"
  result = result + "-f0%7C0%7C1%7C0%7C0%7C1%7C0%7C0%7C0%7C0%7C0%7C0%7C0%7C0%7C0.html";
  return result;
}

/** 爬取书籍详情页. */
async function crawlBooks(categorisedUrls: IUrl[], opts?: Pick<ISiteOpts, "sampling">): Promise<IBook[]> {
  const result: IBook[] = [];

  const c = new SamplingCounter(opts?.sampling);
  for (let i = 0; i < categorisedUrls.length; i++) {
    const { url, info } = categorisedUrls[i];
    console.log(`processing book (${i}/${categorisedUrls.length}): ${url}`);
    try {
      const res = await fetchUrl(url);
      const bookInfo = parseBookPage(res.data);
      result.push({ ...bookInfo, url, category: info });
    } catch (e) {
      console.log(`Error in process book: ${url}`, e);
    }

    if (c.enough()) break;
  }

  return result;
}

const isbnReg = /\d{9,}/g;

/** 处理书籍详情页. */
export function parseBookPage(html: string | Buffer): IBookInfo {
  const $ = cheerio.load(html);

  const rawTitle = $(configs.selectors.detailPage.title).text();
  const title = removeSpaces(rawTitle);

  const rating = $(configs.selectors.detailPage.rating).text().trim();

  const infoText = $(configs.selectors.detailPage.info).text();
  const props = [infoText];

  const isbnMatch = infoText.match(isbnReg);
  const isbn = Array.isArray(isbnMatch) && isbnMatch.length > 0 ? isbnMatch[0] : "";

  return { title, rating, isbn, props };
}
