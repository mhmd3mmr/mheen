export const runtime = "edge";

import { getAllCommunityPhotos } from "@/app/actions/adminActions";
import AdminCommunityPhotosClient from "./AdminCommunityPhotosClient";

export default async function AdminCommunityPhotosPage() {
  const photos = await getAllCommunityPhotos();
  return <AdminCommunityPhotosClient initialPhotos={photos} />;
}
