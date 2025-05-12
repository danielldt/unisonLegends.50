import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { gameService } from '../services/gameService';

const DebugPage: React.FC = () => {
  const [token, setToken] = useState<string>('');
  const [verificationStatus, setVerificationStatus] = useState<string>('');
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  
  useEffect(() => {
    // Load token from localStorage
    const storedToken = authService.getCurrentToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const handleVerifyToken = async () => {
    setVerificationStatus('Verifying token...');
    try {
      const result = await authService.verifyToken(token);
      setVerificationResult(result);
      setVerificationStatus(result.success ? 'Token valid!' : 'Token invalid!');
    } catch (error) {
      setVerificationStatus('Error verifying token');
      setVerificationResult({ error });
    }
  };

  const handleConnectToRoom = async () => {
    setConnectionStatus('Connecting...');
    try {
      const room = await gameService.connect();
      setConnectionStatus(room ? 'Connected!' : 'Failed to connect');
    } catch (error) {
      setConnectionStatus(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleUpdateToken = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setToken(e.target.value);
  };

  const handleSaveToken = () => {
    localStorage.setItem('token', token);
    alert('Token saved to localStorage');
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Debug Tools</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Token Verification</h2>
        <textarea 
          value={token} 
          onChange={handleUpdateToken}
          className="w-full h-32 p-2 border rounded mb-2 font-mono text-sm"
          placeholder="Paste JWT token here"
        />
        <div className="flex gap-2 mb-4">
          <button 
            onClick={handleVerifyToken}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Verify Token
          </button>
          <button 
            onClick={handleSaveToken}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Save to localStorage
          </button>
        </div>
        <div className="mb-2">
          Status: <span className={verificationStatus.includes('valid') ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {verificationStatus}
          </span>
        </div>
        {verificationResult && (
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-sm">
            {JSON.stringify(verificationResult, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Game Room Connection</h2>
        <button 
          onClick={handleConnectToRoom}
          className="px-4 py-2 bg-blue-600 text-white rounded mb-2"
        >
          Connect to Game Room
        </button>
        <div>
          Status: <span className={connectionStatus === 'Connected!' ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {connectionStatus}
          </span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Current Player</h2>
        <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 text-sm">
          {JSON.stringify(authService.getCurrentPlayer(), null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default DebugPage; 