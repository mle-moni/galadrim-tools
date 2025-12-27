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

interface SecurityCardProps {
    password: string;
    passwordConfirm: string;
    onChangePassword: (next: string) => void;
    onChangePasswordConfirm: (next: string) => void;
    onSubmit: (password: string) => Promise<{ notification: string }>;
    isPending: boolean;
}

export default function SecurityCard({
    password,
    passwordConfirm,
    onChangePassword,
    onChangePasswordConfirm,
    onSubmit,
    isPending,
}: SecurityCardProps) {
    return (
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
                            onChange={(e) => onChangePassword(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="settings-password-confirm">Confirmer</Label>
                        <Input
                            id="settings-password-confirm"
                            type="password"
                            value={passwordConfirm}
                            onChange={(e) => onChangePasswordConfirm(e.target.value)}
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

                        const promise = onSubmit(password);
                        toast.promise(promise, {
                            loading: "Mise à jour…",
                            success: (data) => data.notification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de modifier le mot de passe",
                        });
                    }}
                    disabled={isPending}
                >
                    {isPending ? <RefreshCcw className="h-4 w-4 animate-spin" /> : "Mettre à jour"}
                </Button>
            </CardFooter>
        </Card>
    );
}
