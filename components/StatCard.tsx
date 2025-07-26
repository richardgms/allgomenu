interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    text: string;
  };
}

export default function StatCard({ title, value, subtitle, trend }: StatCardProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 sm:p-6 hover:border-gray-200 transition-colors">
      <div className="space-y-1 sm:space-y-2">
        <p className="text-xs sm:text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-xs sm:text-sm text-gray-400">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center space-x-1">
            {trend.direction === 'up' && (
              <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L6.707 7.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend.direction === 'down' && (
              <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 12.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span className={`text-xs ${
              trend.direction === 'up' ? 'text-green-600' : 
              trend.direction === 'down' ? 'text-red-600' : 
              'text-gray-500'
            }`}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}