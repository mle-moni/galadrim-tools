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

import type { ApiToken } from "@/integrations/backend/settings";

async function copyToClipboard(text: string) {
    try {
        if (!navigator.clipboard?.writeText) return false;
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

interface ApiTokenCardProps {
    apiToken: ApiToken | null;
    onGenerate: () => Promise<ApiToken>;
    isGenerating: boolean;
}

export default function ApiTokenCard({ apiToken, onGenerate, isGenerating }: ApiTokenCardProps) {
    return (
        <Card className="mt-4">
            <CardHeader>
                <CardTitle>API token</CardTitle>
                <CardDescription>Générez un token personnel pour accéder à l'API.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
                {apiToken && (
                    <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 font-mono text-sm">
                        {apiToken.token}
                    </div>
                )}

                <p className="text-xs text-muted-foreground">
                    Le token n'est affiché qu'après génération. Conservez-le dans un endroit sûr.
                </p>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    variant="outline"
                    onClick={() => {
                        const promise = onGenerate();

                        toast.promise(promise, {
                            loading: "Génération…",
                            success: "API token généré",
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de créer un API token",
                        });

                        void promise
                            .then(async (token) => {
                                const copied = await copyToClipboard(token.token);
                                if (copied) {
                                    toast.success("API token copié dans le presse-papier");
                                } else {
                                    toast.error(
                                        "Impossible de copier automatiquement. Copiez le token affiché.",
                                    );
                                }
                            })
                            .catch(() => {});
                    }}
                    disabled={isGenerating}
                >
                    {isGenerating ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "Générer"}
                </Button>
                {apiToken && (
                    <Button
                        className="ml-2"
                        onClick={async () => {
                            const ok = await copyToClipboard(apiToken.token);
                            if (ok) {
                                toast.success("API token copié dans le presse-papier");
                            } else {
                                toast.error("Impossible de copier automatiquement.");
                            }
                        }}
                    >
                        Copier
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
