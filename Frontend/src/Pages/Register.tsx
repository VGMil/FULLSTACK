import Header from '../components/Header'
import { Link, useNavigate } from 'react-router-dom'
import CustomButton from '../components/CustomButton'
import Card from '../components/Card'
import { Fingerprint } from 'lucide-react'
import { useState } from 'react'

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    if (!username) {
      newErrors.username = 'Nombre requerido';
      valid = false;
    }

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
    } else if (password.length < 6) {
      newErrors.password = 'Mínimo 6 caracteres';
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch('http://localhost:3001/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/Login');
      } else {
        setErrors(prev => ({
          ...prev,
          email: data.message || 'Error en el registro'
        }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({
        ...prev,
        email: 'Error en el servidor'
      }));
    }
  };

  return (
    <div className="flex justify-center items-center">
      <Header>
        <Link to="/register">
          <CustomButton variant="primary" disabled>
            Comienza Ya
          </CustomButton>
        </Link>

        <Link to="/login">
          <CustomButton variant="secondary">
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
              <h2 className="text-2xl font-semibold text-center">Registrate</h2>
            </>
          }
          content={
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Milo Velasquez"
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>
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
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar Contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="••••••••"
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                  )}
                </div>

                <CustomButton type="submit" className="w-full">
                  Registrarse
                </CustomButton>
              </form>
            </>
          }
          footer={
            <div className='flex items-baseline justify-center'>
              <span className="text-gray-600">¿Ya tienes una cuenta?</span>{" "}
              <CustomButton variant='clear'>
                <Link to="/login" className="text-primary hover:underline">Inicia Sesion</Link>
              </CustomButton>
            </div>
          }
        >
        </Card>
      </div>
    </div>
  )
}

export default Register