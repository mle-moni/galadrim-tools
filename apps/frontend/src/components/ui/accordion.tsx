import type { ComponentProps } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({ ...props }: ComponentProps<typeof AccordionPrimitive.Root>) {
    return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({ className, ...props }: ComponentProps<typeof AccordionPrimitive.Item>) {
    return (
        <AccordionPrimitive.Item
            data-slot="accordion-item"
            className={cn("border-b", className)}
            {...props}
        />
    );
}

function AccordionTrigger({
    className,
    children,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
    return (
        <AccordionPrimitive.Header className="flex">
            <AccordionPrimitive.Trigger
                data-slot="accordion-trigger"
                className={cn(
                    "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center justify-between gap-2 rounded-md py-2 text-left text-sm font-medium transition-all focus-visible:ring-[3px] focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
                    className,
                )}
                {...props}
            >
                {children}
                <ChevronDownIcon className="text-muted-foreground size-4 shrink-0 transition-transform duration-200" />
            </AccordionPrimitive.Trigger>
        </AccordionPrimitive.Header>
    );
}

function AccordionContent({
    className,
    children,
    ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
    return (
        <AccordionPrimitive.Content
            data-slot="accordion-content"
            className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
            {...props}
        >
            <div className={cn("pt-0 pb-2", className)}>{children}</div>
        </AccordionPrimitive.Content>
    );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
