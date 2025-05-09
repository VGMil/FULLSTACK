import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card'
import { useWebSocketContext } from '../contexts/messageContext';
import { Message } from '../Models/message.model';
import { useEffect, useState } from 'react';
import CustomButton from '../components/CustomButton';
import { ArrowLeft, Edit, Fingerprint, Mail, Save, UserRound } from 'lucide-react';
import { useUserContext } from '../contexts/userContext';
import Header from '../components/Header';

function Profile() {
    const navigate = useNavigate();
    const [isEditMode, setIsEditMode] = useState(false);
    const [fingerprints, setFingerprints] = useState<number[]>([]);
    const { messageState, sendWebSocketMessage } = useWebSocketContext();
    
    const { user_id, user_email, user_name } = useUserContext();
  
    const goToScan = () => {
        console.log('Enviando mensaje WebSocket y navegando a /finger-print', { user_id });
        sendWebSocketMessage({
          event: 'scan_request',
          context: 'register',
          origin: 'frontend',
          status: 'info',
          payload: {
            user_id: user_id,
          },
        } as Message);
        // Forzar la navegación
        setTimeout(() => {
          navigate('/finger-print', { replace: false });
        }, 200);
      };

      useEffect(() => {
        const fetchFingerData = async () => {
        if (!user_id) {
          console.log('user_id no definido, omitiendo fetchFingerData');
          return;
        }
          try {
            console.log(`Obteniendo huellas para user_id: ${user_id}`);
            const response = await fetch(`http://localhost:3001/fingers/${user_id}`);
            if (!response.ok) {
              if (response.status === 404) {
                console.log('No se encontraron huellas para el usuario');
                setFingerprints([]);
              } else {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
              }
            } else {
              const data = await response.json();
              console.log('IDs de huellas obtenidos:', data);
              
              setFingerprints(data.fingerIds);
            }
          } catch (error) {
            console.error('Error al obtener huellas:', error);
            setFingerprints([]);
          }
        };
        fetchFingerData();
      }, [user_id, setFingerprints]);
      

    return (
        <div className="flex justify-center items-center h-full w-full">
            <Header>
                    <CustomButton variant='clear' className='flex gap-1' onClick={()=>navigate('/files')}>
                        <ArrowLeft className='text-primary'></ArrowLeft>
                        <p className='text-primary'>Volver</p>
                    </CustomButton>
            </Header>

            <div className="flex flex-grow items-center justify-center py-20 px-4">
                <Card
                    header={
                        <div className="text-2xl flex items-center justify-between gap-3">
                            <h3>Perfil de Usuario: {user_id || 0} </h3>
                            <div className='flex items-center justify-center rounded-sm bg-primary-500'>  
                            {!isEditMode ? (
                                <CustomButton variant="clear" onClick={() => setIsEditMode(true)}>
                                    <Edit className="h-4 w-4 text-white" />
                                </CustomButton>
                            ) : (
                                <CustomButton variant="clear" onClick={() => setIsEditMode(false)}>
                                    <Save className="h-4 w-4 text-white" />
                                </CustomButton>
                            )}
                            </div>
                        </div>
                    }
                    content={
                        <section>
                            <h3 className="text-lg font-semibold mb-4">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor="name" className='text-primary-500 font-bold'>Nombre</label>
                                    <div className="flex items-center gap-2">
                                        <UserRound className="h-4 w-4 text-muted-foreground " />
                                        {isEditMode ? (
                                            <input
                                                id="name"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                                                defaultValue={user_name}
                                            />
                                        ) : (
                                            <p >{user_name}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className='text-primary-500 font-bold'>Correo electrónico</label>
                                    <div className="flex items-center gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                        {isEditMode ? (
                                            <input
                                                id="email"
                                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                                                defaultValue={user_email}
                                            />
                                        ) : (
                                            <p>{user_email}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    }
                    footer={
                        <section className="pt-4 border-t">
                            <h3 className="text-lg font-semibold mb-4">Seguridad Biométrica</h3>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium ">Huellas Dactilares Registradas</h4>
                                        <p className="text-xs text-gray-700 font-semibold mt-0">Actualmente tienes {fingerprints.length} huella{fingerprints.length > 1 ? 's' : ''} registrada{fingerprints.length > 1 ? 's' : ''}</p>
                                    </div>
                                </div>

                                <div>
                                    <div >
                                        <CustomButton className="flex items-center justify-center w-full"
                                            onClick={goToScan}
                                        >
                                            <Fingerprint className="mr-2 h-4 w-4" />
                                            Agregar Nueva Huella Dactilar
                                        </CustomButton>
                                    </div>
                                    <div>
                                        <h4 className='mt-5 font-medium'>Registro de Huella Dactilar</h4>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className="space-y-1 max-h-[100px] overflow-y-auto ">
                                        {Array.from({ length: fingerprints.length  }).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-brand-blue/10 flex items-center justify-center">
                                                        <Fingerprint className="h-5 w-5 text-brand-blue" />
                                                    </div>
                                                    <span>Huella {index + 1}</span>
                                                </div>
                                                {/* <CustomButton variant="cancel" onClick={()=> handleFingerprint(-1)}>Eliminar</CustomButton> */}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    }
                />
            </div>
        </div>
    )
}

export default Profile