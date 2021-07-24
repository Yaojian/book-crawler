import axios from "axios";
import charset from "charset";
import fs from "fs";
import http2 from "http2";
import iconv from "iconv-lite";
import Path from "path";

export function loadFile(dirname: string, fileName: string): string {
  const file = Path.join(dirname, fileName);
  return fs.readFileSync(file, "utf-8");
}

export function removeSpaces(text: string): string {
  if (!text) return "";

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join();
}

export const DEFAULT_HTTP_HEADERS = {
  Accept: "text/html,application/xhtml+xml,application/xml",
  "User-Agent": "Chrome/91.0.4472.164",
};

export const axiosUtf8 = axios.create({ headers: DEFAULT_HTTP_HEADERS, responseType: "arraybuffer" });
axiosUtf8.interceptors.response.use(function (response) {
  const cs = charset(response.headers, response.data) ?? "utf-8";
  if (["utf8", "utf-8"].indexOf(cs) < 0) {
    response.data = iconv.decode(response.data, cs);
  }
  if (response.data instanceof Buffer) {
    response.data = response.data.toString();
  }
  return response;
});

export async function fetchUrl(url: string) {
  const res = await axiosUtf8.get<string>(url, {
    headers: DEFAULT_HTTP_HEADERS,
  });
  if (res.status != http2.constants.HTTP_STATUS_OK) {
    // noinspection ExceptionCaughtLocallyJS
    throw new Error(`Error response status ${res.status} for ${url}.`);
  }
  return res;
}

const quotaDisabled = () => false;
/**
 * 定义一个用于限制循环次数的计次器。
 * @returns ()=>boolean 对该函数的每次调用将会增加计次，当计次小于或等于上限时返回 false, 否则返回 true.
 * */
export function quota(max?: number): () => boolean {
  if (max !== undefined) {
    let count: number = 0;
    return () => ++count >= max;
  }
  return quotaDisabled;
}
