import Link from "next/link";

export default async function Home() {
  return (
    <div>
      Go to <Link href="/dashboard">/dashboard</Link>
    </div>
  );
}
