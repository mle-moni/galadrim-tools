import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

import type { IUserData } from "@galadrim-tools/shared";

import Avatar from "@/components/Avatar";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { meQueryOptions } from "@/integrations/backend/auth";
import { officesQueryOptions } from "@/integrations/backend/offices";
import { queryKeys } from "@/integrations/backend/query-keys";
import {
    changeDefaultOffice,
    changePassword,
    createApiToken,
    logout,
    updateNotificationsSettings,
    updateProfile,
    type ApiToken,
} from "@/integrations/backend/settings";

const NOTIFICATION_MASKS = {
    NEW_RESTAURANT: 0b1,
    NEW_IDEA: 0b10,
    NEW_REVIEW: 0b1000,
    NEW_IDEA_COMMENT: 0b10000,
} as const;

type NotificationKey = keyof typeof NOTIFICATION_MASKS;

function isNotificationEnabled(settings: number, notification: NotificationKey) {
    return (settings & NOTIFICATION_MASKS[notification]) !== 0;
}

function toggleNotificationSetting(settings: number, notification: NotificationKey) {
    const shouldAdd = !isNotificationEnabled(settings, notification);
    const delta = shouldAdd ? NOTIFICATION_MASKS[notification] : -NOTIFICATION_MASKS[notification];
    return settings + delta;
}

async function copyToClipboard(text: string) {
    try {
        const permissions = await navigator.permissions.query({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            name: "clipboard-write",
        });

        if (permissions.state !== "granted" && permissions.state !== "prompt") {
            return false;
        }

        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        return false;
    }
}

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const meQuery = useQuery(meQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());

    const me = meQuery.data;

    const [profileUsername, setProfileUsername] = useState("");
    const [profileEmail, setProfileEmail] = useState("");
    const [profileAvatarFile, setProfileAvatarFile] = useState<File | null>(null);
    const [profileTouched, setProfileTouched] = useState(false);

    const [officeId, setOfficeId] = useState<number | "">("");

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [apiToken, setApiToken] = useState<ApiToken | null>(null);

    const officesErrorToastShown = useRef(false);

    const avatarPreviewUrl = useMemo(() => {
        if (!profileAvatarFile) return null;
        return URL.createObjectURL(profileAvatarFile);
    }, [profileAvatarFile]);

    useEffect(() => {
        if (!avatarPreviewUrl) return;
        return () => URL.revokeObjectURL(avatarPreviewUrl);
    }, [avatarPreviewUrl]);

    useEffect(() => {
        if (!me) return;
        if (profileTouched) return;

        setProfileUsername(me.username);
        setProfileEmail(me.email);
        setOfficeId(me.officeId ?? "");
    }, [me, profileTouched]);

    useEffect(() => {
        if (!officesQuery.isError) return;
        if (officesErrorToastShown.current) return;
        officesErrorToastShown.current = true;
        toast.error("Impossible de charger la liste des bureaux");
    }, [officesQuery.isError]);

    const profileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (data) => {
            queryClient.setQueryData<IUserData>(queryKeys.me(), data);
            setProfileAvatarFile(null);
            setProfileTouched(false);
        },
    });

    const notificationsMutation = useMutation({
        mutationFn: updateNotificationsSettings,
        onSuccess: (_data, notificationsSettings) => {
            queryClient.setQueryData<IUserData>(queryKeys.me(), (old) => {
                if (!old) return old;
                return { ...old, notificationsSettings };
            });
        },
    });

    const officeMutation = useMutation({
        mutationFn: changeDefaultOffice,
        onSuccess: (_data, nextOfficeId) => {
            queryClient.setQueryData<IUserData>(queryKeys.me(), (old) => {
                if (!old) return old;
                return { ...old, officeId: nextOfficeId };
            });
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            setPassword("");
            setPasswordConfirm("");
        },
    });

    const tokenMutation = useMutation({
        mutationFn: createApiToken,
        onSuccess: (token) => {
            setApiToken(token);
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: async () => {
            queryClient.removeQueries({ queryKey: queryKeys.me(), exact: true });
            await router.invalidate();
            router.history.push("/login");
        },
        onError: async () => {
            queryClient.removeQueries({ queryKey: queryKeys.me(), exact: true });
            await router.invalidate();
            router.history.push("/login");
        },
    });

    const currentAvatarSrc = avatarPreviewUrl ?? me?.imageUrl ?? null;

    const officeOptions = useMemo(() => {
        const offices = officesQuery.data ?? [];
        return offices
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((office) => ({ id: office.id, name: office.name }));
    }, [officesQuery.data]);

    const notificationsSettings = me?.notificationsSettings ?? 0;

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Avatar
                        src={currentAvatarSrc}
                        alt={me?.username ?? "Utilisateur"}
                        size={40}
                        className="h-10 w-10"
                    />
                    <div>
                        <h1 className="text-2xl font-semibold">Paramètres</h1>
                        <p className="text-sm text-muted-foreground">
                            Gérez votre profil, vos notifications et votre compte.
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Button
                        variant="destructive"
                        onClick={() => {
                            toast.promise(logoutMutation.mutateAsync(), {
                                loading: "Déconnexion…",
                                success: (data) => data.notification,
                                error: (error) =>
                                    error instanceof Error
                                        ? error.message
                                        : "Impossible de se déconnecter",
                            });
                        }}
                        disabled={logoutMutation.isPending}
                    >
                        {logoutMutation.isPending ? (
                            <RefreshCcw className="h-4 w-4 animate-spin" />
                        ) : (
                            "Se déconnecter"
                        )}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="profile" className="gap-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="office">Bureau</TabsTrigger>
                    <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <Card>
                        <CardHeader>
                            <CardTitle>Profil</CardTitle>
                            <CardDescription>
                                Modifiez votre nom, votre e-mail et votre photo de profil.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="settings-username">Nom d'utilisateur</Label>
                                    <Input
                                        id="settings-username"
                                        value={profileUsername}
                                        onChange={(e) => {
                                            setProfileTouched(true);
                                            setProfileUsername(e.target.value);
                                        }}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="settings-email">Adresse e-mail</Label>
                                    <Input
                                        id="settings-email"
                                        type="email"
                                        value={profileEmail}
                                        onChange={(e) => {
                                            setProfileTouched(true);
                                            setProfileEmail(e.target.value);
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <Label htmlFor="settings-avatar">Photo de profil</Label>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Avatar
                                        src={currentAvatarSrc}
                                        alt={profileUsername || me?.username || "Utilisateur"}
                                        size={64}
                                        className="h-16 w-16"
                                    />
                                    <div className="flex-1">
                                        <Input
                                            id="settings-avatar"
                                            type="file"
                                            accept="image/png,image/jpg,image/jpeg"
                                            onChange={(e) => {
                                                setProfileTouched(true);
                                                const file = e.target.files?.[0] ?? null;
                                                setProfileAvatarFile(file);
                                            }}
                                        />
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            PNG/JPG, 1MB max (limite serveur).
                                        </p>
                                    </div>
                                    {profileAvatarFile && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setProfileAvatarFile(null)}
                                        >
                                            Retirer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                onClick={() => {
                                    toast.promise(
                                        profileMutation.mutateAsync({
                                            username: profileUsername,
                                            email: profileEmail,
                                            avatarFile: profileAvatarFile,
                                        }),
                                        {
                                            loading: "Sauvegarde…",
                                            success: "Profil mis à jour",
                                            error: (error) =>
                                                error instanceof Error
                                                    ? error.message
                                                    : "Impossible de mettre à jour le profil",
                                        },
                                    );
                                }}
                                disabled={
                                    profileMutation.isPending ||
                                    profileUsername.trim() === "" ||
                                    profileEmail.trim() === ""
                                }
                            >
                                {profileMutation.isPending ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Sauvegarder"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notifications</CardTitle>
                            <CardDescription>
                                Choisissez quelles notifications vous souhaitez recevoir.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {(
                                [
                                    {
                                        key: "NEW_RESTAURANT",
                                        title: "Nouveau restaurant",
                                        description: "Quand un restaurant est ajouté.",
                                    },
                                    {
                                        key: "NEW_IDEA",
                                        title: "Nouvelle idée",
                                        description: "Quand une idée est publiée.",
                                    },
                                    {
                                        key: "NEW_REVIEW",
                                        title: "Nouvel avis",
                                        description: "Quand un avis est posté.",
                                    },
                                    {
                                        key: "NEW_IDEA_COMMENT",
                                        title: "Nouveau commentaire",
                                        description: "Quand quelqu'un commente une idée.",
                                    },
                                ] as const
                            ).map((item) => {
                                const checked = isNotificationEnabled(
                                    notificationsSettings,
                                    item.key as NotificationKey,
                                );

                                return (
                                    <div
                                        key={item.key}
                                        className="flex items-start justify-between gap-4 rounded-lg border border-border/60 px-4 py-3"
                                    >
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium">{item.title}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {item.description}
                                            </div>
                                        </div>
                                        <Switch
                                            checked={checked}
                                            disabled={notificationsMutation.isPending || !me}
                                            onCheckedChange={() => {
                                                if (!me) return;
                                                const next = toggleNotificationSetting(
                                                    notificationsSettings,
                                                    item.key as NotificationKey,
                                                );

                                                const promise =
                                                    notificationsMutation.mutateAsync(next);
                                                toast.promise(promise, {
                                                    loading: "Mise à jour…",
                                                    success: (data) => data.message,
                                                    error: (error) =>
                                                        error instanceof Error
                                                            ? error.message
                                                            : "Impossible de mettre à jour ce paramètre de notification",
                                                });
                                            }}
                                        />
                                    </div>
                                );
                            })}

                            <p className="text-xs text-muted-foreground">
                                Les changements sont appliqués immédiatement.
                            </p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="office">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bureau</CardTitle>
                            <CardDescription>
                                Définissez vos locaux par défaut (utilisés comme point de départ).
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="settings-office">Locaux par défaut</Label>
                                <select
                                    id="settings-office"
                                    value={officeId}
                                    disabled={officesQuery.isLoading || officesQuery.isError}
                                    onChange={(e) => {
                                        const next =
                                            e.target.value === "" ? "" : Number(e.target.value);
                                        setOfficeId(next);
                                    }}
                                    className="border-input bg-transparent shadow-xs focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 flex h-9 w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-[3px]"
                                >
                                    <option value="" disabled>
                                        Sélectionner un bureau…
                                    </option>
                                    {officeOptions.map((o) => (
                                        <option key={o.id} value={o.id}>
                                            {o.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                onClick={() => {
                                    if (officeId === "") {
                                        toast.error("Sélectionnez un bureau.");
                                        return;
                                    }

                                    const promise = officeMutation.mutateAsync(officeId);
                                    toast.promise(promise, {
                                        loading: "Sauvegarde…",
                                        success: (data) => data.notification,
                                        error: (error) =>
                                            error instanceof Error
                                                ? error.message
                                                : "Impossible de sauvegarder les paramètres",
                                    });
                                }}
                                disabled={officeMutation.isPending || officeId === ""}
                            >
                                {officeMutation.isPending ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Sauvegarder"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                </TabsContent>

                <TabsContent value="security">
                    <Card>
                        <CardHeader>
                            <CardTitle>Sécurité</CardTitle>
                            <CardDescription>Changez votre mot de passe.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="settings-password">Nouveau mot de passe</Label>
                                    <Input
                                        id="settings-password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="settings-password-confirm">Confirmer</Label>
                                    <Input
                                        id="settings-password-confirm"
                                        type="password"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                onClick={() => {
                                    if (password.trim() === "") {
                                        toast.error("Entrez un mot de passe.");
                                        return;
                                    }
                                    if (password !== passwordConfirm) {
                                        toast.error("Les mots de passe ne correspondent pas.");
                                        return;
                                    }

                                    const promise = passwordMutation.mutateAsync(password);
                                    toast.promise(promise, {
                                        loading: "Mise à jour…",
                                        success: (data) => data.notification,
                                        error: (error) =>
                                            error instanceof Error
                                                ? error.message
                                                : "Impossible de modifier le mot de passe",
                                    });
                                }}
                                disabled={passwordMutation.isPending}
                            >
                                {passwordMutation.isPending ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Mettre à jour"
                                )}
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card className="mt-4">
                        <CardHeader>
                            <CardTitle>API token</CardTitle>
                            <CardDescription>
                                Générez un token personnel pour accéder à l'API.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3">
                            {apiToken && (
                                <div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 font-mono text-sm">
                                    {apiToken.token}
                                </div>
                            )}

                            <p className="text-xs text-muted-foreground">
                                Le token n'est affiché qu'après génération. Conservez-le dans un
                                endroit sûr.
                            </p>
                        </CardContent>
                        <CardFooter className="justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    const promise = tokenMutation.mutateAsync();

                                    toast.promise(promise, {
                                        loading: "Génération…",
                                        success: "API token généré",
                                        error: (error) =>
                                            error instanceof Error
                                                ? error.message
                                                : "Impossible de créer un API token",
                                    });

                                    void promise
                                        .then(async (token) => {
                                            const copied = await copyToClipboard(token.token);
                                            if (copied) {
                                                toast.success(
                                                    "API token copié dans le presse-papier",
                                                );
                                            } else {
                                                toast.error(
                                                    "Impossible de copier automatiquement. Copiez le token affiché.",
                                                );
                                            }
                                        })
                                        .catch(() => {
                                            // Error toast handled by toast.promise.
                                        });
                                }}
                                disabled={tokenMutation.isPending}
                            >
                                {tokenMutation.isPending ? (
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Générer"
                                )}
                            </Button>
                            {apiToken && (
                                <Button
                                    className="ml-2"
                                    onClick={async () => {
                                        const ok = await copyToClipboard(apiToken.token);
                                        if (ok) {
                                            toast.success("API token copié dans le presse-papier");
                                        } else {
                                            toast.error("Impossible de copier automatiquement.");
                                        }
                                    }}
                                >
                                    Copier
                                </Button>
                            )}
                        </CardFooter>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
