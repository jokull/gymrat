import { ReactNode } from "react";

import Header from "~/app/_components/header-";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-full flex-col">
      <Header page="dashboard" />
      <div className="my-4 flex grow flex-col gap-4 pb-4 sm:my-8 sm:gap-8">
        {children}
      </div>
    </div>
  );
}
