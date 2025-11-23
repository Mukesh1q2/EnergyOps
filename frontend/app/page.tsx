export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            OptiBid Energy Platform
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Advanced energy bidding and trading platform with AI-powered optimization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🚀 Quick Start
            </h2>
            <div className="space-y-4">
              <a
                href="/auth/login"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg text-center transition"
              >
                Login to Dashboard
              </a>
              <a
                href="/auth/register"
                className="block w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg text-center transition"
              >
                Create Account
              </a>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              🔐 Test Accounts
            </h2>
            <div className="space-y-3 text-sm">
              <div className="border-l-4 border-blue-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">Admin</p>
                <p className="text-gray-600 dark:text-gray-400">admin@optibid.com / admin123</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">Trader</p>
                <p className="text-gray-600 dark:text-gray-400">trader@optibid.com / trader123</p>
              </div>
              <div className="border-l-4 border-yellow-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">Analyst</p>
                <p className="text-gray-600 dark:text-gray-400">analyst@optibid.com / analyst123</p>
              </div>
              <div className="border-l-4 border-gray-500 pl-4">
                <p className="font-semibold text-gray-900 dark:text-white">Viewer</p>
                <p className="text-gray-600 dark:text-gray-400">viewer@optibid.com / viewer123</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Real-time Trading
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Live market data and instant bid execution
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              AI-Powered Optimization
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Machine learning for bid optimization
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive dashboards and reports
            </p>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            API Documentation: <a href="http://localhost:8000/api/docs" className="text-blue-600 hover:underline" target="_blank">http://localhost:8000/api/docs</a>
          </p>
        </div>
      </div>
    </div>
  )
}
