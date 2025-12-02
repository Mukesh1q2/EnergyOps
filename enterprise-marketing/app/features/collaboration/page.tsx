'use client'

import { SectionWrapper } from '@/components/ui/SectionWrapper'
import { motion } from 'framer-motion'
import { 
  UsersIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  EyeIcon,
  PencilIcon,
  GlobeAltIcon,
  ClockIcon,
  ShieldCheckIcon,
  SpeakerWaveIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline'

export default function CollaborationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SectionWrapper>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 text-sm font-medium mb-6"
              >
              <UsersIcon className="h-4 w-4 mr-2" />
              Team Collaboration Platform
            </motion.div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">Real-time</span> Collaboration
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Transform your energy trading with seamless team collaboration. Share insights, coordinate trades, 
              and work together in real-time with advanced communication and coordination tools.
            </p>
          </div>

          {/* Collaboration Demo */}
          <section className="mb-16">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold mb-4">Work Together, Win Together</h2>
                  <p className="text-xl mb-6 opacity-90">
                    See how teams coordinate energy trades, share insights, and make decisions together in real-time. 
                    Experience the power of synchronized collaboration.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">15+</div>
                      <div className="text-sm opacity-75">Simultaneous Users</div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <div className="text-2xl font-bold">&lt;100ms</div>
                      <div className="text-sm opacity-75">Collaboration Latency</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <button className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      <VideoCameraIcon className="h-4 w-4 mr-2" />
                      Join Demo Session
                    </button>
                    <button className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors">
                      View Live Dashboard
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <div className="text-center mb-4">
                      <div className="flex justify-center space-x-2 mb-4">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-200"></div>
                      </div>
                      <p className="text-lg font-medium">3 Team Members Active</p>
                      <p className="text-sm opacity-75">Real-time synchronization active</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm">
                        <EyeIcon className="h-4 w-4" />
                        <span>Sarah viewing Dashboard A</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <PencilIcon className="h-4 w-4" />
                        <span>Mike editing Portfolio B</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm mt-1">
                        <ChatBubbleLeftRightIcon className="h-4 w-4" />
                        <span>Lisa commenting on Trade C</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Core Collaboration Features */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Powerful Collaboration Features</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                  <EyeIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Live Presence</h3>
                <p className="text-gray-600 mb-4">
                  See who's viewing what in real-time with live cursors, activity indicators, and team member status.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Live cursor tracking</li>
                  <li>• Active user indicators</li>
                  <li>• Role-based access levels</li>
                  <li>• Permission management</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <ChatBubbleLeftRightIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Real-time Messaging</h3>
                <p className="text-gray-600 mb-4">
                  Communicate instantly with contextual chat, discussion threads, and @mentions for team coordination.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Contextual comments</li>
                  <li>• Discussion threads</li>
                  <li>• @mentions and notifications</li>
                  <li>• File sharing in chat</li>
                </ul>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                  <ShareIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Shared Workspaces</h3>
                <p className="text-gray-600 mb-4">
                  Collaborate on shared dashboards, trading strategies, and analysis with synchronized updates.
                </p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Shared dashboard views</li>
                  <li>• Collaborative editing</li>
                  <li>• Strategy annotations</li>
                  <li>• Version control</li>
                </ul>
              </motion.div>
            </div>
          </section>

          {/* Collaboration Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Real-World Collaboration Scenarios</h2>
            
            <div className="space-y-6">
              {/* Trading Desk Coordination */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <UsersIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Trading Desk Coordination</h3>
                    <p className="text-gray-600 mb-4">
                      Energy trading teams coordinate complex trades, share market insights, and make collective decisions 
                      with real-time collaboration on trading desks and portfolios.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Team Activities:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Shared trade execution workflows</li>
                          <li>• Real-time market commentary</li>
                          <li>• Collective risk assessment</li>
                          <li>• Strategy discussion and approval</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Collaboration Features:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Live trading desk monitoring</li>
                          <li>• Instant trade confirmations</li>
                          <li>• Risk alerts and notifications</li>
                          <li>• Performance tracking together</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Portfolio Review Sessions */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Portfolio Review & Strategy Sessions</h3>
                    <p className="text-gray-600 mb-4">
                      Conduct structured portfolio reviews, strategy planning, and performance analysis with your team 
                      using collaborative dashboards and shared annotations.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Review Activities:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Joint portfolio analysis</li>
                          <li>• Strategy planning sessions</li>
                          <li>• Performance discussions</li>
                          <li>• Risk evaluation meetings</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Collaboration Tools:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Shared screen annotations</li>
                          <li>• Action item tracking</li>
                          <li>• Decision logging</li>
                          <li>• Follow-up reminders</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remote Trading Support */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mr-6 flex-shrink-0">
                    <GlobeAltIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Remote Trading & Expert Support</h3>
                    <p className="text-gray-600 mb-4">
                      Support remote traders, involve experts from different locations, and maintain team cohesion 
                      with comprehensive remote collaboration tools.
                    </p>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Remote Features:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Screen sharing and control</li>
                          <li>• Voice and video integration</li>
                          <li>• Expert consultation requests</li>
                          <li>• Asynchronous communication</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Support Capabilities:</h4>
                        <ul className="text-gray-600 text-sm space-y-1">
                          <li>• Real-time assistance</li>
                          <li>• Expert guidance sessions</li>
                          <li>• Remote trade approvals</li>
                          <li>• Cross-timezone coordination</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Technical Capabilities */}
          <section className="mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Advanced Collaboration Technology</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Synchronization</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>WebSocket connections:</strong> Ultra-low latency real-time updates</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Conflict resolution:</strong> Intelligent handling of simultaneous edits</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>State synchronization:</strong> Consistent view across all team members</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Offline support:</strong> Queue actions for when connection is restored</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Security & Permissions</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Role-based access:</strong> Granular permission controls for different roles</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Audit trails:</strong> Complete history of all collaboration activities</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Encrypted communication:</strong> End-to-end encryption for sensitive discussions</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span><strong>Compliance logging:</strong> Meeting all regulatory requirements</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Integration Capabilities</h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <SpeakerWaveIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Voice Chat</p>
                    <p className="text-sm text-gray-600">Integrated communication</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <VideoCameraIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Video Calls</p>
                    <p className="text-sm text-gray-600">Face-to-face discussions</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <DocumentTextIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Document Share</p>
                    <p className="text-sm text-gray-600">Instant file collaboration</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <ArrowsPointingInIcon className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                    <p className="font-medium text-gray-900">Screen Share</p>
                    <p className="text-sm text-gray-600">Share any application</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Team Workflow */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Streamlined Team Workflows</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-600">1</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Strategy Discussion</h3>
                  <p className="text-gray-600">
                    Team collaborates on trading strategies using shared whiteboards and real-time discussion
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">2</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Trade Execution</h3>
                  <p className="text-gray-600">
                    Execute trades collaboratively with team oversight, approvals, and real-time monitoring
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-600">3</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Performance Review</h3>
                  <p className="text-gray-600">
                    Analyze results together, discuss outcomes, and identify improvement opportunities
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-orange-600">4</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Optimization</h3>
                  <p className="text-gray-600">
                    Apply learnings to future strategies with shared insights and documented best practices
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Success Metrics */}
          <section className="mb-16">
            <div className="bg-gray-100 rounded-2xl p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Collaboration Success Stories</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-green-600 mb-2">67%</div>
                  <div className="font-semibold text-gray-900 mb-2">Faster Decision Making</div>
                  <p className="text-gray-600 text-sm">
                    Trading desk reduced decision time by 67% through real-time collaboration and shared insights
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-blue-600 mb-2">89%</div>
                  <div className="font-semibold text-gray-900 mb-2">Team Satisfaction</div>
                  <p className="text-gray-600 text-sm">
                    Team members report 89% higher satisfaction with collaboration tools and shared workflows
                  </p>
                </div>
                <div className="bg-white rounded-lg p-6">
                  <div className="text-3xl font-bold text-purple-600 mb-2">45%</div>
                  <div className="font-semibold text-gray-900 mb-2">Fewer Errors</div>
                  <p className="text-gray-600 text-sm">
                    Collaborative oversight reduced trading errors by 45% through team verification and peer review
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Setup Process */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Getting Started with Collaboration</h2>
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Set Up Teams</h3>
                  <p className="text-gray-600">
                    Create teams, define roles, and configure collaboration permissions for your organization
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClockIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule Sessions</h3>
                  <p className="text-gray-600">
                    Organize collaboration sessions, portfolio reviews, and team discussions with integrated scheduling
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Start Collaborating</h3>
                  <p className="text-gray-600">
                    Begin working together in real-time with instant messaging, shared dashboards, and voice/video calls
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-8 text-white">
              <h2 className="text-3xl font-bold mb-4">Transform Your Team's Collaboration</h2>
              <p className="text-xl mb-6 opacity-90">
                Enable seamless real-time collaboration and take your energy trading to the next level with shared insights and coordinated decision-making.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="inline-flex items-center px-6 py-3 bg-white text-green-600 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Start Collaboration Trial
                </a>
                <a 
                  href="/docs/getting-started" 
                  className="inline-flex items-center px-6 py-3 border border-white text-white rounded-lg font-medium hover:bg-white/10 transition-colors"
                >
                  <UsersIcon className="h-4 w-4 mr-2" />
                  Learn Collaboration Features
                </a>
              </div>
            </div>
          </section>
        </div>
      </SectionWrapper>
    </div>
  )
}
