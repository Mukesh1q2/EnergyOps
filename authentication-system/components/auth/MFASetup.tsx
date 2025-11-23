"""
MFA Setup Component
Multi-Factor Authentication setup with TOTP and backup codes
"""

'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Shield, 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle, 
  Smartphone,
  Mail,
  Lock,
  Copy as CopyIcon
} from 'lucide-react';
import type { MFAData, MFASetupResult } from './AuthContext';

interface MFASetupProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export const MFASetup: React.FC<MFASetupProps> = ({ onComplete, onSkip }) => {
  const { setupMFA, verifyMFA, user, loading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<'choose' | 'setup' | 'verify' | 'complete'>('choose');
  const [selectedMethod, setSelectedMethod] = useState<'totp' | 'sms' | 'email'>('totp');
  const [mfaData, setMfaData] = useState<MFAData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelection = async (method: 'totp' | 'sms' | 'email') => {
    setSelectedMethod(method);
    setError(null);
    
    try {
      const data = await setupMFA(method);
      setMfaData(data);
      setCurrentStep('setup');
    } catch (err: any) {
      setError(err.message || 'Failed to setup MFA');
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    if (selectedMethod === 'totp' && !deviceName.trim()) {
      setError('Please enter a device name');
      return;
    }

    try {
      const result = await verifyMFA(selectedMethod, verificationCode, deviceName);
      
      if (result.backup_codes) {
        setBackupCodes(result.backup_codes);
      }
      
      setCurrentStep('complete');
      
      if (onComplete) {
        onComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    }
  };

  const copyToClipboard = async (text: string, codeId?: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(codeId || text);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const renderChooseMethod = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Secure Your Account</h2>
        <p className="text-gray-600">
          Multi-factor authentication adds an extra layer of security to your account.
        </p>
      </div>

      <div className="grid gap-4">
        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'totp' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('totp')}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedMethod === 'totp' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <Smartphone className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Authenticator App</h3>
              <p className="text-sm text-gray-600">
                Use Google Authenticator, Authy, or similar app
              </p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Recommended
                </span>
              </div>
            </div>
          </div>
        </div>

        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'sms' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('sms')}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedMethod === 'sms' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <Lock className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">SMS Text Message</h3>
              <p className="text-sm text-gray-600">
                Receive codes via text message to your phone
              </p>
            </div>
          </div>
        </div>

        <div 
          className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
            selectedMethod === 'email' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
          }`}
          onClick={() => setSelectedMethod('email')}
        >
          <div className="flex items-start space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              selectedMethod === 'email' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}>
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">Email Verification</h3>
              <p className="text-sm text-gray-600">
                Receive verification codes via email
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <Button 
          onClick={() => handleMethodSelection(selectedMethod)}
          className="w-full"
          disabled={loading}
        >
          {loading ? 'Setting up...' : `Continue with ${selectedMethod === 'totp' ? 'Authenticator' : selectedMethod === 'sms' ? 'SMS' : 'Email'}`}
        </Button>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={onSkip}
        >
          Skip for now
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Important</h4>
            <p className="text-sm text-yellow-700 mt-1">
              MFA is strongly recommended for all enterprise accounts. 
              You'll be prompted to set it up again when accessing sensitive features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSetup = () => {
    if (!mfaData) return null;

    if (mfaData.method === 'totp') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <QrCode className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Scan QR Code</h2>
            <p className="text-gray-600">
              Scan this QR code with your authenticator app
            </p>
          </div>

          {mfaData.qr_code && (
            <div className="flex justify-center">
              <img 
                src={mfaData.qr_code} 
                alt="QR Code for authenticator app" 
                className="border rounded-lg"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label>Manual Entry Key</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input 
                  value={mfaData.manual_entry_key || ''} 
                  readOnly 
                  className="font-mono text-sm"
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => copyToClipboard(mfaData.manual_entry_key || '', 'secret')}
                >
                  {copiedCode === 'secret' ? <Check className="h-4 w-4" /> : <CopyIcon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                placeholder="e.g., iPhone 15, Work Phone"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              After scanning the QR code, your authenticator app will show a 6-digit code. 
              Enter this code below to verify the setup.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Enter 6-digit code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full"
              disabled={loading || !verificationCode || !deviceName}
            >
              {loading ? 'Verifying...' : 'Verify & Enable MFA'}
            </Button>
          </div>
        </div>
      );
    }

    if (mfaData.method === 'sms' || mfaData.method === 'email') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <Lock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {mfaData.method === 'sms' ? 'SMS Verification' : 'Email Verification'}
            </h2>
            <p className="text-gray-600">
              {mfaData.method === 'sms' 
                ? 'We\'ll send a verification code to your phone' 
                : 'We\'ll send a verification code to your email'
              }
            </p>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {mfaData.message || 'Verification code sent successfully'}
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="verificationCode">Enter verification code</Label>
              <Input
                id="verificationCode"
                type="text"
                placeholder="Enter the code we sent you"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="mt-1 text-center text-lg tracking-widest font-mono"
                maxLength={6}
              />
            </div>

            <Button 
              onClick={handleVerify}
              className="w-full"
              disabled={loading || !verificationCode}
            >
              {loading ? 'Verifying...' : 'Verify & Enable MFA'}
            </Button>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => handleMethodSelection(selectedMethod)}
              disabled={loading}
            >
              Resend Code
            </Button>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderComplete = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">MFA Enabled Successfully!</h2>
        <p className="text-gray-600">
          Your account is now more secure with multi-factor authentication.
        </p>
      </div>

      {backupCodes.length > 0 && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Save Backup Codes</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Store these backup codes in a safe place. You can use them to access your account 
                  if you lose access to your authentication device.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Backup Codes</h4>
            <div className="grid grid-cols-2 gap-2">
              {backupCodes.map((code, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border flex-1">
                    {code}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(code, `backup-${index}`)}
                  >
                    {copiedCode === `backup-${index}` ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 w-full"
              onClick={() => copyToClipboard(backupCodes.join('\n'), 'all-codes')}
            >
              {copiedCode === 'all-codes' ? 'Copied All Codes!' : 'Copy All Codes'}
            </Button>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <Check className="h-5 w-5 text-green-600 mt-0.5 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-green-800">What's Next?</h4>
            <ul className="text-sm text-green-700 mt-1 space-y-1">
              <li>• You'll be prompted for MFA codes on future logins</li>
              <li>• You can manage your MFA settings in account security</li>
              <li>• Keep your backup codes safe and accessible</li>
            </ul>
          </div>
        </div>
      </div>

      <Button 
        onClick={onComplete}
        className="w-full"
      >
        Continue to Dashboard
      </Button>
    </div>
  );

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="space-y-2">
            <Button onClick={() => setCurrentStep('choose')} className="w-full">
              Try Again
            </Button>
            <Button variant="outline" onClick={onSkip} className="w-full">
              Skip for Now
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Multi-Factor Authentication</CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {currentStep === 'choose' && renderChooseMethod()}
        {currentStep === 'setup' && renderSetup()}
        {currentStep === 'complete' && renderComplete()}
      </CardContent>
    </Card>
  );
};

export default MFASetup;