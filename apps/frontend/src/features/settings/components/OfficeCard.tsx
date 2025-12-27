import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export type OfficeOption = { id: number; name: string };

interface OfficeCardProps {
    officeId: number | null;
    officeOptions: OfficeOption[];
    isLoading: boolean;
    isSaving: boolean;
    onChangeOfficeId: (next: number | null) => void;
    onSave: (officeId: number) => Promise<{ notification: string }>;
}

export default function OfficeCard({
    officeId,
    officeOptions,
    isLoading,
    isSaving,
    onChangeOfficeId,
    onSave,
}: OfficeCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Bureau</CardTitle>
                <CardDescription>
                    Définissez vos locaux par défaut (utilisés comme point de départ).
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="settings-office">Locaux par défaut</Label>
                    <select
                        id="settings-office"
                        value={officeId ?? ""}
                        disabled={isLoading}
                        onChange={(e) => {
                            const next = e.target.value === "" ? null : Number(e.target.value);
                            onChangeOfficeId(next);
                        }}
                        className="border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]"
                    >
                        <option value="" disabled>
                            Sélectionner un bureau…
                        </option>
                        {officeOptions.map((o) => (
                            <option key={o.id} value={o.id}>
                                {o.name}
                            </option>
                        ))}
                    </select>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={() => {
                        if (officeId == null) {
                            toast.error("Sélectionnez un bureau.");
                            return;
                        }

                        const promise = onSave(officeId);
                        toast.promise(promise, {
                            loading: "Sauvegarde…",
                            success: (data) => data.notification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de sauvegarder les paramètres",
                        });
                    }}
                    disabled={isSaving || officeId == null}
                >
                    {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                </Button>
            </CardFooter>
        </Card>
    );
}
