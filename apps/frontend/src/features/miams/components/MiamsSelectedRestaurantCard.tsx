import { useMemo, useState } from "react";

import { ExternalLink, Pencil, RefreshCcw, Trash2, X } from "lucide-react";
import type { IRestaurant, NotesOption } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import {
    getMyNote,
    formatPrice,
    resolveBackendUrl,
    sortByCreatedAtDesc,
    type CreateReviewMutationLike,
    type DeleteRestaurantMutationLike,
    type DeleteReviewMutationLike,
    type ToggleMutationLike,
    type UpdateReviewMutationLike,
    type UpsertNoteMutationLike,
} from "../utils";

export default function MiamsSelectedRestaurantCard(props: {
    restaurant: IRestaurant;
    meId: number | null;
    myDailyChoiceId: number | null;
    isMiamAdmin: boolean;
    usernameById: Map<number, string>;
    canCreateReview: boolean;

    toggleChoiceMutation: ToggleMutationLike;
    upsertNoteMutation: UpsertNoteMutationLike;

    deleteRestaurantMutation: DeleteRestaurantMutationLike;

    createReviewMutation: CreateReviewMutationLike;
    updateReviewMutation: UpdateReviewMutationLike;
    deleteReviewMutation: DeleteReviewMutationLike;

    onClose: () => void;
    onEditRestaurant: () => void;
    onAfterDeleteRestaurant: () => void;
    onSelectTag: (tagName: string) => void;
}) {
    const [reviewComment, setReviewComment] = useState("");
    const [reviewImage, setReviewImage] = useState<File | null>(null);

    const sortedSelectedRestaurantReviews = useMemo(() => {
        return sortByCreatedAtDesc(props.restaurant.reviews);
    }, [props.restaurant.reviews]);

    const canEditRestaurant = props.isMiamAdmin || props.restaurant.userId === props.meId;

    return (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 p-4 md:inset-y-0 md:left-auto md:right-0 md:w-[460px]">
            <Card className="pointer-events-auto h-full overflow-hidden shadow-lg">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                        <span className="truncate">{props.restaurant.name}</span>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            type="button"
                            onClick={props.onClose}
                        >
                            <X className="h-4 w-4" />
                            <span className="sr-only">Fermer</span>
                        </Button>
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                        {props.restaurant.averagePrice != null && (
                            <span>Prix moyen: {formatPrice(props.restaurant.averagePrice)}</span>
                        )}
                        <span>Choix du jour: {props.restaurant.choices.length}</span>
                    </CardDescription>

                    {canEditRestaurant && (
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={props.onEditRestaurant}
                            >
                                Modifier
                            </Button>

                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                disabled={props.deleteRestaurantMutation.isPending}
                                onClick={() => {
                                    const ok = window.confirm(
                                        `Supprimer ${props.restaurant.name} ?`,
                                    );
                                    if (!ok) return;

                                    props.deleteRestaurantMutation.mutate(
                                        { restaurantId: props.restaurant.id },
                                        {
                                            onSuccess: () => {
                                                props.onAfterDeleteRestaurant();
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
                    {props.restaurant.websiteLink && (
                        <Button asChild variant="outline" size="sm">
                            <a
                                href={props.restaurant.websiteLink}
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
                        {props.restaurant.tags.map((t) => (
                            <button
                                key={t.id}
                                type="button"
                                className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground hover:bg-muted/80"
                                onClick={() => props.onSelectTag(t.name)}
                            >
                                {t.name}
                            </button>
                        ))}
                    </div>

                    {props.restaurant.image?.url && (
                        <img
                            src={resolveBackendUrl(props.restaurant.image.url)}
                            alt={props.restaurant.name}
                            className="aspect-video w-full rounded-md border object-cover"
                            loading="lazy"
                        />
                    )}

                    {props.restaurant.description && (
                        <div className="text-sm text-muted-foreground">
                            {props.restaurant.description}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">Mon choix du jour</div>
                        <Button
                            type="button"
                            disabled={props.toggleChoiceMutation.isPending}
                            onClick={() => props.toggleChoiceMutation.mutate(props.restaurant.id)}
                            variant={
                                props.myDailyChoiceId === props.restaurant.id
                                    ? "secondary"
                                    : "default"
                            }
                            className="gap-2"
                        >
                            {props.toggleChoiceMutation.isPending ? (
                                <RefreshCcw className="h-4 w-4 animate-spin" />
                            ) : null}
                            {props.myDailyChoiceId === props.restaurant.id
                                ? "Sélectionné"
                                : "Sélectionner"}
                        </Button>
                    </div>

                    <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium">Ma note</div>
                        <div className="grid grid-cols-5 gap-2">
                            {(["1", "2", "3", "4", "5"] as NotesOption[]).map((value) => {
                                const current = getMyNote(props.restaurant, props.meId);

                                return (
                                    <Button
                                        key={value}
                                        type="button"
                                        size="sm"
                                        variant={current === value ? "secondary" : "outline"}
                                        onClick={() => {
                                            if (props.meId === null) return;
                                            props.upsertNoteMutation.mutate({
                                                restaurantId: props.restaurant.id,
                                                note: value,
                                            });
                                        }}
                                    >
                                        {value}
                                    </Button>
                                );
                            })}
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
                                                const file = e.target.files?.[0] ?? null;
                                                setReviewImage(file);
                                            }}
                                        />
                                        <Button asChild type="button" variant="outline" size="sm">
                                            <label
                                                htmlFor="review-image"
                                                className="cursor-pointer"
                                            >
                                                Ajouter une image
                                            </label>
                                        </Button>
                                        <div className="min-w-0 truncate text-xs text-muted-foreground">
                                            {reviewImage ? reviewImage.name : "Aucune image"}
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            props.createReviewMutation.isPending ||
                                            reviewComment.trim() === "" ||
                                            !props.canCreateReview
                                        }
                                        onClick={() => {
                                            props.createReviewMutation.mutate(
                                                {
                                                    restaurantId: props.restaurant.id,
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
                                        {props.createReviewMutation.isPending
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
                                                    {props.usernameById.get(review.userId) ??
                                                        "Utilisateur inconnu"}
                                                </div>

                                                {(props.isMiamAdmin ||
                                                    review.userId === props.meId) && (
                                                    <div className="flex items-center gap-1">
                                                        <Button
                                                            type="button"
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-7 w-7"
                                                            disabled={
                                                                props.updateReviewMutation.isPending
                                                            }
                                                            onClick={() => {
                                                                const nextComment = window.prompt(
                                                                    "Modifier l'avis",
                                                                    review.comment,
                                                                );
                                                                if (nextComment == null) return;

                                                                const trimmed = nextComment.trim();
                                                                if (trimmed === "") return;

                                                                props.updateReviewMutation.mutate({
                                                                    restaurantId:
                                                                        props.restaurant.id,
                                                                    reviewId: review.id,
                                                                    comment: trimmed,
                                                                });
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
                                                                props.deleteReviewMutation.isPending
                                                            }
                                                            onClick={() => {
                                                                const ok =
                                                                    window.confirm(
                                                                        "Supprimer cet avis ?",
                                                                    );
                                                                if (!ok) return;

                                                                props.deleteReviewMutation.mutate({
                                                                    restaurantId:
                                                                        props.restaurant.id,
                                                                    reviewId: review.id,
                                                                });
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
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="mt-1 whitespace-pre-wrap text-sm">
                                            {review.comment}
                                        </div>

                                        {review.image?.url && (
                                            <img
                                                src={resolveBackendUrl(review.image.url)}
                                                alt=""
                                                className="mt-2 max-h-56 w-full rounded-md border object-cover"
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                ))}

                                {sortedSelectedRestaurantReviews.length === 0 && (
                                    <div className="text-sm text-muted-foreground">Aucun avis.</div>
                                )}
                            </div>
                        </div>
                    </ScrollArea>
                </CardContent>
            </Card>
        </div>
    );
}
