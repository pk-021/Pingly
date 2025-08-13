
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/lib/data-service';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  const handleAuthSuccess = async (user: User, name?: string) => {
    try {
      if (isSignUp && name) {
        await updateProfile(user, { displayName: name });
        await createUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: name
        });
      }
      router.replace('/dashboard');
    } catch (e: any) {
      const errorMessage = `Authentication successful, but failed to set up user profile: ${e.message}`;
      console.error(errorMessage, e);
      setError(errorMessage);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        if (!displayName) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential.user, displayName);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await handleAuthSuccess(userCredential.user);
      }
    } catch (error: any) {
      console.error('Authentication Error:', error);
      let errorMessage = `An unknown error occurred: ${error.message}`;
      if (error.code) {
        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'No account found with this email. Please sign up.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'Incorrect password. Please try again.';
                break;
            case 'auth/email-already-in-use':
                errorMessage = 'An account with this email already exists. Please sign in.';
                break;
            case 'auth/weak-password':
                errorMessage = 'The password must be at least 6 characters long.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Please enter a valid email address.';
                break;
            default:
                errorMessage = `Authentication failed: ${error.message}`;
        }
      }
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-6">
      <div className="grid gap-2 text-center">
        <h1 className="text-3xl font-bold">{isSignUp ? 'Create Account' : 'Sign In'}</h1>
        <p className="text-balance text-muted-foreground">
          Enter your information to {isSignUp ? 'create an account' : 'access your dashboard'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        {isSignUp && (
            <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                id="name"
                type="text"
                placeholder="John Doe"
                required={isSignUp}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>
        )}
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
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && (
                 <a href="#" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                 </a>
            )}
          </div>
          <Input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md border border-red-200">
            {error}
            </div>
        )}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </form>
      
      <div className="mt-4 text-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => {setIsSignUp(!isSignUp); setError(null);}} className="underline ml-1">
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </div>
    </div>
  );
}
