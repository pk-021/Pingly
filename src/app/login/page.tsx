
'use client';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { createUserProfile } from "@/lib/data-service";

export default function LoginPage() {
    const router = useRouter();
    const [user, loading] = useAuthState(auth);
    const [error, setError] = useState<string | null>(null);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (isSignUp) {
            // Sign Up
            if (!displayName) {
                setError("Display name is required for sign up.");
                return;
            }
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(userCredential.user, { displayName });
                
                // Create a user profile document in Firestore
                await createUserProfile({
                    uid: userCredential.user.uid,
                    email: userCredential.user.email,
                    displayName: displayName
                });

                // The useEffect will handle the redirect.
            } catch (error: any) {
                setError(error.message);
            }
        } else {
            // Sign In
            try {
                await signInWithEmailAndPassword(auth, email, password);
                // The useEffect will handle the redirect
            } catch (error: any) {
                setError(error.message);
            }
        }
    };
    
    useEffect(() => {
        if (!loading && user) {
            router.push('/');
        }
    }, [user, loading, router]);

    return (
        <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
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
            <div className="flex items-center justify-center py-12">
                <div className="mx-auto grid w-[350px] gap-6">
                    <div className="grid gap-2 text-center">
                        <h1 className="text-3xl font-bold">{isSignUp ? 'Create an Account' : 'Login'}</h1>
                        <p className="text-balance text-muted-foreground">
                            Enter your credentials to continue
                        </p>
                    </div>
                    {error && <p className="text-sm text-center text-red-500 bg-red-100 p-2 rounded-md">{error}</p>}
                    <form onSubmit={handleAuthAction} className="grid gap-4">
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
                    <div className="mt-4 text-center text-sm">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}
                        <Button variant="link" onClick={() => { setIsSignUp(!isSignUp); setError(null); }}>
                            {isSignUp ? 'Login' : 'Sign Up'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
