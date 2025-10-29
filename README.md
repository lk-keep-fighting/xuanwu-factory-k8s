# 玄武工厂 · Xuanwu Factory

基于 Kubernetes 的一站式交付平台原型，聚合了类似 Dokploy 的核心能力：

- **GitLab 集成**：同步项目、分支与流水线，提交即触发构建与部署。
- **灵活构建**：支持 Dockerfile 与 Docker Compose，配置化定义流水线。
- **数据库管理**：一键部署 MySQL、Redis、PostgreSQL 等服务。
- **自动备份**：自定义备份计划、跨区域存储与恢复流程。
- **多环境部署**：生产、预览、测试多环境编排与发布策略。
- **资源监控**：实时监控 CPU、内存、网络资源与节点状态。
- **日志查看**：聚合部署、Kubernetes 事件及应用标准输出。

## 技术栈

- [React 18](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [lucide-react](https://lucide.dev/) 图标组件

## 本地运行

```bash
npm install
npm run dev
```

默认服务运行在 `http://localhost:5173`。

## 目录结构

```
.
├── public/             # 静态资源
├── src/
│   ├── components/     # 可复用界面组件
│   ├── data/           # 预置的模拟数据
│   ├── pages/          # 功能页面
│   └── main.tsx        # 应用入口
├── index.html
├── package.json
└── vite.config.ts
```

> 当前为产品原型，页面数据基于模拟数据与前端实时动态。后续可结合后端 API 与 Kubernetes、GitLab 集成实现完整能力。
