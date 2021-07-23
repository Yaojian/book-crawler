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

/** 用于采样计数. */
export class SamplingCounter {
  constructor(private readonly limit?: number) {}

  private count: number = 0;

  public enough() {
    if (this.limit !== undefined && this.limit > 0) {
      this.count++;
      if (this.count >= this.limit) return true;
    }
    return false;
  }
}
