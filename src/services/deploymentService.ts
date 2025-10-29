import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

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
    const deployment = await this.createDeployment({
      application_id: applicationId,
      version,
      status: 'pending',
    });

    setTimeout(async () => {
      await this.updateDeployment(deployment.id, {
        status: 'building',
        build_logs: '[INFO] Starting build process...\n[INFO] Pulling base image...\n',
      });

      setTimeout(async () => {
        await this.updateDeployment(deployment.id, {
          status: 'deploying',
          build_logs: '[INFO] Build completed successfully\n[INFO] Image pushed to registry\n',
          deploy_logs: '[INFO] Applying Kubernetes manifests...\n[INFO] Creating deployment...\n',
          image_url: `registry.example.com/${applicationId}:${version}`,
        });

        setTimeout(async () => {
          await this.updateDeployment(deployment.id, {
            status: 'deployed',
            deploy_logs: '[INFO] Deployment successful\n[INFO] Service is now available\n',
            completed_at: new Date().toISOString(),
          });
        }, 3000);
      }, 5000);
    }, 2000);

    return deployment;
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
