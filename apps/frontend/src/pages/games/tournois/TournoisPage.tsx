import { OpenInNew } from "@mui/icons-material";
import BackIcon from "@mui/icons-material/ChevronLeft";
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    Typography,
} from "@mui/material";
import { DataGrid, type GridColDef } from "@mui/x-data-grid";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo } from "react";
import { getSocketApiUrl } from "../../../api/fetch";
import { AppStore } from "../../../globalStores/AppStore";
import MainLayout from "../../../reusableComponents/layouts/MainLayout";
import { TournoisResultsStore } from "./TournoisResultsStore";

export interface ResultRow {
    id: number;
    rank: number;
    username: string;
    score: number;
    jumps: number;
    time: number;
}

const RESULT_COLUMNS: GridColDef[] = [
    {
        field: "rank",
        headerName: "Classement",
        width: 100,
    },
    {
        field: "username",
        headerName: "Joueur",
        width: 200,
    },
    {
        field: "score",
        headerName: "Score",
        width: 200,
    },
    {
        field: "jumps",
        headerName: "Sauts",
        width: 200,
    },
    {
        field: "time",
        headerName: "Temps",
        width: 200,
    },
];

const TournoisPage = observer(() => {
    const resultsStore = useMemo(() => new TournoisResultsStore(), []);

    useEffect(() => {
        if (!resultsStore.loadingState.isLoading) {
            resultsStore.fetchResults();
        }
        if (AppStore.tournoisResultsStore === null) {
            AppStore.setTournoisResultsStore(resultsStore);
        }
    }, [resultsStore]);

    return (
        <MainLayout fullscreen={false}>
            <Stack direction="column" sx={{ p: 4 }}>
                <Box sx={{ mb: 2 }}>
                    <Button
                        startIcon={<BackIcon />}
                        variant="contained"
                        onClick={() => AppStore.navigate("/")}
                    >
                        Retour
                    </Button>
                    <Button
                        startIcon={<OpenInNew />}
                        variant="contained"
                        color="info"
                        onClick={() => window.open(`${getSocketApiUrl()}/tournois`)}
                        sx={{ ml: 2 }}
                    >
                        Jouer
                    </Button>
                </Box>
                <Typography variant="h3" gutterBottom>
                    Resultats du jeu de plateformes
                </Typography>

                {resultsStore.mapIds.length !== 0 && (
                    <FormControl sx={{ width: 300, my: 2 }}>
                        <InputLabel id="mapId-select-label">Map</InputLabel>
                        <Select
                            labelId="mapId-select-label"
                            id="mapId-select"
                            value={resultsStore.mapIndex}
                            label="Map"
                            onChange={(e) => resultsStore.setMapIndex(+e.target.value)}
                        >
                            {resultsStore.mapIds.map((mapId) => (
                                <MenuItem key={mapId} value={mapId}>
                                    Map numéro {mapId}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
                <Typography variant="h5" gutterBottom>
                    Tableau des scores
                </Typography>
                <div
                    style={{
                        height: 400,
                        width: "100%",
                        backgroundColor: "rgba(255,255,255,0.5)",
                    }}
                >
                    <DataGrid
                        rows={resultsStore.resultsRows.slice()}
                        columns={RESULT_COLUMNS}
                        pageSize={10}
                        rowsPerPageOptions={[10]}
                    />
                </div>
            </Stack>
        </MainLayout>
    );
});

export default TournoisPage;
