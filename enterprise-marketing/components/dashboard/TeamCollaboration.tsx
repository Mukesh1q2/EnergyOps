'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XMarkIcon,
  ChatBubbleLeftRightIcon,
  UserCircleIcon,
  PaperAirplaneIcon,
  EllipsisHorizontalIcon,
  HandThumbUpIcon,
  PhotoIcon,
  DocumentIcon,
  LinkIcon,
  AtSymbolIcon,
  FaceSmileIcon,
  MicrophoneIcon,
  PhoneIcon,
  VideoCameraIcon,
  ShareIcon,
  EyeIcon,
  ClockIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment } from 'react'
import { clsx } from 'clsx'

interface TeamCollaborationProps {
  onClose: () => void
  user: any
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  widgetId?: string
  mentions: string[]
  reactions: { [emoji: string]: string[] }
  replies: Comment[]
  isResolved: boolean
}

interface Activity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  target: string
  targetType: 'widget' | 'dashboard' | 'comment'
  timestamp: string
  details?: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: string
  status: 'online' | 'away' | 'busy' | 'offline'
  lastSeen: string
  permissions: string[]
  cursor?: { x: number; y: number }
  selection?: { start: number; end: number }
}

const MOCK_COMMENTS: Comment[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    content: 'Great performance on the Wind Farm B widget! The efficiency improvements are impressive.',
    timestamp: '2024-01-20T10:30:00Z',
    widgetId: 'wind-farm-b',
    mentions: [],
    reactions: { '👍': ['user-2', 'user-3'], '🎉': ['user-4'] },
    replies: [
      {
        id: '1-1',
        userId: 'user-2',
        userName: 'Sarah Wilson',
        content: 'Thanks John! The new optimization algorithm really helped.',
        timestamp: '2024-01-20T10:35:00Z',
        mentions: ['user-1'],
        reactions: {},
        replies: [],
        isResolved: false
      }
    ],
    isResolved: false
  },
  {
    id: '2',
    userId: 'user-3',
    userName: 'Mike Chen',
    content: 'Could we add a comparison view to the Market Prices widget? @sarah-wilson',
    timestamp: '2024-01-20T11:15:00Z',
    widgetId: 'market-prices',
    mentions: ['sarah-wilson'],
    reactions: { '💡': ['user-1', 'user-4'] },
    replies: [],
    isResolved: false
  },
  {
    id: '3',
    userId: 'user-4',
    userName: 'Emily Davis',
    content: 'The new energy generation chart looks amazing! Perfect for our client presentation.',
    timestamp: '2024-01-20T11:45:00Z',
    widgetId: 'energy-generation',
    mentions: [],
    reactions: { '❤️': ['user-1', 'user-2', 'user-3'] },
    replies: [],
    isResolved: true
  }
]

const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    userId: 'user-1',
    userName: 'John Doe',
    action: 'updated',
    target: 'Wind Farm B Widget',
    targetType: 'widget',
    timestamp: '2024-01-20T10:30:00Z',
    details: 'Changed time range to 24h'
  },
  {
    id: '2',
    userId: 'user-2',
    userName: 'Sarah Wilson',
    action: 'commented on',
    target: 'Market Prices Widget',
    targetType: 'widget',
    timestamp: '2024-01-20T10:45:00Z'
  },
  {
    id: '3',
    userId: 'user-3',
    userName: 'Mike Chen',
    action: 'shared',
    target: 'Performance Dashboard',
    targetType: 'dashboard',
    timestamp: '2024-01-20T11:00:00Z'
  },
  {
    id: '4',
    userId: 'user-4',
    userName: 'Emily Davis',
    action: 'resolved',
    target: 'comment on Energy Generation',
    targetType: 'comment',
    timestamp: '2024-01-20T11:20:00Z'
  }
]

const MOCK_TEAM_MEMBERS: TeamMember[] = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@optibid.com',
    role: 'Senior Analyst',
    status: 'online',
    lastSeen: '2024-01-20T11:50:00Z',
    permissions: ['read', 'write', 'admin'],
    cursor: { x: 150, y: 200 }
  },
  {
    id: 'user-2',
    name: 'Sarah Wilson',
    email: 'sarah@optibid.com',
    role: 'Data Scientist',
    status: 'online',
    lastSeen: '2024-01-20T11:55:00Z',
    permissions: ['read', 'write'],
    cursor: { x: 300, y: 150 }
  },
  {
    id: 'user-3',
    name: 'Mike Chen',
    email: 'mike@optibid.com',
    role: 'Energy Analyst',
    status: 'away',
    lastSeen: '2024-01-20T10:30:00Z',
    permissions: ['read', 'write'],
  },
  {
    id: 'user-4',
    name: 'Emily Davis',
    email: 'emily@optibid.com',
    role: 'Portfolio Manager',
    status: 'busy',
    lastSeen: '2024-01-20T11:45:00Z',
    permissions: ['read', 'write', 'admin'],
  }
]

const COMMON_EMOJIS = ['👍', '❤️', '🎉', '💡', '🔥', '👏', '🙌', '✨', '🚀', '💯']

export function TeamCollaboration({ onClose, user }: TeamCollaborationProps) {
  const [activeTab, setActiveTab] = useState('comments')
  const [comments, setComments] = useState<Comment[]>(MOCK_COMMENTS)
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(MOCK_TEAM_MEMBERS)
  const [newComment, setNewComment] = useState('')
  const [selectedComment, setSelectedComment] = useState<string | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState<string | null>(null)
  const [isTyping, setIsTyping] = useState<{ [userId: string]: boolean }>({})
  const commentsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      // Update online status
      setTeamMembers(prev => prev.map(member => ({
        ...member,
        status: Math.random() > 0.1 ? member.status : 'away'
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [comments])

  const scrollToBottom = () => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendComment = () => {
    if (!newComment.trim()) return

    const comment: Comment = {
      id: Date.now().toString(),
      userId: user?.id || 'current-user',
      userName: user?.firstName + ' ' + user?.lastName || 'You',
      content: newComment,
      timestamp: new Date().toISOString(),
      mentions: extractMentions(newComment),
      reactions: {},
      replies: [],
      isResolved: false
    }

    setComments(prev => [...prev, comment])
    setNewComment('')
  }

  const handleReply = (commentId: string, replyContent: string) => {
    if (!replyContent.trim()) return

    const reply: Comment = {
      id: `${commentId}-${Date.now()}`,
      userId: user?.id || 'current-user',
      userName: user?.firstName + ' ' + user?.lastName || 'You',
      content: replyContent,
      timestamp: new Date().toISOString(),
      mentions: extractMentions(replyContent),
      reactions: {},
      replies: [],
      isResolved: false
    }

    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ))
  }

  const handleReaction = (commentId: string, emoji: string) => {
    const userId = user?.id || 'current-user'
    
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        const reactions = { ...comment.reactions }
        const currentUsers = reactions[emoji] || []
        
        if (currentUsers.includes(userId)) {
          reactions[emoji] = currentUsers.filter(id => id !== userId)
          if (reactions[emoji].length === 0) {
            delete reactions[emoji]
          }
        } else {
          reactions[emoji] = [...currentUsers, userId]
        }
        
        return { ...comment, reactions }
      }
      return comment
    }))
  }

  const handleResolveComment = (commentId: string) => {
    setComments(prev => prev.map(comment =>
      comment.id === commentId
        ? { ...comment, isResolved: !comment.isResolved }
        : comment
    ))
  }

  const extractMentions = (content: string): string[] => {
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    
    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1])
    }
    
    return mentions
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500'
      case 'away': return 'bg-yellow-500'
      case 'busy': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={clsx('mb-4', isReply && 'ml-8 border-l-2 border-gray-200 pl-4')}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
              {comment.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {comment.userName}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatTimestamp(comment.timestamp)}
            </span>
            {comment.isResolved && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckIcon className="w-3 h-3 mr-1" />
                Resolved
              </span>
            )}
          </div>
          <div className="text-sm text-gray-700 dark:text-gray-300 mb-2">
            {comment.content.split(/(@\w+)/).map((part, index) => 
              part.startsWith('@') ? (
                <span key={index} className="font-medium text-blue-600 dark:text-blue-400">
                  {part}
                </span>
              ) : part
            )}
          </div>
          
          {/* Reactions */}
          {Object.keys(comment.reactions).length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {Object.entries(comment.reactions).map(([emoji, users]) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(comment.id, emoji)}
                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-xs hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <span>{emoji}</span>
                  <span className="text-gray-600 dark:text-gray-400">{users.length}</span>
                </button>
              ))}
            </div>
          )}
          
          {/* Actions */}
          {!isReply && (
            <div className="flex items-center space-x-4 text-xs">
              <button
                onClick={() => setShowEmojiPicker(showEmojiPicker === comment.id ? null : comment.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                😊
              </button>
              <button
                onClick={() => handleResolveComment(comment.id)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Resolve
              </button>
              <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Reply
              </button>
            </div>
          )}
          
          {/* Emoji Picker */}
          {showEmojiPicker === comment.id && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
              <div className="flex space-x-2">
                {COMMON_EMOJIS.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => {
                      handleReaction(comment.id, emoji)
                      setShowEmojiPicker(null)
                    }}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const renderTeamMembers = () => (
    <div className="space-y-3">
      {teamMembers.map(member => (
        <div key={member.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-300 font-medium">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className={clsx(
                'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                getStatusColor(member.status)
              )}></div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {member.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {member.role}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {member.status === 'online' ? 'Active' : 
               member.status === 'away' ? 'Away' :
               member.status === 'busy' ? 'Busy' : 'Offline'}
            </div>
            <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <AtSymbolIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  )

  const renderActivities = () => (
    <div className="space-y-4">
      {activities.map(activity => (
        <div key={activity.id} className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            <span className="text-blue-600 dark:text-blue-300 text-sm font-medium">
              {activity.userName.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-900 dark:text-white">
              <span className="font-medium">{activity.userName}</span> {activity.action}{' '}
              <span className="font-medium">{activity.target}</span>
            </div>
            {activity.details && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.details}
              </div>
            )}
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formatTimestamp(activity.timestamp)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-3">
                    <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-500" />
                    <div>
                      <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                        Team Collaboration
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Collaborate in real-time on your dashboard
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                  <Tab.Group>
                    <Tab.List className="flex space-x-8 px-6">
                      {[
                        { id: 'comments', name: 'Comments', icon: ChatBubbleLeftRightIcon },
                        { id: 'team', name: 'Team', icon: UserCircleIcon },
                        { id: 'activity', name: 'Activity', icon: ClockIcon }
                      ].map(tab => (
                        <Tab
                          key={tab.id}
                          className={({ selected }) =>
                            clsx(
                              'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
                              selected
                                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                            )
                          }
                        >
                          <div className="flex items-center space-x-2">
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.name}</span>
                          </div>
                        </Tab>
                      ))}
                    </Tab.List>
                  </Tab.Group>
                </div>

                {/* Tab Content */}
                <div className="h-96 overflow-hidden">
                  <Tab.Panels>
                    {/* Comments Panel */}
                    <Tab.Panel className="h-full flex flex-col">
                      {/* Comments List */}
                      <div className="flex-1 overflow-y-auto p-6">
                        {comments.map(comment => (
                          <div key={comment.id}>
                            {renderComment(comment)}
                            {comment.replies.map(reply => renderComment(reply, true))}
                          </div>
                        ))}
                        <div ref={commentsEndRef} />
                      </div>

                      {/* New Comment Input */}
                      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                        <div className="flex items-end space-x-3">
                          <div className="flex-1">
                            <textarea
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="Add a comment... Use @ to mention teammates"
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500 resize-none"
                              rows={2}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault()
                                  handleSendComment()
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={handleSendComment}
                            disabled={!newComment.trim()}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <PaperAirplaneIcon className="h-5 w-5" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-2">
                            <button className="hover:text-gray-700 dark:hover:text-gray-200">
                              <PhotoIcon className="h-4 w-4" />
                            </button>
                            <button className="hover:text-gray-700 dark:hover:text-gray-200">
                              <DocumentIcon className="h-4 w-4" />
                            </button>
                            <button className="hover:text-gray-700 dark:hover:text-gray-200">
                              <LinkIcon className="h-4 w-4" />
                            </button>
                          </div>
                          <span>Press Enter to send, Shift+Enter for new line</span>
                        </div>
                      </div>
                    </Tab.Panel>

                    {/* Team Panel */}
                    <Tab.Panel className="h-full p-6 overflow-y-auto">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Team Members
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {teamMembers.filter(m => m.status === 'online').length} of {teamMembers.length} members online
                        </p>
                      </div>
                      {renderTeamMembers()}
                    </Tab.Panel>

                    {/* Activity Panel */}
                    <Tab.Panel className="h-full p-6 overflow-y-auto">
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                          Recent Activity
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Latest changes and updates from your team
                        </p>
                      </div>
                      {renderActivities()}
                    </Tab.Panel>
                  </Tab.Panels>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2">
                    <button className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                      <ShareIcon className="h-4 w-4" />
                      <span>Share Dashboard</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}