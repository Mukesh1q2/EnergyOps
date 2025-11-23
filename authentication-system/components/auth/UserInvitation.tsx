"""
User Invitation Component
Enterprise user invitation and management interface
"""

'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Alert, AlertDescription } from '../ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { 
  Users, 
  UserPlus, 
  Mail, 
  Shield, 
  Check, 
  X, 
  Clock,
  Globe,
  Building,
  Search,
  Filter,
  MoreVertical,
  Copy,
  Trash2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface InvitedUser {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  invitedAt: string;
  invitedBy: string;
  message?: string;
}

interface UserInvitationProps {
  onBack?: () => void;
}

export const UserInvitation: React.FC<UserInvitationProps> = ({ onBack }) => {
  const { inviteUser, user } = useAuth();
  const [activeTab, setActiveTab] = useState('invite');
  
  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: '',
    message: ''
  });
  const [isInviting, setIsInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');

  // Invitations list
  const [invitations, setInvitations] = useState<InvitedUser[]>([
    {
      id: '1',
      email: 'john.doe@company.com',
      role: 'analyst',
      status: 'pending',
      invitedAt: '2025-01-15T10:30:00Z',
      invitedBy: 'admin@company.com',
      message: 'Welcome to the energy trading team!'
    },
    {
      id: '2',
      email: 'jane.smith@company.com',
      role: 'trader',
      status: 'accepted',
      invitedAt: '2025-01-10T14:20:00Z',
      invitedBy: 'admin@company.com'
    },
    {
      id: '3',
      email: 'old.user@company.com',
      role: 'viewer',
      status: 'expired',
      invitedAt: '2025-01-01T09:00:00Z',
      invitedBy: 'admin@company.com'
    }
  ]);

  // Filter and search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setInviteError('');

    try {
      await inviteUser(inviteForm.email, inviteForm.role, inviteForm.message);
      
      // Add to local list
      const newInvitation: InvitedUser = {
        id: Date.now().toString(),
        email: inviteForm.email,
        role: inviteForm.role,
        status: 'pending',
        invitedAt: new Date().toISOString(),
        invitedBy: user?.email || 'Unknown',
        message: inviteForm.message
      };
      
      setInvitations(prev => [newInvitation, ...prev]);
      setInviteForm({ email: '', role: '', message: '' });
      
    } catch (err: any) {
      setInviteError(err.message || 'Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    // Resend invitation logic
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, invitedAt: new Date().toISOString() }
        : inv
    ));
  };

  const handleRevokeInvitation = async (invitationId: string) => {
    setInvitations(prev => prev.map(inv => 
      inv.id === invitationId 
        ? { ...inv, status: 'expired' }
        : inv
    ));
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: 'outline',
      accepted: 'default',
      expired: 'destructive'
    };

    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800'
    };

    return (
      <Badge variant={variants[status] || 'outline'} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-800',
      analyst: 'bg-blue-100 text-blue-800',
      trader: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800',
      auditor: 'bg-orange-100 text-orange-800'
    };

    return (
      <Badge variant="outline" className={colors[role] || 'bg-gray-100 text-gray-800'}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const filteredInvitations = invitations.filter(invitation => {
    const matchesSearch = invitation.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderInviteTab = () => (
    <div className="space-y-6">
      {/* Invite Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserPlus className="mr-2 h-5 w-5" />
            Invite New User
          </CardTitle>
          <CardDescription>
            Send an invitation to join your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            {inviteError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{inviteError}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select user role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="trader">Trader</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    {user?.role === 'admin' && (
                      <SelectItem value="admin">Admin</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Personal Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to your invitation..."
                value={inviteForm.message}
                onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full"
              disabled={isInviting || !inviteForm.email || !inviteForm.role}
            >
              {isInviting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending Invitation...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Role Descriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
          <CardDescription>
            Understanding user roles and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Shield className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Admin</h4>
                <p className="text-sm text-gray-600">
                  Full access to all features, user management, and organization settings
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Analyst</h4>
                <p className="text-sm text-gray-600">
                  Access to analytics, data upload, dashboard creation, and reporting features
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Globe className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Trader</h4>
                <p className="text-sm text-gray-600">
                  Access to trading features, market data, bid management, and real-time monitoring
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg">
              <Building className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <h4 className="font-medium">Viewer</h4>
                <p className="text-sm text-gray-600">
                  Read-only access to dashboards, reports, and general information
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInvitationsTab = () => (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        <Button variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {invitations.filter(i => i.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {invitations.filter(i => i.status === 'accepted').length}
              </div>
              <div className="text-sm text-gray-600">Accepted</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {invitations.filter(i => i.status === 'expired').length}
              </div>
              <div className="text-sm text-gray-600">Expired</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {invitations.length}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invitations List */}
      <div className="space-y-3">
        {filteredInvitations.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No invitations found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No invitations have been sent yet'
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredInvitations.map((invitation) => (
            <Card key={invitation.id}>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-gray-900">{invitation.email}</h4>
                        {getRoleBadge(invitation.role)}
                        {getStatusBadge(invitation.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center space-x-4">
                          <span>Invited by {invitation.invitedBy}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(invitation.invitedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {invitation.message && (
                          <p className="text-gray-500 italic">"{invitation.message}"</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {invitation.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResendInvitation(invitation.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-1" />
                          Resend
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeInvitation(invitation.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </>
                    )}
                    
                    {invitation.status === 'expired' && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setInviteForm({
                            email: invitation.email,
                            role: invitation.role,
                            message: invitation.message || ''
                          });
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Re-invite
                      </Button>
                    )}

                    <Button size="sm" variant="ghost">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Back to Settings
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">
          Invite and manage users in your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invite">Invite Users</TabsTrigger>
          <TabsTrigger value="invitations">Manage Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="invite" className="mt-6">
          {renderInviteTab()}
        </TabsContent>

        <TabsContent value="invitations" className="mt-6">
          {renderInvitationsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserInvitation;