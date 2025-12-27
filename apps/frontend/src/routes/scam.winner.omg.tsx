import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import confetti from "canvas-confetti";

import { meQueryOptions } from "@/integrations/backend/auth";
import { startOfDayIso } from "@/integrations/backend/date";
import { roomReservationsQueryOptions } from "@/integrations/backend/reservations";

export const Route = createFileRoute("/scam/winner/omg")({
    beforeLoad: async ({ context, location }) => {
        const me = await context.queryClient.ensureQueryData(meQueryOptions()).catch(() => {
            throw redirect({
                to: "/login",
                search: {
                    redirect: location.href,
                },
            });
        });

        if (me.officeId == null) {
            throw redirect({
                to: "/planning",
                search: {},
            });
        }

        const dayIso = startOfDayIso(new Date());
        const reservations = await context.queryClient
            .ensureQueryData(roomReservationsQueryOptions(me.officeId, dayIso))
            .catch(() => null);

        const latestId = (reservations ?? []).reduce((max, r) => (r.id > max ? r.id : max), 0);
        if (!latestId) {
            throw redirect({
                to: "/planning",
                search: { officeId: me.officeId },
            });
        }

        const nearest10000 = Math.max(10000, Math.round(latestId / 10000) * 10000);
        const isNearMilestone = Math.abs(latestId - nearest10000) <= 15;

        if (!isNearMilestone) {
            throw redirect({
                to: "/planning",
                search: { officeId: me.officeId },
            });
        }
    },
    component: ScamWinnerOmgPage,
});

type ScamPopup = {
    id: string;
    title: string;
    body: string;
    cta: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    angle: number;
    isVisible: boolean;
};

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function randomBetween(min: number, max: number) {
    return min + Math.random() * (max - min);
}

function createPopup(index: number): ScamPopup {
    const templates = [
        {
            title: "🎁 VOUS AVEZ GAGNÉ UN iPAD !!!",
            body: "Cliquez ICI maintenant pour récupérer votre iPad gratuit\n(100% réel, promis)",
            cta: "RÉCUPÉRER MON iPAD",
        },

        {
            title: "💸 PRIME EXCEPTIONNELLE",
            body: "Vous avez droit à une prime de 5000€\nEntrez votre RIB pour valider",
            cta: "VALIDER MA PRIME",
        },
        {
            title: "🧠 TEST QI RAPIDE",
            body: "Découvrez votre QI en 30 secondes\nRésultat garanti",
            cta: "DÉMARRER LE TEST",
        },
        {
            title: "🚨 DERNIÈRE CHANCE",
            body: "Offre limitée: GÂTEAU GRATUIT + iPad\nExpirera dans 00:00:13",
            cta: "JE CLIQUE !!!",
        },
    ];

    const template = templates[index % templates.length];

    const width = 260;
    const height = 160;
    const maxX = Math.max(0, window.innerWidth - width);
    const maxY = Math.max(0, window.innerHeight - height);

    // DVD-logo-ish: start in corners with clean diagonal movement
    const speed = randomBetween(2.2, 3.4);
    const cornerIndex = index % 4;
    const corners: Array<{ x: number; y: number; vx: number; vy: number }> = [
        { x: 0, y: 0, vx: +speed, vy: +speed },
        { x: maxX, y: 0, vx: -speed, vy: +speed },
        { x: 0, y: maxY, vx: +speed, vy: -speed },
        { x: maxX, y: maxY, vx: -speed, vy: -speed },
    ];

    const isCornerPopup = index < 8;
    const base = isCornerPopup
        ? corners[cornerIndex]
        : {
              x: randomBetween(0, maxX),
              y: randomBetween(0, maxY),
              vx: (Math.random() < 0.5 ? -1 : 1) * speed,
              vy: (Math.random() < 0.5 ? -1 : 1) * speed,
          };

    return {
        id: `${Date.now()}-${index}-${Math.random().toString(16).slice(2)}`,
        title: template.title,
        body: template.body,
        cta: template.cta,
        x: base.x,
        y: base.y,
        vx: base.vx,
        vy: base.vy,
        angle: randomBetween(-3, 3),
        isVisible: true,
    };
}

function ScamWinnerOmgPage() {
    const meQuery = useQuery(meQueryOptions());
    const officeId = meQuery.data?.officeId;

    const dayIso = startOfDayIso(new Date());
    const reservationsQuery = useQuery({
        ...roomReservationsQueryOptions(officeId ?? null, dayIso),
        enabled: officeId != null,
    });

    const milestoneLabel = useMemo(() => {
        const reservations = reservationsQuery.data;
        if (!reservations || reservations.length === 0) return "10\u00a0000";

        const latestId = reservations.reduce((max, r) => (r.id > max ? r.id : max), 0);
        if (latestId <= 0) return "10\u00a0000";

        const milestone = Math.max(10000, Math.round(latestId / 10000) * 10000);
        return milestone.toLocaleString("fr-FR");
    }, [reservationsQuery.data]);

    const [popups, setPopups] = useState<ScamPopup[]>([]);

    const popupCount = 14;

    const [basePopups] = useState<ScamPopup[]>(() => {
        return Array.from({ length: popupCount }, (_, idx) => createPopup(idx));
    });

    useEffect(() => {
        setPopups(basePopups);
    }, [basePopups]);

    useEffect(() => {
        const start = Date.now();

        const burst = () => {
            confetti({
                particleCount: 90,
                spread: 120,
                startVelocity: 55,
                origin: { x: Math.random(), y: 0.15 + Math.random() * 0.35 },
                colors: ["#ff008a", "#fff700", "#00d5ff", "#00ff2a", "#000000"],
            });
        };

        burst();
        const interval = window.setInterval(() => {
            burst();
            if (Date.now() - start > 7000) window.clearInterval(interval);
        }, 650);

        return () => window.clearInterval(interval);
    }, []);

    useEffect(() => {
        if (popups.length === 0) return;

        const width = 260;
        const height = 160;

        const timer = window.setInterval(() => {
            setPopups((current) =>
                current.map((popup) => {
                    if (!popup.isVisible) return popup;

                    const maxX = Math.max(0, window.innerWidth - width);
                    const maxY = Math.max(0, window.innerHeight - height);

                    let nextX = popup.x + popup.vx;
                    let nextY = popup.y + popup.vy;
                    let nextVx = popup.vx;
                    let nextVy = popup.vy;

                    const hitX = nextX <= 0 || nextX >= maxX;
                    const hitY = nextY <= 0 || nextY >= maxY;

                    if (hitX) nextVx = -nextVx;
                    if (hitY) nextVy = -nextVy;

                    nextX = clamp(nextX, 0, maxX);
                    nextY = clamp(nextY, 0, maxY);

                    // Very DVD-logo behavior: sometimes do a tiny confetti tick on corner hits
                    if (hitX && hitY && Math.random() < 0.18) {
                        confetti({
                            particleCount: 18,
                            spread: 80,
                            startVelocity: 30,
                            origin: {
                                x: (nextX + width / 2) / window.innerWidth,
                                y: (nextY + 6) / window.innerHeight,
                            },
                            colors: ["#fff700", "#ff008a", "#00d5ff"],
                        });
                    }

                    return {
                        ...popup,
                        x: nextX,
                        y: nextY,
                        vx: nextVx,
                        vy: nextVy,
                    };
                }),
            );
        }, 40);

        return () => window.clearInterval(timer);
    }, [popups.length]);

    const closePopup = (id: string) => {
        setPopups((current) =>
            current.map((popup) => (popup.id === id ? { ...popup, isVisible: false } : popup)),
        );

        window.setTimeout(
            () => {
                setPopups((current) =>
                    current.map((popup) => {
                        if (popup.id !== id) return popup;
                        const resurrected = createPopup(Math.floor(Math.random() * 999));
                        return {
                            ...popup,
                            x: resurrected.x,
                            y: resurrected.y,
                            vx: resurrected.vx,
                            vy: resurrected.vy,
                            angle: resurrected.angle,
                            isVisible: true,
                        };
                    }),
                );
            },
            900 + Math.random() * 1300,
        );
    };

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-auto bg-[repeating-linear-gradient(45deg,#fff700_0px,#fff700_18px,#ff008a_18px,#ff008a_36px)] p-6">
            {popups
                .filter((p) => p.isVisible)
                .map((popup) => (
                    <div
                        key={popup.id}
                        className="pointer-events-auto fixed z-[2000] w-[260px] select-none border-4 border-black bg-gradient-to-b from-[#00d5ff] to-[#ff008a] shadow-[6px_6px_0_0_#000]"
                        style={{
                            left: popup.x,
                            top: popup.y,
                            transform: `rotate(${popup.angle}deg)`,
                            animation: "scam-shake 120ms infinite linear",
                        }}
                    >
                        <div className="flex items-center justify-between gap-2 bg-black px-2 py-1 text-xs font-black uppercase tracking-widest text-[#fff700]">
                            <span className="truncate">{popup.title}</span>
                            <button
                                type="button"
                                className="pointer-events-auto h-5 w-5 shrink-0 border-2 border-white bg-red-600 text-[10px] leading-4 text-white"
                                onClick={() => closePopup(popup.id)}
                            >
                                X
                            </button>
                        </div>
                        <div className="p-2 text-[12px] font-black text-black">
                            <div className="whitespace-pre-line bg-white/80 p-2">{popup.body}</div>
                            <button
                                type="button"
                                className="pointer-events-auto mt-2 w-full border-4 border-black bg-[#fff700] px-2 py-1 text-sm font-black shadow-[3px_3px_0_0_#000]"
                                onClick={() => {
                                    confetti({
                                        particleCount: 60,
                                        spread: 160,
                                        startVelocity: 65,
                                        origin: {
                                            x: popup.x / window.innerWidth,
                                            y: popup.y / window.innerHeight,
                                        },
                                        colors: ["#fff700", "#ff008a", "#00d5ff"],
                                    });
                                    closePopup(popup.id);
                                }}
                            >
                                {popup.cta}
                            </button>
                        </div>
                    </div>
                ))}

            <div className="mx-auto w-full max-w-4xl rounded-xl border-8 border-black bg-white/90 p-6 shadow-[0_0_0_6px_#fff,0_0_60px_12px_rgba(255,0,138,0.25)]">
                <div className="overflow-hidden rounded-md border-4 border-red-700 bg-red-600 p-2 text-center text-white">
                    <div
                        className="inline-block pl-[100%] font-mono text-xl font-black tracking-widest"
                        style={{ animation: "scam-marquee 2.1s linear infinite" }}
                    >
                        🚨Vous avez booké la {milestoneLabel} ème reservation de salle !🚨 🚨Vous
                        avez booké la {milestoneLabel} ème reservation de salle !🚨
                    </div>
                </div>

                <br />

                <h2 className="text-center text-2xl font-black underline">
                    🎉🎉🎉🎉Vous aver gagné GATEAU fabriqué par MAYEUL gratuit 🎉🎉🎉🎉
                </h2>

                <br />
                <br />
                <br />
                <br />
                <br />
                <br />

                <div className="mt-8">
                    <div className="mb-2 text-lg font-bold">Commentaires :</div>
                    <div className="space-y-4 text-sm">
                        <div>
                            <div className="font-semibold">Benjamin D.</div>
                            <div>
                                Heureuse surprise, sans doute mon jour de chance ! <span>🤙</span>
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">Jean-Paul Dubost</div>
                            <div>
                                Au début, je pensais que c'était une blague, mais j'ai finalement eu
                                mon GÂTEAU GRATUIT ! J'en ai parlé à des amis, pour qu'ils puissent
                                aussi participer
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">Natanaël Baugé</div>
                            <div>
                                Je me suis inscrit, j'ai gagné et j'ai reçu mon GÂTEAU GRATUIT au
                                bout de 5 jours. Merci beaucoup les gars !
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">Jennifer Ballesdens</div>
                            <div>
                                Fantastique ! Je n'ai jamais rien gagné, mais ici j'ai eu de la
                                chance :)
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">Hugo Montgomery</div>
                            <div>
                                J'ai gagné, j'ai gagné! Quelle belle surprise en ces temps
                                difficiles!
                            </div>
                        </div>
                        <div>
                            <div className="font-semibold">Nicolette Lambert</div>
                            <div>
                                Je n'ai rien gagné ! Les prix n'étaient pas disponibles lorsque j'ai
                                terminé l'enquête
                            </div>
                        </div>
                    </div>
                </div>

                <style>{`
                    @keyframes scam-marquee {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-100%);
                        }
                    }

                    @keyframes scam-shake {
                        0% {
                            transform: translate(0px, 0px) rotate(0deg);
                        }
                        25% {
                            transform: translate(1px, -1px) rotate(0.2deg);
                        }
                        50% {
                            transform: translate(-1px, 1px) rotate(-0.2deg);
                        }
                        75% {
                            transform: translate(1px, 1px) rotate(0.3deg);
                        }
                        100% {
                            transform: translate(-1px, -1px) rotate(-0.3deg);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
