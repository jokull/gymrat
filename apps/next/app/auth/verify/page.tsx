import { SetPasswordForm } from "./components/SetPasswordForm";

// eslint-disable-next-line @typescript-eslint/require-await
export default async function Page({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const token = searchParams?.token?.toString();
  return (
    <div>
      <SetPasswordForm token={token} />
    </div>
  );
}
