import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import AuthClient from "./AuthClient";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return <AuthClient />;
}
