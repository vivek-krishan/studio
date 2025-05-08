import { AuthForm } from '@/components/auth/AuthForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Eval-Lite',
  description: 'Sign up for Eval-Lite.',
};

export default function SignupPage() {
  return <AuthForm mode="signup" />;
}
