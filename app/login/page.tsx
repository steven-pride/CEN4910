import { BuildingOffice2Icon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from 'next/link';

export default function LoginPage() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/50 px-4 py-12 sm:px-6">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-5 flex size-12 items-center justify-center rounded-xl bg-primary text-brand-cyan-foreground">
            <BuildingOffice2Icon aria-hidden="true" className="size-6" />
          </div>
          <p className="mb-2 text-sm font-semibold text-brand-white">
            Building Energy Tracker
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-card-foreground">
            Login
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to manage your building energy data.
          </p>
        </div>

        <form className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email address
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <Button type="button" variant="default" size="lg" className="w-full">
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account? <Link href="/register" className="underline text-blue-600 hover:text-blue-800">Register here.</Link>
        </p>
      </section>
    </main>
  );
}
