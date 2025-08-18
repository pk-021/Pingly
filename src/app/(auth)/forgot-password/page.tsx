
'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('Password reset email sent! Please check your inbox (and spam folder).');
    } catch (error: any) {
      console.error('Password Reset Error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError(`An error occurred: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">Reset Password</h1>
        <p className="text-balance text-muted-foreground">
          Enter your email to receive a password reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md border border-red-200">
            {error}
            </div>
        )}
        
        {success && (
            <div className="text-green-700 text-sm text-center bg-green-100 p-3 rounded-md border border-green-200">
            {success}
            </div>
        )}
        
        <Button type="submit" disabled={loading || !!success} className="w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        <Link href="/login" className="underline inline-flex items-center gap-1">
          <ArrowLeft className="h-3 w-3"/>
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
