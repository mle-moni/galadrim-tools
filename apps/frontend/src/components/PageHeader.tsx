import type { ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

import PageTitle from "@/components/PageTitle";

interface PageHeaderProps {
    title: string;
    icon?: ElementType<{ className?: string }>;
    description?: string;
    right?: ReactNode;
    className?: string;
    iconClassName?: string;
}

export default function PageHeader({
    title,
    icon,
    description,
    right,
    className,
    iconClassName,
}: PageHeaderProps) {
    return (
        <header className={cn("border-b bg-background px-4 py-3 md:px-6 md:py-4", className)}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <PageTitle icon={icon} iconClassName={iconClassName}>
                        {title}
                    </PageTitle>
                    {description ? (
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                    ) : null}
                </div>
                {right ? <div className="flex items-center gap-2">{right}</div> : null}
            </div>
        </header>
    );
}
