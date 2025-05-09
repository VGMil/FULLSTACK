import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomButton'
import Header from '../components/Header'
import Card from '../components/Card'
import { Fingerprint } from 'lucide-react'
import { useWebSocketContext } from '../contexts/messageContext'
import { Message } from '../Models/message.model'

function Login() {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const {messageState, sendWebSocketMessage} =useWebSocketContext();
  console.log('Mensaje ',messageState);

  const goToScan = () => {
    
    sendWebSocketMessage({
      event:'scan_request',
      context:'auth',
      origin:'frontend',
      status:'info',
      payload:{}
    }as Message);

    navigate('/finger-print');
  }

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: '', password: '' };

    if (!email) {
      newErrors.email = 'Email requerido';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!password) {
      newErrors.password = 'Contraseña requerida';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;
    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        navigate('/files');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Header>
        <Link to="/register">
            <CustomButton variant="primary">
              Comienza Ya
            </CustomButton>
          </Link>

          <Link to="/login">
            <CustomButton variant="secondary" disabled>
              Iniciar Sesión
            </CustomButton>
          </Link>
        </Header>

        <div className="flex flex-grow items-center justify-center py-20 px-4">
        <Card 
          header={
            <>
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
                  <Fingerprint className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-center">Iniciar sesión</h2>
            </>
          }
          content={
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <CustomButton type="submit" className="w-full">
                  Iniciar sesión
                </CustomButton>
              </form>
              <div className="relative my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">O continúa con</span>
                </div>
              </div>
            </>
          }
          footer={
            <div className='flex flex-col'>

              <CustomButton variant='secondary' onClick={goToScan}>
                <div className="flex justify-center items-center w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path d="M15.545 6.558c.21.005.338.018.51.051.383.086.66.324.78.646.117.32.042.641-.154.916-.198.28-.493.434-.83.434H14.3c-.383 0-.76-.08-1.11-.23a2.83 2.83 0 0 1-.96-.68c-.234-.28-.407-.59-.519-.932-.112-.342-.173-.705-.173-1.087 0-.367.06-.72.173-1.057.112-.336.285-.645.52-.925.232-.28.54-.506.927-.682.386-.176.807-.266 1.26-.27h.046h.066c.354.004.706.073 1.054.207.343.133.655.33.93.59l-1.058.755c-.135-.131-.297-.235-.485-.31a1.7 1.7 0 0 0-.618-.117H14.3c-.246 0-.478.047-.695.14a1.59 1.59 0 0 0-.554.4c-.154.17-.275.37-.357.596-.082.226-.123.476-.123.748 0 .256.041.493.123.718.082.226.203.425.357.595.154.17.34.307.554.415.217.095.45.145.695.145h.066-.003zm-3.065 1.196h.073c.32-.004.615.1.853.304.244.207.368.478.368.812 0 .337-.117.607-.35.815-.23.206-.52.31-.852.31H9.52l-1.467 1.59v-1.59H5.31c-.332 0-.619-.1-.858-.305-.236-.203-.355-.476-.355-.813 0-.338.12-.607.358-.813.239-.203.528-.303.863-.303h1.82V5.383h7.342z" fill="currentColor" />
                  </svg>
                Huella Dactilar
                </div>
              </CustomButton>

              <div className="flex items-baseline justify-center">
                <span className="text-gray-600">¿No tienes una cuenta?</span>{" "}
                <CustomButton variant='clear'>
                  <Link to="/register" className="text-primary hover:underline">Registrarse</Link>
                </CustomButton>
              </div>
            </div>
          }
        >
        </Card>
      </div>
    </div>

    
  )
}

export default Login