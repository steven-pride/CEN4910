'use client'

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { signup, type SignupState } from '@/lib/authActions';

const initialState: SignupState = { success: false }

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(signup, initialState)

  // Auto-redirect a few seconds after the account is created
  useEffect(() => {
    if (!state.success) return
    const timer = setTimeout(() => router.push('/login'), 4000)
    return () => clearTimeout(timer)
  }, [state.success, router])

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
            Register
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Create an account to get started.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
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
              autoComplete="new-password"
              placeholder="Enter your password"
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">
              Confirm Password
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm your password"
              required
              className="h-11 rounded-lg bg-background"
            />
          </div>

          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? 'Creating account...' : 'Sign up'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="underline text-blue-600 hover:text-blue-800">Login here.</Link>
        </p>
      </section>

      
      <AlertDialog
        open={state.success}
        onOpenChange={(open) => {
          // Covers Escape key / any other dismissal
          if (!open) router.push('/login')
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Account created</AlertDialogTitle>
            <AlertDialogDescription>
              Your account has been created successfully. You will be
              redirected to the login page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push('/login')}>
              Go to login
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </main>
  );
}
