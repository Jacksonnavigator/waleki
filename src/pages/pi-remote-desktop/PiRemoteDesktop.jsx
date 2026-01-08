import React, { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// Set your Pi's IP here or use an .env variable for production
const PI_VNC_URL = 'http://100.94.99.122:6080/vnc.html'; // <-- UPDATE THIS

const PiRemoteDesktop = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
    // Add admin/role check here if needed
  }, [currentUser, navigate]);

  return (
    <div style={{height: '100vh', width: '100vw', background: '#181c20'}}>
      <iframe
        src={PI_VNC_URL}
        title="Pi Remote Desktop"
        id="pi-vnc-iframe"
        style={{border: 0, width: '100%', height: '100%'}}
        allowFullScreen
      />
    </div>
  );
};

export default PiRemoteDesktop;
