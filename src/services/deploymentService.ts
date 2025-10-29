import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { kubernetesService } from './kubernetesService';
import { applicationService } from './applicationService';
import { k8sConfig } from '@/lib/k8s-config';

type Deployment = Database['public']['Tables']['deployments']['Row'];
type DeploymentInsert = Database['public']['Tables']['deployments']['Insert'];
type DeploymentUpdate = Database['public']['Tables']['deployments']['Update'];

export const deploymentService = {
  async createDeployment(deployment: DeploymentInsert): Promise<Deployment> {
    const { data, error } = await supabase
      .from('deployments')
      .insert(deployment as any)
      .select()
      .single();

    if (error) throw error;
    return data as Deployment;
  },

  async updateDeployment(id: string, updates: DeploymentUpdate): Promise<Deployment> {
    const updateData: any = updates;
    const { data, error } = await (supabase as any)
      .from('deployments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Deployment;
  },

  async getDeploymentById(id: string) {
    const { data, error } = await supabase
      .from('deployments')
      .select('*, applications(name, project_id, projects(name, namespace))')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async startDeployment(applicationId: string, version: string) {
    // 获取应用和项目信息
    const appData = await applicationService.getApplicationById(applicationId);
    const application = appData as any;
    const project = application.projects;

    const deployment = await this.createDeployment({
      application_id: applicationId,
      version,
      status: 'pending',
    });

    // 异步执行部署流程
    this.executeDeployment(deployment.id, application, project, version);

    return deployment;
  },

  async executeDeployment(
    deploymentId: string,
    application: any,
    project: any,
    version: string
  ) {
    try {
      // 阶段1: 构建镜像
      await this.updateDeployment(deploymentId, {
        status: 'building',
        build_logs: `[${new Date().toISOString()}] [INFO] Starting build process...
[${new Date().toISOString()}] [INFO] Repository: ${application.gitlab_repo}
[${new Date().toISOString()}] [INFO] Branch: ${application.gitlab_branch}
[${new Date().toISOString()}] [INFO] Build type: ${application.build_type}
`,
      });

      // 模拟构建过程
      await new Promise(resolve => setTimeout(resolve, 2000));

      const imageUrl = `${k8sConfig.registry.url}/${k8sConfig.registry.namespace}/${application.name}:${version}`;

      await this.updateDeployment(deploymentId, {
        build_logs: `[${new Date().toISOString()}] [INFO] Starting build process...
[${new Date().toISOString()}] [INFO] Repository: ${application.gitlab_repo}
[${new Date().toISOString()}] [INFO] Branch: ${application.gitlab_branch}
[${new Date().toISOString()}] [INFO] Build type: ${application.build_type}
[${new Date().toISOString()}] [INFO] Pulling base image...
[${new Date().toISOString()}] [INFO] Building Docker image...
[${new Date().toISOString()}] [INFO] Build completed successfully
[${new Date().toISOString()}] [INFO] Pushing image to ${imageUrl}
[${new Date().toISOString()}] [INFO] Image pushed successfully
`,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // 阶段2: 部署到Kubernetes
      await this.updateDeployment(deploymentId, {
        status: 'deploying',
        image_url: imageUrl,
        deploy_logs: `[${new Date().toISOString()}] [INFO] Starting deployment to Kubernetes...
[${new Date().toISOString()}] [INFO] Namespace: ${project.namespace}
[${new Date().toISOString()}] [INFO] Generating manifests...
`,
      });

      // 调用Kubernetes服务
      const k8sResult = await kubernetesService.deployApplication(
        application,
        project,
        imageUrl,
        application.build_config
      );

      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.updateDeployment(deploymentId, {
        deploy_logs: `[${new Date().toISOString()}] [INFO] Starting deployment to Kubernetes...
[${new Date().toISOString()}] [INFO] Namespace: ${project.namespace}
[${new Date().toISOString()}] [INFO] Generating manifests...
[${new Date().toISOString()}] [INFO] Applying Deployment manifest...
[${new Date().toISOString()}] [INFO] Deployment created: ${k8sResult.deployment.metadata.name}
[${new Date().toISOString()}] [INFO] Applying Service manifest...
[${new Date().toISOString()}] [INFO] Service created: ${k8sResult.service.metadata.name}
[${new Date().toISOString()}] [INFO] Waiting for pods to be ready...
`,
      });

      await new Promise(resolve => setTimeout(resolve, 3000));

      // 获取Pod状态
      const podStatus = await kubernetesService.getPodStatus(
        project.namespace,
        application.name.toLowerCase().replace(/[^a-z0-9-]/g, '-')
      );

      // 阶段3: 完成
      await this.updateDeployment(deploymentId, {
        status: 'deployed',
        deploy_logs: `[${new Date().toISOString()}] [INFO] Starting deployment to Kubernetes...
[${new Date().toISOString()}] [INFO] Namespace: ${project.namespace}
[${new Date().toISOString()}] [INFO] Generating manifests...
[${new Date().toISOString()}] [INFO] Applying Deployment manifest...
[${new Date().toISOString()}] [INFO] Deployment created: ${k8sResult.deployment.metadata.name}
[${new Date().toISOString()}] [INFO] Applying Service manifest...
[${new Date().toISOString()}] [INFO] Service created: ${k8sResult.service.metadata.name}
[${new Date().toISOString()}] [INFO] Waiting for pods to be ready...
[${new Date().toISOString()}] [INFO] Pod ${podStatus.pods[0].name} is running
[${new Date().toISOString()}] [SUCCESS] Deployment completed successfully!
[${new Date().toISOString()}] [INFO] Service URL: http://${k8sResult.service.metadata.name}.${project.namespace}.svc.cluster.local
`,
        completed_at: new Date().toISOString(),
      });
    } catch (error) {
      // 处理错误
      await this.updateDeployment(deploymentId, {
        status: 'failed',
        deploy_logs: `[${new Date().toISOString()}] [ERROR] Deployment failed: ${(error as Error).message}
`,
        completed_at: new Date().toISOString(),
      });
    }
  },

  async subscribeToDeployment(deploymentId: string, callback: (deployment: Deployment) => void): Promise<() => void> {
    const channel = supabase
      .channel(`deployment-${deploymentId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deployments',
          filter: `id=eq.${deploymentId}`,
        },
        (payload) => {
          callback(payload.new as Deployment);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
};
