"use client";

import { AuthDebug } from "@/components/AuthDebug";
import { useAuth } from "@/context/AuthContext";
import { tokenStorage } from "@/utils/tokenStorage";
import { useState } from "react";

export default function AuthTestPage() {
  const { user, loading } = useAuth();
  const [testResult, setTestResult] = useState<string>("");

  const runDiagnostics = async () => {
    let result = "🔍 AUTH DIAGNOSTICS\n\n";

    // Check localStorage
    const rt = tokenStorage.getRefreshToken();
    result += `1. Refresh Token in localStorage:\n`;
    result += rt ? `   ✓ EXISTS (${rt.length} chars)\n` : `   ✗ NOT FOUND\n`;
    result += `\n`;

    // Check access token
    const at = tokenStorage.getAccessToken();
    result += `2. Access Token in memory:\n`;
    result += at ? `   ✓ EXISTS (${at.length} chars)\n` : `   ✗ NOT FOUND (normal after refresh)\n`;
    result += `\n`;

    // Check user state
    result += `3. User State:\n`;
    result += user ? `   ✓ LOGGED IN: ${user.email}\n` : `   ✗ NOT LOGGED IN\n`;
    result += `\n`;

    // Check loading state
    result += `4. Loading State:\n`;
    result += loading ? `   ⏳ LOADING (auth init in progress)\n` : `   ✅ LOADED\n`;
    result += `\n`;

    // Test refresh token API if available
    if (rt) {
      result += `5. Testing Refresh Token API:\n`;
      try {
        const response = await fetch('http://localhost:3005/api/v1/auth/refresh', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: rt })
        });

        const data = await response.json();

        if (response.ok) {
          result += `   ✓ API CALL SUCCESS (${response.status})\n`;
          result += `   Response format: ${data.data.access_token ? 'snake_case' : 'camelCase'}\n`;
          result += `   Has access_token: ${!!data.data.access_token ? '✓' : '✗'}\n`;
          result += `   Has accessToken: ${!!data.data.accessToken ? '✓' : '✗'}\n`;
        } else {
          result += `   ✗ API CALL FAILED (${response.status})\n`;
          result += `   Error: ${JSON.stringify(data, null, 2)}\n`;
        }
      } catch (err: any) {
        result += `   ✗ API CALL ERROR: ${err.message}\n`;
      }
    } else {
      result += `5. Cannot test API - no refresh token\n`;
    }

    result += `\n`;
    result += `═══════════════════════════════════\n`;
    result += `\n`;

    // Diagnosis
    if (!rt && !user) {
      result += `📋 DIAGNOSIS: Not logged in\n`;
      result += `   → Login through /login page\n`;
    } else if (rt && !user && !loading) {
      result += `📋 DIAGNOSIS: Session restore FAILED\n`;
      result += `   → Refresh token exists but user not loaded\n`;
      result += `   → Check Console (F12) for [AUTH] error logs\n`;
      result += `   → Refresh token might be expired\n`;
    } else if (rt && user) {
      result += `📋 DIAGNOSIS: Everything working! ✅\n`;
      result += `   → Refresh token exists\n`;
      result += `   → User is logged in\n`;
      result += `   → Auto-login should work on page refresh\n`;
    } else if (loading) {
      result += `📋 DIAGNOSIS: Auth initialization in progress...\n`;
      result += `   → Wait a moment and run diagnostics again\n`;
    }

    setTestResult(result);
  };

  return (
    <div style={{ padding: '40px', maxWidth: '900px', margin: '0 auto', fontFamily: 'monospace' }}>
      <h1 style={{ marginBottom: '20px' }}>🔐 Auth Test Page</h1>

      <div style={{
        background: '#f5f5f5',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2 style={{ marginTop: 0 }}>Current State:</h2>
        <div style={{ fontSize: '14px' }}>
          <div>Loading: <strong>{loading ? 'Yes ⏳' : 'No ✅'}</strong></div>
          <div>User: <strong>{user ? `${user.email} ✅` : 'Not logged in ✗'}</strong></div>
          <div>Refresh Token: <strong>{tokenStorage.getRefreshToken() ? 'Exists ✓' : 'None ✗'}</strong></div>
          <div>Access Token: <strong>{tokenStorage.getAccessToken() ? 'Exists ✓' : 'None ✗'}</strong></div>
        </div>
      </div>

      <button
        onClick={runDiagnostics}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        Run Full Diagnostics
      </button>

      {testResult && (
        <pre style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '20px',
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '13px',
          lineHeight: '1.6'
        }}>
          {testResult}
        </pre>
      )}

      <div style={{ marginTop: '30px', padding: '20px', background: '#fff9e6', borderRadius: '8px' }}>
        <h3 style={{ marginTop: 0 }}>💡 How to Test:</h3>
        <ol style={{ fontSize: '14px' }}>
          <li>Click "Run Full Diagnostics" to see current state</li>
          <li>Open browser Console (F12) to see [AUTH] logs</li>
          <li>Login through /login page if not logged in</li>
          <li>Come back here and run diagnostics again</li>
          <li>Refresh page (F5) - should stay logged in</li>
          <li>Check Console for auto-login logs</li>
        </ol>
      </div>

      {/* Add debug panel */}
      <AuthDebug />
    </div>
  );
}
