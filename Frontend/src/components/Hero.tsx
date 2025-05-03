
import CustomButton from './CustomButton'
import { Fingerprint } from "lucide-react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <div className="relative bg-gradient-to-b from-brand-light to-white pt-24 pb-16 px-4 sm:px-6 lg:px-8 min-h-[80vh] flex items-center">
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
            
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6">
            Gestión de archivos con autenticación biométrica
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Accede a tus documentos de forma segura con autenticación por huella dactilar. 
            Gestiona permisos, comparte archivos y mantén el control total sobre quién accede a tu información.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link to="/register">
            <CustomButton variant='primary'>
              Comenzar ahora
            </CustomButton>
            </Link>
              <Link to="/login">
            <CustomButton variant='secondary'>
              Iniciar sesión
            </CustomButton>
            </Link>
          </div>

        </div>
        <div className="relative flex justify-center">
          <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200 max-w-md w-full">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                    <Fingerprint className="h-12 w-12 text-blue-400" />
                    <div className="absolute inset-0 rounded-full border-2 border-primary-400 animate-ping "></div>
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold text-center mb-2">Autenticación Biométrica</h3>
            <p className="text-gray-500 text-center mb-6">
              Accede a tu cuenta de forma instantánea y segura utilizando tu huella dactilar.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="h-10 w-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Mayor seguridad</div>
                  <div className="text-sm text-gray-500">Evita el riesgo de contraseñas comprometidas</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                <div className="h-10 w-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium">Acceso instantáneo</div>
                  <div className="text-sm text-gray-500">Sin recordar contraseñas complejas</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default Hero