
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Hero from '../components/Hero'
import CustomButton from '../components/CustomButton'
import { useUserContext } from '../contexts/userContext'

function Home() {
  const {clearUser} = useUserContext();
  clearUser();
  return (
    <>
        <Header>
        <Link to="/register">
            <CustomButton variant="primary">
              Comienza Ya
            </CustomButton>
          </Link>

          <Link to="/login">
            <CustomButton variant="secondary">
              Iniciar Sesión
            </CustomButton>
          </Link>
        </Header>
        <Hero></Hero>
    </>
  )
}

export default Home