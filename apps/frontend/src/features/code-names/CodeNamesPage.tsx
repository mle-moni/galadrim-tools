import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronsUpDown, Puzzle, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { ApiMatrix, MatrixDto } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { meQueryOptions } from "@/integrations/backend/auth";
import {
    codeNamesGamesQueryOptions,
    matricesQueryOptions,
    useAddCodeNamesRoundMutation,
    useCreateCodeNamesGameMutation,
    useDeleteCodeNamesGameMutation,
} from "@/integrations/backend/codeNames";
import { usersQueryOptions } from "@/integrations/backend/users";
import { getApiUrl } from "@/integrations/backend/client";
import { hasRights } from "@/lib/rights";
import { cn } from "@/lib/utils";

import { useCodeNamesSocketSync } from "./use-code-names-socket-sync";

const MATRIX_CHAR = ["?", "R", "B", "W", "X"] as const;
const CELL_IDS = Array.from({ length: 25 }, (_value, index) => String(index));

type DrawableMatrixChar = (typeof MATRIX_CHAR)[number];

type UserOption = { value: number; label: string };

function resolveImageUrl(url: string) {
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    try {
        return new URL(url, getApiUrl()).toString();
    } catch {
        return url;
    }
}

function checkMatrix(matrix: MatrixDto, matrixToCheck: MatrixDto): boolean {
    const checkRed = (matrix.red | matrixToCheck.red) === matrix.red;
    const checkBlue = (matrix.blue | matrixToCheck.blue) === matrix.blue;
    const checkWhite = (matrix.white | matrixToCheck.white) === matrix.white;

    return checkRed && checkBlue && checkWhite;
}

function getMatrixCandidates(matrixToCheck: MatrixDto, matrices: MatrixDto[]): MatrixDto[] {
    return matrices.filter((matrix) => checkMatrix(matrix, matrixToCheck));
}

function getDrawableChar(matrix: MatrixDto, idx: number): DrawableMatrixChar {
    if (matrix.black === idx) return "X";

    const mask = 1 << (24 - idx);
    if ((matrix.white & mask) !== 0) return "W";
    if ((matrix.blue & mask) !== 0) return "B";
    if ((matrix.red & mask) !== 0) return "R";
    return "?";
}

function setCell(matrix: MatrixDto, idx: number, next: DrawableMatrixChar): MatrixDto {
    const mask = 1 << (24 - idx);

    let red = matrix.red & ~mask;
    let blue = matrix.blue & ~mask;
    let white = matrix.white & ~mask;
    let black = matrix.black;

    if (black === idx && next !== "X") {
        black = -1;
    }

    if (next === "R") red |= mask;
    if (next === "B") blue |= mask;
    if (next === "W") white |= mask;
    if (next === "X") black = idx;

    return { red, blue, white, black };
}

function nextChar(current: DrawableMatrixChar): DrawableMatrixChar {
    return MATRIX_CHAR[(MATRIX_CHAR.indexOf(current) + 1) % MATRIX_CHAR.length]!;
}

function UserCombobox(props: {
    value: number | null;
    onChange: (next: number | null) => void;
    options: UserOption[];
    placeholder: string;
    disabled?: boolean;
}) {
    const [open, setOpen] = useState(false);

    const selectedLabel = props.value
        ? props.options.find((o) => o.value === props.value)?.label ?? null
        : null;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={props.disabled}
                    className="w-full justify-between"
                >
                    {selectedLabel ?? props.placeholder}
                    <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Rechercher…" className="h-9" />
                    <CommandList>
                        <CommandEmpty>Aucun résultat.</CommandEmpty>
                        <CommandGroup>
                            {props.options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.label}
                                    onSelect={() => {
                                        props.onChange(
                                            option.value === props.value ? null : option.value,
                                        );
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check
                                        className={cn(
                                            "ml-auto",
                                            props.value === option.value
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}

export default function CodeNamesPage(props: { gameId?: number }) {
    const router = useRouter();

    const meQuery = useQuery(meQueryOptions());
    useCodeNamesSocketSync(meQuery.data);

    const usersQuery = useQuery(usersQueryOptions());
    const gamesQuery = useQuery(codeNamesGamesQueryOptions());
    const matricesQuery = useQuery(matricesQueryOptions());

    const games = gamesQuery.data ?? [];
    const game = games.find((g) => g.id === props.gameId) ?? null;

    const canDeleteGame = hasRights(meQuery.data?.rights ?? 0, ["CODE_NAMES_ADMIN"]);

    const userOptions = useMemo<UserOption[]>(() => {
        const users = usersQuery.data ?? [];
        return users
            .slice()
            .sort((a, b) => a.username.localeCompare(b.username))
            .map((u) => ({ value: u.id, label: u.username }));
    }, [usersQuery.data]);

    const [redSpyMasterId, setRedSpyMasterId] = useState<number | null>(null);
    const [blueSpyMasterId, setBlueSpyMasterId] = useState<number | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [matrix, setMatrix] = useState<MatrixDto>({ red: 0, blue: 0, white: 0, black: -1 });
    const [showResult, setShowResult] = useState(false);

    const [roundSpyMasterId, setRoundSpyMasterId] = useState<number | null>(null);
    const [announce, setAnnounce] = useState("");
    const [clueWord, setClueWord] = useState("");
    const [clueNumber, setClueNumber] = useState("1");

    const createGameMutation = useCreateCodeNamesGameMutation();
    const addRoundMutation = useAddCodeNamesRoundMutation();
    const deleteGameMutation = useDeleteCodeNamesGameMutation();

    useEffect(() => {
        if (!image) {
            setImagePreview(null);
            return;
        }

        const url = URL.createObjectURL(image);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    useEffect(() => {
        if (!game) return;

        setRedSpyMasterId(game.redSpyMasterId);
        setBlueSpyMasterId(game.blueSpyMasterId);
        setRoundSpyMasterId(null);

        const lastRound = game.rounds.at(-1) ?? null;
        setMatrix(
            lastRound
                ? {
                      red: lastRound.red,
                      blue: lastRound.blue,
                      white: lastRound.white,
                      black: lastRound.black,
                  }
                : { red: 0, blue: 0, white: 0, black: -1 },
        );
        setShowResult(false);

        setAnnounce("");
        setClueWord("");
        setClueNumber("1");
    }, [game]);

    const matrices = matricesQuery.data ?? ([] as ApiMatrix[]);
    const candidates = useMemo(() => {
        return getMatrixCandidates(matrix, matrices);
    }, [matrix, matrices]);

    const displayMatrix = showResult && candidates.length === 1 ? candidates[0]! : matrix;

    const spyMasterOptions = useMemo(() => {
        if (!game) return [];
        const wanted = new Set([game.blueSpyMasterId, game.redSpyMasterId]);
        return userOptions.filter((u) => wanted.has(u.value));
    }, [game, userOptions]);

    const submitNewGame = () => {
        if (redSpyMasterId == null || blueSpyMasterId == null || !image) return;

        const promise = createGameMutation.mutateAsync({
            redSpyMasterId,
            blueSpyMasterId,
            image,
        });

        toast.promise(promise, {
            loading: "Création…",
            success: "Partie créée",
            error: (error) =>
                error instanceof Error ? error.message : "Impossible de créer la partie",
        });

        promise
            .then((created) => {
                router.history.push(`/games/code-names?gameId=${created.id}`);
            })
            .catch(() => {});
    };

    const submitRound = () => {
        if (!game) return;
        if (roundSpyMasterId == null) return;

        const clue = clueWord.trim();
        const clueNum = Number(clueNumber);
        if (clue === "") return;
        if (!Number.isFinite(clueNum) || clueNum <= 0) return;

        const promise = addRoundMutation.mutateAsync({
            gameId: game.id,
            spyMasterId: roundSpyMasterId,
            announce: announce.trim(),
            clueWord: clue,
            clueNumber: clueNum,
            matrix,
        });

        toast.promise(promise, {
            loading: "Ajout du round…",
            success: "Round sauvegardé",
            error: (error) =>
                error instanceof Error ? error.message : "Impossible d'ajouter le round",
        });

        promise
            .then((round) => {
                setMatrix({
                    red: round.red,
                    blue: round.blue,
                    white: round.white,
                    black: round.black,
                });
                setShowResult(false);
                setAnnounce("");
                setClueWord("");
                setClueNumber("1");
            })
            .catch(() => {});
    };

    const resetToCreate = () => {
        router.history.push("/games/code-names");
    };

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h1 className="flex items-center gap-2 text-2xl font-semibold">
                        <Puzzle className="h-5 w-5 text-primary" />
                        Code Names
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {game ? `Partie #${game.id}` : "Créer une nouvelle partie"}
                    </p>
                </div>

                {game ? (
                    <div className="flex items-center gap-2">
                        <Button type="button" variant="outline" onClick={resetToCreate}>
                            Nouvelle partie
                        </Button>
                        {canDeleteGame && (
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={deleteGameMutation.isPending}
                                onClick={() => {
                                    if (!confirm("Supprimer cette partie ?")) return;

                                    const promise = deleteGameMutation.mutateAsync({
                                        gameId: game.id,
                                    });
                                    toast.promise(promise, {
                                        loading: "Suppression…",
                                        success: "Partie supprimée",
                                        error: (error) =>
                                            error instanceof Error
                                                ? error.message
                                                : "Impossible de supprimer",
                                    });

                                    promise
                                        .then(() => {
                                            router.history.push("/games/code-names");
                                        })
                                        .catch(() => {});
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                            </Button>
                        )}
                    </div>
                ) : null}
            </div>

            {!game && (
                <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nouvelle partie</CardTitle>
                            <CardDescription>
                                Choisissez les deux spymasters et la photo du board.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Blue Spy Master</Label>
                                <UserCombobox
                                    value={blueSpyMasterId}
                                    onChange={setBlueSpyMasterId}
                                    options={userOptions}
                                    placeholder="Sélectionner…"
                                    disabled={usersQuery.isLoading || usersQuery.isError}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Red Spy Master</Label>
                                <UserCombobox
                                    value={redSpyMasterId}
                                    onChange={setRedSpyMasterId}
                                    options={userOptions}
                                    placeholder="Sélectionner…"
                                    disabled={usersQuery.isLoading || usersQuery.isError}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Image</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setImage(file);
                                    }}
                                />
                                {imagePreview && (
                                    <img
                                        src={resolveImageUrl(imagePreview)}
                                        alt="Aperçu"
                                        className="w-full rounded-md border border-border/60"
                                    />
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                type="button"
                                onClick={submitNewGame}
                                disabled={
                                    createGameMutation.isPending ||
                                    redSpyMasterId == null ||
                                    blueSpyMasterId == null ||
                                    image == null
                                }
                            >
                                Commencer
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Parties existantes</CardTitle>
                            <CardDescription>
                                Ouvrez une partie existante en entrant son id dans l'URL.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm text-muted-foreground">
                                Exemple :{" "}
                                <span className="font-mono">/games/code-names?gameId=123</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {game && (
                <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
                    <Card>
                        <CardHeader>
                            <CardTitle>Board</CardTitle>
                            <CardDescription>
                                {candidates.length === 1
                                    ? "1 matrice possible"
                                    : `${candidates.length} matrices possibles`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="overflow-hidden rounded-md border border-border/60">
                                <img
                                    src={resolveImageUrl(game.image.url)}
                                    alt="Board"
                                    className="w-full object-contain"
                                    loading="lazy"
                                />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="text-sm font-medium">Matrice</div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled={candidates.length !== 1}
                                        onClick={() => setShowResult((s) => !s)}
                                    >
                                        {showResult ? "Masquer" : "Afficher"}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-5 gap-1">
                                    {CELL_IDS.map((cellId) => {
                                        const idx = Number(cellId);
                                        const char = getDrawableChar(displayMatrix, idx);

                                        const className =
                                            char === "R"
                                                ? "bg-red-500/85 hover:bg-red-500"
                                                : char === "B"
                                                  ? "bg-sky-500/85 hover:bg-sky-500"
                                                  : char === "W"
                                                    ? "bg-slate-100 hover:bg-white"
                                                    : char === "X"
                                                      ? "bg-black hover:bg-black/90"
                                                      : "bg-muted/60 hover:bg-muted";

                                        return (
                                            <button
                                                key={cellId}
                                                type="button"
                                                className={cn(
                                                    "aspect-square w-full rounded-sm border border-border/60",
                                                    className,
                                                )}
                                                onClick={() => {
                                                    if (showResult && candidates.length === 1) {
                                                        setShowResult(false);
                                                    }

                                                    const current = getDrawableChar(matrix, idx);
                                                    const next = nextChar(current);
                                                    setMatrix((prev) => setCell(prev, idx, next));
                                                }}
                                            >
                                                <span className="sr-only">{char}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Ajouter un round</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="grid gap-2">
                                <Label>Round Spy Master</Label>
                                <UserCombobox
                                    value={roundSpyMasterId}
                                    onChange={setRoundSpyMasterId}
                                    options={spyMasterOptions}
                                    placeholder="Sélectionner…"
                                    disabled={spyMasterOptions.length === 0}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Announce (mots séparés par des virgules)</Label>
                                <Input
                                    value={announce}
                                    onChange={(e) => setAnnounce(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Clue word</Label>
                                <Input
                                    value={clueWord}
                                    onChange={(e) => setClueWord(e.target.value)}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Clue number</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={clueNumber}
                                    onChange={(e) => setClueNumber(e.target.value)}
                                />
                            </div>
                        </CardContent>
                        <CardFooter className="justify-between">
                            <div className="text-xs text-muted-foreground">
                                {matricesQuery.isLoading ? "Chargement des matrices…" : null}
                                {matricesQuery.isError ? "Erreur de chargement des matrices" : null}
                            </div>
                            <Button
                                type="button"
                                onClick={submitRound}
                                disabled={
                                    addRoundMutation.isPending ||
                                    roundSpyMasterId == null ||
                                    clueWord.trim() === "" ||
                                    matricesQuery.isLoading
                                }
                            >
                                Ajouter
                            </Button>
                        </CardFooter>

                        <Separator />

                        <CardContent className="pt-4">
                            <div className="text-sm font-medium">Rounds</div>
                            <ScrollArea className="mt-2 h-72">
                                <div className="flex flex-col gap-2 pr-3">
                                    {game.rounds.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            Aucun round pour le moment.
                                        </div>
                                    ) : (
                                        game.rounds
                                            .slice()
                                            .reverse()
                                            .map((round) => {
                                                const spy = userOptions.find(
                                                    (u) => u.value === round.spyMasterId,
                                                )?.label;
                                                return (
                                                    <div
                                                        key={round.id}
                                                        className="rounded-md border border-border/60 bg-muted/10 px-3 py-2"
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="text-sm font-semibold">
                                                                {round.clueWord} ·{" "}
                                                                {round.clueNumber}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {spy ?? `#${round.spyMasterId}`}
                                                            </div>
                                                        </div>
                                                        {round.announce ? (
                                                            <div className="mt-1 text-xs text-muted-foreground">
                                                                {round.announce}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                );
                                            })
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            )}

            {(gamesQuery.isError || usersQuery.isError) && (
                <div className="rounded-lg border border-border/60 bg-muted/10 px-4 py-3 text-sm">
                    Impossible de charger Code Names.
                </div>
            )}
        </div>
    );
}
