import { clsx } from 'clsx';

export type StatusTone = 'success' | 'warning' | 'critical' | 'info';

type StatusBadgeProps = {
  tone?: StatusTone;
  children: string;
};

const toneClassMap: Record<StatusTone, string> = {
  success: 'status-badge--success',
  warning: 'status-badge--warning',
  critical: 'status-badge--critical',
  info: 'status-badge--info'
};

const StatusBadge = ({ tone = 'info', children }: StatusBadgeProps) => {
  return <span className={clsx('status-badge', toneClassMap[tone])}>{children}</span>;
};

export default StatusBadge;
