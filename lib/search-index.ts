import fs from "node:fs";
import path from "node:path";

export type SearchDocument = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  date: string;
  text: string;
};

export function readSearchIndex(): SearchDocument[] {
  const filePath = path.join(process.cwd(), "public/search-index.json");
  if (!fs.existsSync(filePath)) {
    return [];
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8")) as SearchDocument[];
}
