export type DeploymentStrategy = 'dockerfile' | 'compose';

export type Project = {
  id: string;
  name: string;
  repository: string;
  gitlabGroup: string;
  branch: string;
  status: '运行中' | '构建中' | '失败';
  lastDeployedAt: string;
  deploymentStrategy: DeploymentStrategy;
  environments: Environment['type'][];
};

export type Environment = {
  name: string;
  type: '生产' | '预览' | '测试';
  cluster: string;
  url: string;
  replicas: number;
  cpu: string;
  memory: string;
  status: '健康' | '告警' | '异常';
};

export type DatabaseService = {
  id: string;
  type: 'MySQL' | 'Redis' | 'PostgreSQL';
  version: string;
  status: '运行中' | '初始化' | '暂停';
  storage: string;
  connectionUri: string;
  autoBackup: boolean;
  lastBackupAt: string;
};

export type BackupPolicy = {
  id: string;
  name: string;
  target: string;
  schedule: string;
  retention: string;
  status: '启用' | '暂停';
  lastRun: string;
};

export type PipelineActivity = {
  id: string;
  projectId: string;
  stage: '构建' | '部署' | '发布';
  status: '成功' | '运行中' | '失败';
  duration: string;
  triggeredBy: string;
  startedAt: string;
};

export type InfrastructureNode = {
  name: string;
  role: '控制面' | '工作节点';
  zone: string;
  kubernetesVersion: string;
  cpu: string;
  memory: string;
  pods: string;
  status: '就绪' | '维护中';
};

export const projects: Project[] = [
  {
    id: 'project-analytics',
    name: '玄武数据平台',
    repository: 'git@gitlab.com:xuanwu/analytics.git',
    gitlabGroup: 'xuanwu-platform',
    branch: 'main',
    status: '运行中',
    lastDeployedAt: '2024-10-24 14:36',
    deploymentStrategy: 'compose',
    environments: ['生产', '预览']
  },
  {
    id: 'project-gateway',
    name: 'API 网关',
    repository: 'git@gitlab.com:xuanwu/gateway.git',
    gitlabGroup: 'xuanwu-edge',
    branch: 'develop',
    status: '构建中',
    lastDeployedAt: '2024-10-29 09:24',
    deploymentStrategy: 'dockerfile',
    environments: ['生产', '测试']
  },
  {
    id: 'project-console',
    name: '玄武前端控制台',
    repository: 'git@gitlab.com:xuanwu/console.git',
    gitlabGroup: 'xuanwu-ux',
    branch: 'release/1.3.0',
    status: '失败',
    lastDeployedAt: '2024-10-28 21:16',
    deploymentStrategy: 'dockerfile',
    environments: ['预览']
  }
];

export const environments: Environment[] = [
  {
    name: 'Production-CN',
    type: '生产',
    cluster: 'k8s-cn-prod',
    url: 'https://prod.xuanwu.cloud',
    replicas: 12,
    cpu: '34 cores',
    memory: '96 GiB',
    status: '健康'
  },
  {
    name: 'Preview-SEA',
    type: '预览',
    cluster: 'k8s-sea-preview',
    url: 'https://preview.xuanwu.cloud',
    replicas: 6,
    cpu: '10 cores',
    memory: '32 GiB',
    status: '告警'
  },
  {
    name: 'Testing-CI',
    type: '测试',
    cluster: 'k8s-ci',
    url: 'https://ci.xuanwu.cloud',
    replicas: 4,
    cpu: '6 cores',
    memory: '16 GiB',
    status: '健康'
  }
];

export const databases: DatabaseService[] = [
  {
    id: 'mysql-core',
    type: 'MySQL',
    version: '8.0.36',
    status: '运行中',
    storage: '500 GiB',
    connectionUri: 'mysql://mysql-core:3306',
    autoBackup: true,
    lastBackupAt: '2024-10-29 04:00'
  },
  {
    id: 'redis-session',
    type: 'Redis',
    version: '7.2',
    status: '运行中',
    storage: '64 GiB',
    connectionUri: 'redis://redis-session:6379',
    autoBackup: false,
    lastBackupAt: '未设置'
  },
  {
    id: 'pgsql-reporting',
    type: 'PostgreSQL',
    version: '15',
    status: '初始化',
    storage: '120 GiB',
    connectionUri: 'postgres://pgsql-reporting:5432',
    autoBackup: true,
    lastBackupAt: '等待首次备份'
  }
];

export const backupPolicies: BackupPolicy[] = [
  {
    id: 'policy-daily-prod',
    name: '生产数据库每日快照',
    target: 'mysql-core',
    schedule: '每天 04:00',
    retention: '保留 14 天',
    status: '启用',
    lastRun: '2024-10-29 04:02'
  },
  {
    id: 'policy-weekly-redis',
    name: 'Redis Session 每周备份',
    target: 'redis-session',
    schedule: '每周日 02:00',
    retention: '保留 4 周',
    status: '暂停',
    lastRun: '2024-10-13 02:04'
  },
  {
    id: 'policy-weekly-reporting',
    name: '报表库全量备份',
    target: 'pgsql-reporting',
    schedule: '每周三 01:00',
    retention: '保留 8 周',
    status: '启用',
    lastRun: '等待首次运行'
  }
];

export const pipelineActivities: PipelineActivity[] = [
  {
    id: 'pipeline-001',
    projectId: 'project-analytics',
    stage: '部署',
    status: '成功',
    duration: '3m21s',
    triggeredBy: 'yang.liu',
    startedAt: '2024-10-29 09:20'
  },
  {
    id: 'pipeline-002',
    projectId: 'project-gateway',
    stage: '构建',
    status: '运行中',
    duration: '1m12s',
    triggeredBy: 'ci-bot',
    startedAt: '2024-10-29 09:28'
  },
  {
    id: 'pipeline-003',
    projectId: 'project-console',
    stage: '构建',
    status: '失败',
    duration: '45s',
    triggeredBy: 'wang.qing',
    startedAt: '2024-10-28 21:10'
  }
];

export const infrastructureNodes: InfrastructureNode[] = [
  {
    name: 'cn-prod-master-01',
    role: '控制面',
    zone: 'cn-beijing-a',
    kubernetesVersion: '1.29.3',
    cpu: '16 cores (58%)',
    memory: '32 GiB (46%)',
    pods: '32 / 110',
    status: '就绪'
  },
  {
    name: 'cn-prod-worker-04',
    role: '工作节点',
    zone: 'cn-beijing-b',
    kubernetesVersion: '1.29.3',
    cpu: '32 cores (73%)',
    memory: '128 GiB (68%)',
    pods: '64 / 110',
    status: '就绪'
  },
  {
    name: 'sea-preview-worker-02',
    role: '工作节点',
    zone: 'sea-singapore-a',
    kubernetesVersion: '1.28.2',
    cpu: '16 cores (89%)',
    memory: '64 GiB (82%)',
    pods: '48 / 110',
    status: '维护中'
  }
];

export const initialLogs: string[] = [
  '[2024-10-29 09:32:12] [INFO] 应用 API 网关 正在准备构建上下文',
  '[2024-10-29 09:32:15] [INFO] Dockerfile 已解析，开始构建镜像 ci-registry.gitlab.com/xuanwu/gateway:latest',
  '[2024-10-29 09:32:44] [INFO] 镜像构建完成，推送至 Registry',
  '[2024-10-29 09:32:50] [INFO] 部署 pipeline-002 已启动，目标集群 k8s-cn-prod',
  '[2024-10-29 09:33:04] [ERROR] Pod gateway-78f8d7 构建失败，原因：容器健康检查超时',
  '[2024-10-29 09:33:06] [WARN] 自动回滚至上一版本成功',
  '[2024-10-29 09:33:10] [INFO] 等待开发者确认新的 Compose 配置'
];
