import { RefreshCcw } from "lucide-react";
import { toast } from "sonner";

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
import Avatar from "@/components/Avatar";

export interface ProfileFormState {
    username: string;
    email: string;
    avatarFile: File | null;
}

interface ProfileCardProps {
    currentAvatarSrc: string | null;
    displayedUsername: string;
    form: ProfileFormState;
    onChange: (next: ProfileFormState) => void;
    onRemoveAvatar: () => void;
    onSave: () => Promise<unknown>;
    isSaving: boolean;
}

export default function ProfileCard({
    currentAvatarSrc,
    displayedUsername,
    form,
    onChange,
    onRemoveAvatar,
    onSave,
    isSaving,
}: ProfileCardProps) {
    const isValid = form.username.trim() !== "" && form.email.trim() !== "";

    return (
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
                            value={form.username}
                            onChange={(e) =>
                                onChange({
                                    ...form,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="settings-email">Adresse e-mail</Label>
                        <Input
                            id="settings-email"
                            type="email"
                            value={form.email}
                            onChange={(e) =>
                                onChange({
                                    ...form,
                                    email: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid gap-3">
                    <Label htmlFor="settings-avatar">Photo de profil</Label>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Avatar
                            src={currentAvatarSrc}
                            alt={displayedUsername}
                            size={64}
                            className="h-16 w-16"
                        />
                        <div className="flex-1">
                            <Input
                                id="settings-avatar"
                                type="file"
                                accept="image/png,image/jpg,image/jpeg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    onChange({
                                        ...form,
                                        avatarFile: file,
                                    });
                                }}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                                PNG ou JPG seulement, 1 Mo max
                            </p>
                        </div>
                        {form.avatarFile && (
                            <Button variant="outline" onClick={onRemoveAvatar}>
                                Retirer
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={() => {
                        toast.promise(onSave(), {
                            loading: "Sauvegarde…",
                            success: "Profil mis à jour",
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de mettre à jour le profil",
                        });
                    }}
                    disabled={isSaving || !isValid}
                >
                    {isSaving ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "Sauvegarder"}
                </Button>
            </CardFooter>
        </Card>
    );
}
