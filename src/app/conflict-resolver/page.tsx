import ConflictResolverClient from "@/components/conflict-resolver-client";

export default function ConflictResolverPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline text-primary">Schedule Conflict Resolver</h1>
            <p className="text-muted-foreground">
                This tool analyzes your schedule to find overlapping events. It prioritizes official calendar entries when suggesting resolutions.
            </p>
            <ConflictResolverClient />
        </div>
    );
}
