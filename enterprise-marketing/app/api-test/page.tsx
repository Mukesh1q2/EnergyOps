'use client';

import { useState, useEffect } from 'react';

export default function ApiTestPage() {
  const [status, setStatus] = useState<string>('Testing...');
  const [apiResponse, setApiResponse] = useState<any>(null);

  useEffect(() => {
    // Test backend connection
    const testBackendConnection = async () => {
      try {
        setStatus('Testing backend connection...');
        
        // Test health endpoint directly
        const response = await fetch('http://localhost:8000/auth/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setStatus('✅ Backend connection successful!');
          setApiResponse(data);
        } else {
          setStatus(`❌ Backend returned error: ${response.status}`);
          setApiResponse({ error: `HTTP ${response.status}` });
        }
      } catch (error) {
        setStatus(`❌ Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setApiResponse({ error: error instanceof Error ? error.message : 'Unknown error' });
      }
    };

    testBackendConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Backend API Test</h1>
        
        <div className="bg-gray-800 p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          <p className={`text-lg ${status.includes('✅') ? 'text-green-400' : status.includes('❌') ? 'text-red-400' : 'text-yellow-400'}`}>
            {status}
          </p>
        </div>

        {apiResponse && (
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">API Response</h2>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Test Endpoints</h2>
          <ul className="space-y-2">
            <li>
              <a href="http://localhost:8000/api/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                📚 API Documentation (Swagger UI)
              </a>
            </li>
            <li>
              <a href="http://localhost:8000/api/redoc" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300">
                📖 API Documentation (ReDoc)
              </a>
            </li>
            <li>
              <a href="http://localhost:3000" className="text-green-400 hover:text-green-300">
                🏠 Frontend Homepage
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}