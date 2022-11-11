import { AlternateEmail, Key, Person } from '@mui/icons-material'
import BackIcon from '@mui/icons-material/ChevronLeft'
import { Avatar, Button, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { useMemo } from 'react'
import { AppStore } from '../../globalStores/AppStore'
import { GaladrimLogo } from '../../reusableComponents/Branding/GaladrimLogo'
import { CenteredDiv } from '../../reusableComponents/common/CenteredDiv'
import { CustomLink } from '../../reusableComponents/Core/CustomLink'
import { GaladrimRoomsCard } from '../../reusableComponents/Core/GaladrimRoomsCard'
import { TextFieldStore } from '../../reusableComponents/form/TextFieldStore'
import { TextInputWithIcon } from '../../reusableComponents/form/TextInputWithIcon'
import MainLayout from '../../reusableComponents/layouts/MainLayout'

export const ProfilePage = observer(() => {
    const { authStore } = AppStore
    const userNameStore = useMemo(
        () => new TextFieldStore(authStore.user.username),
        [authStore.user.username]
    )
    const emailStore = useMemo(
        () => new TextFieldStore(authStore.user.email),
        [authStore.user.email]
    )

    return (
        <MainLayout fullscreen={false}>
            <CenteredDiv>
                <GaladrimRoomsCard size="large" sx={{ width: '100%', maxWidth: 600, mt: 4 }}>
                    <GaladrimLogo align="center" sx={{ mb: 2 }} />
                    <Typography sx={{ fontSize: 26, textAlign: 'center', m: 2 }}>
                        Modifier vos informations
                    </Typography>
                    <form
                        style={{ marginBottom: 20 }}
                        onSubmit={(e) => {
                            e.preventDefault()
                            authStore.updateProfile(userNameStore.text, emailStore.text)
                        }}
                    >
                        <CenteredDiv style={{ flexDirection: 'column' }}>
                            <TextInputWithIcon
                                value={userNameStore.text}
                                placeholder="Nom d'utilisateur"
                                onChange={(value) => userNameStore.setText(value)}
                                Icon={Person}
                            />
                            <TextInputWithIcon
                                value={emailStore.text}
                                placeholder="Adresse email"
                                onChange={(value) => emailStore.setText(value)}
                                Icon={AlternateEmail}
                            />
                        </CenteredDiv>

                        <div className="flex justify-center" style={{ marginTop: '24px' }}>
                            <Avatar
                                alt={authStore.user.username}
                                src={authStore.imageSrc ?? authStore.user.imageUrl}
                                sx={{ width: 256, height: 256, mb: 1 }}
                            />
                        </div>
                        <CenteredDiv>
                            <Button variant="contained" component="label" sx={{ my: 2 }}>
                                Changer l'image de profil
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    id="image"
                                    multiple
                                    onChange={(e) => authStore.setUploadedImage(e.target)}
                                />
                            </Button>
                            {authStore.image !== null && (
                                <span style={{ marginLeft: '12px' }}>({authStore.image.name})</span>
                            )}
                        </CenteredDiv>
                        <br />

                        <Button
                            fullWidth
                            variant="contained"
                            type="submit"
                            size="large"
                            sx={{ my: 2 }}
                        >
                            Mettre à jour le profil
                        </Button>
                    </form>

                    <CustomLink
                        to="/changePassword"
                        style={{ marginBottom: '20px', marginTop: '40px' }}
                    >
                        <Key /> Changer votre mot de passe
                    </CustomLink>

                    <CustomLink to="/">
                        <BackIcon /> Retour à l'accueil
                    </CustomLink>
                </GaladrimRoomsCard>
            </CenteredDiv>
        </MainLayout>
    )
})

export default ProfilePage
