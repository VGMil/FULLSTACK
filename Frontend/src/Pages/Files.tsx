import { Link } from "react-router-dom"
import Header from "../components/Header"
import CustomButton from "../components/CustomButton"
import { Settings } from "lucide-react"


import { useEffect } from 'react';
import { useUserContext } from '../contexts/userContext';

function Files() {
  const { user_id,user_email,user_name, setUserEmail, setUserName } = useUserContext();
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (user_email && user_name) return; // Evita fetch si ya hay datos
      try {
        const response = await fetch(`http://localhost:3001/users/${user_id}`);
        const data = await response.json();
        setUserEmail(data.user.email);
        setUserName(data.user.full_name);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (user_id) fetchUserData();
  }, [user_id, user_email, user_name]);

  return (
    <div className="flex justify-center items-center h-screen">
    <Header>
      <Link to="/profile">
      <CustomButton variant="clear" className="flex gap-1">
        <Settings className=" text-black"></Settings>
        <p>Perfil</p>
      </CustomButton>
      </Link>
    </Header>
    <div>{`${user_id} Files of ${user_email}`}</div>
    </div>
  )
}

export default Files