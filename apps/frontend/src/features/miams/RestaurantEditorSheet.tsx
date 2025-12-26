import { useEffect, useState } from "react";
import type { IRestaurant, ITag } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";

import { useCreateTagMutation } from "@/integrations/backend/miams";

export type RestaurantEditorValues = {
    name: string;
    description: string;
    lat: string;
    lng: string;
    websiteLink: string;
    averagePrice: string;
    tagIds: number[];
    image: File | null;
};

function buildInitialValues(restaurant: IRestaurant | null): RestaurantEditorValues {
    return {
        name: restaurant?.name ?? "",
        description: restaurant?.description ?? "",
        lat: restaurant ? String(restaurant.lat) : "",
        lng: restaurant ? String(restaurant.lng) : "",
        websiteLink: restaurant?.websiteLink ?? "",
        averagePrice: restaurant?.averagePrice != null ? String(restaurant.averagePrice) : "",
        tagIds: restaurant?.tags.map((t) => t.id) ?? [],
        image: null,
    };
}

function parseNumberText(text: string) {
    const trimmed = text.trim();
    if (trimmed === "") return null;

    // Accept 47.2126 or -1.5642
    if (!/^-?\d+(?:\.\d+)?$/.test(trimmed)) return null;

    return +trimmed;
}

export function RestaurantEditorSheet(props: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    mode: "create" | "edit";
    restaurant: IRestaurant | null;
    tags: ITag[];
    isSubmitting?: boolean;
    onSubmit: (values: {
        name: string;
        description: string;
        lat: number;
        lng: number;
        websiteLink?: string;
        averagePrice?: number | null;
        tagIds: number[];
        image?: File | null;
    }) => void;
}) {
    const [values, setValues] = useState<RestaurantEditorValues>(() =>
        buildInitialValues(props.restaurant),
    );
    const [tagSearch, setTagSearch] = useState("");
    const [createTagOpen, setCreateTagOpen] = useState(false);
    const [newTagName, setNewTagName] = useState("");

    const createTagMutation = useCreateTagMutation();

    useEffect(() => {
        if (!props.open) return;
        setValues(buildInitialValues(props.restaurant));
        setTagSearch("");
        setCreateTagOpen(false);
        setNewTagName("");
    }, [props.open, props.restaurant]);

    const normalizedTagSearch = tagSearch.trim().toLowerCase();
    const selectedTags = props.tags.filter((tag) => values.tagIds.includes(tag.id));
    const availableTags = props.tags
        .filter((tag) => !values.tagIds.includes(tag.id))
        .filter((tag) => {
            if (!normalizedTagSearch) return true;
            return tag.name.toLowerCase().includes(normalizedTagSearch);
        });

    const lat = parseNumberText(values.lat);
    const lng = parseNumberText(values.lng);
    const averagePrice = parseNumberText(values.averagePrice);

    const isValid =
        values.name.trim().length >= 2 &&
        values.description.trim().length >= 2 &&
        lat !== null &&
        lng !== null &&
        values.tagIds.length > 0;

    const title = props.mode === "create" ? "Nouveau restaurant" : "Modifier le restaurant";

    return (
        <Sheet open={props.open} onOpenChange={props.onOpenChange}>
            <SheetContent className="sm:max-w-xl">
                <SheetHeader>
                    <SheetTitle>{title}</SheetTitle>
                    <SheetDescription>
                        Double-clic sur la carte pour copier des coordonnées.
                    </SheetDescription>
                </SheetHeader>

                <Separator />

                <ScrollArea className="min-h-0 flex-1 px-4">
                    <div className="flex flex-col gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="restaurant-name">Nom</Label>
                            <Input
                                id="restaurant-name"
                                value={values.name}
                                onChange={(e) =>
                                    setValues((old) => ({ ...old, name: e.target.value }))
                                }
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="restaurant-description">Description</Label>
                            <textarea
                                id="restaurant-description"
                                className="min-h-28 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm"
                                value={values.description}
                                onChange={(e) =>
                                    setValues((old) => ({ ...old, description: e.target.value }))
                                }
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                                <Label htmlFor="restaurant-lat">Latitude</Label>
                                <Input
                                    id="restaurant-lat"
                                    inputMode="decimal"
                                    value={values.lat}
                                    onChange={(e) =>
                                        setValues((old) => ({ ...old, lat: e.target.value }))
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="restaurant-lng">Longitude</Label>
                                <Input
                                    id="restaurant-lng"
                                    inputMode="decimal"
                                    value={values.lng}
                                    onChange={(e) =>
                                        setValues((old) => ({ ...old, lng: e.target.value }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="restaurant-website">Site web</Label>
                            <Input
                                id="restaurant-website"
                                value={values.websiteLink}
                                onChange={(e) =>
                                    setValues((old) => ({ ...old, websiteLink: e.target.value }))
                                }
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="restaurant-price">Prix moyen</Label>
                            <Input
                                id="restaurant-price"
                                inputMode="decimal"
                                value={values.averagePrice}
                                onChange={(e) =>
                                    setValues((old) => ({ ...old, averagePrice: e.target.value }))
                                }
                                placeholder="ex: 12"
                            />
                        </div>

                        <div className="grid gap-2">
                            <div className="flex items-center justify-between gap-2">
                                <Label>Tags (min 1)</Label>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={createTagMutation.isPending}
                                    onClick={() => setCreateTagOpen((open) => !open)}
                                >
                                    Ajouter un tag
                                </Button>
                            </div>

                            {createTagOpen && (
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Nom du tag"
                                        value={newTagName}
                                        onChange={(e) => setNewTagName(e.target.value)}
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            createTagMutation.isPending || newTagName.trim() === ""
                                        }
                                        onClick={async () => {
                                            const name = newTagName.trim();
                                            if (name === "") return;

                                            try {
                                                const tag = await createTagMutation.mutateAsync({
                                                    name,
                                                });

                                                setValues((old) => {
                                                    if (old.tagIds.includes(tag.id)) return old;
                                                    return {
                                                        ...old,
                                                        tagIds: [...old.tagIds, tag.id],
                                                    };
                                                });

                                                setNewTagName("");
                                                setCreateTagOpen(false);
                                                setTagSearch("");
                                            } catch {
                                                // ignore
                                            }
                                        }}
                                    >
                                        {createTagMutation.isPending ? "Ajout…" : "Ajouter"}
                                    </Button>
                                </div>
                            )}

                            <Input
                                placeholder="Rechercher un tag…"
                                value={tagSearch}
                                onChange={(e) => setTagSearch(e.target.value)}
                            />

                            {selectedTags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {selectedTags.map((tag) => (
                                        <Button
                                            key={tag.id}
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => {
                                                setValues((old) => ({
                                                    ...old,
                                                    tagIds: old.tagIds.filter(
                                                        (id) => id !== tag.id,
                                                    ),
                                                }));
                                            }}
                                        >
                                            {tag.name}
                                        </Button>
                                    ))}
                                </div>
                            )}

                            {availableTags.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {availableTags.map((tag) => (
                                        <Button
                                            key={tag.id}
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setValues((old) => ({
                                                    ...old,
                                                    tagIds: [...old.tagIds, tag.id],
                                                }));
                                            }}
                                        >
                                            {tag.name}
                                        </Button>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-muted-foreground">
                                    Pas de tags trouvés.
                                </div>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label>Image</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    id="restaurant-image"
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setValues((old) => ({ ...old, image: file }));
                                    }}
                                />
                                <Button asChild type="button" variant="outline" size="sm">
                                    <label htmlFor="restaurant-image" className="cursor-pointer">
                                        Choisir une image
                                    </label>
                                </Button>
                                <div className="min-w-0 truncate text-xs text-muted-foreground">
                                    {values.image ? values.image.name : "Aucune image"}
                                </div>
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <SheetFooter>
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => props.onOpenChange(false)}
                        >
                            Annuler
                        </Button>
                        <Button
                            type="button"
                            disabled={!isValid || props.isSubmitting}
                            onClick={() => {
                                if (!isValid) return;
                                if (lat === null || lng === null) return;

                                props.onSubmit({
                                    name: values.name.trim(),
                                    description: values.description.trim(),
                                    lat,
                                    lng,
                                    websiteLink: values.websiteLink.trim() || undefined,
                                    averagePrice,
                                    tagIds: values.tagIds,
                                    image: values.image,
                                });
                            }}
                        >
                            {props.isSubmitting ? "Sauvegarde…" : "Sauvegarder"}
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
