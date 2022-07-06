import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';



export const restaurantList = [
    {
      picture:
        'https://lh5.googleusercontent.com/p/AF1QipPnCyRgjMHxFGTunnwHTD0W6E1fRKQ1PuBBUzVw=w600-h321-p-k-no',
      name: 'KingKong',
      description: 'restaurant coréen',
      grade: 4,
      price: 4,
    },
    {
      picture:
        'https://gourmandcroquant.com/wp-content/uploads/2018/04/IT-768x432.png',
      name: 'IT',
      description: 'L italie du Sud près de chez vous',
      grade: 1,
      price: 2,
    },
    {
      picture:
        'https://lh3.googleusercontent.com/p/AF1QipNYn4jjSGx1fAD3h99yGrgBfLFSzcV73-CAAakr=w1080-h608-p-no-v0',
      name: 'Wokantine',
      description: 'Restaurant wok à Paris',
      grade: 2,
      price: 2,
    },
    {
      picture:
        'https://media-cdn.tripadvisor.com/media/photo-w/16/a8/b2/0c/getlstd-property-photo.jpg',
      name: 'Sweeteas',
      description: 'Goûtez d’authentiques plats coréen sans pour autant avoir à effectuer des milliers de kilomètres.',
      grade: 3,
      price: 2,
    },
    {
      picture:
        'https://ac-franchise.com/wp-content/uploads/2020/07/La-franchise-Berliner-Das-Original.jpg',
      name: 'Berliner Das Original – Kebab',
      description: 'Le meilleur de la cuisine kebab',
      grade: 3,
      price: 2,
    },
    {
      picture:
        'https://lh5.googleusercontent.com/p/AF1QipPMNjQUohkFwHxYsrUEt8HxgRzd8FPIfl3kDIJ4=w600-h420-p-k-no',
      name: 'Zuzuttomo - Original Ramen Noodles from 日本',
      description: 'Zuzuttomo, restaurant de ramen japonais traditionnel.',
      grade: 2,
      price: 2,
    },
    {
      picture:
        'https://media-cdn.tripadvisor.com/media/photo-s/11/99/10/23/pratolina-rez-de-chaussee.jpg',
      name: 'Pratolina',
      description: 'La trattoria toscana chic',
      grade: 2,
      price: 1,
    },
    {
      picture:
        'https://scontent.fcdg1-1.fna.fbcdn.net/v/t1.6435-9/78711918_2279908875628572_1471124146824937472_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=8bfeb9&_nc_ohc=AT3XyKXs7GYAX_zfCvs&_nc_oc=AQmBdKgIhFXm89bLi70JCzrC_Mii2R42MQCqB7xeWtG-h0TsCTsr_f-cw8LA9gaHdbo&_nc_ht=scontent.fcdg1-1.fna&oh=00_AT_4pBAkOMLpT_MdNBmFGLNgv6Pgej1NFjO90TUyK8-r7A&oe=62E581B3',
      name: 'Momo House',
      description: 'Restaurant raviolis',
      grade: 2,
      price: 3,
    },
    {
      picture: 'https://10619-2.s.cdn12.com/rests/original/109_507809383.jpg',
      name: 'Rôtisserie Stévenot',
      description: 'Découvrez les rôtisseries Stevenot, rôtisseur et traiteur depuis 1950. Toutes les viandes que nous travaillons sont d exception et made in France !',
      grade: 4,
      price: 3,
    },
    {
      picture:
        'https://media-cdn.tripadvisor.com/media/photo-s/10/12/ac/b7/photo0jpg.jpg',
      name: 'Pic Nic',
      description: 'Asiatique, Coréenne',
      grade: 3,
      price: 4,
    },
    {
      picture:
        'https://res.cloudinary.com/tf-lab/image/upload/w_600,h_337,c_fill,g_auto:subject,q_auto,f_auto/restaurant/9b045a06-23d1-4bcb-aa27-3caa8deea98b/6eeefa38-fba8-424f-a6bb-49f0587583e9.jpg',
      name: 'New New',
      description: 'Une cuisine traditionnelle de Wenzhou',
      grade: 4,
      price: 4,
    },
  ];
type restaurantCardProps = {
  searchTerm: string
}
export default function RestaurantCard({searchTerm}:restaurantCardProps){
  return (
  <div style={{ height:"88vh", overflow:"scroll", overflowX: "hidden"}}>
    {restaurantList.filter((val) => {
      return(val.name.toLowerCase().includes(searchTerm))
    }).map((restaurant) => (
      <Card sx={{ maxWidth: 400 }} style={{ cursor: "pointer" , boxShadow: "1px 5px 5px grey"}}>
        <CardMedia
          component="img"
          height="180"
          image={restaurant.picture}
        />
        <CardContent>
          <Typography gutterBottom variant="h5" component="div">
          {restaurant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
          {restaurant.description}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Note</Button>
          <Button size="small">Avis</Button>
          <Button size="small"> <FavoriteIcon/> </Button>
        </CardActions>
      </Card>
      ))}
    </div>
  )
}
