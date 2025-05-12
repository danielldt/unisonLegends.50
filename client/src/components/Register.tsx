import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, RegisterData } from '../services/authService';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authService.register(formData);
      if (response.success) {
        navigate('/login');
      } else {
        setError(response.error?.message || 'Registration failed');
      }
    } catch (err) {
      setError('Could not connect to server');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-primary-dark">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-xl text-gold font-pixel mb-2">UNISON LEGENDS</h1>
          <div className="border-b-4 border-gold mx-auto w-32"></div>
        </div>

        <div className="panel">
          <h2 className="text-center font-pixel text-lg mb-4 text-brown-dark">Create Account</h2>
          
          {error && (
            <div className="bg-ui-hp/20 border-2 border-ui-hp text-ui-dark p-2 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block font-pixel text-xs mb-1">
                USERNAME
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full p-2 pixel-border bg-brown-light/30 focus:bg-brown-light/50 outline-none"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block font-pixel text-xs mb-1">
                EMAIL
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-2 pixel-border bg-brown-light/30 focus:bg-brown-light/50 outline-none"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block font-pixel text-xs mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full p-2 pixel-border bg-brown-light/30 focus:bg-brown-light/50 outline-none"
                required
              />
              <p className="text-xs mt-1 text-brown-dark">Must be at least 8 characters</p>
            </div>
            
            <div className="flex flex-col gap-2 pt-4">
              <button
                type="submit"
                className={`rpg-button ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={isLoading}
              >
                {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-pixel text-gold underline mt-2"
              >
                BACK TO LOGIN
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}; 