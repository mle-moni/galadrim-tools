import { Link } from "@tanstack/react-router";
import { UtensilsCrossed } from "lucide-react";
import type { IRestaurant } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export function MiamsSidebar(props: {
    search: string;
    onSearchChange: (search: string) => void;

    canCreateRestaurant: boolean;
    onCreateRestaurant: () => void;

    restaurants: IRestaurant[];
    selectedRestaurantId?: number;
    zoom: number;
    onAfterSelectRestaurant?: () => void;
}) {
    const trimmedSearch = props.search.trim();
    const suggestions = trimmedSearch ? props.restaurants.slice(0, 5) : [];
    const listRestaurants = trimmedSearch ? props.restaurants.slice(5) : props.restaurants;

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
                </div>

                {suggestions.length > 0 && (
                    <div className="mt-3 rounded-md border bg-card/50 p-1">
                        {suggestions.map((restaurant) => {
                            const isSelected = restaurant.id === props.selectedRestaurantId;

                            return (
                                <Button
                                    key={restaurant.id}
                                    asChild
                                    type="button"
                                    variant={isSelected ? "secondary" : "ghost"}
                                    className="h-9 w-full min-w-0 justify-start"
                                >
                                    <Link
                                        to="/miams"
                                        search={{ restaurantId: restaurant.id, zoom: props.zoom }}
                                        onClick={() => props.onAfterSelectRestaurant?.()}
                                    >
                                        <span className="block min-w-0 flex-1 truncate">
                                            {restaurant.name}
                                        </span>
                                    </Link>
                                </Button>
                            );
                        })}
                    </div>
                )}
            </div>

            <Separator />

            <ScrollArea className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]>div]:!block">
                <div className="flex flex-col gap-1 p-2">
                    {listRestaurants.map((restaurant) => {
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
                                <div className="flex min-w-0 items-center justify-between gap-2">
                                    <div className="min-w-0 flex-1 truncate text-sm font-medium">
                                        {restaurant.name}
                                    </div>
                                    {restaurant.averagePrice != null && (
                                        <div className="text-xs text-muted-foreground">
                                            {restaurant.averagePrice.toFixed(0)}€
                                        </div>
                                    )}
                                </div>
                                <div className="flex min-w-0 items-center justify-between gap-2 text-xs text-muted-foreground">
                                    <div className="min-w-0 flex-1 truncate">
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
