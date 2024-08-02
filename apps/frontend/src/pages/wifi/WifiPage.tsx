import { Lightbulb } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { GaladrimLogo } from "../../reusableComponents/Branding/GaladrimLogo";
import { CustomLink } from "../../reusableComponents/Core/CustomLink";
import { GaladrimRoomsCard } from "../../reusableComponents/Core/GaladrimRoomsCard";
import { BasicSelect } from "../../reusableComponents/form/BasicSelect";
import { TextInputWithIcon } from "../../reusableComponents/form/TextInputWithIcon";
import MainLayout from "../../reusableComponents/layouts/MainLayout";
import { WifiStore } from "./WifiStore";

export const WifiPage = observer(() => {
    const wifiStore = useMemo(() => new WifiStore(), []);

    return (
        <MainLayout fullscreen>
            <div style={{ display: "flex", justifyContent: "center" }}>
                <GaladrimRoomsCard size="large" sx={{ width: "100%", maxWidth: 600 }}>
                    <GaladrimLogo align="center" sx={{ mb: 8 }} />
                    <Typography sx={{ fontSize: 26, textAlign: "center", m: 2 }}>
                        Reporter un problème d'internet
                    </Typography>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            wifiStore.publish();
                        }}
                    >
                        <BasicSelect
                            options={wifiStore.networkNameOptions}
                            value={wifiStore.networkName ?? ""}
                            onChange={(v) => wifiStore.setNetworkName(v.toString())}
                            label="Nom du réseau"
                        />
                        <BasicSelect
                            options={wifiStore.roomOptions}
                            value={wifiStore.room ?? ""}
                            onChange={(v) => wifiStore.setRoom(v.toString())}
                            sx={{ mt: 2 }}
                            label="Nom de la salle"
                        />
                        <TextInputWithIcon
                            value={wifiStore.details.text}
                            placeholder={"Un détail à rajouter ?"}
                            Icon={Lightbulb}
                            onChange={(newText) => wifiStore.details.setText(newText)}
                            multiline
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!wifiStore.canPublish}
                            type="submit"
                            size="large"
                            sx={{ my: 2 }}
                        >
                            Envoyer
                        </Button>
                        <CustomLink to="/">Retour</CustomLink>
                    </form>
                </GaladrimRoomsCard>
            </div>
        </MainLayout>
    );
});

export default WifiPage;
