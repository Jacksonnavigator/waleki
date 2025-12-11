import React, { useEffect } from 'react';

// Only allow access if user is admin (for now, all logged-in users are admins)
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RemoteDesktop = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    // Add more admin checks here if you add roles in the future
  }, [currentUser, navigate]);

  return (
    <div style={{height: '100vh', width: '100vw', background: '#181c20'}}>
      <iframe
        src={process.env.PUBLIC_URL + '/pages/remote-desktop/index.html'}
        title="Raspberry Pi Remote Desktop"
        style={{border: 0, width: '100%', height: '100%'}}
        allowFullScreen
      />
    </div>
  );
};

export default RemoteDesktop;
