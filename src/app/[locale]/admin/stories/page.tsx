export const runtime = "edge";

import { getAllStories } from "@/app/actions/adminActions";
import AdminStoriesClient from "./AdminStoriesClient";

export default async function AdminStoriesPage() {
  const stories = await getAllStories();

  return <AdminStoriesClient initialStories={stories} />;
}
