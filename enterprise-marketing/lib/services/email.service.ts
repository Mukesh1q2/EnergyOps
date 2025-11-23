/**
 * Email Service Implementation
 * Handles all email operations using SendGrid
 * Includes verification, password reset, and MFA notifications
 */

import sgMail from '@sendgrid/mail';

interface EmailConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

interface VerificationEmailData {
  to: string;
  verificationUrl: string;
  userName?: string;
}

interface PasswordResetEmailData {
  to: string;
  resetUrl: string;
  userName?: string;
}

interface MFAEmailData {
  to: string;
  verificationCode: string;
  userName?: string;
}

interface WelcomeEmailData {
  to: string;
  userName: string;
  organizationName?: string;
}

export class EmailService {
  private sgMail: typeof sgMail;
  private config: EmailConfig;

  constructor() {
    this.config = {
      apiKey: process.env.SENDGRID_API_KEY || '',
      fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@optibid-energy.com',
      fromName: process.env.SENDGRID_FROM_NAME || 'OptiBid Energy Platform'
    };

    if (!this.config.apiKey) {
      throw new Error('SENDGRID_API_KEY environment variable is required');
    }

    sgMail.setApiKey(this.config.apiKey);
    this.sgMail = sgMail;
  }

  /**
   * Send email verification link to user
   */
  async sendVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    try {
      const templateId = process.env.EMAIL_VERIFICATION_TEMPLATE_ID;
      
      if (!templateId) {
        // Fallback to basic email if template not configured
        return await this.sendBasicVerificationEmail(data);
      }

      const msg = {
        to: data.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        templateId: templateId,
        dynamicTemplateData: {
          verification_url: data.verificationUrl,
          user_name: data.userName || 'User',
          company_name: 'OptiBid Energy Platform',
          support_email: 'support@optibid-energy.com',
          expiration_hours: '24'
        }
      };

      await this.sgMail.send(msg);
      
      console.log(`Verification email sent to: ${data.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email with secure link
   */
  async sendPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    try {
      const templateId = process.env.PASSWORD_RESET_TEMPLATE_ID;
      
      if (!templateId) {
        return await this.sendBasicPasswordResetEmail(data);
      }

      const msg = {
        to: data.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        templateId: templateId,
        dynamicTemplateData: {
          reset_url: data.resetUrl,
          user_name: data.userName || 'User',
          company_name: 'OptiBid Energy Platform',
          support_email: 'support@optibid-energy.com',
          expiration_hours: '1'
        }
      };

      await this.sgMail.send(msg);
      
      console.log(`Password reset email sent to: ${data.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Send MFA verification code via email (backup method)
   */
  async sendMFAEmail(data: MFAEmailData): Promise<boolean> {
    try {
      const templateId = process.env.MFA_EMAIL_TEMPLATE_ID;
      
      if (!templateId) {
        return await this.sendBasicMFAEmail(data);
      }

      const msg = {
        to: data.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        templateId: templateId,
        dynamicTemplateData: {
          verification_code: data.verificationCode,
          user_name: data.userName || 'User',
          company_name: 'OptiBid Energy Platform',
          expiration_minutes: '10'
        }
      };

      await this.sgMail.send(msg);
      
      console.log(`MFA email sent to: ${data.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send MFA email:', error);
      throw new Error('Failed to send MFA email');
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    try {
      const templateId = process.env.WELCOME_EMAIL_TEMPLATE_ID;
      
      if (!templateId) {
        return await this.sendBasicWelcomeEmail(data);
      }

      const msg = {
        to: data.to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        templateId: templateId,
        dynamicTemplateData: {
          user_name: data.userName,
          organization_name: data.organizationName || 'OptiBid Energy Platform',
          dashboard_url: `${process.env.NEXT_PUBLIC_API_URL}/dashboard`,
          support_email: 'support@optibid-energy.com'
        }
      };

      await this.sgMail.send(msg);
      
      console.log(`Welcome email sent to: ${data.to}`);
      return true;
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      throw new Error('Failed to send welcome email');
    }
  }

  /**
   * Send security alert email for suspicious activities
   */
  async sendSecurityAlert(
    to: string, 
    alertType: string, 
    details: any
  ): Promise<boolean> {
    try {
      const templateId = process.env.SECURITY_ALERT_TEMPLATE_ID;
      
      if (!templateId) {
        return await this.sendBasicSecurityAlert(to, alertType, details);
      }

      const msg = {
        to,
        from: {
          email: this.config.fromEmail,
          name: this.config.fromName
        },
        templateId: templateId,
        dynamicTemplateData: {
          alert_type: alertType,
          user_name: details.userName || 'User',
          timestamp: new Date().toISOString(),
          ip_address: details.ipAddress,
          user_agent: details.userAgent,
          location: details.location,
          company_name: 'OptiBid Energy Platform'
        }
      };

      await this.sgMail.send(msg);
      
      console.log(`Security alert sent to: ${to} (${alertType})`);
      return true;
    } catch (error) {
      console.error('Failed to send security alert:', error);
      throw new Error('Failed to send security alert');
    }
  }

  /**
   * Fallback methods for when templates are not configured
   */
  private async sendBasicVerificationEmail(data: VerificationEmailData): Promise<boolean> {
    const msg = {
      to: data.to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Verify Your OptiBid Energy Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Welcome to OptiBid Energy Platform</h2>
          <p>Hello ${data.userName || 'there'},</p>
          <p>Please verify your email address to complete your registration with OptiBid Energy Platform.</p>
          <div style="margin: 30px 0;">
            <a href="${data.verificationUrl}" 
               style="background: #0066cc; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            This link will expire in 24 hours. If you didn't create this account, please ignore this email.
          </p>
        </div>
      `
    };

    await this.sgMail.send(msg);
    return true;
  }

  private async sendBasicPasswordResetEmail(data: PasswordResetEmailData): Promise<boolean> {
    const msg = {
      to: data.to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Reset Your OptiBid Energy Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Password Reset Request</h2>
          <p>Hello ${data.userName || 'there'},</p>
          <p>We received a request to reset your password for your OptiBid Energy Platform account.</p>
          <div style="margin: 30px 0;">
            <a href="${data.resetUrl}" 
               style="background: #dc3545; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            This link will expire in 1 hour. If you didn't request this reset, please ignore this email.
          </p>
        </div>
      `
    };

    await this.sgMail.send(msg);
    return true;
  }

  private async sendBasicMFAEmail(data: MFAEmailData): Promise<boolean> {
    const msg = {
      to: data.to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Your OptiBid Energy MFA Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Multi-Factor Authentication Code</h2>
          <p>Hello ${data.userName || 'there'},</p>
          <p>Your verification code for OptiBid Energy Platform is:</p>
          <div style="margin: 30px 0; font-size: 24px; font-weight: bold; color: #0066cc;">
            ${data.verificationCode}
          </div>
          <p style="font-size: 12px; color: #666;">
            This code will expire in 10 minutes. If you didn't request this code, please contact support.
          </p>
        </div>
      `
    };

    await this.sgMail.send(msg);
    return true;
  }

  private async sendBasicWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const msg = {
      to: data.to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: 'Welcome to OptiBid Energy Platform',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066cc;">Welcome to OptiBid Energy Platform!</h2>
          <p>Hello ${data.userName},</p>
          <p>Your OptiBid Energy Platform account has been successfully created.</p>
          <p>You can now access your dashboard and start optimizing your energy trading strategies with our advanced analytics platform.</p>
          <div style="margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_API_URL}/dashboard" 
               style="background: #0066cc; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <p style="font-size: 12px; color: #666;">
            If you have any questions, contact us at support@optibid-energy.com
          </p>
        </div>
      `
    };

    await this.sgMail.send(msg);
    return true;
  }

  private async sendBasicSecurityAlert(
    to: string, 
    alertType: string, 
    details: any
  ): Promise<boolean> {
    const msg = {
      to,
      from: {
        email: this.config.fromEmail,
        name: this.config.fromName
      },
      subject: `Security Alert - ${alertType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc3545;">Security Alert</h2>
          <p>Hello ${details.userName || 'there'},</p>
          <p>We detected ${alertType} on your OptiBid Energy Platform account.</p>
          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-left: 4px solid #dc3545;">
            <h3>Details:</h3>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>IP Address:</strong> ${details.ipAddress || 'Unknown'}</p>
            <p><strong>User Agent:</strong> ${details.userAgent || 'Unknown'}</p>
            ${details.location ? `<p><strong>Location:</strong> ${details.location}</p>` : ''}
          </div>
          <p style="font-size: 12px; color: #666;">
            If this was you, you can ignore this alert. If you didn't perform this action, please contact support immediately.
          </p>
        </div>
      `
    };

    await this.sgMail.send(msg);
    return true;
  }

  /**
   * Get email service health status
   */
  async getHealthStatus(): Promise<{ healthy: boolean; details: string }> {
    try {
      // Send a test email to verify configuration
      if (!this.config.apiKey) {
        return { healthy: false, details: 'SendGrid API key not configured' };
      }

      return { 
        healthy: true, 
        details: `SendGrid configured with from: ${this.config.fromEmail}` 
      };
    } catch (error) {
      return { 
        healthy: false, 
        details: `SendGrid error: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
