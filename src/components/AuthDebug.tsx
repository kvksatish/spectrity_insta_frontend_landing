"use client";

/**
 * Auth Debug Component
 * Shows real-time auth state and localStorage
 * Add this to your dashboard or layout to see what's happening
 */

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { tokenStorage } from "@/utils/tokenStorage";

export function AuthDebug() {
  const { user, loading } = useAuth();
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    // Check tokens
    const rt = tokenStorage.getRefreshToken();
    const at = tokenStorage.getAccessToken();
    setRefreshToken(rt);
    setAccessToken(at);

    // Intercept console logs
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args) => {
      const message = args.join(' ');
      if (message.includes('[AUTH]')) {
        setLogs(prev => [...prev, `LOG: ${message}`].slice(-20));
      }
      originalLog(...args);
    };

    console.error = (...args) => {
      const message = args.join(' ');
      if (message.includes('[AUTH]') || message.includes('Auth')) {
        setLogs(prev => [`ERROR: ${message}`, ...prev].slice(0, 20));
      }
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, [user, loading]);

  const testRefresh = async () => {
    setLogs(prev => ['Testing refresh token...', ...prev]);

    const rt = tokenStorage.getRefreshToken();
    if (!rt) {
      setLogs(prev => ['ERROR: No refresh token found!', ...prev]);
      return;
    }

    try {
      const response = await fetch('http://localhost:3005/api/v1/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: rt })
      });

      const data = await response.json();

      if (response.ok) {
        setLogs(prev => [
          `✓ Refresh SUCCESS`,
          `Response format: ${data.data.access_token ? 'snake_case' : 'camelCase'}`,
          `Has access_token: ${!!data.data.access_token}`,
          `Has accessToken: ${!!data.data.accessToken}`,
          ...prev
        ]);
      } else {
        setLogs(prev => [
          `✗ Refresh FAILED: ${response.status}`,
          `Error: ${JSON.stringify(data)}`,
          ...prev
        ]);
      }
    } catch (err: any) {
      setLogs(prev => [`ERROR: ${err.message}`, ...prev]);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      right: 0,
      width: '500px',
      maxHeight: '600px',
      background: '#1e1e1e',
      color: '#d4d4d4',
      border: '2px solid #0e639c',
      borderRadius: '8px 0 0 0',
      padding: '15px',
      fontFamily: 'monospace',
      fontSize: '12px',
      overflow: 'auto',
      zIndex: 9999
    }}>
      <div style={{ marginBottom: '10px', borderBottom: '1px solid #3e3e42', paddingBottom: '10px' }}>
        <strong style={{ color: '#4ec9b0' }}>🔍 Auth Debug Panel</strong>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <div style={{ color: '#dcdcaa' }}>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
        <div style={{ color: user ? '#4ec9b0' : '#f48771' }}>
          User: {user ? `✓ ${user.email}` : '✗ Not logged in'}
        </div>
        <div style={{ marginTop: '10px', fontSize: '11px', opacity: 0.7 }}>
          Refresh Token: {refreshToken ? `✓ ${refreshToken.substring(0, 30)}...` : '✗ None'}
        </div>
        <div style={{ fontSize: '11px', opacity: 0.7 }}>
          Access Token: {accessToken ? `✓ ${accessToken.substring(0, 30)}...` : '✗ None'}
        </div>
      </div>

      <button
        onClick={testRefresh}
        style={{
          padding: '8px 15px',
          background: '#0e639c',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '10px',
          width: '100%'
        }}
      >
        Test Refresh Token API
      </button>

      <div style={{
        marginTop: '10px',
        borderTop: '1px solid #3e3e42',
        paddingTop: '10px',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <div style={{ color: '#dcdcaa', marginBottom: '5px' }}>Recent [AUTH] Logs:</div>
        {logs.length === 0 ? (
          <div style={{ opacity: 0.5 }}>No logs yet...</div>
        ) : (
          logs.map((log, i) => (
            <div
              key={i}
              style={{
                padding: '4px 8px',
                margin: '2px 0',
                background: log.includes('ERROR') ? '#3d1f1f' : log.includes('✓') ? '#1f3d1f' : '#252526',
                borderRadius: '3px',
                color: log.includes('ERROR') ? '#f48771' : log.includes('✓') ? '#4ec9b0' : '#d4d4d4',
                fontSize: '11px'
              }}
            >
              {log}
            </div>
          ))
        )}
      </div>

      <div style={{
        marginTop: '10px',
        fontSize: '10px',
        opacity: 0.5,
        textAlign: 'center'
      }}>
        Check browser Console (F12) for full logs
      </div>
    </div>
  );
}
