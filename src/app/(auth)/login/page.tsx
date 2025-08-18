
'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, User, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { createUserProfile, getUserProfile } from '@/lib/data-service';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const router = useRouter();

  const handleAuthSuccess = async (user: User, name?: string) => {
    try {
      // Check if a profile already exists.
      const existingProfile = await getUserProfile(user.uid);

      if (!existingProfile) {
          // For sign up, the name is provided from the form.
          // For Google sign in, the name comes from the Google profile.
          const finalName = name || user.displayName;

          if (!user.displayName && finalName) {
            await updateProfile(user, { displayName: finalName });
          }

          // Create the profile since it doesn't exist
          await createUserProfile({
              uid: user.uid,
              email: user.email,
              displayName: finalName
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

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
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
                setIsSignUp(false);
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

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await setPersistence(auth, browserLocalPersistence);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handleAuthSuccess(result.user);
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      
      let errorMessage = `Google Sign-In failed: ${error.message}`;
      
      if (error.code) {
        switch (error.code) {
          // User cancelled the sign-in flow
          case 'auth/cancelled-popup-request':
          case 'auth/popup-closed-by-user':
            errorMessage = 'Sign-in was cancelled. Please try again.';
            break;
            
          // Popup was blocked by browser
          case 'auth/popup-blocked':
            errorMessage = 'Pop-up was blocked by your browser. Please allow pop-ups for this site and try again.';
            break;
            
          // Account exists with different credential
          case 'auth/account-exists-with-different-credential':
            errorMessage = 'An account already exists with the same email address but different sign-in credentials. Try signing in with your email and password.';
            break;
            
          // Network errors
          case 'auth/network-request-failed':
            errorMessage = 'Network error occurred. Please check your internet connection and try again.';
            break;
            
          // Too many requests
          case 'auth/too-many-requests':
            errorMessage = 'Too many failed attempts. Please wait a moment before trying again.';
            break;
            
          // Invalid API key or configuration
          case 'auth/invalid-api-key':
            errorMessage = 'Authentication configuration error. Please contact support.';
            break;
            
          // Auth domain not authorized
          case 'auth/unauthorized-domain':
            errorMessage = 'This domain is not authorized for authentication. Please contact support.';
            break;
            
          // Operation not allowed
          case 'auth/operation-not-allowed':
            errorMessage = 'Google Sign-In is not enabled. Please contact support.';
            break;
            
          // Invalid credential
          case 'auth/invalid-credential':
            errorMessage = 'The credential received is malformed or has expired. Please try again.';
            break;
            
          // User disabled
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled. Please contact support.';
            break;
            
          // Web storage unsupported
          case 'auth/web-storage-unsupported':
            errorMessage = 'Your browser does not support web storage or it is disabled. Please enable cookies and try again.';
            break;
            
          // Internal error
          case 'auth/internal-error':
            errorMessage = 'An internal error occurred. Please try again later.';
            break;
            
          default:
            errorMessage = `Google Sign-In failed: ${error.message}`;
        }
      }
      
      // Handle specific error types that might not have codes
      if (error.name === 'FirebaseError' && !error.code) {
        errorMessage = 'Firebase authentication error occurred. Please try again.';
      }
      
      // Handle network-related errors without specific codes
      if (error.message?.includes('network') || error.message?.includes('offline')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
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

      <form onSubmit={handleEmailSubmit} className="grid gap-4">
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
                 <Link href="/forgot-password" className="ml-auto inline-block text-sm underline">
                    Forgot your password?
                 </Link>
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

        {isSignUp && (
            <div className="grid gap-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                id="confirm-password"
                type="password"
                required={isSignUp}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                />
            </div>
        )}
        
        {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-3 rounded-md border border-red-200">
            {error}
            </div>
        )}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <Button variant="outline" onClick={handleGoogleSignIn} disabled={loading}>
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 381.5 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 21.2 177.2 56.4l-63.1 61.9C338.4 99.8 298.8 80 248 80c-82.8 0-150.5 67.7-150.5 150.5S165.2 406.5 248 406.5c48.4 0 91.4-21.8 122.3-56.9l-66.3-54.3c-15.1 32.3-46.2 54.3-82.3 54.3-50.5 0-93.9-39.2-105.4-90.3H40.2c21.8 103.9 120.3 177.3 228.3 177.3 64.9 0 122.6-24.1 163.5-64.4 20.3-20.1 34.1-46.3 43-75.3H248v-96.1h239.9z"></path></svg>
        Google
      </Button>
      
      <div className="mt-4 text-center text-sm">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        <button onClick={() => {setIsSignUp(!isSignUp); setError(null);}} className="underline ml-1">
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </div>
    </div>
  );
}
