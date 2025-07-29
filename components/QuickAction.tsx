import Link from 'next/link';
import { DashboardIcon } from '@/components/ui/Icon';
import { Badge } from '@/components/ui/badge';

interface QuickActionProps {
  title: string;
  description: string;
  href: string;
  badge?: string;
  disabled?: boolean;
  icon?: 'orders' | 'products' | 'categories' | 'reports' | 'settings';
}

export default function QuickAction({ title, description, href, badge, disabled, icon }: QuickActionProps) {
  if (disabled) {
    return (
      <div className="bg-primaria-200 border border-primaria-200 rounded-xl shadow-sm p-4 sm:p-6 opacity-60 cursor-not-allowed">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {icon && (
                <div className="p-3 rounded-xl bg-primaria-100">
                  <DashboardIcon type={icon} size="md" className="text-primaria-700" />
                </div>
              )}
              <div>
                <h3 className="text-sm sm:text-base font-bold text-primaria-900">{title}</h3>
                <p className="text-xs sm:text-sm text-primaria-700 mt-1">{description}</p>
              </div>
            </div>
            {badge && (
              <Badge variant="secondary" size="sm" outline>
                {badge}
              </Badge>
            )}
          </div>
          <div className="pt-2">
            <Badge variant="warning" size="sm" outline>
              Em breve
            </Badge>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <Link 
      href={href}
      className="bg-gradient-to-br from-white via-primaria-50 to-white border border-primaria-200 rounded-xl shadow-sm hover:shadow-md p-4 sm:p-6 block transition-all duration-200 hover:scale-[1.02] group"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-3 rounded-xl transition-all duration-200 group-hover:scale-110 bg-gradient-to-br from-primaria-100 to-primaria-50">
                <DashboardIcon type={icon} size="md" className="text-primaria-700" />
              </div>
            )}
            <div>
              <h3 className="text-sm sm:text-base font-bold transition-colors text-primaria-900">
                {title}
              </h3>
              <p className="text-xs sm:text-sm mt-1 text-primaria-700">
                {description}
              </p>
            </div>
          </div>
          {badge && (
            <Badge variant="primary" size="sm" outline>
              {badge}
            </Badge>
          )}
        </div>
        
        {/* Indicador de ação */}
        <div className="flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-200">
          <div className="flex items-center space-x-1 text-xs text-primaria-700">
            <span>Acessar</span>
            <DashboardIcon type="chevronRight" size="xs" />
          </div>
        </div>
      </div>
    </Link>
  );
}