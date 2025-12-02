'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const EmailVerificationPage = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('john.doe@energycorp.com'); // In real app, get from context
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      return;
    }

    // Simulate token verification
    const verifyToken = async () => {
      setTimeout(() => {
        // Simulate success (in real app, this would check the token)
        if (token.length > 10) {
          setVerificationStatus('success');
        } else {
          setVerificationStatus('expired');
        }
      }, 2000);
    };

    verifyToken();
  }, [token]);

  useEffect(() => {
    if (countdown > 0 && verificationStatus !== 'success') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown, verificationStatus]);

  const handleResendEmail = async () => {
    setIsResending(true);
    setCountdown(60);
    
    // Simulate API call
    setTimeout(() => {
      setIsResending(false);
      // In real app, this would trigger email resend
    }, 1500);
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'loading':
        return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>;
      case 'success':
        return <CheckCircleIcon className="h-16 w-16 text-green-600" />;
      case 'error':
      case 'expired':
        return <ExclamationTriangleIcon className="h-16 w-16 text-red-600" />;
      default:
        return <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Verifying your email...';
      case 'success':
        return 'Email verified successfully!';
      case 'error':
        return 'Invalid verification link';
      case 'expired':
        return 'Verification link expired';
      default:
        return 'Verifying your email...';
    }
  };

  const getStatusMessage = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'Please wait while we verify your email address.';
      case 'success':
        return 'Your email has been verified. You can now access all features of your OptiBid account.';
      case 'error':
        return 'The verification link you clicked is invalid or has been tampered with.';
      case 'expired':
        return 'This verification link has expired. Please request a new verification email.';
      default:
        return 'Please wait while we verify your email address.';
    }
  };

  const getStatusColor = () => {
    switch (verificationStatus) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
      case 'expired':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-4"
          >
            {getStatusIcon()}
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className={`text-2xl font-bold mb-2 ${getStatusColor()}`}
          >
            {getStatusTitle()}
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-gray-600"
          >
            {getStatusMessage()}
          </motion.p>
        </div>

        {/* Email Info */}
        {verificationStatus !== 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mb-8"
          >
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Verifying email:</p>
                  <p className="text-sm text-gray-600">{email}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {verificationStatus === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex justify-center space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                  style={{ animationDelay: `${i * 0.1}s` }}
                ></div>
              ))}
            </div>
            <p className="text-sm text-gray-600 text-center">
              This usually takes just a few seconds...
            </p>
          </motion.div>
        )}

        {/* Success State */}
        {verificationStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-green-900">Account Verified</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Your email address has been successfully verified. You now have full access to all OptiBid features.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                href="/dashboard"
                className="block w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
              >
                Go to Dashboard
              </Link>
              
              <Link
                href="/profile"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Complete Profile Setup
              </Link>
            </div>
          </motion.div>
        )}

        {/* Error States */}
        {(verificationStatus === 'error' || verificationStatus === 'expired') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="space-y-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-red-900">
                    {verificationStatus === 'expired' ? 'Link Expired' : 'Invalid Link'}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {verificationStatus === 'expired' 
                      ? 'Verification links expire after 24 hours for security reasons.'
                      : 'Please check the link you received in your email and try again.'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {verificationStatus === 'expired' && (
                <button
                  onClick={handleResendEmail}
                  disabled={isResending || countdown > 0}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResending ? (
                    <div className="flex items-center justify-center">
                      <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                      Resending...
                    </div>
                  ) : countdown > 0 ? (
                    <div className="flex items-center justify-center">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      Resend in {countdown}s
                    </div>
                  ) : (
                    'Resend verification email'
                  )}
                </button>
              )}
              
              <Link
                href="/signup"
                className="block w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors text-center"
              >
                Create new account
              </Link>
              
              <Link
                href="/login"
                className="block text-blue-600 hover:text-blue-700 transition-colors text-center"
              >
                Back to login
              </Link>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact our support team at{' '}
                <a href="mailto:support@optibid-energy.com" className="text-blue-600 hover:underline">
                  support@optibid-energy.com
                </a>
              </p>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        {verificationStatus !== 'loading' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-8 pt-6 border-t border-gray-200"
          >
            <h3 className="font-medium text-gray-900 mb-3">Didn't receive the email?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your spam or junk folder</li>
              <li>• Make sure you entered the correct email address</li>
              <li>• Wait a few minutes for the email to arrive</li>
              <li>• Contact support if you continue having issues</li>
            </ul>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EmailVerificationPage;