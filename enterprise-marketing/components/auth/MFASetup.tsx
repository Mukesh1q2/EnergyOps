'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ShieldCheckIcon, 
  DevicePhoneMobileIcon, 
  QrCodeIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import QRCode from 'react-qr-code'

interface MFASetupProps {
  userId: string
  onComplete: (data: any) => void
  onSkip?: () => void
}

type MFAMethod = 'totp' | 'sms'

interface BackupCode {
  code: string
  used: boolean
}

export function MFASetup({ userId, onComplete, onSkip }: MFASetupProps) {
  const [step, setStep] = useState(1)
  const [selectedMethod, setSelectedMethod] = useState<MFAMethod>('totp')
  const [loading, setLoading] = useState(false)
  const [setupData, setSetupData] = useState<any>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [backupCodes, setBackupCodes] = useState<BackupCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleMethodSelect = async (method: MFAMethod) => {
    setSelectedMethod(method)
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, method })
      })
      
      const data = await response.json()
      if (data.success) {
        setSetupData(data.data)
        if (method === 'totp') {
          setBackupCodes(data.data.backupCodes.map((code: string) => ({ code, used: false })))
        }
        setStep(2)
      } else {
        console.error('MFA setup failed:', data.error)
      }
    } catch (error) {
      console.error('MFA setup error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async () => {
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          code: verificationCode, 
          method: selectedMethod 
        })
      })
      
      const data = await response.json()
      if (data.success) {
        onComplete(data.data)
      } else {
        console.error('MFA verification failed:', data.error)
      }
    } catch (error) {
      console.error('MFA verification error:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center"
    >
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <ShieldCheckIcon className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Set Up Multi-Factor Authentication
      </h2>
      
      <p className="text-gray-600 mb-8">
        Add an extra layer of security to your account with MFA. Choose your preferred method:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
        {/* TOTP Option */}
        <button
          onClick={() => handleMethodSelect('totp')}
          disabled={loading}
          className="p-6 border-2 border-gray-200 rounded-xl text-left hover:border-blue-300 hover:bg-blue-50 transition-all disabled:opacity-50"
        >
          <QrCodeIcon className="w-8 h-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Authenticator App</h3>
          <p className="text-sm text-gray-600">
            Use Google Authenticator, Authy, or similar apps to generate verification codes
          </p>
        </button>

        {/* SMS Option */}
        <button
          onClick={() => handleMethodSelect('sms')}
          disabled={loading}
          className="p-6 border-2 border-gray-200 rounded-xl text-left hover:border-green-300 hover:bg-green-50 transition-all disabled:opacity-50"
        >
          <DevicePhoneMobileIcon className="w-8 h-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">SMS Code</h3>
          <p className="text-sm text-gray-600">
            Receive verification codes via text message to your phone
          </p>
        </button>
      </div>

      {onSkip && (
        <div className="mt-8">
          <button
            onClick={onSkip}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Skip for now
          </button>
        </div>
      )}
    </motion.div>
  )

  const renderStep2TOTP = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <QrCodeIcon className="w-8 h-8 text-blue-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Set Up Authenticator App
      </h2>
      
      <p className="text-gray-600 mb-6">
        Scan this QR code with your authenticator app, then enter the verification code:
      </p>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-lg border-2 border-gray-200 inline-block mb-6">
        <QRCode
          value={setupData.qrCodeUrl}
          size={200}
          bgColor="#FFFFFF"
          fgColor="#000000"
        />
      </div>

      {/* Manual Entry Option */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="text-sm text-gray-600 mb-2">Can't scan? Enter this code manually:</p>
        <div className="flex items-center justify-center space-x-2">
          <code className="text-xs bg-white px-2 py-1 rounded border">
            {setupData.secret}
          </code>
          <button
            onClick={() => copyToClipboard(setupData.secret)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {copiedCode === setupData.secret ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <ClipboardDocumentIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Backup Codes */}
      <div className="text-left mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Backup Codes</h3>
        <p className="text-sm text-gray-600 mb-3">
          Save these backup codes in a secure location. You can use them if you lose access to your authenticator app:
        </p>
        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-4 rounded-lg">
          {backupCodes.map((backup, index) => (
            <div key={index} className="flex items-center justify-between">
              <code className="text-xs font-mono">{backup.code}</code>
              <button
                onClick={() => copyToClipboard(backup.code)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                {copiedCode === backup.code ? (
                  <CheckIcon className="w-3 h-3 text-green-500" />
                ) : (
                  <ClipboardDocumentIcon className="w-3 h-3" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Verification Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter 6-digit verification code:
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="000000"
          maxLength={6}
        />
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleVerification}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>
    </motion.div>
  )

  const renderStep2SMS = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center max-w-md mx-auto"
    >
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <DevicePhoneMobileIcon className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        Verify Phone Number
      </h2>
      
      <p className="text-gray-600 mb-6">
        We've sent a 6-digit code to {setupData.phoneMasked}. Enter it below:
      </p>

      {/* Verification Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter 6-digit verification code:
        </label>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-green-500 focus:border-green-500"
          placeholder="000000"
          maxLength={6}
        />
      </div>

      {/* Timer */}
      <div className="text-sm text-gray-500 mb-6">
        Code expires in {Math.floor((new Date(setupData.expiresAt).getTime() - Date.now()) / 60000)} minutes
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        <button
          onClick={() => setStep(1)}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={handleVerification}
          disabled={loading || verificationCode.length !== 6}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify & Enable'}
        </button>
      </div>

      {/* Resend Code */}
      <div className="mt-4">
        <button
          onClick={() => handleMethodSelect('sms')}
          disabled={loading}
          className="text-sm text-green-600 hover:text-green-700 underline disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 1 && renderStep1()}
        {step === 2 && selectedMethod === 'totp' && renderStep2TOTP()}
        {step === 2 && selectedMethod === 'sms' && renderStep2SMS()}
      </div>
    </div>
  )
}