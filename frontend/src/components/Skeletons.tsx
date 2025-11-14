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

export function SurveyDetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
          </div>
          <div className="ml-6 h-10 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg"></div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-20 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-16"></div>
            </div>
          ))}
        </div>

        {/* Questions Section */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-6 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SurveyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SurveyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function AIInsightsSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-6">
        {/* Header */}
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-64 mb-6"></div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-slate-700">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-3"></div>
              <div className="h-10 bg-gray-200 dark:bg-slate-700 rounded w-20"></div>
            </div>
          ))}
        </div>

        {/* Sentiment Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-6"></div>
          <div className="h-64 bg-gray-100 dark:bg-slate-900 rounded-lg"></div>
        </div>

        {/* Key Insights */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-2 h-2 bg-gray-200 dark:bg-slate-700 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-4/5"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Response List */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-slate-700">
          <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
