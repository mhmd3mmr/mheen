export const runtime = "edge";

import { getUsers } from "@/app/actions/adminActions";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return <AdminUsersClient initialUsers={users} />;
}
