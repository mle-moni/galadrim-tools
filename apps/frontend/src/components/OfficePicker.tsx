import { Building2 } from "lucide-react";

import type { ApiOffice } from "@galadrim-tools/shared";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface OfficePickerProps {
    offices: ApiOffice[];
    selectedOfficeName: string | undefined;
    onSelectOfficeId: (officeId: number) => void;
}

export default function OfficePicker({
    offices,
    selectedOfficeName,
    onSelectOfficeId,
}: OfficePickerProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" type="button">
                    <Building2 className="h-4 w-4" />
                    {selectedOfficeName ?? "Chargement…"}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-[200] w-64 bg-card shadow-lg">
                {offices.map((office) => (
                    <DropdownMenuItem
                        key={office.id}
                        className="cursor-pointer"
                        onSelect={() => onSelectOfficeId(office.id)}
                    >
                        <span className="truncate">{office.name}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
