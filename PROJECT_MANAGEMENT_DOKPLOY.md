# 项目管理功能 - Dokploy 风格实现

## 概述

本次更新参考 Dokploy 的项目管理功能，使用 shadcn/ui 组件重构了整个项目管理系统，提供了更加专业和友好的用户界面。

## 主要改进

### 1. 项目管理页面 (ProjectManagement)

#### 新增功能
- **统计面板**: 显示项目总数、应用总数、命名空间数量
- **卡片式布局**: 每个项目以卡片形式展示，包含详细信息
- **快速操作**: 查看详情、管理应用、复制项目、删除项目
- **实时统计**: 显示每个项目的应用数量和部署数量
- **元数据展示**: 创建时间、创建者等信息

#### UI 组件
- 使用 shadcn/ui Button 组件
- 使用 Card 组件展示项目
- 使用 Dialog 组件处理创建和复制操作
- 使用 Badge 组件展示命名空间
- 使用 Input、Label、Textarea 等表单组件

#### 路由结构
```
/project-management
  - 项目列表
  - 创建项目
  - 复制项目
```

### 2. 项目详情页面 (ProjectDetail) [新增]

#### 功能特性
- **多标签页导航**: 概览、应用、活动、设置
- **统计仪表板**: 应用数量、部署总数、成功率、创建时间
- **概览标签**: 
  - 项目基本信息
  - Kubernetes 资源使用情况
- **应用标签**: 
  - 项目下所有应用列表
  - 应用状态和元信息
- **活动标签**: 
  - 项目和应用的操作历史
  - 时间线展示
- **设置标签**: 
  - 危险操作区域
  - 项目删除等功能

#### 路由结构
```
/projects/:projectId
  - 项目详情
  - 多标签页面
```

### 3. 应用管理页面 (ApplicationManagement)

#### 新增功能
- **面包屑导航**: 返回项目管理、显示当前项目
- **状态统计**: 应用总数、运行中、构建中、失败
- **状态徽章**: 不同颜色表示应用状态
- **构建类型标签**: Java 17/21、Python、Node.js、Dockerfile
- **快速操作**: 部署、配置、删除
- **时间格式化**: 友好的日期时间显示

#### UI 改进
- 列表式卡片布局
- 清晰的应用信息展示
- 状态颜色编码
- 响应式设计

#### 路由结构
```
/projects/:projectId/applications
  - 应用列表
  - 创建应用
```

### 4. GitLab 集成页面

保持原有功能，使用 shadcn/ui 组件进行了 UI 优化。

## shadcn/ui 组件库

### 已集成的组件

1. **Button**: 多种变体和大小
   - default, destructive, outline, secondary, ghost, link
   - default, sm, lg, icon

2. **Card**: 完整的卡片系统
   - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

3. **Dialog**: 模态对话框
   - Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter

4. **Input**: 输入框组件
   - 支持所有标准 HTML input 属性
   - 一致的样式和交互

5. **Label**: 标签组件
   - 与表单控件配合使用

6. **Badge**: 徽章组件
   - success, warning, info, destructive, outline

7. **Textarea**: 文本域组件
   - 多行文本输入

8. **Tabs**: 标签页组件 [新增]
   - Tabs, TabsList, TabsTrigger, TabsContent

### 设计系统

#### 颜色变量
```css
--primary: 243 75% 59%
--secondary: 210 40% 96.1%
--destructive: 0 84.2% 60.2%
--muted: 210 40% 96.1%
--accent: 210 40% 96.1%
```

#### 组件样式
- 圆角: 8-16px
- 间距: 标准 Tailwind spacing
- 阴影: 渐进式提升
- 过渡: 200ms ease-out

## 响应式设计

### 断点
- sm: 640px
- md: 768px
- lg: 1024px
- xl: 1280px
- 2xl: 1400px

### 网格系统
- 项目列表: `md:grid-cols-2 lg:grid-cols-3`
- 统计卡片: `md:grid-cols-3` 或 `md:grid-cols-4`
- 表单: `grid-cols-2` 响应式布局

## 用户体验改进

### 1. 加载状态
```tsx
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
```

### 2. 空状态
```tsx
<Card className="py-16">
  <CardContent className="text-center">
    <Icon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">标题</h3>
    <p className="text-muted-foreground mb-6">描述</p>
    <Button>操作</Button>
  </CardContent>
</Card>
```

### 3. 悬停效果
```tsx
<Card className="hover:shadow-lg transition-shadow">
```

### 4. 状态徽章
```tsx
const getStatusBadge = (status) => {
  const config = {
    deployed: { label: '已部署', variant: 'success' },
    building: { label: '构建中', variant: 'info' },
    failed: { label: '失败', variant: 'destructive' },
  };
  return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
};
```

## 数据流

### 项目管理流程
```
加载项目列表
  ↓
加载项目统计 (应用数、部署数)
  ↓
显示项目卡片
  ↓
用户操作 (查看/管理/复制/删除)
```

### 应用管理流程
```
加载项目信息
  ↓
加载应用列表
  ↓
加载 GitLab 配置
  ↓
加载构建模板
  ↓
显示应用列表和统计
  ↓
用户操作 (部署/配置/删除)
```

### 项目详情流程
```
加载项目信息
  ↓
加载应用列表
  ↓
计算部署统计
  ↓
显示多标签页内容
  ↓
用户在标签页间切换
```

## 性能优化

### 1. 懒加载
- 使用 React.lazy 和 Suspense（未来）
- 分标签页加载内容

### 2. 并行请求
```tsx
const [projectData, appsData, templatesData] = await Promise.all([
  projectService.getProjectById(projectId),
  projectService.getProjectApplications(projectId),
  buildTemplateService.getAllTemplates(),
]);
```

### 3. 缓存策略
- 使用 React state 缓存数据
- 避免重复请求

## 代码组织

### 页面组件
```
src/pages/
├── ProjectManagement.tsx     # 项目管理主页
├── ProjectDetail.tsx         # 项目详情页（新增）
├── ApplicationManagement.tsx # 应用管理页
├── ApplicationDeployment.tsx # 应用部署页
└── GitLabIntegration.tsx     # GitLab 集成页
```

### UI 组件
```
src/components/ui/
├── button.tsx       # 按钮组件
├── card.tsx         # 卡片组件
├── dialog.tsx       # 对话框组件
├── input.tsx        # 输入框组件
├── label.tsx        # 标签组件
├── badge.tsx        # 徽章组件
├── textarea.tsx     # 文本域组件
└── tabs.tsx         # 标签页组件（新增）
```

### 服务层
```
src/services/
├── projectService.ts         # 项目服务
├── applicationService.ts     # 应用服务
├── deploymentService.ts      # 部署服务
├── gitlabService.ts          # GitLab 服务
├── buildTemplateService.ts   # 构建模板服务
└── kubernetesService.ts      # Kubernetes 服务
```

## 与 Dokploy 的对比

### 相似之处
1. **卡片式项目列表**: 清晰的视觉层次
2. **统计面板**: 快速了解系统状态
3. **多标签页详情**: 组织复杂信息
4. **状态徽章**: 直观的状态展示
5. **快速操作**: 常用功能一键触达

### 特色功能
1. **K8s 命名空间**: 与项目一一对应
2. **项目复制**: 批量复制配置和应用
3. **GitLab 深度集成**: 仓库和分支管理
4. **构建模板**: 预定义的构建配置
5. **实时部署日志**: 流式日志输出

## 未来扩展

### 短期规划
- [ ] 项目设置页面（环境变量、密钥）
- [ ] 应用详情页面（配置、日志、监控）
- [ ] 批量操作（多选、批量部署）
- [ ] 搜索和过滤功能
- [ ] 项目分组和标签

### 中期规划
- [ ] 团队和权限管理
- [ ] 审计日志
- [ ] 通知和告警
- [ ] 资源配额管理
- [ ] 自动扩缩容配置

### 长期规划
- [ ] 多集群支持
- [ ] 成本分析
- [ ] AI 辅助运维
- [ ] 自定义仪表板
- [ ] 插件系统

## 使用示例

### 创建项目
```tsx
// 1. 点击「新建项目」按钮
// 2. 填写表单
const formData = {
  name: '电商平台',
  namespace: 'ecommerce',
  description: '核心电商业务系统',
};
// 3. 提交创建
await projectService.createProject(formData);
// 4. 自动创建 K8s 命名空间
```

### 复制项目
```tsx
// 1. 在项目卡片上点击复制按钮
// 2. 修改项目名称和命名空间
// 3. 提交复制
await projectService.copyProject(
  sourceProjectId,
  '电商平台 (副本)',
  'ecommerce-copy'
);
// 4. 复制所有应用配置
```

### 创建应用
```tsx
// 1. 进入项目的应用管理页
// 2. 点击「新建应用」
// 3. 填写应用信息
const appData = {
  name: '用户服务',
  gitlab_repo: 'git@gitlab.com:ecommerce/user-service.git',
  gitlab_branch: 'main',
  build_type: 'java17',
  build_config: { PORT: 8080 },
};
// 4. 提交创建
await applicationService.createApplication(appData);
```

## 最佳实践

### 1. 命名空间规范
- 使用小写字母、数字和连字符
- 避免特殊字符
- 保持简短和描述性
- 示例: `ecommerce`, `user-service`, `prod-api`

### 2. 项目组织
- 一个项目对应一个业务领域
- 相关的应用放在同一个项目中
- 合理使用项目描述
- 定期清理不用的项目

### 3. 应用管理
- 应用名称清晰描述功能
- 选择合适的构建方式
- 配置必要的环境变量
- 定期更新和部署

### 4. 权限控制
- 明确项目创建者
- 记录操作日志
- 限制删除权限
- 定期审计

## 总结

通过参考 Dokploy 的设计理念，我们实现了一个现代化、专业的项目管理系统：

✅ **直观的 UI**: shadcn/ui 提供一致的视觉体验
✅ **完整的功能**: 从创建到部署的完整流程
✅ **灵活的架构**: 易于扩展和定制
✅ **良好的性能**: 优化的数据加载和渲染
✅ **响应式设计**: 适配各种设备和屏幕

这为玄武工厂提供了坚实的基础，可以持续迭代和改进，满足企业级应用部署的需求。
