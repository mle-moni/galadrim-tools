import type { ApiOffice } from "@galadrim-tools/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBackendJson } from "../../api/fetch";

export const useOfficeSelect = (baseUrl = "/office-rooms") => {
    const navigate = useNavigate();
    const { officeId: officeIdRaw } = useParams();
    const officeId = officeIdRaw ? Number(officeIdRaw) : null;
    const officesQuery = useQuery({
        queryKey: ["offices"],
        queryFn: async () => {
            const res = await fetchBackendJson<{ data: ApiOffice[] }, unknown>(
                "/adomin/api/models/crud/Office?pageIndex=1&pageSize=100",
                "GET",
            );

            if (!res.ok) {
                throw new Error("Impossible de récupérer les bureaux");
            }

            return res.json;
        },
    });

    const officesOptions = useMemo(() => {
        if (!officesQuery.data) return [];

        const options = officesQuery.data.data.map((office) => ({
            label: office.name,
            value: office.id,
        }));

        return options;
    }, [officesQuery.data]);

    const selectedOffice = useMemo(() => {
        if (!officesQuery.data) return null;

        return officesQuery.data.data.find((office) => office.id === officeId) ?? null;
    }, [officesQuery.data, officeId]);

    const setSelectedOffice = (office: ApiOffice | null) => {
        if (!office) {
            navigate(baseUrl);
        } else {
            navigate(`${baseUrl}/${office.id}`);
        }
    };

    const setSelectedOfficeFromId = (id: number) => {
        const office = officesQuery.data?.data.find((office) => office.id === id);
        if (!office) return;
        setSelectedOffice(office);
    };

    return {
        officesOptions,
        allOffices: officesQuery.data?.data ?? [],
        selectedOffice,
        selectedOfficeId: selectedOffice?.id ?? null,
        setSelectedOfficeFromId,
    };
};
