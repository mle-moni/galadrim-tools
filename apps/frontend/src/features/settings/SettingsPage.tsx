import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";

import type { IUserData } from "@galadrim-tools/shared";

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

import ApiTokenCard from "./components/ApiTokenCard";
import type { ProfileFormState } from "./components/ProfileCard";
import ProfileCard from "./components/ProfileCard";
import type { NotificationToggleItem } from "./components/NotificationsCard";
import NotificationsCard from "./components/NotificationsCard";
import type { OfficeOption } from "./components/OfficeCard";
import OfficeCard from "./components/OfficeCard";
import SecurityCard from "./components/SecurityCard";
import SettingsHeader from "./components/SettingsHeader";

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
    return settings ^ NOTIFICATION_MASKS[notification];
}

const NOTIFICATION_ITEMS: readonly NotificationToggleItem<NotificationKey>[] = [
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
] as const;

export default function SettingsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const meQuery = useQuery(meQueryOptions());
    const officesQuery = useQuery(officesQueryOptions());

    const me = meQuery.data;

    const [profileTouched, setProfileTouched] = useState(false);
    const [profileForm, setProfileForm] = useState<ProfileFormState>({
        username: "",
        email: "",
        avatarFile: null,
    });

    const [officeId, setOfficeId] = useState<number | null>(null);

    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");

    const [apiToken, setApiToken] = useState<ApiToken | null>(null);

    const officesErrorToastShown = useRef(false);

    const avatarPreviewUrl = useMemo(() => {
        if (!profileForm.avatarFile) return null;
        return URL.createObjectURL(profileForm.avatarFile);
    }, [profileForm.avatarFile]);

    useEffect(() => {
        if (!avatarPreviewUrl) return;
        return () => URL.revokeObjectURL(avatarPreviewUrl);
    }, [avatarPreviewUrl]);

    useEffect(() => {
        if (!me) return;
        if (profileTouched) return;

        setProfileForm({
            username: me.username,
            email: me.email,
            avatarFile: null,
        });
        setOfficeId(me.officeId ?? null);
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
            setProfileTouched(false);
            setProfileForm((prev) => ({ ...prev, avatarFile: null }));
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

    const officeOptions = useMemo<OfficeOption[]>(() => {
        const offices = officesQuery.data ?? [];
        return offices
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((office) => ({ id: office.id, name: office.name }));
    }, [officesQuery.data]);

    const notificationsSettings = me?.notificationsSettings ?? 0;

    return (
        <div className="flex h-full w-full flex-col gap-6 overflow-auto p-6">
            <SettingsHeader
                title="Paramètres"
                description="Gérez votre profil, vos notifications et votre compte."
                username={me?.username ?? "Utilisateur"}
                avatarSrc={currentAvatarSrc}
                logoutMutation={logoutMutation}
                onLogoutSuccessNotification={(data) => data.notification}
            />

            <Tabs defaultValue="profile" className="gap-4">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="profile">Profil</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="office">Bureau</TabsTrigger>
                    <TabsTrigger value="security">Sécurité</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                    <ProfileCard
                        currentAvatarSrc={currentAvatarSrc}
                        displayedUsername={profileForm.username || me?.username || "Utilisateur"}
                        form={profileForm}
                        onChange={(next) => {
                            setProfileTouched(true);
                            setProfileForm(next);
                        }}
                        onRemoveAvatar={() => {
                            setProfileTouched(true);
                            setProfileForm((prev) => ({ ...prev, avatarFile: null }));
                        }}
                        onSave={() =>
                            profileMutation.mutateAsync({
                                username: profileForm.username,
                                email: profileForm.email,
                                avatarFile: profileForm.avatarFile,
                            })
                        }
                        isSaving={profileMutation.isPending}
                    />
                </TabsContent>

                <TabsContent value="notifications">
                    <NotificationsCard
                        items={NOTIFICATION_ITEMS}
                        disabled={notificationsMutation.isPending || !me}
                        isEnabled={(key) => isNotificationEnabled(notificationsSettings, key)}
                        onToggle={async (key) => {
                            if (!me) {
                                return { message: "Utilisateur non chargé" };
                            }

                            const next = toggleNotificationSetting(notificationsSettings, key);
                            return notificationsMutation.mutateAsync(next);
                        }}
                    />
                </TabsContent>

                <TabsContent value="office">
                    <OfficeCard
                        officeId={officeId}
                        officeOptions={officeOptions}
                        isLoading={officesQuery.isLoading || officesQuery.isError}
                        isSaving={officeMutation.isPending}
                        onChangeOfficeId={setOfficeId}
                        onSave={(id) => officeMutation.mutateAsync(id)}
                    />
                </TabsContent>

                <TabsContent value="security">
                    <SecurityCard
                        password={password}
                        passwordConfirm={passwordConfirm}
                        onChangePassword={setPassword}
                        onChangePasswordConfirm={setPasswordConfirm}
                        onSubmit={(pwd) => passwordMutation.mutateAsync(pwd)}
                        isPending={passwordMutation.isPending}
                    />

                    <ApiTokenCard
                        apiToken={apiToken}
                        onGenerate={() => tokenMutation.mutateAsync()}
                        isGenerating={tokenMutation.isPending}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
}
