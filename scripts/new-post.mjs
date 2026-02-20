import fs from "node:fs";
import path from "node:path";

const postsDir = path.join(process.cwd(), "content/posts");
const rawTitle = process.argv.slice(2).join(" ").trim();

if (!rawTitle) {
  console.error('Usage: npm run new:post -- "Your post title"');
  process.exit(1);
}

const now = new Date();
const date = now.toISOString().slice(0, 10);
const slug = rawTitle
  .toLowerCase()
  .replace(/[^a-z0-9\s-]/g, "")
  .trim()
  .replace(/\s+/g, "-")
  .replace(/-+/g, "-");

const fileName = `${date}-${slug}.mdx`;
const filePath = path.join(postsDir, fileName);

if (fs.existsSync(filePath)) {
  console.error(`Post already exists: ${filePath}`);
  process.exit(1);
}

const template = `---
title: "${rawTitle.replace(/"/g, '\\"')}"
date: "${date}"
summary: "Write a concise one-sentence takeaway."
tags:
  - product-management
  - notes
status: "scheduled"
publishAt: "${date}T08:00:00+01:00"
---

## Context

What problem or opportunity are you unpacking today?

## Insight

What changed your perspective?

## Next action

What should happen next based on this note?
`;

fs.mkdirSync(postsDir, { recursive: true });
fs.writeFileSync(filePath, template);
console.log(`Created ${filePath}`);
