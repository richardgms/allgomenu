interface StatusBadgeProps {
  status: 'open' | 'closed' | 'pending' | 'active';
  text: string;
  size?: 'sm' | 'md';
}

export default function StatusBadge({ status, text, size = 'sm' }: StatusBadgeProps) {
  const getStatusStyles = () => {
    switch (status) {
      case 'open':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'closed':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'active':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const sizeClasses = size === 'md' ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs';

  return (
    <span className={`inline-flex items-center font-medium border rounded-full ${getStatusStyles()} ${sizeClasses}`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'open' ? 'bg-green-500' :
        status === 'closed' ? 'bg-gray-400' :
        status === 'pending' ? 'bg-amber-500' :
        'bg-blue-500'
      }`} />
      {text}
    </span>
  );
}