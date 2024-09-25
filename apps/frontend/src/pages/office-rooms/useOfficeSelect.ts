import type { ApiOffice } from "@galadrim-tools/shared";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchBackendJson } from "../../api/fetch";

const NO_OFFICE_ID = 0;
const NO_OFFICE_OPTION = { label: "Aucun", value: NO_OFFICE_ID };

export const useOfficeSelect = () => {
    const navigate = useNavigate();
    const { officeId: officeIdRaw } = useParams();
    const officeId = Number(officeIdRaw ?? NO_OFFICE_ID);
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
        if (!officesQuery.data) return [NO_OFFICE_OPTION];

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
            navigate("/office-rooms");
        } else {
            navigate(`/office-rooms/${office.id}`);
        }
    };

    const setSelectedOfficeFromId = (id: number) => {
        const office = officesQuery.data?.data.find((office) => office.id === id);
        if (!office) return;
        setSelectedOffice(office);
    };

    return {
        officesOptions,
        selectedOffice,
        selectedOfficeId: officeId,
        setSelectedOfficeFromId,
    };
};
