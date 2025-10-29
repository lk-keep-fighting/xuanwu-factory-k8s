import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type ProjectInsert = Database['public']['Tables']['projects']['Insert'];
type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];

export const projectService = {
  async getAllProjects(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Project[];
  },

  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Project;
  },

  async createProject(project: ProjectInsert): Promise<Project> {
    const { data, error } = await supabase
      .from('projects')
      .insert(project as any)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const updateData: any = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await (supabase as any)
      .from('projects')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  async deleteProject(id: string): Promise<void> {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async copyProject(sourceProjectId: string, newName: string, newNamespace: string): Promise<Project> {
    const { data: sourceProject, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', sourceProjectId)
      .single();

    if (projectError) throw projectError;
    const typedSourceProject = sourceProject as Project;

    const { data: newProject, error: createError } = await supabase
      .from('projects')
      .insert({
        name: newName,
        namespace: newNamespace,
        description: typedSourceProject.description,
      } as any)
      .select()
      .single();

    if (createError) throw createError;
    const typedNewProject = newProject as Project;

    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', sourceProjectId);

    if (appsError) throw appsError;
    const typedApplications = applications as Application[];

    if (typedApplications && typedApplications.length > 0) {
      const newApplications: ApplicationInsert[] = typedApplications.map(app => ({
        project_id: typedNewProject.id,
        name: app.name,
        gitlab_repo: app.gitlab_repo,
        gitlab_branch: app.gitlab_branch,
        build_type: app.build_type,
        dockerfile_path: app.dockerfile_path,
        build_config: app.build_config,
        status: 'pending' as const,
      }));

      const { error: copyAppsError } = await supabase
        .from('applications')
        .insert(newApplications as any);

      if (copyAppsError) throw copyAppsError;
    }

    return typedNewProject;
  },

  async getProjectApplications(projectId: string): Promise<Application[]> {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as Application[];
  },
};
