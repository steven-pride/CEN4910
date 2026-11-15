'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export type LoginState = {
  success?: boolean
  error?: string
}

export async function login(
  _prevState: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const supabase = await createClient()

  const email = (formData.get('email') as string)?.trim()
  const password = formData.get('password') as string

  if (!email || !password) {
    return { success: false, error: 'Email and password are required.' }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export type SignupState = {
  success: boolean
  error?: string
}

function isAutoAssignAdminEnabled(): boolean {
  const envVal =
    process.env.AUTO_ASSIGN_ADMIN_ON_REGISTRATION ?? '';

  const normalized = envVal.trim().toLowerCase();
  return normalized === 'true';
}

async function autoAssignAdminAndProperties(userId: string, email: string) {
  try {
    const adminClient = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    // 1. Assign admin role in user_profile
    const { error: profileError } = await adminClient
      .from('user_profile')
      .upsert(
        {
          user_id: userId,
          email,
          role: 'admin',
        },
        { onConflict: 'user_id' }
      );

    if (profileError) {
      console.error('Failed to auto-assign admin role in user_profile:', profileError);
    }

    // 2. Fetch all properties
    const { data: properties, error: propError } = await adminClient
      .from('property')
      .select('property_id');

    if (propError) {
      console.error('Failed to fetch properties for auto-assignment:', propError);
      return;
    }

    if (properties && properties.length > 0) {
      // 3. Assign all properties to the newly registered user
      const assignments = properties.map((prop) => ({
        user_id: userId,
        property_id: prop.property_id,
      }));

      const { error: assignError } = await adminClient
        .from('property_assignment')
        .upsert(assignments, { onConflict: 'user_id,property_id' });

      if (assignError) {
        console.error('Failed to assign properties to new admin user:', assignError);
      }
    }
  } catch (err) {
    console.error('Error during auto-assignment of admin role and properties:', err);
  }
}

export async function signup(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { success: false, error: error.message }
  }

  if (isAutoAssignAdminEnabled() && data?.user?.id) {
    await autoAssignAdminAndProperties(data.user.id, email);
  }

  return { success: true }
}