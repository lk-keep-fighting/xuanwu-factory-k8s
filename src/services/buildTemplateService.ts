import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type BuildTemplate = Database['public']['Tables']['build_templates']['Row'];

export const buildTemplateService = {
  async getAllTemplates() {
    const { data, error } = await supabase
      .from('build_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('build_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  async getTemplatesByType(type: BuildTemplate['type']) {
    const { data, error } = await supabase
      .from('build_templates')
      .select('*')
      .eq('type', type);

    if (error) throw error;
    return data;
  },

  renderDockerfile(template: string, config: Record<string, string>) {
    let rendered = template;
    Object.entries(config).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });
    return rendered;
  },
};
