export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          name: string
          namespace: string
          description: string | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          namespace: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          name?: string
          namespace?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      applications: {
        Row: {
          id: string
          project_id: string
          name: string
          gitlab_repo: string
          gitlab_branch: string
          build_type: 'dockerfile' | 'java17' | 'java21' | 'python' | 'nodejs'
          dockerfile_path: string | null
          build_config: Json | null
          status: 'pending' | 'building' | 'deployed' | 'failed' | 'stopped'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          name: string
          gitlab_repo: string
          gitlab_branch: string
          build_type?: 'dockerfile' | 'java17' | 'java21' | 'python' | 'nodejs'
          dockerfile_path?: string | null
          build_config?: Json | null
          status?: 'pending' | 'building' | 'deployed' | 'failed' | 'stopped'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          name?: string
          gitlab_repo?: string
          gitlab_branch?: string
          build_type?: 'dockerfile' | 'java17' | 'java21' | 'python' | 'nodejs'
          dockerfile_path?: string | null
          build_config?: Json | null
          status?: 'pending' | 'building' | 'deployed' | 'failed' | 'stopped'
          created_at?: string
          updated_at?: string
        }
      }
      gitlab_config: {
        Row: {
          id: string
          name: string
          gitlab_url: string
          access_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          gitlab_url: string
          access_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          gitlab_url?: string
          access_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      deployments: {
        Row: {
          id: string
          application_id: string
          version: string
          status: 'pending' | 'building' | 'deploying' | 'deployed' | 'failed' | 'rolled_back'
          build_logs: string | null
          deploy_logs: string | null
          image_url: string | null
          started_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          application_id: string
          version: string
          status?: 'pending' | 'building' | 'deploying' | 'deployed' | 'failed' | 'rolled_back'
          build_logs?: string | null
          deploy_logs?: string | null
          image_url?: string | null
          started_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          application_id?: string
          version?: string
          status?: 'pending' | 'building' | 'deploying' | 'deployed' | 'failed' | 'rolled_back'
          build_logs?: string | null
          deploy_logs?: string | null
          image_url?: string | null
          started_at?: string
          completed_at?: string | null
        }
      }
      build_templates: {
        Row: {
          id: string
          name: string
          type: 'java17' | 'java21' | 'python' | 'nodejs'
          description: string | null
          dockerfile_template: string
          default_config: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'java17' | 'java21' | 'python' | 'nodejs'
          description?: string | null
          dockerfile_template: string
          default_config?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'java17' | 'java21' | 'python' | 'nodejs'
          description?: string | null
          dockerfile_template?: string
          default_config?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
