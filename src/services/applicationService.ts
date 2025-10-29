import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Application = Database['public']['Tables']['applications']['Row'];
type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
type ApplicationUpdate = Database['public']['Tables']['applications']['Update'];

export const applicationService = {
  async getAllApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*, projects(name, namespace)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getApplicationById(id: string) {
    const { data, error } = await supabase
      .from('applications')
      .select('*, projects(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async createApplication(application: ApplicationInsert): Promise<Application> {
    const { data, error } = await supabase
      .from('applications')
      .insert(application as any)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async updateApplication(id: string, updates: ApplicationUpdate): Promise<Application> {
    const updateData: any = { ...updates, updated_at: new Date().toISOString() };
    const { data, error } = await (supabase as any)
      .from('applications')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Application;
  },

  async deleteApplication(id: string) {
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getApplicationDeployments(applicationId: string) {
    const { data, error } = await supabase
      .from('deployments')
      .select('*')
      .eq('application_id', applicationId)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data;
  },
};
