import Path from "path";
import fs from "fs";
import axios from "axios";

export function loadFile(dirname: string, fileName: string): string {
  const file = Path.join(dirname, fileName);
  return fs.readFileSync(file, "utf-8");
}

export const DEFAULT_HTTP_HEADERS = {
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.164 Safari/537.36",
};

export async function fetchUrl(url: string) {
  return await axios.get<string>(url, {
    headers: DEFAULT_HTTP_HEADERS,
  });
}
