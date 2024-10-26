import { Autocomplete, Avatar, Box, TextField, Typography } from "@mui/material";
import { observer } from "mobx-react-lite";

const DEFAULT_AVATAR_URL =
    "https://res.cloudinary.com/forest2/image/fetch/f_auto,w_150,h_150/https://forest.galadrim.fr/img/users/0.jpg";

interface UserOption {
    label: string;
    value: number;
    imageUrl: string | null;
}

interface Props {
    usersOptions: UserOption[];
    selectedUserOption: UserOption | null;
    setSelectedUserFromId: (id: number | null) => void;
}

export const UserSelect = observer(
    ({ selectedUserOption, usersOptions, setSelectedUserFromId }: Props) => {
        return (
            <Autocomplete
                disablePortal
                sx={{ width: 250 }}
                options={usersOptions}
                renderOption={(props, option) => (
                    <Box
                        component="li"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                        }}
                        {...props}
                        key={option.value}
                    >
                        <Avatar
                            alt={option.label}
                            src={option.imageUrl ?? DEFAULT_AVATAR_URL}
                            sx={{ width: 30, height: 30 }}
                        />
                        <Typography>{option.label}</Typography>
                    </Box>
                )}
                renderInput={(params) => (
                    <TextField {...params} label="Rechercher un utilisateur" size="small" />
                )}
                value={selectedUserOption}
                onChange={(_e, value) => {
                    setSelectedUserFromId(value?.value ?? null);
                }}
            />
        );
    },
);
