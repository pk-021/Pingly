'use client';
import { useState } from "react";
import { mockEvents } from "@/lib/mock-data";
import { resolveScheduleConflicts, type ResolveScheduleConflictsOutput } from "@/ai/flows/resolve-schedule-conflicts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { BotMessageSquare, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ConflictResolverClient() {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ResolveScheduleConflictsOutput | null>(null);
    const { toast } = useToast();

    const handleCheckConflicts = async () => {
        setIsLoading(true);
        setResult(null);
        try {
            const formattedTasks = mockEvents.map(task => ({
                title: task.title,
                startTime: task.startTime.toISOString(),
                endTime: task.endTime.toISOString(),
                isOfficial: task.isOfficial,
            }));
            const res = await resolveScheduleConflicts({ tasks: formattedTasks });
            setResult(res);
        } catch (error) {
            console.error("Failed to resolve conflicts", error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Could not check for conflicts. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Calendar Events</CardTitle>
                    <CardDescription>This is the list of events that will be analyzed.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
                    {mockEvents.map(event => (
                        <div key={event.id} className="p-3 border rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold">{event.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {format(event.startTime, 'MMM d, HH:mm')} - {format(event.endTime, 'HH:mm')}
                                </p>
                            </div>
                            {event.isOfficial && <Badge variant="outline">Official</Badge>}
                        </div>
                    ))}
                </CardContent>
            </Card>

            <div className="space-y-4">
                <Button onClick={handleCheckConflicts} disabled={isLoading} className="w-full">
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Analyzing...
                        </>
                    ) : (
                        <>
                            <BotMessageSquare className="mr-2 h-4 w-4" />
                            Find Conflicts
                        </>
                    )}
                </Button>

                {result && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Analysis Result</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {result.conflicts.length > 0 ? (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Conflicts Found!</AlertTitle>
                                    <AlertDescription className="space-y-4 mt-2">
                                        {result.conflicts.map((conflict, index) => (
                                            <div key={index} className="p-3 bg-destructive/10 rounded-lg">
                                                <p className="font-semibold">Conflict: <span className="font-normal">{conflict.task1} vs {conflict.task2}</span></p>
                                                <p className="text-sm mt-2"><strong>Recommendation:</strong> {conflict.resolutionRecommendation}</p>
                                            </div>
                                        ))}
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="default" className="border-green-300 bg-green-50 text-green-900">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <AlertTitle>No Conflicts Found</AlertTitle>
                                    <AlertDescription>
                                        Your schedule is clear of any overlapping events.
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
