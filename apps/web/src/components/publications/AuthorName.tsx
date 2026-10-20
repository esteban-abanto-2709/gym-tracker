import type { ExploreSocial } from "@/lib/types";

export function AuthorName({ author }: { author: ExploreSocial["author"] }) {
  return <span>{author.username}</span>;
}
