import { redirect } from "next/navigation";

/** Bookmarks and notes now live in the Revision area. */
export default function BookmarksPage() {
  redirect("/revision?tab=bookmarks");
}
