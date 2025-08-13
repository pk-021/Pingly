
'use client';

import { useState } from 'react';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { createUserProfile } from '@/lib/data-service';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAuthSuccess = async (user: User) => {
    try {
        // This function will now safely handle both new and returning users.
        await createUserProfile({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName
        });
        // Using replace so the user can't go "back" to the login page.
        router.replace('/dashboard');
    } catch (e: any) {
         // This error is specifically for when profile creation fails after a successful login.
         const errorMessage = `Login successful, but failed to create your user profile: ${e.message}`;
         console.error(errorMessage, e);
         setError(errorMessage);
         setLoading(false);
    }
}

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
      
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please check your Firebase and Google Cloud console settings.');
      } else if (error.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked by your browser. Please allow pop-ups and try again.');
      } else {
        setError(`An unknown sign-in error occurred: ${error.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid w-[350px] gap-6">
        <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Sign In</h1>
            <p className="text-balance text-muted-foreground">
                Use your Google account to access your dashboard.
            </p>
        </div>

        <div className="space-y-4">
            <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full"
                variant="outline"
            >
                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12	s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20	s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039	l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36	c-5.222,0-9.655-3.373-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path><path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571	l6.19,5.238C42.022,35.283,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
            </Button>
      
            {error && (
                <div className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md border border-red-200">
                {error}
                </div>
            )}
        </div>
    </div>
  );
}
