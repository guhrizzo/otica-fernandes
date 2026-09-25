import type { Metadata } from "next";
import AdminClient from "./admin-client";
import "./admin.css";

export const metadata: Metadata = {
  title: "Painel | Ótica Fernandes",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminClient />;
}
