import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { z } from "zod";

const postsDir = path.join(process.cwd(), "content/posts");

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const dateFieldSchema = z
  .union([z.string(), z.date()])
  .transform((value) => (value instanceof Date ? value.toISOString().slice(0, 10) : value))
  .refine((value) => isoDateRegex.test(value), "Expected YYYY-MM-DD");

const frontmatterSchema = z.object({
  title: z.string().min(1),
  date: dateFieldSchema,
  summary: z.string().min(1),
  tags: z.array(z.string().min(1)),
  draft: z.boolean().optional().default(false),
  coverImage: z.string().optional(),
  updatedAt: dateFieldSchema.optional()
});

if (!fs.existsSync(postsDir)) {
  console.log("No content/posts directory found; content check skipped.");
  process.exit(0);
}

const files = fs
  .readdirSync(postsDir)
  .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
  .sort();

let hasErrors = false;

for (const fileName of files) {
  const fullPath = path.join(postsDir, fileName);
  const source = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(source);
  const validated = frontmatterSchema.safeParse(parsed.data);

  if (!validated.success) {
    hasErrors = true;
    const details = validated.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
    console.error(`Invalid frontmatter in ${fileName}: ${details}`);
  }
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Content check passed for ${files.length} post(s).`);
