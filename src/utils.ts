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
    .join();
}

export const DEFAULT_HTTP_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
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
