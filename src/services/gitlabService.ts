import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type GitlabConfig = Database['public']['Tables']['gitlab_config']['Row'];
type GitlabConfigInsert = Database['public']['Tables']['gitlab_config']['Insert'];

export const gitlabService = {
  async getAllConfigs() {
    const { data, error } = await supabase
      .from('gitlab_config')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getConfigById(id: string) {
    const { data, error } = await supabase
      .from('gitlab_config')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createConfig(config: GitlabConfigInsert): Promise<GitlabConfig> {
    const { data, error } = await supabase
      .from('gitlab_config')
      .insert(config as any)
      .select()
      .single();

    if (error) throw error;
    return data as GitlabConfig;
  },

  async updateConfig(id: string, updates: Partial<GitlabConfig>): Promise<GitlabConfig> {
    const updateData: any = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await (supabase as any)
      .from('gitlab_config')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as GitlabConfig;
  },

  async deleteConfig(id: string) {
    const { error } = await supabase
      .from('gitlab_config')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async testConnection(gitlabUrl: string, accessToken: string) {
    try {
      const response = await fetch(`${gitlabUrl}/api/v4/user`, {
        headers: {
          'PRIVATE-TOKEN': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Invalid GitLab credentials');
      }

      const user = await response.json();
      return { success: true, user };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async fetchRepositories(gitlabUrl: string, accessToken: string) {
    try {
      const response = await fetch(`${gitlabUrl}/api/v4/projects?membership=true&per_page=100`, {
        headers: {
          'PRIVATE-TOKEN': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      return await response.json();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },

  async fetchBranches(gitlabUrl: string, accessToken: string, projectId: number) {
    try {
      const response = await fetch(`${gitlabUrl}/api/v4/projects/${projectId}/repository/branches`, {
        headers: {
          'PRIVATE-TOKEN': accessToken,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }

      return await response.json();
    } catch (error) {
      throw new Error((error as Error).message);
    }
  },
};
