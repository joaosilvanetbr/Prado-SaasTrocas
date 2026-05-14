import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="p-8 text-center">
      {icon && <div className="mb-3 opacity-40">{icon}</div>}
      <p className="text-[#6b7280] text-sm font-medium">{title}</p>
      {description && <p className="text-xs text-[#9ca3af] mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}