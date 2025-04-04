import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';
import '../../styles/auth.css';

export default function AuthForm() {
  const [isRegistering, setIsRegistering] = useState(false);

  const toggleForm = () => {
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="auth-container">
      {isRegistering ? (
        <Register onToggleForm={toggleForm} />
      ) : (
        <Login onToggleForm={toggleForm} />
      )}
    </div>
  );
} 