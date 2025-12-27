import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { RefreshCcw, Sparkles } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { toast } from "sonner";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

import { getApiUrl } from "@/integrations/backend/client";
import {
    gradePortraitGuessGame,
    portraitGuessGameGuessesQueryOptions,
    type PortraitGuessGameGuess,
} from "@/integrations/backend/portraitGuessGame";

function resolvePictureUrl(pictureUrl: string) {
    if (pictureUrl.startsWith("http://") || pictureUrl.startsWith("https://")) return pictureUrl;
    if (pictureUrl.startsWith("data:") || pictureUrl.startsWith("blob:")) return pictureUrl;

    try {
        return new URL(pictureUrl, getApiUrl()).toString();
    } catch {
        return pictureUrl;
    }
}

const GRADES = [
    {
        grade: 4 as const,
        label: "Facile",
        className: "border-sky-500/70 text-sky-500 hover:bg-sky-500/10",
    },
    {
        grade: 3 as const,
        label: "Ok",
        className: "border-emerald-500/70 text-emerald-500 hover:bg-emerald-500/10",
    },
    {
        grade: 2 as const,
        label: "Difficile",
        className: "border-amber-500/70 text-amber-500 hover:bg-amber-500/10",
    },
    {
        grade: 1 as const,
        label: "Impossible",
        className: "border-red-500/70 text-red-500 hover:bg-red-500/10",
    },
];

export default function GalakiPage() {
    const guessesQuery = useQuery(portraitGuessGameGuessesQueryOptions());

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answerOpen, setAnswerOpen] = useState(false);
    const [imageStatus, setImageStatus] = useState<"loading" | "loaded" | "error">("loading");

    useEffect(() => {
        if (!guessesQuery.data) return;
        setCurrentIndex(0);
        setAnswerOpen(false);
    }, [guessesQuery.data]);

    const guesses = guessesQuery.data;

    const currentGuess: PortraitGuessGameGuess | undefined = useMemo(() => {
        return guesses?.at(currentIndex);
    }, [currentIndex, guesses]);

    useEffect(() => {
        if (!currentGuess) return;
        setImageStatus("loading");
    }, [currentGuess?.id, currentGuess]);

    const gradeMutation = useMutation({
        mutationFn: gradePortraitGuessGame,
    });

    const total = guesses?.length ?? 0;
    const done = total === 0 ? 0 : Math.min(currentIndex, total);

    const canGrade = Boolean(currentGuess) && !gradeMutation.isPending && imageStatus !== "loading";

    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <PageHeader
                title="Galaki"
                icon={Sparkles}
                iconClassName="text-muted-foreground"
                right={
                    <>
                        <SidebarTrigger className="md:hidden" />
                        <Button
                            variant="outline"
                            onClick={() => guessesQuery.refetch()}
                            disabled={guessesQuery.isFetching}
                        >
                            {guessesQuery.isFetching ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : null}
                            Rafraîchir
                        </Button>
                    </>
                }
            />

            <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Portrait</CardTitle>
                            <CardDescription>
                                {total === 0
                                    ? "Aucun portrait à deviner pour l'instant."
                                    : currentGuess
                                      ? `Portrait ${done + 1} / ${total}`
                                      : `Terminé — ${total} portrait${total > 1 ? "s" : ""}`}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="flex flex-col gap-4">
                            {guessesQuery.isLoading && (
                                <div className="grid gap-4">
                                    <Skeleton className="aspect-square w-full max-w-[420px]" />
                                    <Skeleton className="h-10 w-full" />
                                    <div className="grid gap-2 sm:grid-cols-2">
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                        <Skeleton className="h-10 w-full" />
                                    </div>
                                </div>
                            )}

                            {guessesQuery.isError && (
                                <div className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm">
                                    Impossible de charger les portraits.
                                </div>
                            )}

                            {!guessesQuery.isLoading && !guessesQuery.isError && currentGuess && (
                                <>
                                    <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/5">
                                        <img
                                            src={resolvePictureUrl(
                                                currentGuess.portraitGuessable.pictureUrl,
                                            )}
                                            alt="Portrait à deviner"
                                            className="aspect-square w-full object-cover"
                                            loading="lazy"
                                            onLoad={() => setImageStatus("loaded")}
                                            onError={() => setImageStatus("error")}
                                        />
                                    </div>

                                    <Accordion
                                        type="single"
                                        collapsible
                                        value={answerOpen ? "answer" : undefined}
                                        onValueChange={(value) => setAnswerOpen(value === "answer")}
                                    >
                                        <AccordionItem value="answer" className="border-none">
                                            <AccordionTrigger className="rounded-md px-1">
                                                Réponse
                                            </AccordionTrigger>
                                            <AccordionContent className="px-1">
                                                <div className="rounded-md border border-border/60 bg-muted/10 px-3 py-2 text-sm font-medium">
                                                    {currentGuess.portraitGuessable.guess}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <div className="grid gap-2 sm:grid-cols-2">
                                        {GRADES.map((g) => (
                                            <Button
                                                key={g.grade}
                                                type="button"
                                                variant="outline"
                                                className={g.className}
                                                disabled={!canGrade}
                                                onClick={() => {
                                                    if (!currentGuess) return;

                                                    const previousIndex = currentIndex;
                                                    setAnswerOpen(false);
                                                    setCurrentIndex((idx) => idx + 1);

                                                    const promise = gradeMutation.mutateAsync({
                                                        guessId: currentGuess.id,
                                                        grade: g.grade,
                                                    });

                                                    promise.catch((error) => {
                                                        setCurrentIndex(previousIndex);

                                                        toast.error(
                                                            error instanceof Error
                                                                ? error.message
                                                                : "Impossible d'enregistrer la réponse",
                                                        );
                                                    });
                                                }}
                                            >
                                                {g.label}
                                            </Button>
                                        ))}
                                    </div>

                                    {gradeMutation.isPending && (
                                        <div className="text-xs text-muted-foreground">
                                            Enregistrement…
                                        </div>
                                    )}
                                </>
                            )}

                            {!guessesQuery.isLoading &&
                                !guessesQuery.isError &&
                                !currentGuess &&
                                total > 0 && (
                                    <div className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm">
                                        Plus aucun portrait en attente. Reviens plus tard.
                                    </div>
                                )}

                            {!guessesQuery.isLoading && !guessesQuery.isError && total === 0 && (
                                <div className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm">
                                    Aucun portrait à deviner pour l'instant. Revenez plus tard.
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="justify-between">
                            <div className="text-xs text-muted-foreground">
                                {total > 0 ? `${done} / ${total} validé` : ""}
                            </div>
                            {total > 0 && !currentGuess && (
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setCurrentIndex(0);
                                        setAnswerOpen(false);
                                    }}
                                    disabled={guessesQuery.isFetching}
                                >
                                    Recommencer
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
