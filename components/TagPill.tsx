import Link from "next/link";

export function TagPill({ tag }: { tag: string }) {
  return (
    <Link href={`/tag/${encodeURIComponent(tag)}`} className="tag-pill">
      {tag}
    </Link>
  );
}
