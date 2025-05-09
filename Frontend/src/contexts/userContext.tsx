import { createContext, useContext, ReactNode, useState } from 'react';

type UserContextType = {
  user_name: string;
  user_id: string;
  user_email: string;
  setUserName: (name: string) => void;
  setUserId: (id: string) => void;
  setUserEmail: (email: string) => void;
  clearUser: () => void;
};

const UserContext = createContext<UserContextType>({
  user_name: '',
  user_id: '',
  user_email: '',
  setUserName: () => {},
  setUserId: () => {},
  setUserEmail: () => {},
  clearUser:()=>{}
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user_name, setUserName] = useState('');
  const [user_id, setUserId] = useState('');
  const [user_email, setUserEmail] = useState('');
  const clearUser = () =>{
    setUserName('');
    setUserId('');
    setUserEmail('');
  }
  return (
    <UserContext.Provider
      value={{
        user_name,
        user_id,
        user_email,
        setUserName,
        setUserId,
        setUserEmail,
        clearUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);