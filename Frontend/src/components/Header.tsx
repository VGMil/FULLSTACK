import { Link } from "react-router-dom";
import CustomButton from "./CustomButton";
import { Fingerprint } from "lucide-react";

interface HeaderProps {
 variant?: 'Login' | 'Register'| 'Default'; 
}
const Header = ({variant = "Default"}: HeaderProps) => {
  return (
    <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/">
          <CustomButton variant="clear">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 rounded-md p-1">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl text-black">SecureFiles</span>
            </div>
          </CustomButton>
        </Link>

        <div className="flex gap-3">
          <Link to="/register">
            <CustomButton variant="primary" disabled = {variant=='Register'} >
              Comienza Ya
            </CustomButton>
          </Link>

          <Link to="/login">
            <CustomButton variant="secondary" disabled = {variant=='Login'}>
              Iniciar Sesión
            </CustomButton>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;