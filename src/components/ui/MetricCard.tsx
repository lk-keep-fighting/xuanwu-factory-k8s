import { type ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: ReactNode;
  description?: string;
  trend?: ReactNode;
};

const MetricCard = ({ title, value, description, trend }: MetricCardProps) => {
  return (
    <div className="metric-card">
      <div className="metric-card__header">
        <p className="metric-card__title">{title}</p>
        {trend && <span className="metric-card__trend">{trend}</span>}
      </div>
      <div className="metric-card__value">{value}</div>
      {description && <p className="metric-card__description">{description}</p>}
    </div>
  );
};

export default MetricCard;
