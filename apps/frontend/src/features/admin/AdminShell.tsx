import type { ElementType, ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronLeft, Shield } from "lucide-react";

import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

type AdminShellProps = {
    title: string;
    icon?: ElementType<{ className?: string }>;
    description?: string;
    backTo?: string;
    children: ReactNode;
};

export default function AdminShell({
    title,
    icon = Shield,
    description,
    backTo = "/admin",
    children,
}: AdminShellProps) {
    return (
        <div className="flex h-full w-full flex-col overflow-hidden">
            <PageHeader
                title={title}
                icon={icon}
                description={description}
                right={
                    <Button variant="outline" asChild>
                        <Link to={backTo} search={{}}>
                            <ChevronLeft className="h-4 w-4" />
                            Retour
                        </Link>
                    </Button>
                }
            />

            <div className="flex-1 overflow-auto px-4 py-4 md:px-6 md:py-6">{children}</div>
        </div>
    );
}
