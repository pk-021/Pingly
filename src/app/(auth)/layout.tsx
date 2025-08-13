// Enhanced login page with comprehensive debugging

'use client';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, updateProfile, type User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createUserProfile, debugAuthState, testSecurityRules, testFirestoreConnection } from "@/lib/data-service";

export default function LoginPage() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [debugMode, setDebugMode] = useState(false);

    useEffect(() => {
        if (!loading && user) {
            console.log("✅ User authenticated, redirecting to dashboard");
            router.replace('/dashboard');
        }
    }, [user, loading, router]);

    // Enhanced debugging function
    const runDiagnostics = async () => {
        console.log("🔧 Running comprehensive diagnostics...");
        debugAuthState();
        
        const isConnected = await testFirestoreConnection();
        console.log("Firestore connectivity:", isConnected ? "✅ Connected" : "❌ Failed");
        
        if (auth.currentUser) {
            await testSecurityRules();
        }
    };

    const handleAuthSuccess = async (user: User, newDisplayName?: string) => {
        console.log(`🎉 Authentication successful for user: ${user.uid}`);
        console.log("User details:", {
            uid: user.uid,
            email: user.email,
            displayName: newDisplayName || user.displayName,
            emailVerified: user.emailVerified,
            providerData: user.providerData
        });

        try {
            // Wait a moment for auth state to fully propagate
            console.log("⏳ Waiting for auth state to stabilize...");
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log("📝 Calling createUserProfile...");
            await createUserProfile({
                uid: user.uid,
                email: user.email,
                displayName: newDisplayName || user.displayName
            });
            
            console.log("✅ Profile creation completed successfully");
            console.log("🚀 Navigating to dashboard...");
            router.replace('/dashboard');
            
        } catch (e: any) {
            console.error("💥 CRITICAL: Failed to create profile after login:", e);
            
            const errorMessage = `Login successful, but failed to create profile: ${e.message}`;
            setError(errorMessage);
            
            // Show detailed error to user in debug mode
            if (debugMode) {
                alert(`Detailed Error Information:\n\nError: ${e.message}\nCode: ${e.code || 'unknown'}\nStack: ${e.stack}`);
            } else {
                alert(`${errorMessage}\n\nTip: Enable debug mode for more details.`);
            }
        }
    };
    
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        
        console.log("📧 Starting email authentication...");
        console.log("Sign up mode:", isSignUp);
        
        if (isSignUp) {
            if (!displayName.trim()) {
                setError("Display name is required for sign up.");
                return;
            }
            try {
                console.log("Creating new user with email/password...");
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log("✅ User created, updating profile...");
                await updateProfile(userCredential.user, { displayName: displayName.trim() });
                console.log("✅ Profile updated, proceeding to profile creation...");
                await handleAuthSuccess(userCredential.user, displayName.trim());
            } catch (error: any) {
                console.error("❌ Email sign-up failed:", error);
                setError(`Sign up failed: ${error.message}`);
            }
        } else {
            try {
                console.log("Signing in with email/password...");
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log("✅ Sign-in successful, proceeding to profile creation...");
                await handleAuthSuccess(userCredential.user);
            } catch (error: any) {
                console.error("❌ Email sign-in failed:", error);
                setError(`Sign in failed: ${error.message}`);
            }
        }
    };
    
    const handleGoogleSignIn = async () => {
        setError(null);
        console.log("🔍 Starting Google sign-in...");
        
        const provider = new GoogleAuthProvider();
        // Force account selection
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        
        try {
            console.log("Opening Google sign-in popup...");
            const result = await signInWithPopup(auth, provider);
            console.log("✅ Google sign-in successful:", {
                uid: result.user.uid,
                email: result.user.email,
                displayName: result.user.displayName
            });
            await handleAuthSuccess(result.user);
        } catch (error: any) {
            console.error("❌ Google sign-in failed:", error);
            setError(`Google sign-in failed: ${error.message}`);
        }
    };

    if (loading || user) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="mx-auto grid w-[350px] gap-6 text-center">
                    <p>Loading...</p>
                    {loading && <p className="text-sm text-gray-500">Checking authentication...</p>}
                </div>
            </div>
        );
    }

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
            {/* Left side branding */}
            <div className="hidden bg-primary lg:flex items-center justify-center">
                <div className="flex items-center gap-4 text-primary-foreground">
                    <div className="p-3 rounded-lg bg-primary-foreground/20">
                        <svg
                            className="text-primary-foreground"
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12 6C9.79 6 8 7.79 8 10C8 12.21 9.79 14 12 14C14.21 14 16 12.21 16 10C16 7.79 14.21 6 12 6ZM12 12C10.9 12 10 11.1 10 10C10 8.9 10.9 8 12 8C13.1 8 14 8.9 14 10C14 11.1 13.1 12 12 12Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <span className="font-headline text-5xl">Pingly</span>
                </div>
            </div>

            {/* Right side form */}
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">{isSignUp ? 'Create an Account' : 'Login'}</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your credentials to continue
                        </p>
                    </div>

                    {/* Error display */}
                    {error && (
                        <div className="text-sm text-center text-red-500 bg-red-100 p-3 rounded-md border border-red-200">
                            <div className="font-medium mb-1">Error</div>
                            <div>{error}</div>
                        </div>
                    )}

                    {/* Debug mode toggle */}
                    <div className="flex items-center justify-between text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={debugMode}
                                onChange={(e) => setDebugMode(e.target.checked)}
                                className="w-3 h-3"
                            />
                            Debug Mode
                        </label>
                        {debugMode && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={runDiagnostics}
                                className="text-xs px-2 py-1 h-auto"
                            >
                                Run Diagnostics
                            </Button>
                        )}
                    </div>

                    {/* Auth form */}
                    <form onSubmit={handleEmailAuth} className="grid gap-4">
                        {isSignUp && (
                            <div className="grid gap-2">
                                <Label htmlFor="displayName">Full Name</Label>
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                             />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
                        </Button>
                    </form>

                    {/* Divider */}
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

                    {/* Google Sign In */}
                    <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                        <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
                            <path fill="#fbc02d" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
                            <path fill="#e53935" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
                            <path fill="#4caf50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.373-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"></path>
                            <path fill="#1565c0" d="M43.611,20.083L43.595,20L42,20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C42.022,35.283,44,30.036,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                        </svg>
                        Google
                    </Button>

                    {/* Toggle sign up/in */}
                    <div className="mt-4 text-center text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <Button 
                            variant="link" 
                            onClick={() => { 
                                setIsSignUp(!isSignUp); 
                                setError(null); 
                                setEmail('');
                                setPassword('');
                                setDisplayName('');
                            }}
                        >
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </Button>
                    </div>

                    {/* Debug info */}
                    {debugMode && (
                        <div className="text-xs bg-gray-50 p-3 rounded border">
                            <div className="font-medium mb-2">Debug Info:</div>
                            <div>Firebase Project: pingly-b1de9</div>
                            <div>Auth State: {user ? 'Authenticated' : 'Not authenticated'}</div>
                            <div>Loading: {loading ? 'Yes' : 'No'}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}