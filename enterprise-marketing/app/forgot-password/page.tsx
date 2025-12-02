'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  EnvelopeIcon, 
  ArrowLeftIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon
} from '@heroicons/react/24/outline';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate API call
    setTimeout(() => {
      if (email) {
        setIsSubmitted(true);
        setIsSubmitting(false);
      } else {
        setError('Please enter a valid email address');
        setIsSubmitting(false);
      }
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 w-full max-w-md text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Check your email
          </h1>
          
          <p className="text-gray-600 mb-6">
            We've sent password reset instructions to <br />
            <span className="font-semibold text-gray-900">{email}</span>
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Next steps:</strong>
            </p>
            <ol className="text-sm text-blue-700 mt-2 text-left list-decimal list-inside space-y-1">
              <li>Check your email inbox (and spam folder)</li>
              <li>Click the reset link in the email</li>
              <li>Follow the instructions to create a new password</li>
            </ol>
          </div>
          
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsSubmitted(false);
                setEmail('');
              }}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Send another email
            </button>
            
            <Link
              href="/login"
              className="flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
          
          <p className="text-xs text-gray-500 mt-6">
            Didn't receive the email? Check your spam folder or contact support at{' '}
            <a href="mailto:support@optibid-energy.com" className="text-blue-600 hover:underline">
              support@optibid-energy.com
            </a>
          </p>
        </motion.div>
      </div>
    );
  }

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
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CogIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Forgot your password?
          </h1>
          <p className="text-gray-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <EnvelopeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                required
              />
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-center text-red-600 text-sm"
              >
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {error}
              </motion.div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending reset link...
              </div>
            ) : (
              'Send reset link'
            )}
          </button>
        </form>

        {/* Help Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Need help?</h3>
            <p className="text-sm text-gray-600 mb-3">
              If you're still having trouble accessing your account:
            </p>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check if you entered the correct email address</li>
              <li>• Look for the email in your spam or junk folder</li>
              <li>• The reset link will expire in 24 hours</li>
              <li>• Contact our support team if you need assistance</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to login
          </Link>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            For your security, we'll only send reset instructions to registered email addresses.{' '}
            <Link href="/privacy" className="text-blue-600 hover:underline">
              Learn more
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;