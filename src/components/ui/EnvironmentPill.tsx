import { clsx } from 'clsx';

type EnvironmentPillProps = {
  type: '生产' | '预览' | '测试';
};

const EnvironmentPill = ({ type }: EnvironmentPillProps) => {
  return <span className={clsx('environment-pill', `environment-pill--${type}`)}>{type}</span>;
};

export default EnvironmentPill;
