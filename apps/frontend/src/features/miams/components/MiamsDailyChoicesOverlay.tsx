import { useMemo } from "react";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

import type { IRestaurant } from "@galadrim-tools/shared";

import type { ToggleMutationLike } from "../utils";

export default function MiamsDailyChoicesOverlay(props: {
    restaurants: IRestaurant[];
    totalDailyChoices: number;
    meId: number | null;
    usernameById: Map<number, string>;
    selectedRestaurantId?: number;
    onSelectRestaurantId: (restaurantId: number) => void;
    toggleChoiceMutation: ToggleMutationLike;
}) {
    const defaultValue = props.restaurants.length > 0 ? "choices" : undefined;

    const choices = useMemo(() => {
        return props.restaurants.map((restaurant, index) => {
            const chosen = props.meId !== null && restaurant.choices.includes(props.meId);

            const names = restaurant.choices
                .flatMap((id) => {
                    const name = props.usernameById.get(id);
                    return name ? [name] : [];
                })
                .join(", ");

            return { restaurant, index, chosen, names };
        });
    }, [props.meId, props.restaurants, props.usernameById]);

    return (
        <div
            className={`absolute right-4 top-4 z-40 w-[340px] max-w-[calc(100vw-2rem)] ${
                props.selectedRestaurantId != null ? "md:right-[476px]" : ""
            }`}
        >
            <div className="rounded-md border bg-card/95 shadow-lg backdrop-blur">
                <Accordion type="single" collapsible defaultValue={defaultValue}>
                    <AccordionItem value="choices" className="border-b-0">
                        <AccordionTrigger className="px-3">
                            <div className="flex w-full items-center justify-between pr-2">
                                <span>Choix du jour des galadrimeurs</span>
                                <span className="text-xs text-muted-foreground">
                                    {props.totalDailyChoices}
                                </span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-3">
                            {choices.length > 0 ? (
                                <div className="max-h-[70vh] space-y-3 overflow-auto pb-2">
                                    {choices.map(({ restaurant, index, chosen, names }) => (
                                        <div key={restaurant.id} className="space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <Button
                                                    type="button"
                                                    variant="link"
                                                    className={`h-auto min-w-0 justify-start p-0 text-left ${
                                                        chosen ? "text-green-600" : ""
                                                    }`}
                                                    onClick={() =>
                                                        props.onSelectRestaurantId(restaurant.id)
                                                    }
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
                                                        props.toggleChoiceMutation.mutate(
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
                                    ))}
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
    );
}
