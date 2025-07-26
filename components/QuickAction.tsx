import Link from 'next/link';

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
  disabled?: boolean;
}

export default function QuickAction({ title, description, href, badge, disabled }: QuickActionProps) {
  if (disabled) {
    return (
      <div className="block p-4 sm:p-6 bg-white border border-gray-100 rounded-lg opacity-50 cursor-not-allowed">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-gray-500">{description}</p>
          <span className="text-xs text-gray-400 italic">Em breve</span>
        </div>
      </div>
    );
  }
  
  return (
    <Link 
      href={href}
      className="block p-4 sm:p-6 bg-white border border-gray-100 rounded-lg transition-all duration-200 hover:border-gray-200 hover:shadow-sm"
    >
      <div className="space-y-1 sm:space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {badge}
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}