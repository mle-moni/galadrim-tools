import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { useCreateIdeaMutation } from "@/integrations/backend/ideas";

export default function CreateIdeaSheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    meId: number | null;
}) {
    const [text, setText] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);

    const createMutation = useCreateIdeaMutation(props.meId);

    const trimmedText = useMemo(() => text.trim(), [text]);
    const canSubmit =
        trimmedText.length >= 2 && trimmedText.length <= 300 && !createMutation.isPending;

    useEffect(() => {
        if (!props.open) {
            setText("");
            setIsAnonymous(false);
        }
    }, [props.open]);

    return (
        <Sheet open={props.open} onOpenChange={props.onOpenChange}>
            <SheetContent className="sm:max-w-lg">
                <SheetHeader>
                    <SheetTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        J'ai une idée
                    </SheetTitle>
                    <SheetDescription>Propose une amélioration pour Galadrim.</SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 px-4 pb-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="idea-text">Ton idée</Label>
                        <textarea
                            id="idea-text"
                            className="min-h-32 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            placeholder="Quelle est ton idée ?"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            maxLength={300}
                        />
                        <div className="text-xs text-muted-foreground">
                            {trimmedText.length}/300
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 rounded-md border bg-muted/30 px-3 py-2">
                        <div className="flex flex-col">
                            <div className="text-sm font-medium">Publier en anonyme</div>
                            <div className="text-xs text-muted-foreground">
                                Ton nom ne sera pas affiché.
                            </div>
                        </div>
                        <Switch checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                    </div>

                    <Button
                        type="button"
                        disabled={!canSubmit}
                        onClick={() => {
                            const promise = createMutation
                                .mutateAsync({ text: trimmedText, isAnonymous })
                                .then(() => props.onOpenChange(false));

                            toast.promise(promise, {
                                loading: "Publication…",
                                success: "Idée publiée",
                                error: (error) =>
                                    error instanceof Error
                                        ? error.message
                                        : "Impossible de publier cette idée",
                            });
                        }}
                    >
                        <Send className="h-4 w-4" />
                        Publier
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
