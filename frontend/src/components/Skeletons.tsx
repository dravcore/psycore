export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
    </div>
  );
}

export function SurveyCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full"></div>
        </div>
        <div className="ml-4 h-8 w-8 bg-gray-200 dark:bg-slate-700 rounded-full"></div>
      </div>
      <div className="flex gap-4 mt-4">
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
      <div className="animate-pulse">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-slate-900 px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex gap-4">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100 dark:border-slate-700">
            <div className="flex gap-4">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="animate-pulse">
        {/* Header */}
        <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
        
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 overflow-hidden">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600"></div>
          
          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="border-t border-gray-200 dark:border-slate-700 px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-slate-900 rounded-xl p-4">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-12"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
