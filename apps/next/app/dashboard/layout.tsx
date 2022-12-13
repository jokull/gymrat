import { trpc } from "@/trpc/server";
import { ReactNode } from "react";
import Header from "../components/Header";

export default async function Layout({ children }: { children: ReactNode }) {
  const user = await trpc.user.query();
  return (
    <div className="flex flex-col h-screen">
      {/* @ts-expect-error github.com/microsoft/TypeScript/pull/51328 */}
      <Header page="dashboard" />
      {children}
      <footer>
        <p className="text-xs text-neutral-700">{user.apiKey}</p>
      </footer>
    </div>
  );
}
