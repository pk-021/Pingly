
'use client';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";

export default function LoginPage() {
    const router = useRouter();
    const [user, authLoading] = useAuthState(auth);
    const [error, setError] = useState<string | null>(null);
    const [isProcessingRedirect, setIsProcessingRedirect] = useState(true);

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithRedirect(auth, provider);
        } catch (error: any) {
            console.error("Error initiating redirect sign-in: ", error);
            setError(error.message);
        }
    };

    useEffect(() => {
        const handleRedirectResult = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    // This will trigger the useAuthState hook to update and redirect.
                    // No need to manually push, the effect below will handle it.
                }
            } catch (error: any) {
                console.error("Error getting redirect result: ", error);
                if (error.code === 'auth/popup-closed-by-user') {
                    setError("The sign-in popup was closed before completion. Please try again.");
                } else if (error.code === 'auth/cancelled-popup-request') {
                    // This can happen if the user clicks the button multiple times.
                    // We can often ignore it as another request is likely in flight.
                } else {
                    setError(error.message);
                }
            } finally {
                setIsProcessingRedirect(false);
            }
        };

        handleRedirectResult();
    }, []);
    
    useEffect(() => {
        // Redirect if user is logged in and we are not in the middle of auth processes.
        if (!authLoading && user) {
            router.push('/');
        }
    }, [user, authLoading, router]);

    const loading = authLoading || isProcessingRedirect;

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
                        <h1 className="text-3xl font-bold">Login</h1>
                        <p className="text-balance text-muted-foreground">
                            Sign in to your account to continue
                        </p>
                    </div>
                    {error && <p className="text-sm text-center text-red-500">{error}</p>}
                    <Button onClick={signInWithGoogle} variant="outline" disabled={loading}>
                         <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.521-3.355-11.113-7.936l-6.637,5.332C9.004,38.923,15.981,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.089,5.571l6.19,5.238C42.021,35.596,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
                        {loading ? 'Signing in...' : 'Login with Google'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
