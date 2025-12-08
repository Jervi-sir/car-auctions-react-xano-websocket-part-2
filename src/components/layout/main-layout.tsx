import type { ReactNode } from "react";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <main className="mx-auto flex max-w-5xl flex-1 px-4 py-6">
      <div className="w-full space-y-4">{children}</div>
    </main>
  );
}
