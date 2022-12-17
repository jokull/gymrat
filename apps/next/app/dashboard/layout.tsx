import { ReactNode } from "react";

import Header from "../components/Header";

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col h-full">
      <Header page="dashboard" />
      <div className="my-4 sm:my-8 pb-4 flex flex-col gap-4 sm:gap-8 grow">
        {children}
      </div>
    </div>
  );
}
