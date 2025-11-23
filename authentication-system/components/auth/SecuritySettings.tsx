"""
Security Settings Component
Enterprise security management interface
"""

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  Shield, 
  Lock, 
  Smartphone, 
  Mail, 
  Eye, 
  EyeOff, 
  Trash2,
  Check,
  AlertTriangle,
  Clock,
  Monitor,
  User,
  Globe,
  Settings,
  Key,
  AlertCircle,
  CheckCircle2,
  Copy,
  Download
} from 'lucide-react';
import type { SessionInfo } from './AuthContext';

interface SecuritySettingsProps {
  onBack?: () => void;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onBack }) => {
  const { user, logout, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // MFA State
  const [mfaEnabled, setMfaEnabled] = useState(user?.mfa_enabled || false);
  const [mfaMethod, setMfaMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes] = useState<string[]>([
    '12345678', '87654321', '11223344', '44332211',
    '55667788', '88776655', '99887766', '66778899'
  ]);

  // Sessions State
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<string[]>([]);

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPasswords, setShowPasswords] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditFilter, setAuditFilter] = useState('all');

  useEffect(() => {
    // Load security data
    loadSessions();
    loadAuditLogs();
  }, []);

  const loadSessions = async () => {
    // Mock data - in real app, fetch from API
    const mockSessions: SessionInfo[] = [
      {
        id: '1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ip_address: '192.168.1.100',
        device_type: 'desktop',
        browser: 'Chrome',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        last_activity_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
        status: 'active'
      },
      {
        id: '2',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)',
        ip_address: '192.168.1.101',
        device_type: 'mobile',
        browser: 'Safari',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        last_activity_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        status: 'active'
      }
    ];
    setSessions(mockSessions);
  };

  const loadAuditLogs = async () => {
    // Mock audit logs
    const mockLogs = [
      {
        id: '1',
        action: 'login',
        status: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        action: 'password_change',
        status: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        action: 'mfa_setup',
        status: 'success',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome',
        created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      }
    ];
    setAuditLogs(mockLogs);
  };

  const handleRevokeSessions = async () => {
    // Revoke selected sessions
    setSessions(prev => prev.filter(session => !selectedSessions.includes(session.id)));
    setSelectedSessions([]);
  };

  const validatePassword = (password: string) => {
    const feedback = [];
    let score = 0;

    if (password.length >= 12) score += 25;
    else feedback.push('At least 12 characters');

    if (/[a-z]/.test(password)) score += 15;
    else feedback.push('One lowercase letter');

    if (/[A-Z]/.test(password)) score += 15;
    else feedback.push('One uppercase letter');

    if (/[0-9]/.test(password)) score += 15;
    else feedback.push('One number');

    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    else feedback.push('One symbol');

    if (password.length >= 16 && score >= 85) score = 100;

    setPasswordStrength(score);
    return feedback.length === 0 && score >= 75;
  };

  const handlePasswordChange = async () => {
    if (!validatePassword(newPassword) || newPassword !== confirmPassword) {
      return;
    }

    try {
      // API call to change password
      console.log('Changing password...');
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(0);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Security Score
          </CardTitle>
          <CardDescription>
            Overall security assessment of your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">85%</div>
              <div className="text-sm text-gray-600">Good</div>
            </div>
            <div className="flex-1 ml-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Multi-Factor Authentication</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Strong Password</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Recent Login</span>
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Session Management</span>
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="font-medium">Multi-Factor Authentication</h3>
                  <p className="text-sm text-gray-600">
                    {mfaEnabled ? 'MFA is enabled for your account' : 'Enable MFA for additional security'}
                  </p>
                </div>
              </div>
              <Badge variant={mfaEnabled ? "default" : "secondary"}>
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Monitor className="h-6 w-6 text-green-600" />
                <div>
                  <h3 className="font-medium">Active Sessions</h3>
                  <p className="text-sm text-gray-600">
                    {sessions.filter(s => s.status === 'active').length} active sessions
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActiveTab('sessions')}>
                Manage
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Lock className="h-6 w-6 text-purple-600" />
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-gray-600">
                    Last changed 30 days ago
                  </p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setActiveTab('password')}>
                Change
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderMFASettings = () => (
    <div className="space-y-6">
      {mfaEnabled ? (
        <div className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>
              Multi-factor authentication is enabled on your account. Your account is more secure.
            </AlertDescription>
          </Alert>

          {/* Current MFA Setup */}
          <Card>
            <CardHeader>
              <CardTitle>Current MFA Setup</CardTitle>
              <CardDescription>
                Manage your multi-factor authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Authenticator App</h4>
                    <p className="text-sm text-gray-600">Google Authenticator • iPhone 15</p>
                  </div>
                </div>
                <Badge variant="default">Primary</Badge>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  Add New Device
                </Button>
                <Button variant="outline">
                  Backup Codes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Backup Codes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="mr-2 h-5 w-5" />
                Backup Codes
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setShowBackupCodes(!showBackupCodes)}
                >
                  {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </CardTitle>
              <CardDescription>
                Use backup codes to access your account if you lose your MFA device
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showBackupCodes ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                          {code}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                    <Button size="sm" variant="outline">
                      Copy All Codes
                    </Button>
                    <Button size="sm" variant="destructive">
                      Generate New Codes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <Button variant="outline" onClick={() => setShowBackupCodes(true)}>
                    Show Backup Codes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Disable MFA */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-900">Disable MFA</CardTitle>
              <CardDescription className="text-red-700">
                Only disable MFA if you have a valid reason. Your account will be less secure.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive">
                Disable Multi-Factor Authentication
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">MFA Not Enabled</h3>
            <p className="text-gray-600">
              Enable multi-factor authentication to secure your account
            </p>
          </div>
          <Button>
            Setup Multi-Factor Authentication
          </Button>
        </div>
      )}
    </div>
  );

  const renderSessions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Active Sessions</h3>
          <p className="text-sm text-gray-600">
            Manage your active login sessions across devices
          </p>
        </div>
        <Button variant="outline" onClick={loadSessions}>
          Refresh
        </Button>
      </div>

      {/* Session List */}
      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    {session.device_type === 'mobile' ? (
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Monitor className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {session.device_type === 'mobile' ? 'Mobile Device' : 'Desktop Browser'}
                      {session.id === '1' && ' (Current)'}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {session.browser} • {session.ip_address}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>
                        Last active {new Date(session.last_activity_at).toLocaleDateString()} at{' '}
                        {new Date(session.last_activity_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                    {session.status}
                  </Badge>
                  {session.id !== '1' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSessions(prev => prev.filter(s => s.id !== session.id));
                      }}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revoke All Sessions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-900">Revoke All Sessions</CardTitle>
          <CardDescription className="text-red-700">
            This will sign you out of all devices except the current one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive">
            Revoke All Other Sessions
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderPasswordSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Change Password</h3>
        <p className="text-sm text-gray-600">
          Update your password to keep your account secure
        </p>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  validatePassword(e.target.value);
                }}
                placeholder="Enter your new password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            
            {newPassword && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Password strength:</span>
                  <span className={
                    passwordStrength >= 75 ? 'text-green-600' :
                    passwordStrength >= 50 ? 'text-yellow-600' : 'text-red-600'
                  }>
                    {passwordStrength >= 75 ? 'Strong' :
                     passwordStrength >= 50 ? 'Medium' : 'Weak'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${
                      passwordStrength >= 75 ? 'bg-green-500' :
                      passwordStrength >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600">Passwords do not match</p>
            )}
          </div>

          <Button 
            onClick={handlePasswordChange}
            disabled={
              !currentPassword || 
              !newPassword || 
              !confirmPassword || 
              newPassword !== confirmPassword ||
              passwordStrength < 75
            }
          >
            Update Password
          </Button>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle>Password Requirements</CardTitle>
          <CardDescription>
            Your password must meet the following requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              At least 12 characters long
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              Contains uppercase and lowercase letters
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              Contains at least one number
            </li>
            <li className="flex items-center">
              <Check className="h-4 w-4 text-green-600 mr-2" />
              Contains at least one special character
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );

  const renderAuditLogs = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Security Audit Log</h3>
          <p className="text-sm text-gray-600">
            Track all security-related activities on your account
          </p>
        </div>
        <div className="flex gap-2">
          <select 
            value={auditFilter}
            onChange={(e) => setAuditFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Activities</option>
            <option value="login">Login Activities</option>
            <option value="security">Security Changes</option>
            <option value="settings">Settings Changes</option>
          </select>
          <Button variant="outline" size="sm">
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {auditLogs.map((log) => (
          <Card key={log.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <h4 className="font-medium capitalize">
                      {log.action.replace('_', ' ')}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {log.ip_address} • {log.browser}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                  {log.status}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Settings
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage your account security, authentication, and privacy settings
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="mfa">MFA</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="mfa" className="mt-6">
          {renderMFASettings()}
        </TabsContent>

        <TabsContent value="sessions" className="mt-6">
          {renderSessions()}
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          {renderPasswordSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecuritySettings;