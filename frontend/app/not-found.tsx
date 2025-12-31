import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 text-slate-100">
      <h1 className="text-4xl font-bold text-brand-foreground">404 - Page Not Found</h1>
      <p className="mt-2 text-slate-400">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-6">
        <Button className="border-blue-500 text-blue-400 hover:bg-blue-500/10">
          Go Home
        </Button>
      </Link>
    </div>
  );
}
