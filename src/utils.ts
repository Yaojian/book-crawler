import Path from "path";
import fs from "fs";
import axios from "axios";
import iconv from "iconv-lite";

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
  const ct: string = response.headers["content-type"];
  if (ct.includes("charset=GB2312") || ct.includes("charset=gb2312")) {
    response.data = iconv.decode(response.data, "gb2312");
  } else if (ct.includes("charset=GBK") || ct.includes("charset=gbk")) {
    response.data = iconv.decode(response.data, "gbk");
  }
  return response;
});

export async function fetchUrl(url: string) {
  return await axiosUtf8.get<string>(url, {
    headers: DEFAULT_HTTP_HEADERS,
  });
}
