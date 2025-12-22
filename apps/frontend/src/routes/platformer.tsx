import { useMemo, useState } from "react";
import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import * as Dialog from "@radix-ui/react-dialog";

import { Button } from "@/components/ui/button";
import { meQueryOptions } from "@/integrations/backend/auth";
import { getApiUrl } from "@/integrations/backend/client";
import {
    clearPlatformerEasterEggReturnTo,
    getPlatformerEasterEggReturnTo,
    isPlatformerEasterEggUnlocked,
} from "@/features/platformer/easter-egg";

export const Route = createFileRoute("/platformer")({
    beforeLoad: async ({ context, location }) => {
        try {
            await context.queryClient.ensureQueryData(meQueryOptions());
        } catch {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        }

        if (!isPlatformerEasterEggUnlocked()) {
            throw redirect({
                to: "/planning",
                search: {},
            });
        }
    },
    component: PlatformerRoute,
});

function PlatformerRoute() {
    const router = useRouter();
    const [open, setOpen] = useState(true);

    const gameUrl = useMemo(() => {
        // Important: trailing slash so relative scripts load from /tournois/.
        return new URL("/tournois/", getApiUrl()).toString();
    }, []);

    const close = () => {
        setOpen(false);
        const returnTo = getPlatformerEasterEggReturnTo();
        clearPlatformerEasterEggReturnTo();
        router.history.push(returnTo ?? "/planning");
    };

    return (
        <div className="flex min-h-svh items-center justify-center">
            <Dialog.Root
                open={open}
                onOpenChange={(next) => {
                    if (!next) close();
                }}
            >
                <Dialog.Portal>
                    <Dialog.Overlay className="fixed inset-0 bg-black/70" />
                    <Dialog.Content className="fixed inset-0">
                        <div className="absolute right-4 top-4 z-10 flex gap-2">
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    window.open(gameUrl, "_blank", "noopener,noreferrer")
                                }
                            >
                                Ouvrir dans un onglet
                            </Button>
                            <Button variant="destructive" onClick={close}>
                                Fermer
                            </Button>
                        </div>

                        <iframe
                            title="Platformer"
                            src={gameUrl}
                            className="h-full w-full border-0"
                            referrerPolicy="no-referrer"
                            allow="fullscreen"
                        />
                    </Dialog.Content>
                </Dialog.Portal>
            </Dialog.Root>
        </div>
    );
}
