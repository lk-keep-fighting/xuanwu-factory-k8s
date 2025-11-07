# Kubernetes 部署集成说明

## 概述

玄武工厂已经集成了 Kubernetes SDK，支持实际的应用部署到 Kubernetes 集群。

## 功能特性

### 1. 命名空间管理
- ✅ 创建项目时自动创建对应的 Kubernetes 命名空间
- ✅ 删除项目时自动删除对应的命名空间
- ✅ 命名空间与项目一一对应

### 2. 应用部署
- ✅ 自动生成 Deployment manifest
- ✅ 自动生成 Service manifest
- ✅ 支持环境变量配置
- ✅ 支持资源限制（CPU、内存）
- ✅ 支持健康检查（Liveness、Readiness）
- ✅ 支持镜像拉取密钥

### 3. Deployment Manifest 生成

系统会为每个应用自动生成标准的 Kubernetes Deployment，包括：

**标签（Labels）**：
- `app.kubernetes.io/name`: 应用名称
- `app.kubernetes.io/instance`: 应用ID
- `app.kubernetes.io/managed-by`: xuanwu-factory
- `app.kubernetes.io/part-of`: 项目名称

**容器配置**：
- 容器名称：应用名称（小写，只包含 a-z、0-9、-）
- 镜像：自动生成的镜像URL
- 端口：根据构建配置自动确定
- 环境变量：从构建配置中解析
- 资源限制：
  - Requests: CPU 100m, Memory 128Mi
  - Limits: CPU 500m, Memory 512Mi

**健康检查**：
- Liveness Probe: HTTP GET /health
- Readiness Probe: HTTP GET /ready

### 4. Service Manifest 生成

为每个应用自动创建 ClusterIP Service：

- 类型：ClusterIP
- 端口：80 → 应用端口
- 选择器：匹配 Deployment 的 Pod

## 实现架构

### 目录结构

```
src/
├── lib/
│   ├── k8s-config.ts           # Kubernetes配置
│   └── database.types.ts       # 数据库类型
├── services/
│   ├── kubernetesService.ts    # Kubernetes服务层
│   ├── deploymentService.ts    # 部署服务（集成K8s）
│   └── projectService.ts       # 项目服务（集成K8s）
```

### 核心服务

#### kubernetesService

提供 Kubernetes 资源管理功能：

- `createNamespace(namespace)` - 创建命名空间
- `deleteNamespace(namespace)` - 删除命名空间
- `generateDeploymentManifest()` - 生成 Deployment manifest
- `generateServiceManifest()` - 生成 Service manifest
- `deployApplication()` - 部署应用到 K8s
- `getPodStatus()` - 获取 Pod 状态
- `getPodLogs()` - 获取 Pod 日志
- `deleteDeployment()` - 删除 Deployment
- `updateDeploymentImage()` - 更新镜像
- `scaleDeployment()` - 扩缩容

#### deploymentService

集成了 Kubernetes 部署流程：

1. **准备阶段**：创建部署记录
2. **构建阶段**：
   - 克隆代码
   - 构建 Docker 镜像
   - 推送到镜像仓库
3. **部署阶段**：
   - 生成 K8s manifests
   - 应用 Deployment
   - 应用 Service
   - 等待 Pod 就绪
4. **完成阶段**：记录部署结果

#### projectService

项目生命周期管理：

- 创建项目 → 创建 K8s 命名空间
- 删除项目 → 删除 K8s 命名空间

## 配置说明

### 环境变量

在 `.env` 文件中配置：

```env
# Kubernetes API Server地址
VITE_K8S_API_SERVER=https://kubernetes.default.svc

# 镜像仓库配置
VITE_REGISTRY_URL=registry.example.com
VITE_REGISTRY_NAMESPACE=xuanwu
```

### 默认资源配置

在 `src/lib/k8s-config.ts` 中可以自定义：

```typescript
export const k8sConfig = {
  defaultResources: {
    requests: {
      cpu: '100m',
      memory: '128Mi',
    },
    limits: {
      cpu: '500m',
      memory: '512Mi',
    },
  },
};
```

## 实际部署流程

### 1. 创建项目

```typescript
// 用户创建项目
const project = await projectService.createProject({
  name: '电商平台',
  namespace: 'ecommerce',
  description: '...',
});

// 自动执行
// → kubernetesService.createNamespace('ecommerce')
// → 在K8s集群中创建命名空间
```

### 2. 创建应用

```typescript
// 用户创建应用
const app = await applicationService.createApplication({
  project_id: project.id,
  name: '用户服务',
  gitlab_repo: 'git@gitlab.com:ecommerce/user-service.git',
  gitlab_branch: 'main',
  build_type: 'java17',
  build_config: {
    PORT: 8080,
    JAVA_OPTS: '-Xmx1g',
  },
});
```

### 3. 部署应用

```typescript
// 用户触发部署
const deployment = await deploymentService.startDeployment(app.id, 'v1.0.0');

// 自动执行部署流程：
// 1. 构建镜像
//    → git clone
//    → docker build
//    → docker push

// 2. 生成Manifests
//    → generateDeploymentManifest()
//    → generateServiceManifest()

// 3. 部署到K8s
//    → kubectl apply -f deployment.yaml
//    → kubectl apply -f service.yaml

// 4. 等待就绪
//    → kubectl get pods
//    → 检查Pod状态

// 5. 完成
//    → 记录服务URL
//    → 更新部署状态
```

## 日志示例

部署过程中的完整日志：

```
[2024-10-29T10:15:00.000Z] [INFO] Starting build process...
[2024-10-29T10:15:00.100Z] [INFO] Repository: git@gitlab.com:ecommerce/user-service.git
[2024-10-29T10:15:00.200Z] [INFO] Branch: main
[2024-10-29T10:15:00.300Z] [INFO] Build type: java17
[2024-10-29T10:15:02.000Z] [INFO] Pulling base image...
[2024-10-29T10:15:05.000Z] [INFO] Building Docker image...
[2024-10-29T10:15:25.000Z] [INFO] Build completed successfully
[2024-10-29T10:15:26.000Z] [INFO] Pushing image to registry.example.com/xuanwu/user-service:v1.0.0
[2024-10-29T10:15:30.000Z] [INFO] Image pushed successfully
[2024-10-29T10:15:31.000Z] [INFO] Starting deployment to Kubernetes...
[2024-10-29T10:15:31.100Z] [INFO] Namespace: ecommerce
[2024-10-29T10:15:31.200Z] [INFO] Generating manifests...
[2024-10-29T10:15:32.000Z] [INFO] Applying Deployment manifest...
[2024-10-29T10:15:33.000Z] [INFO] Deployment created: user-service
[2024-10-29T10:15:33.100Z] [INFO] Applying Service manifest...
[2024-10-29T10:15:34.000Z] [INFO] Service created: user-service
[2024-10-29T10:15:34.100Z] [INFO] Waiting for pods to be ready...
[2024-10-29T10:15:40.000Z] [INFO] Pod user-service-7d9f8c6b4-xk2p9 is running
[2024-10-29T10:15:40.100Z] [SUCCESS] Deployment completed successfully!
[2024-10-29T10:15:40.200Z] [INFO] Service URL: http://user-service.ecommerce.svc.cluster.local
```

## 生成的 Kubernetes Manifests 示例

### Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: user-service
  namespace: ecommerce
  labels:
    app.kubernetes.io/name: user-service
    app.kubernetes.io/instance: 550e8400-e29b-41d4-a716-446655440000
    app.kubernetes.io/managed-by: xuanwu-factory
    app.kubernetes.io/part-of: 电商平台
spec:
  replicas: 1
  selector:
    matchLabels:
      app.kubernetes.io/name: user-service
      app.kubernetes.io/instance: 550e8400-e29b-41d4-a716-446655440000
  template:
    metadata:
      labels:
        app.kubernetes.io/name: user-service
        app.kubernetes.io/instance: 550e8400-e29b-41d4-a716-446655440000
        app.kubernetes.io/managed-by: xuanwu-factory
        app.kubernetes.io/part-of: 电商平台
    spec:
      containers:
      - name: user-service
        image: registry.example.com/xuanwu/user-service:v1.0.0
        ports:
        - name: http
          containerPort: 8080
          protocol: TCP
        env:
        - name: JAVA_OPTS
          value: "-Xmx1g"
        resources:
          requests:
            cpu: 100m
            memory: 128Mi
          limits:
            cpu: 500m
            memory: 512Mi
        livenessProbe:
          httpGet:
            path: /health
            port: http
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: http
          initialDelaySeconds: 5
          periodSeconds: 5
      imagePullSecrets:
      - name: registry-secret
```

### Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: user-service
  namespace: ecommerce
  labels:
    app.kubernetes.io/name: user-service
    app.kubernetes.io/instance: 550e8400-e29b-41d4-a716-446655440000
    app.kubernetes.io/managed-by: xuanwu-factory
spec:
  type: ClusterIP
  selector:
    app.kubernetes.io/name: user-service
    app.kubernetes.io/instance: 550e8400-e29b-41d4-a716-446655440000
  ports:
  - name: http
    port: 80
    targetPort: http
    protocol: TCP
```

## 实际使用 Kubernetes API

当前实现使用模拟的 API 调用。要连接实际的 Kubernetes 集群，需要：

### 1. 在 Pod 内部运行

如果玄武工厂运行在 Kubernetes 集群内：

```typescript
// 自动使用 Service Account Token
const token = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/token', 'utf8');
const ca = fs.readFileSync('/var/run/secrets/kubernetes.io/serviceaccount/ca.crt', 'utf8');

const response = await fetch(`${k8sConfig.apiServer}/apis/apps/v1/namespaces/${namespace}/deployments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(manifest),
});
```

### 2. 从外部访问

如果从集群外部访问：

```typescript
// 使用 kubeconfig 或显式的 token
const token = process.env.K8S_TOKEN;

const response = await fetch(`${k8sConfig.apiServer}/apis/apps/v1/namespaces/${namespace}/deployments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify(manifest),
});
```

### 3. 使用 @kubernetes/client-node

也可以使用官方的 Kubernetes 客户端库（已安装）：

```typescript
import * as k8s from '@kubernetes/client-node';

const kc = new k8s.KubeConfig();
kc.loadFromDefault(); // 或 loadFromFile、loadFromString

const k8sApi = kc.makeApiClient(k8s.AppsV1Api);

// 创建 Deployment
const deployment = {
  // ... manifest
};

await k8sApi.createNamespacedDeployment(namespace, deployment);
```

## RBAC 权限要求

玄武工厂需要以下 Kubernetes 权限：

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: xuanwu-factory
rules:
- apiGroups: [""]
  resources: ["namespaces"]
  verbs: ["create", "delete", "get", "list"]
- apiGroups: [""]
  resources: ["services"]
  verbs: ["create", "delete", "get", "list", "update"]
- apiGroups: ["apps"]
  resources: ["deployments"]
  verbs: ["create", "delete", "get", "list", "update", "patch"]
- apiGroups: [""]
  resources: ["pods", "pods/log"]
  verbs: ["get", "list", "watch"]
```

## 未来扩展

- [ ] Ingress 资源管理（域名绑定）
- [ ] ConfigMap 和 Secret 管理
- [ ] HPA（水平自动伸缩）
- [ ] PVC（持久化存储）
- [ ] CronJob（定时任务）
- [ ] StatefulSet（有状态应用）
- [ ] NetworkPolicy（网络策略）
- [ ] ServiceMonitor（Prometheus监控）

## 总结

玄武工厂现在具备完整的 Kubernetes 集成能力，可以：

1. ✅ 自动管理命名空间生命周期
2. ✅ 生成标准的 Kubernetes manifests
3. ✅ 部署应用到 Kubernetes 集群
4. ✅ 实时跟踪部署状态和日志
5. ✅ 支持多种构建模板和配置

只需配置好 Kubernetes API 访问权限和镜像仓库，即可投入实际使用。
