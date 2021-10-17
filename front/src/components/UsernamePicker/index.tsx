import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core"
import { observer } from "mobx-react-lite"
import { AppStore } from "../../stores/AppStore"


export const UsernamePicker = observer(() => {

    return (

        <FormControl fullWidth>
            <InputLabel id="username-select-label">Qui es-tu ?</InputLabel>
            <Select
                style={{ minWidth: 100 }}
                labelId="username-select-label"
                id="username-select"
                value={AppStore.username}
                onChange={(event) => AppStore.setUsername(event.target.value as string)}
            >
                {AppStore.galadrimeurs.map(
                    (galadrimeur) => (<MenuItem key={galadrimeur} value={galadrimeur}>{galadrimeur}</MenuItem>)
                )}
            </Select>
        </FormControl>
    )
})
