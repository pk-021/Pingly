// Create a new file: src/components/DebugFirestore.tsx

'use client';
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { 
    doc, 
    getDoc, 
    setDoc, 
    getDocs, 
    collection, 
    Timestamp 
} from 'firebase/firestore';
import { getFirebaseApp } from '@/lib/firebase';

export default function DebugFirestore() {
    const [results, setResults] = useState<string[]>([]);
    const { db } = getFirebaseApp();

    const addResult = (message: string) => {
        setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
        console.log(message);
    };

    const clearResults = () => {
        setResults([]);
        console.clear();
    };

    const checkProjectConfig = () => {
        addResult("=== PROJECT CONFIGURATION CHECK ===");
        addResult(`Firebase App Name: ${db.app.name}`);
        addResult(`Firebase Options: ${JSON.stringify(db.app.options)}`);
        addResult(`Project ID: ${db.app.options.projectId}`);
        addResult(`Auth Domain: ${db.app.options.authDomain}`);
        
        if (auth.currentUser) {
            addResult(`Current User: ${auth.currentUser.uid}`);
            addResult(`User Email: ${auth.currentUser.email}`);
        } else {
            addResult("❌ No authenticated user");
        }
    };

    const testBasicWrite = async () => {
        addResult("=== TESTING BASIC FIRESTORE WRITE ===");
        
        if (!auth.currentUser) {
            addResult("❌ No authenticated user - please login first");
            return;
        }

        try {
            const testRef = doc(db, "debug_test", "basic_test");
            const testData = {
                test: true,
                timestamp: Timestamp.now(),
                user: auth.currentUser.uid,
                message: "Debug write test"
            };
            
            addResult("📝 Writing test document...");
            await setDoc(testRef, testData);
            addResult("✅ Test write successful!");
            
            // Verify the write
            addResult("🔍 Verifying write...");
            const readSnap = await getDoc(testRef);
            if (readSnap.exists()) {
                addResult(`✅ Verification successful: ${JSON.stringify(readSnap.data())}`);
            } else {
                addResult("❌ Verification failed - document not found after write");
            }
            
        } catch (error: any) {
            addResult(`❌ Test write failed: ${error.message}`);
            addResult(`Error code: ${error.code || 'unknown'}`);
        }
    };

    const checkUserProfile = async () => {
        addResult("=== CHECKING USER PROFILE ===");
        
        if (!auth.currentUser) {
            addResult("❌ No authenticated user");
            return;
        }

        const uid = auth.currentUser.uid;
        addResult(`Checking profile for UID: ${uid}`);

        try {
            const userRef = doc(db, "users", uid);
            addResult(`Document path: ${userRef.path}`);
            
            const docSnap = await getDoc(userRef);
            addResult(`Document exists: ${docSnap.exists()}`);
            
            if (docSnap.exists()) {
                addResult(`Document data: ${JSON.stringify(docSnap.data())}`);
                addResult(`Document metadata: ${JSON.stringify(docSnap.metadata)}`);
            } else {
                addResult("📝 Document doesn't exist, attempting to create...");
                
                const userData = {
                    email: auth.currentUser.email || "",
                    displayName: auth.currentUser.displayName || "Debug User",
                    department: "",
                    createdAt: Timestamp.fromDate(new Date()),
                    isAdmin: false,
                    debugCreated: true,
                    createdVia: "DebugFirestore component"
                };
                
                await setDoc(userRef, userData);
                addResult("✅ User document created!");
                
                // Verify creation
                const verifySnap = await getDoc(userRef);
                if (verifySnap.exists()) {
                    addResult(`✅ Creation verified: ${JSON.stringify(verifySnap.data())}`);
                } else {
                    addResult("❌ Creation verification failed");
                }
            }
            
        } catch (error: any) {
            addResult(`❌ User profile check failed: ${error.message}`);
            addResult(`Error code: ${error.code || 'unknown'}`);
        }
    };

    const listAllCollections = async () => {
        addResult("=== CHECKING ALL COLLECTIONS ===");
        
        try {
            // Try to read from users collection
            const usersRef = collection(db, "users");
            const usersSnapshot = await getDocs(usersRef);
            addResult(`Users collection size: ${usersSnapshot.size}`);
            
            if (!usersSnapshot.empty) {
                addResult("Found users:");
                usersSnapshot.forEach((doc) => {
                    addResult(`  - ${doc.id}: ${JSON.stringify(doc.data())}`);
                });
            } else {
                addResult("Users collection is empty");
            }
            
            // Try debug_test collection
            const debugRef = collection(db, "debug_test");
            const debugSnapshot = await getDocs(debugRef);
            addResult(`Debug_test collection size: ${debugSnapshot.size}`);
            
            if (!debugSnapshot.empty) {
                addResult("Found debug documents:");
                debugSnapshot.forEach((doc) => {
                    addResult(`  - ${doc.id}: ${JSON.stringify(doc.data())}`);
                });
            }
            
        } catch (error: any) {
            addResult(`❌ Collection check failed: ${error.message}`);
            addResult(`Error code: ${error.code || 'unknown'}`);
        }
    };

    const runFullDiagnostic = async () => {
        clearResults();
        addResult("🔧 Starting full diagnostic...");
        
        checkProjectConfig();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await testBasicWrite();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await checkUserProfile();
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await listAllCollections();
        
        addResult("🏁 Full diagnostic complete!");
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Firestore Debug Console</h1>
            
            <div className="flex gap-2 mb-4 flex-wrap">
                <Button onClick={checkProjectConfig}>Check Config</Button>
                <Button onClick={testBasicWrite}>Test Write</Button>
                <Button onClick={checkUserProfile}>Check User Profile</Button>
                <Button onClick={listAllCollections}>List Collections</Button>
                <Button onClick={runFullDiagnostic} className="bg-blue-600">Run Full Diagnostic</Button>
                <Button onClick={clearResults} variant="outline">Clear</Button>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg h-96 overflow-y-auto">
                <h3 className="font-bold mb-2">Debug Results:</h3>
                {results.length === 0 ? (
                    <p className="text-gray-500">Click a button above to run diagnostics...</p>
                ) : (
                    <div className="space-y-1">
                        {results.map((result, index) => (
                            <div key={index} className="text-sm font-mono">
                                {result}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
