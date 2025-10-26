
'use client';

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddConceptMapDialog } from "@/components/admin/add-concept-map-dialog";
import { Button } from "@/components/ui/button";

export default function BatchAdminConceptMapsPage() {
    const [isFeeding, setIsFeeding] = useState(false);
    const { toast } = useToast();

    // This is a placeholder for the actual refetch logic.
    // In a real scenario, this would trigger a re-fetch of the concept maps list.
    const handleMapAdded = useCallback(() => {
        toast({
            title: "List Updated",
            description: "The concept map has been added.",
        });
    }, [toast]);

    const handleFeedKnowledge = async () => {
        setIsFeeding(true);
        toast({
            title: "Action Not Available",
            description: "The 'Feed Knowledge' action is restricted to full administrators.",
            variant: "destructive"
        });
        setTimeout(() => setIsFeeding(false), 2000);
    };

    return (
        <>
            <div className="flex-1 space-y-4 pt-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Concept Map Management</h2>
                        <p className="text-muted-foreground">
                            Add new concept map documents for the AI Tutor.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                         <Button onClick={handleFeedKnowledge} disabled={isFeeding}>
                            {isFeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                            Feed Knowledge to AI
                        </Button>
                        <AddConceptMapDialog onMapAdded={handleMapAdded} />
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Add New Concept Maps</CardTitle>
                        <CardDescription>
                            Use the button above to add a new concept map. The map will become available to all students and the AI Tutor after an admin feeds it to the knowledge base.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="text-center text-muted-foreground py-16 border-2 border-dashed rounded-lg">
                         <p>Viewing and editing existing concept maps is available in the main admin panel.</p>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
