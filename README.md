# 玄武工厂 · Xuanwu Factory

基于 Kubernetes 和 Supabase 的一站式交付平台，提供完整的项目管理和应用部署能力：

## 核心功能

### 项目管理（参考 Dokploy）
- **项目创建**：每个项目对应一个独立的 Kubernetes 命名空间
- **项目详情**：多标签页展示项目信息、应用列表、活动历史
- **项目复制**：支持批量复制项目配置和应用到新项目
- **统计面板**：实时显示项目数、应用数、部署状态等
- **卡片式布局**：直观展示项目信息和快速操作
- **命名空间隔离**：基于 K8s namespace 实现项目资源隔离

### GitLab 集成
- **多实例支持**：支持 GitLab.com 和自托管 GitLab 实例
- **连接管理**：配置 GitLab Access Token，自动同步仓库信息
- **分支选择**：为每个应用指定部署的 GitLab 仓库和分支

### 应用部署流程
- **应用创建**：在项目中创建应用，关联 GitLab 仓库
- **灵活构建**：支持自定义 Dockerfile 或使用内置模板
- **构建模板**：内置 Java 17/21、Python、Node.js 等构建模板
- **实时部署**：一键部署，实时查看构建和部署日志
- **部署历史**：记录所有部署版本和状态

### 内置构建模板
- **Java 17 Spring Boot**：Maven + Eclipse Temurin 17
- **Java 21 Spring Boot**：Maven + Eclipse Temurin 21
- **Python FastAPI**：Python 3.11 + uvicorn
- **Node.js**：Node.js 20 + npm

### 其他能力
- **数据库管理**：一键部署 MySQL、Redis、PostgreSQL 等服务
- **自动备份**：自定义备份计划、跨区域存储与恢复流程
- **多环境部署**：生产、预览、测试多环境编排与发布策略
- **资源监控**：实时监控 CPU、内存、网络资源与节点状态
- **日志查看**：聚合部署、Kubernetes 事件及应用标准输出

## 技术栈

- [React 18](https://react.dev/) - 前端框架
- [TypeScript](https://www.typescriptlang.org/) - 类型安全
- [Vite](https://vitejs.dev/) - 构建工具
- [Tailwind CSS](https://tailwindcss.com/) - CSS框架
- [shadcn/ui](https://ui.shadcn.com/) - UI组件库
- [Supabase](https://supabase.com/) - 后端数据库和实时订阅
- [Kubernetes Client](https://www.npmjs.com/package/@kubernetes/client-node) - K8s SDK
- [lucide-react](https://lucide.dev/) - 图标组件

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

复制环境变量模板：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入你的 Supabase 配置：

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 初始化数据库

在 Supabase SQL 编辑器中执行 `supabase-schema.sql` 文件，创建所需的表和初始数据。

### 4. 启动开发服务器

```bash
npm run dev
```

默认服务运行在 `http://localhost:5173`。

## 目录结构

```
.
├── public/                 # 静态资源
├── src/
│   ├── components/         # 可复用界面组件
│   │   ├── layout/         # 布局组件
│   │   └── ui/             # shadcn/ui 组件
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── badge.tsx
│   │       ├── textarea.tsx
│   │       └── tabs.tsx
│   ├── data/               # 数据类型和导航配置
│   ├── lib/                # 核心库
│   │   ├── supabase.ts          # Supabase 客户端
│   │   ├── database.types.ts    # 数据库类型定义
│   │   ├── k8s-config.ts        # Kubernetes 配置
│   │   └── utils.ts             # 工具函数
│   ├── pages/              # 页面组件
│   │   ├── ProjectManagement.tsx      # 项目管理（Dokploy风格）
│   │   ├── ProjectDetail.tsx          # 项目详情（多标签页）
│   │   ├── ApplicationManagement.tsx  # 应用管理
│   │   ├── ApplicationDeployment.tsx  # 应用部署
│   │   └── GitLabIntegration.tsx      # GitLab 集成
│   ├── services/           # 业务服务层
│   │   ├── projectService.ts          # 项目服务
│   │   ├── applicationService.ts      # 应用服务
│   │   ├── deploymentService.ts       # 部署服务
│   │   ├── gitlabService.ts           # GitLab 服务
│   │   └── buildTemplateService.ts    # 构建模板服务
│   ├── App.tsx             # 路由配置
│   └── main.tsx            # 应用入口
├── supabase-schema.sql     # 数据库 Schema
├── .env.example            # 环境变量模板
├── index.html
├── package.json
└── vite.config.ts
```

## 使用指南

### 1. 创建项目

1. 访问「项目管理」页面
2. 点击「新建项目」按钮
3. 填写项目名称和 Kubernetes 命名空间
4. 点击「创建」完成项目创建

### 2. 配置 GitLab 集成

1. 访问「GitLab 集成」页面
2. 点击「添加 GitLab 配置」
3. 填写 GitLab URL 和 Access Token
4. 点击「测试连接」验证配置
5. 保存配置

### 3. 创建应用

1. 在项目管理页面点击「管理应用」
2. 点击「新建应用」
3. 填写应用信息：
   - 应用名称
   - GitLab 仓库地址
   - 部署分支
   - 构建方式（Dockerfile 或模板）
4. 创建应用

### 4. 部署应用

1. 在应用列表中点击「部署」按钮
2. 填写版本号
3. 点击「开始部署」
4. 实时查看构建和部署日志
5. 部署完成后应用即可访问

## 开发说明

- 所有业务逻辑封装在 `services/` 目录中
- 使用 Supabase 提供的实时订阅功能监听部署状态变化
- 构建模板支持通过占位符 `{{VARIABLE}}` 进行参数化配置
- 项目复制功能会自动复制所有关联的应用配置
- UI组件使用 shadcn/ui 和 Tailwind CSS 构建
- Kubernetes 集成通过 `kubernetesService` 实现

## Kubernetes 集成

玄武工厂已集成 Kubernetes SDK，支持：

- ✅ 自动创建和管理 Kubernetes 命名空间
- ✅ 生成标准的 Deployment 和 Service manifests
- ✅ 部署应用到 Kubernetes 集群
- ✅ 实时查看部署进度和日志
- ✅ Pod 状态监控

详见：[K8S_DEPLOYMENT.md](./K8S_DEPLOYMENT.md)

## 项目管理功能（Dokploy 风格）

本项目的项目管理功能参考了 [Dokploy](https://dokploy.com/) 的设计理念：

### 主要特性
- ✅ **卡片式项目列表**: 清晰的视觉层次和信息展示
- ✅ **统计面板**: 实时显示系统状态和关键指标
- ✅ **项目详情多标签页**: 概览、应用、活动、设置
- ✅ **状态徽章**: 直观的颜色编码系统
- ✅ **快速操作**: 常用功能一键触达

详见：[PROJECT_MANAGEMENT_DOKPLOY.md](./PROJECT_MANAGEMENT_DOKPLOY.md)

## 后续规划

- [x] Kubernetes SDK集成
- [x] shadcn/ui UI组件重构
- [x] Dokploy 风格项目管理
- [x] 项目详情多标签页
- [ ] GitLab Webhook 自动触发部署
- [ ] 应用配置管理（环境变量、ConfigMap）
- [ ] Ingress 和域名绑定
- [ ] 应用回滚功能
- [ ] 多用户和权限管理
- [ ] CI/CD Pipeline 可视化编辑
- [ ] 实际的 Docker 镜像构建集成
