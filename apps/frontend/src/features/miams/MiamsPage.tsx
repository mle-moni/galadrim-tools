import { useEffect, useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ExternalLink, Pencil, RefreshCcw, Trash2, X } from "lucide-react";
import Fuse from "fuse.js";
import type { IRestaurant, NotesOption } from "@galadrim-tools/shared";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { meQueryOptions } from "@/integrations/backend/auth";
import { getApiUrl } from "@/integrations/backend/client";
import { officesQueryOptions } from "@/integrations/backend/offices";
import { usersQueryOptions } from "@/integrations/backend/users";
import {
    restaurantsQueryOptions,
    tagsQueryOptions,
    useCreateRestaurantMutation,
    useCreateRestaurantReviewMutation,
    useDeleteRestaurantMutation,
    useDeleteRestaurantReviewMutation,
    useToggleRestaurantChoiceMutation,
    useUpdateRestaurantMutation,
    useUpdateRestaurantReviewMutation,
    useUpsertRestaurantNoteMutation,
} from "@/integrations/backend/miams";

import MiamsMap from "./MiamsMap";
import { MiamsSidebar } from "./MiamsSidebar";
import { RestaurantEditorSheet } from "./RestaurantEditorSheet";
import { useMiamsSocketSync } from "./use-miams-socket-sync";

function getMyNote(restaurant: IRestaurant, userId: number | null) {
    if (userId === null) return null;
    return restaurant.notes.find((n) => n.userId === userId)?.note ?? null;
}

function formatPrice(value: number | null) {
    if (value == null) return null;
    return `${value.toFixed(0)}€`;
}

function resolveBackendUrl(pathOrUrl: string) {
    if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) return pathOrUrl;
    const base = getApiUrl().replace(/\/$/, "");
    return `${base}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

function buildMiamsSearchParams(input: { restaurantId?: number; zoom?: number }) {
    const params = new URLSearchParams();
    if (input.restaurantId != null) params.set("restaurantId", String(input.restaurantId));
    if (input.zoom != null) params.set("zoom", String(input.zoom));
    return params;
}

const MAX_ZOOM = 18;

export default function MiamsPage(props: { selectedRestaurantId?: number; zoom?: number }) {
    const router = useRouter();

    const [mobileListOpen, setMobileListOpen] = useState(false);

    const meQuery = useQuery(meQueryOptions());
    const restaurantsQuery = useQuery(restaurantsQueryOptions());
    const tagsQuery = useQuery(tagsQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());
    const usersQuery = useQuery(usersQueryOptions());

    useMiamsSocketSync(meQuery.data);

    const meId = meQuery.data?.id ?? null;
    const myDailyChoiceId = meQuery.data?.dailyChoice ?? null;
    const isMiamAdmin = ((meQuery.data?.rights ?? 0) & 0b1000) !== 0;

    const zoomFromSearch = props.zoom ?? MAX_ZOOM;

    const selectedOfficeId = useMemo(() => {
        const offices = officesQuery.data ?? [];
        const meOfficeId = meQuery.data?.officeId ?? null;

        if (meOfficeId !== null) {
            const found = offices.find((o) => o.id === meOfficeId);
            if (found) return meOfficeId;
        }

        const paris = offices.find((o) => o.name.toLowerCase().includes("paris"));
        if (paris) return paris.id;

        return offices[0]?.id ?? null;
    }, [meQuery.data?.officeId, officesQuery.data]);

    const [search, setSearch] = useState("");

    useEffect(() => {
        if (props.selectedRestaurantId != null) {
            setSearch("");
        }
    }, [props.selectedRestaurantId]);

    const openCreateRestaurantEditor = () => {
        setEditorMode("create");
        setEditorRestaurant(null);
        setEditorOpen(true);
    };

    const selectedRestaurant = useMemo(() => {
        if (!props.selectedRestaurantId) return null;
        return restaurantsQuery.data?.find((r) => r.id === props.selectedRestaurantId) ?? null;
    }, [props.selectedRestaurantId, restaurantsQuery.data]);

    const sortedSelectedRestaurantReviews = useMemo(() => {
        if (!selectedRestaurant) return [];

        return selectedRestaurant.reviews
            .slice()
            .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    }, [selectedRestaurant]);

    const restaurantsFuse = useMemo(() => {
        return new Fuse(restaurantsQuery.data ?? [], {
            includeScore: true,
            keys: ["name", "description", "tags.name"],
        });
    }, [restaurantsQuery.data]);

    const filteredRestaurants = useMemo(() => {
        const restaurants = restaurantsQuery.data ?? [];
        const trimmedSearch = search.trim();

        if (!trimmedSearch) {
            return restaurants.slice().sort((a, b) => a.name.localeCompare(b.name));
        }

        return restaurantsFuse
            .search(trimmedSearch)
            .filter((result) => (result.score ?? 0) < 0.5)
            .map((result) => result.item);
    }, [restaurantsFuse, restaurantsQuery.data, search]);

    const restaurantsForMap = useMemo(() => {
        if (!selectedRestaurant) return filteredRestaurants;
        if (filteredRestaurants.some((r) => r.id === selectedRestaurant.id))
            return filteredRestaurants;
        return [selectedRestaurant, ...filteredRestaurants];
    }, [filteredRestaurants, selectedRestaurant]);

    const restaurantChoices = useMemo(() => {
        const restaurants = restaurantsQuery.data ?? [];

        return restaurants
            .filter((restaurant) => restaurant.choices.length > 0)
            .slice()
            .sort((a, b) => {
                const byCount = b.choices.length - a.choices.length;
                if (byCount !== 0) return byCount;
                return a.name.localeCompare(b.name);
            });
    }, [restaurantsQuery.data]);

    const totalDailyChoices = useMemo(() => {
        return restaurantChoices.reduce((acc, r) => acc + r.choices.length, 0);
    }, [restaurantChoices]);

    const toggleChoiceMutation = useToggleRestaurantChoiceMutation();
    const upsertNoteMutation = useUpsertRestaurantNoteMutation();

    const createRestaurantMutation = useCreateRestaurantMutation();
    const updateRestaurantMutation = useUpdateRestaurantMutation();
    const deleteRestaurantMutation = useDeleteRestaurantMutation();

    const createReviewMutation = useCreateRestaurantReviewMutation();
    const deleteReviewMutation = useDeleteRestaurantReviewMutation();
    const updateReviewMutation = useUpdateRestaurantReviewMutation();

    const [editorOpen, setEditorOpen] = useState(false);
    const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
    const [editorRestaurant, setEditorRestaurant] = useState<IRestaurant | null>(null);

    const [reviewComment, setReviewComment] = useState("");
    const [reviewImage, setReviewImage] = useState<File | null>(null);

    const usernameById = useMemo(() => {
        const map = new Map<number, string>();
        for (const user of usersQuery.data ?? []) {
            map.set(user.id, user.username);
        }
        return map;
    }, [usersQuery.data]);

    const isLoading =
        meQuery.isLoading ||
        restaurantsQuery.isLoading ||
        tagsQuery.isLoading ||
        officesQuery.isLoading ||
        usersQuery.isLoading;

    return (
        <div className="flex h-full min-h-0 w-full">
            <aside className="hidden w-80 min-w-80 flex-col border-r bg-card md:flex">
                <MiamsSidebar
                    search={search}
                    onSearchChange={setSearch}
                    canCreateRestaurant={meId !== null}
                    onCreateRestaurant={openCreateRestaurantEditor}
                    restaurants={filteredRestaurants}
                    selectedRestaurantId={props.selectedRestaurantId}
                    zoom={zoomFromSearch}
                />
            </aside>

            <Sheet open={mobileListOpen} onOpenChange={setMobileListOpen}>
                <SheetContent side="left" className="p-0">
                    <MiamsSidebar
                        search={search}
                        onSearchChange={setSearch}
                        canCreateRestaurant={meId !== null}
                        onCreateRestaurant={() => {
                            setMobileListOpen(false);
                            openCreateRestaurantEditor();
                        }}
                        restaurants={filteredRestaurants}
                        selectedRestaurantId={props.selectedRestaurantId}
                        zoom={zoomFromSearch}
                        onAfterSelectRestaurant={() => setMobileListOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <main className="relative isolate min-h-0 flex-1">
                {isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Chargement…
                    </div>
                ) : (
                    <MiamsMap
                        restaurants={restaurantsForMap}
                        offices={officesQuery.data ?? []}
                        selectedRestaurantId={props.selectedRestaurantId}
                        selectedOfficeId={selectedOfficeId}
                        userId={meId}
                        zoom={zoomFromSearch}
                        onZoomChange={(zoom) => {
                            const params = buildMiamsSearchParams({
                                restaurantId: props.selectedRestaurantId,
                                zoom,
                            });
                            router.history.replace(`/miams?${params.toString()}`);
                        }}
                        onSelectRestaurantId={(restaurantId) => {
                            const params = buildMiamsSearchParams({
                                restaurantId,
                                zoom: zoomFromSearch,
                            });
                            router.history.push(`/miams?${params.toString()}`);
                        }}
                    />
                )}

                {selectedRestaurant && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 p-4 md:inset-y-0 md:left-auto md:right-0 md:w-[460px]">
                        <Card className="pointer-events-auto h-full overflow-hidden shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between gap-2">
                                    <span className="truncate">{selectedRestaurant.name}</span>
                                    <Button
                                        variant="ghost"
                                        size="icon-sm"
                                        type="button"
                                        onClick={() => {
                                            const params = buildMiamsSearchParams({
                                                zoom: zoomFromSearch,
                                            });
                                            router.history.push(`/miams?${params.toString()}`);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                        <span className="sr-only">Fermer</span>
                                    </Button>
                                </CardTitle>
                                <CardDescription className="flex flex-wrap items-center gap-2">
                                    {selectedRestaurant.averagePrice != null && (
                                        <span>
                                            Prix moyen:{" "}
                                            {formatPrice(selectedRestaurant.averagePrice)}
                                        </span>
                                    )}
                                    <span>Choix du jour: {selectedRestaurant.choices.length}</span>
                                </CardDescription>

                                {(isMiamAdmin || selectedRestaurant.userId === meId) && (
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setEditorMode("edit");
                                                setEditorRestaurant(selectedRestaurant);
                                                setEditorOpen(true);
                                            }}
                                        >
                                            Modifier
                                        </Button>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            disabled={deleteRestaurantMutation.isPending}
                                            onClick={() => {
                                                const ok = window.confirm(
                                                    `Supprimer ${selectedRestaurant.name} ?`,
                                                );
                                                if (!ok) return;

                                                deleteRestaurantMutation.mutate(
                                                    { restaurantId: selectedRestaurant.id },
                                                    {
                                                        onSuccess: () => {
                                                            router.history.push("/miams");
                                                        },
                                                    },
                                                );
                                            }}
                                        >
                                            Supprimer
                                        </Button>
                                    </div>
                                )}
                            </CardHeader>

                            <CardContent className="flex h-full min-h-0 flex-col gap-4 overflow-hidden">
                                {selectedRestaurant.websiteLink && (
                                    <Button asChild variant="outline" size="sm">
                                        <a
                                            href={selectedRestaurant.websiteLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="gap-2"
                                        >
                                            <ExternalLink className="h-4 w-4" />
                                            Ouvrir le site
                                        </a>
                                    </Button>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {selectedRestaurant.tags.map((t) => (
                                        <button
                                            key={t.id}
                                            type="button"
                                            className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                                            onClick={() => setSearch(t.name)}
                                        >
                                            {t.name}
                                        </button>
                                    ))}
                                </div>

                                {selectedRestaurant.image?.url && (
                                    <img
                                        src={resolveBackendUrl(selectedRestaurant.image.url)}
                                        alt={selectedRestaurant.name}
                                        className="aspect-video w-full rounded-md border object-cover"
                                        loading="lazy"
                                    />
                                )}

                                {selectedRestaurant.description && (
                                    <div className="text-sm text-muted-foreground">
                                        {selectedRestaurant.description}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-medium">Mon choix du jour</div>
                                    <Button
                                        type="button"
                                        disabled={toggleChoiceMutation.isPending}
                                        onClick={() =>
                                            toggleChoiceMutation.mutate(selectedRestaurant.id)
                                        }
                                        variant={
                                            myDailyChoiceId === selectedRestaurant.id
                                                ? "secondary"
                                                : "default"
                                        }
                                        className="gap-2"
                                    >
                                        {toggleChoiceMutation.isPending ? (
                                            <RefreshCcw className="h-4 w-4 animate-spin" />
                                        ) : null}
                                        {myDailyChoiceId === selectedRestaurant.id
                                            ? "Sélectionné"
                                            : "Sélectionner"}
                                    </Button>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <div className="text-sm font-medium">Ma note</div>
                                    <div className="grid grid-cols-5 gap-2">
                                        {(["1", "2", "3", "4", "5"] as NotesOption[]).map(
                                            (value) => {
                                                const current = getMyNote(selectedRestaurant, meId);

                                                return (
                                                    <Button
                                                        key={value}
                                                        type="button"
                                                        size="sm"
                                                        variant={
                                                            current === value
                                                                ? "secondary"
                                                                : "outline"
                                                        }
                                                        onClick={() => {
                                                            if (meId === null) return;
                                                            upsertNoteMutation.mutate({
                                                                restaurantId: selectedRestaurant.id,
                                                                note: value,
                                                            });
                                                        }}
                                                    >
                                                        {value}
                                                    </Button>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>

                                <Separator />

                                <ScrollArea className="min-h-0 flex-1">
                                    <div className="flex flex-col gap-3">
                                        <div className="text-sm font-medium">Avis</div>

                                        <div className="flex flex-col gap-2">
                                            <textarea
                                                className="min-h-24 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                                                placeholder="Ajouter un avis…"
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                            />
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                                    <input
                                                        id="review-image"
                                                        type="file"
                                                        accept="image/png,image/jpeg"
                                                        className="hidden"
                                                        onChange={(e) => {
                                                            const file =
                                                                e.target.files?.[0] ?? null;
                                                            setReviewImage(file);
                                                        }}
                                                    />
                                                    <Button
                                                        asChild
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        <label
                                                            htmlFor="review-image"
                                                            className="cursor-pointer"
                                                        >
                                                            Ajouter une image
                                                        </label>
                                                    </Button>
                                                    <div className="min-w-0 truncate text-xs text-muted-foreground">
                                                        {reviewImage
                                                            ? reviewImage.name
                                                            : "Aucune image"}
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        createReviewMutation.isPending ||
                                                        reviewComment.trim() === "" ||
                                                        meId === null
                                                    }
                                                    onClick={() => {
                                                        createReviewMutation.mutate(
                                                            {
                                                                restaurantId: selectedRestaurant.id,
                                                                comment: reviewComment.trim(),
                                                                image: reviewImage,
                                                            },
                                                            {
                                                                onSuccess: () => {
                                                                    setReviewComment("");
                                                                    setReviewImage(null);
                                                                },
                                                            },
                                                        );
                                                    }}
                                                >
                                                    {createReviewMutation.isPending
                                                        ? "Envoi…"
                                                        : "Publier"}
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {sortedSelectedRestaurantReviews.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="rounded-md border bg-card px-3 py-2"
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex min-w-0 items-center gap-2">
                                                            <div className="truncate text-xs text-muted-foreground">
                                                                {usernameById.get(review.userId) ??
                                                                    "Utilisateur inconnu"}
                                                            </div>

                                                            {(isMiamAdmin ||
                                                                review.userId === meId) && (
                                                                <div className="flex items-center gap-1">
                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7"
                                                                        disabled={
                                                                            updateReviewMutation.isPending
                                                                        }
                                                                        onClick={() => {
                                                                            const nextComment =
                                                                                window.prompt(
                                                                                    "Modifier l'avis",
                                                                                    review.comment,
                                                                                );
                                                                            if (nextComment == null)
                                                                                return;

                                                                            const trimmed =
                                                                                nextComment.trim();
                                                                            if (trimmed === "")
                                                                                return;

                                                                            updateReviewMutation.mutate(
                                                                                {
                                                                                    restaurantId:
                                                                                        selectedRestaurant.id,
                                                                                    reviewId:
                                                                                        review.id,
                                                                                    comment:
                                                                                        trimmed,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Pencil className="h-4 w-4" />
                                                                        <span className="sr-only">
                                                                            Modifier
                                                                        </span>
                                                                    </Button>

                                                                    <Button
                                                                        type="button"
                                                                        size="icon"
                                                                        variant="ghost"
                                                                        className="h-7 w-7"
                                                                        disabled={
                                                                            deleteReviewMutation.isPending
                                                                        }
                                                                        onClick={() => {
                                                                            const ok =
                                                                                window.confirm(
                                                                                    "Supprimer cet avis ?",
                                                                                );
                                                                            if (!ok) return;

                                                                            deleteReviewMutation.mutate(
                                                                                {
                                                                                    restaurantId:
                                                                                        selectedRestaurant.id,
                                                                                    reviewId:
                                                                                        review.id,
                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                        <span className="sr-only">
                                                                            Supprimer
                                                                        </span>
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="shrink-0 text-xs text-muted-foreground">
                                                            {new Date(
                                                                review.createdAt,
                                                            ).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <div className="mt-1 whitespace-pre-wrap text-sm">
                                                        {review.comment}
                                                    </div>

                                                    {review.image?.url && (
                                                        <img
                                                            src={resolveBackendUrl(
                                                                review.image.url,
                                                            )}
                                                            alt=""
                                                            className="mt-2 max-h-56 w-full rounded-md border object-cover"
                                                            loading="lazy"
                                                        />
                                                    )}
                                                </div>
                                            ))}

                                            {sortedSelectedRestaurantReviews.length === 0 && (
                                                <div className="text-sm text-muted-foreground">
                                                    Aucun avis.
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                )}

                <div className="absolute left-4 top-4 z-40 md:hidden">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setMobileListOpen(true)}
                    >
                        Liste
                    </Button>
                </div>

                <div
                    className={`absolute right-4 top-4 z-40 w-[340px] max-w-[calc(100vw-2rem)] ${
                        selectedRestaurant ? "md:right-[476px]" : ""
                    }`}
                >
                    <div className="rounded-md border bg-card/95 shadow-lg backdrop-blur">
                        <Accordion
                            type="single"
                            collapsible
                            defaultValue={restaurantChoices.length > 0 ? "choices" : undefined}
                        >
                            <AccordionItem value="choices" className="border-b-0">
                                <AccordionTrigger className="px-3">
                                    <div className="flex w-full items-center justify-between pr-2">
                                        <span>Choix du jour des galadrimeurs</span>
                                        <span className="text-xs text-muted-foreground">
                                            {totalDailyChoices}
                                        </span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-3">
                                    {restaurantChoices.length > 0 ? (
                                        <div className="max-h-[70vh] space-y-3 overflow-auto pb-2">
                                            {restaurantChoices.map((restaurant, index) => {
                                                const chosen =
                                                    meId !== null &&
                                                    restaurant.choices.includes(meId);

                                                const names = restaurant.choices
                                                    .flatMap((id) => {
                                                        const name = usernameById.get(id);
                                                        return name ? [name] : [];
                                                    })
                                                    .join(", ");

                                                return (
                                                    <div key={restaurant.id} className="space-y-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="link"
                                                                className={`h-auto min-w-0 justify-start p-0 text-left ${
                                                                    chosen ? "text-green-600" : ""
                                                                }`}
                                                                onClick={() => {
                                                                    const params =
                                                                        buildMiamsSearchParams({
                                                                            restaurantId:
                                                                                restaurant.id,
                                                                            zoom: zoomFromSearch,
                                                                        });
                                                                    router.history.push(
                                                                        `/miams?${params.toString()}`,
                                                                    );
                                                                }}
                                                            >
                                                                <span className="truncate">
                                                                    {index + 1}. {restaurant.name}
                                                                </span>
                                                            </Button>

                                                            <Button
                                                                type="button"
                                                                variant="secondary"
                                                                size="sm"
                                                                className="h-7 w-10 rounded-full p-0"
                                                                onClick={() =>
                                                                    toggleChoiceMutation.mutate(
                                                                        restaurant.id,
                                                                    )
                                                                }
                                                            >
                                                                {restaurant.choices.length}
                                                            </Button>
                                                        </div>

                                                        {names && (
                                                            <div className="text-xs text-muted-foreground">
                                                                {names}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="py-2 text-sm text-muted-foreground">
                                            Aucun choix pour le moment
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </div>
                </div>
            </main>

            <RestaurantEditorSheet
                open={editorOpen}
                onOpenChange={setEditorOpen}
                mode={editorMode}
                restaurant={editorRestaurant}
                tags={tagsQuery.data ?? []}
                isSubmitting={
                    createRestaurantMutation.isPending || updateRestaurantMutation.isPending
                }
                onSubmit={(values) => {
                    if (editorMode === "create") {
                        createRestaurantMutation.mutate(values, {
                            onSuccess: (restaurant) => {
                                setEditorOpen(false);

                                const params = buildMiamsSearchParams({
                                    restaurantId: restaurant.id,
                                });
                                router.history.push(`/miams?${params.toString()}`);
                            },
                        });
                        return;
                    }

                    if (!editorRestaurant) return;

                    updateRestaurantMutation.mutate(
                        {
                            ...values,
                            id: editorRestaurant.id,
                        },
                        {
                            onSuccess: (restaurant) => {
                                setEditorOpen(false);
                                setEditorRestaurant(restaurant);

                                const params = buildMiamsSearchParams({
                                    restaurantId: restaurant.id,
                                });
                                router.history.push(`/miams?${params.toString()}`);
                            },
                        },
                    );
                }}
            />
        </div>
    );
}
