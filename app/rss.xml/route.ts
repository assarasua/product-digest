import { getAllPostsFromApi } from "@/lib/posts-api";

export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toCdata(value: string) {
  return value.replaceAll("]]>", "]]]]><![CDATA[>");
}

function renderInlineMarkdown(input: string) {
  let output = escapeXml(input);
  output = output.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
  return output;
}

function renderMdxToHtml(input: string) {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const html: string[] = [];
  let inList = false;
  let inCode = false;
  let codeLanguage = "";

  const closeList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    const codeFenceMatch = line.match(/^```([\w-]+)?\s*$/);
    if (codeFenceMatch) {
      closeList();
      if (!inCode) {
        inCode = true;
        codeLanguage = codeFenceMatch[1] ?? "";
        const className = codeLanguage ? ` class="language-${escapeXml(codeLanguage)}"` : "";
        html.push(`<pre><code${className}>`);
      } else {
        inCode = false;
        codeLanguage = "";
        html.push("</code></pre>");
      }
      continue;
    }

    if (inCode) {
      html.push(escapeXml(line));
      continue;
    }

    if (!line.trim()) {
      closeList();
      continue;
    }

    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      closeList();
      html.push(`<h2>${renderInlineMarkdown(h2[1])}</h2>`);
      continue;
    }

    const h3 = line.match(/^###\s+(.+)$/);
    if (h3) {
      closeList();
      html.push(`<h3>${renderInlineMarkdown(h3[1])}</h3>`);
      continue;
    }

    const bullet = line.match(/^- (.+)$/);
    if (bullet) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${renderInlineMarkdown(bullet[1])}</li>`);
      continue;
    }

    closeList();
    html.push(`<p>${renderInlineMarkdown(line)}</p>`);
  }

  closeList();

  if (inCode) {
    html.push("</code></pre>");
  }

  return html.join("\n");
}

export async function GET() {
  const posts = await getAllPostsFromApi();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://productdigest.es";
  const feedUrl = `${siteUrl}/rss.xml`;
  const lastBuildDate = posts[0] ? new Date(posts[0].updatedAt ?? posts[0].date).toUTCString() : new Date().toUTCString();

  const items = posts
    .map((post) => {
      const url = `${siteUrl}/post/${post.slug}`;
      return `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${url}</link>
  <guid>${url}</guid>
  <pubDate>${new Date(post.date).toUTCString()}</pubDate>
  <description>${escapeXml(post.summary)}</description>
  <content:encoded><![CDATA[${toCdata(renderMdxToHtml(post.body))}]]></content:encoded>
</item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
  <title>Product Digest</title>
  <link>${siteUrl}</link>
  <description>Análisis y escritura diaria sobre gestión de producto.</description>
  <language>es-ES</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  <generator>Next.js Product Digest RSS</generator>
  <ttl>60</ttl>
  <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
  ${items}
</channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
