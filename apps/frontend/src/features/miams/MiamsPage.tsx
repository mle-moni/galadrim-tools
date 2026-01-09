import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import type { IRestaurant } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import {
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
import MiamsDailyChoicesOverlay from "./components/MiamsDailyChoicesOverlay";
import MiamsSelectedRestaurantCard from "./components/MiamsSelectedRestaurantCard";
import { buildMiamsSearchParams } from "./utils";
import { useMiamsPageController } from "./useMiamsPageController";

export default function MiamsPage(props: { selectedRestaurantId?: number; zoom?: number }) {
    const router = useRouter();

    const controller = useMiamsPageController(props);

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

    const openCreateRestaurantEditor = () => {
        setEditorMode("create");
        setEditorRestaurant(null);
        setEditorOpen(true);
    };

    return (
        <div className="flex h-full min-h-0 w-full">
            <aside className="hidden w-96 min-w-96 flex-col border-r bg-card md:flex">
                <MiamsSidebar
                    search={controller.search}
                    onSearchChange={controller.setSearch}
                    canCreateRestaurant={controller.meId !== null}
                    onCreateRestaurant={openCreateRestaurantEditor}
                    restaurants={controller.filteredRestaurants}
                    selectedRestaurantId={props.selectedRestaurantId}
                    zoom={controller.zoomFromSearch}
                />
            </aside>

            <Sheet open={controller.mobileListOpen} onOpenChange={controller.setMobileListOpen}>
                <SheetContent side="left" className="w-96 p-0">
                    <MiamsSidebar
                        search={controller.search}
                        onSearchChange={controller.setSearch}
                        canCreateRestaurant={controller.meId !== null}
                        onCreateRestaurant={() => {
                            controller.setMobileListOpen(false);
                            openCreateRestaurantEditor();
                        }}
                        restaurants={controller.filteredRestaurants}
                        selectedRestaurantId={props.selectedRestaurantId}
                        zoom={controller.zoomFromSearch}
                        onAfterSelectRestaurant={() => controller.setMobileListOpen(false)}
                    />
                </SheetContent>
            </Sheet>

            <main className="relative isolate min-h-0 flex-1">
                {controller.isLoading ? (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Chargement…
                    </div>
                ) : (
                    <MiamsMap
                        restaurants={controller.restaurantsForMap}
                        offices={controller.officesQuery.data ?? []}
                        selectedRestaurantId={props.selectedRestaurantId}
                        selectedOfficeId={controller.selectedOfficeId}
                        userId={controller.meId}
                        zoom={controller.zoomFromSearch}
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
                                zoom: controller.zoomFromSearch,
                            });
                            router.history.push(`/miams?${params.toString()}`);
                        }}
                    />
                )}

                {controller.selectedRestaurant && (
                    <MiamsSelectedRestaurantCard
                        restaurant={controller.selectedRestaurant}
                        meId={controller.meId}
                        myDailyChoiceId={controller.myDailyChoiceId}
                        isMiamAdmin={controller.isMiamAdmin}
                        usernameById={controller.usernameById}
                        canCreateReview={controller.meId !== null}
                        toggleChoiceMutation={toggleChoiceMutation}
                        upsertNoteMutation={upsertNoteMutation}
                        deleteRestaurantMutation={deleteRestaurantMutation}
                        createReviewMutation={createReviewMutation}
                        updateReviewMutation={updateReviewMutation}
                        deleteReviewMutation={deleteReviewMutation}
                        onSelectTag={(tagName) => controller.setSearch(tagName)}
                        onClose={() => {
                            const params = buildMiamsSearchParams({
                                zoom: controller.zoomFromSearch,
                            });
                            router.history.push(`/miams?${params.toString()}`);
                        }}
                        onEditRestaurant={() => {
                            setEditorMode("edit");
                            setEditorRestaurant(controller.selectedRestaurant);
                            setEditorOpen(true);
                        }}
                        onAfterDeleteRestaurant={() => {
                            router.history.push("/miams");
                        }}
                    />
                )}

                <div className="absolute left-4 top-4 z-40 md:hidden">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => controller.setMobileListOpen(true)}
                    >
                        Liste
                    </Button>
                </div>

                <MiamsDailyChoicesOverlay
                    restaurants={controller.restaurantChoices}
                    totalDailyChoices={controller.totalDailyChoices}
                    meId={controller.meId}
                    usernameById={controller.usernameById}
                    selectedRestaurantId={props.selectedRestaurantId}
                    toggleChoiceMutation={toggleChoiceMutation}
                    onSelectRestaurantId={(restaurantId) => {
                        const params = buildMiamsSearchParams({
                            restaurantId,
                            zoom: controller.zoomFromSearch,
                        });
                        router.history.push(`/miams?${params.toString()}`);
                    }}
                />
            </main>

            <RestaurantEditorSheet
                open={editorOpen}
                onOpenChange={setEditorOpen}
                mode={editorMode}
                restaurant={editorRestaurant}
                tags={controller.tagsQuery.data ?? []}
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
