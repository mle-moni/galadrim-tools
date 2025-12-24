import { Link } from "@tanstack/react-router";
import { Check, UtensilsCrossed } from "lucide-react";
import type { IRestaurant, ITag } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function MiamsSidebar(props: {
    meId: number | null;

    search: string;
    onSearchChange: (search: string) => void;

    tags: ITag[];
    selectedTagIds: number[];
    onToggleTagId: (tagId: number) => void;
    onResetTags: () => void;

    isCreatingTag: boolean;
    onCreateTag: () => void;

    canCreateRestaurant: boolean;
    onCreateRestaurant: () => void;

    restaurants: IRestaurant[];
    selectedRestaurantId?: number;
    zoom: number;
    onAfterSelectRestaurant?: () => void;
}) {
    return (
        <div className="flex h-full min-h-0 flex-col">
            <div className="p-4">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <UtensilsCrossed className="h-5 w-5" />
                        <div className="text-lg font-semibold">Restaurants</div>
                    </div>

                    {props.canCreateRestaurant && (
                        <Button type="button" size="sm" onClick={props.onCreateRestaurant}>
                            Nouveau
                        </Button>
                    )}
                </div>

                <div className="mt-3 flex flex-col gap-2">
                    <Input
                        placeholder="Rechercher…"
                        value={props.search}
                        onChange={(e) => props.onSearchChange(e.target.value)}
                    />

                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    className="flex-1"
                                >
                                    Tags
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-64">
                                {props.tags.map((tag) => {
                                    const isSelected = props.selectedTagIds.includes(tag.id);

                                    return (
                                        <DropdownMenuItem
                                            key={tag.id}
                                            onSelect={(e) => {
                                                e.preventDefault();
                                                props.onToggleTagId(tag.id);
                                            }}
                                        >
                                            <span className="flex-1 truncate">{tag.name}</span>
                                            {isSelected && <Check className="h-4 w-4" />}
                                        </DropdownMenuItem>
                                    );
                                })}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={props.onResetTags}
                            disabled={props.selectedTagIds.length === 0}
                        >
                            Reset
                        </Button>

                        <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            disabled={props.isCreatingTag || props.meId === null}
                            onClick={props.onCreateTag}
                        >
                            Nouveau tag
                        </Button>
                    </div>
                </div>
            </div>

            <Separator />

            <ScrollArea className="min-h-0 flex-1">
                <div className="flex flex-col gap-1 p-2">
                    {props.restaurants.map((restaurant) => {
                        const isSelected = restaurant.id === props.selectedRestaurantId;

                        return (
                            <Link
                                key={restaurant.id}
                                to="/miams"
                                search={{ restaurantId: restaurant.id, zoom: props.zoom }}
                                onClick={() => props.onAfterSelectRestaurant?.()}
                                className={`flex flex-col gap-1 rounded-md border px-3 py-2 text-left transition-colors hover:bg-muted/50 ${
                                    isSelected ? "border-primary bg-muted/40" : "border-transparent"
                                }`}
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div className="truncate text-sm font-medium">
                                        {restaurant.name}
                                    </div>
                                    {restaurant.averagePrice != null && (
                                        <div className="text-xs text-muted-foreground">
                                            {restaurant.averagePrice.toFixed(0)}€
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <div className="truncate">
                                        {restaurant.tags.map((t) => t.name).join(", ")}
                                    </div>
                                    <div>{restaurant.choices.length}</div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
}
