export default function TestPage() {
  return (
    <div className="min-h-screen bg-blue-500 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Test Page
        </h1>
        <p className="text-gray-600">
          If you can see this styled, Tailwind CSS is working!
        </p>
        <div className="mt-4 space-y-2">
          <div className="bg-red-500 text-white p-2 rounded">Red Box</div>
          <div className="bg-green-500 text-white p-2 rounded">Green Box</div>
          <div className="bg-yellow-500 text-white p-2 rounded">Yellow Box</div>
        </div>
      </div>
    </div>
  )
}
