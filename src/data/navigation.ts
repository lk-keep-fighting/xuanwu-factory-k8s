import {
  Activity,
  Database,
  GitBranch,
  LayoutDashboard,
  Layers,
  ScrollText,
  Server,
  ShieldCheck
} from 'lucide-react';
import { type ComponentType, type SVGProps } from 'react';

export type NavigationItem = {
  label: string;
  path: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

export const navigationItems: NavigationItem[] = [
  { label: '概览', path: '/', icon: LayoutDashboard },
  { label: '项目与构建', path: '/projects', icon: GitBranch },
  { label: '多环境', path: '/environments', icon: Layers },
  { label: '数据库', path: '/databases', icon: Database },
  { label: '备份策略', path: '/backups', icon: ShieldCheck },
  { label: '资源监控', path: '/monitoring', icon: Activity },
  { label: '实时日志', path: '/logs', icon: ScrollText },
  { label: '基础设施', path: '/infrastructure', icon: Server }
];
