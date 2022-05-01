import MailIcon from '@mui/icons-material/AlternateEmail';
import BackIcon from '@mui/icons-material/ChevronLeft';
import { Button, InputAdornment, OutlinedInput } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { AppStore } from '../../stores/AppStore';
import { GaladrimLogo } from '../Branding/GaladrimLogo';
import { Card } from '../Core/Card';
import { CustomLink } from '../Core/CustomLink';

export const GetOtp = observer(() => {
  const { authStore } = AppStore;

  return (
    <Card size="large" sx={{ width: '100%', maxWidth: 600 }}>
      <GaladrimLogo align="center" sx={{ mb: 8 }} />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          authStore.getOtp();
        }}
      >
        <OutlinedInput
          value={authStore.email}
          onChange={(e) => {
            authStore.setEmail(e.target.value);
          }}
          fullWidth
          placeholder="Adresse e-mail"
          startAdornment={
            <InputAdornment position="start" sx={{ ml: 0.5, mr: 1 }}>
              <MailIcon />
            </InputAdornment>
          }
        />
        <Button
          fullWidth
          variant="contained"
          type="submit"
          size="large"
          sx={{ my: 2 }}
        >
          Réinitialiser mon mot de passe
        </Button>
        <CustomLink to="/login">
          <BackIcon /> Revenir à la page de connexion
        </CustomLink>
      </form>
    </Card>
  );
});
