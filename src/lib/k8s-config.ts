// Kubernetes配置
// 在实际生产环境中，这些配置应该从环境变量或配置文件中读取

export const k8sConfig = {
  // Kubernetes API Server地址
  apiServer: import.meta.env.VITE_K8S_API_SERVER || 'https://kubernetes.default.svc',
  
  // Service Account Token路径（在Pod内部）
  tokenPath: '/var/run/secrets/kubernetes.io/serviceaccount/token',
  
  // CA证书路径
  caPath: '/var/run/secrets/kubernetes.io/serviceaccount/ca.crt',
  
  // 镜像仓库配置
  registry: {
    url: import.meta.env.VITE_REGISTRY_URL || 'registry.example.com',
    namespace: import.meta.env.VITE_REGISTRY_NAMESPACE || 'xuanwu',
  },
  
  // 默认资源限制
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
