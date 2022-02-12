import { Autocomplete, Button, TextField } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppStore } from '../../stores/AppStore'

export const Login = observer(() => {
    const { authStore } = AppStore
    let navigate = useNavigate()
    useEffect(() => {
        if (authStore.connected) navigate('/')
    }, [])

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault()
                authStore.login()
            }}
        >
            <div>
                <Autocomplete
                    freeSolo
                    inputValue={authStore.username}
                    onInputChange={(_event, newValue) => {
                        authStore.setUsername(newValue || '')
                    }}
                    options={AppStore.galadrimeurs}
                    renderInput={(params) => <TextField {...params} label="Qui es-tu ?" />}
                />
                <br />
                <TextField
                    type="password"
                    label="Mot de passe Forest"
                    value={authStore.password}
                    onChange={(e) => authStore.setPassword(e.target.value)}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        margin: '10px',
                    }}
                >
                    <Button variant="contained" type="submit">
                        Se connecter
                    </Button>
                </div>
                <br />
                <p
                    style={{
                        visibility: authStore.errors === '' ? 'hidden' : 'visible',
                        color: 'red',
                        textAlign: 'center',
                    }}
                >
                    {authStore.errors || 'invisible but ok'}
                </p>
            </div>
        </form>
    )
})
