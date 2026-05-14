export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="h-24 border-b border-gray-200 flex items-center justify-between px-8 bg-white">
        <div>
          <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
        </div>
      </div>
      <div className="flex-1 p-8 space-y-6">
        <div className="grid grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="h-16 border-b border-gray-100 bg-gray-50" />
          <div className="divide-y divide-gray-100">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-50 animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}