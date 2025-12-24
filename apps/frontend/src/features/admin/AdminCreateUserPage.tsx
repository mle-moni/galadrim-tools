import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
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

import { createUser } from "@/integrations/backend/admin";

export default function AdminCreateUserPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");

    const createUserMutation = useMutation({
        mutationFn: createUser,
        onSuccess: () => {
            setEmail("");
            setUsername("");
        },
    });

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Créer un utilisateur</CardTitle>
                <CardDescription>
                    Crée un compte et envoie un email pour initialiser le mot de passe.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="grid gap-2">
                    <Label htmlFor="admin-create-user-email">Adresse e-mail</Label>
                    <Input
                        id="admin-create-user-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="off"
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="admin-create-user-username">Nom d'utilisateur</Label>
                    <Input
                        id="admin-create-user-username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        autoComplete="off"
                    />
                </div>
            </CardContent>
            <CardFooter className="justify-end">
                <Button
                    onClick={() => {
                        const promise = createUserMutation.mutateAsync({
                            email: email.trim(),
                            username: username.trim(),
                        });
                        toast.promise(promise, {
                            loading: "Création…",
                            success: (data) => data.notification,
                            error: (error) =>
                                error instanceof Error
                                    ? error.message
                                    : "Impossible de créer l'utilisateur",
                        });
                    }}
                    disabled={
                        createUserMutation.isPending ||
                        email.trim() === "" ||
                        username.trim() === ""
                    }
                >
                    {createUserMutation.isPending ? (
                        <RefreshCcw className="h-4 w-4 animate-spin" />
                    ) : (
                        "Créer"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
