import { Lightbulb } from "@mui/icons-material";
import { Box, Button, Checkbox, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";
import { useMemo } from "react";
import { TextInputWithIcon } from "../../reusableComponents/form/TextInputWithIcon";
import { type CreateIdeaCallback, CreateIdeaStore } from "./createIdea/CreateIdeaStore";

const CreateIdeaModal = observer<{ onPublish: CreateIdeaCallback }>(({ onPublish }) => {
    const ideaStore = useMemo(() => new CreateIdeaStore(), []);

    const handleSubmit = () => {
        ideaStore.createIdea(onPublish);
    };

    return (
        <div>
            <TextInputWithIcon
                value={ideaStore.text.text}
                placeholder={"Quelle est ton idée ?"}
                Icon={Lightbulb}
                onChange={(idea) => ideaStore.text.setText(idea)}
                multiline
            />
            <Box sx={{ display: "flex", alignItems: "center", marginTop: 2 }}>
                <Checkbox
                    checked={ideaStore.isAnonymous.checked}
                    value={ideaStore.isAnonymous}
                    onChange={(event) => ideaStore.isAnonymous.setChecked(event.target.checked)}
                    sx={{ padding: 0 }}
                />
                <Typography sx={{ marginLeft: 1 }}>Publier en anonyme</Typography>
            </Box>
            <Button
                fullWidth
                variant="contained"
                disabled={!ideaStore.canCreateIdea}
                size="large"
                sx={{ my: 2 }}
                onClick={handleSubmit}
            >
                Publier mon idée
            </Button>
        </div>
    );
});

export default CreateIdeaModal;
