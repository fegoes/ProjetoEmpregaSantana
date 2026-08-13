// Tipos hand-authored espelhando supabase/migrations/*.sql.
// Quando o projeto Supabase real existir, substituir por:
//   npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type EmploymentType = 'clt' | 'pj' | 'temporario' | 'freelance'
export type PricingModelVaga = 'fixed_salary' | 'hourly' | 'per_delivery'
export type PricingModelAutonomo = 'hourly' | 'per_delivery' | 'both'
export type VagaStatus = 'draft' | 'published' | 'paused' | 'closed'
export type EmpresaStatus = 'active' | 'pending' | 'suspended'
export type CandidaturaStatus = 'enviada' | 'em_analise' | 'entrevista' | 'aprovada' | 'rejeitada'
export type UserRole = 'candidato' | 'autonomo' | 'empresa_owner'
export type PlanAudience = 'empresa' | 'autonomo'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          city: string | null
          state: string | null
          country: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'created_at'> & {
          id?: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
        Relationships: [
          {
            foreignKeyName: 'user_roles_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          slug: string
          label: string
          kind: 'vaga' | 'autonomo' | 'both'
        }
        Insert: Partial<Database['public']['Tables']['categories']['Row']> & {
          slug: string
          label: string
        }
        Update: Partial<Database['public']['Tables']['categories']['Row']>
        Relationships: []
      }
      empresas: {
        Row: {
          id: string
          owner_id: string
          razao_social: string | null
          nome_fantasia: string
          cnpj: string | null
          sector: string | null
          description_html: string | null
          logo_url: string | null
          cover_url: string | null
          website: string | null
          city: string | null
          state: string | null
          is_verified: boolean
          status: EmpresaStatus
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['empresas']['Row']> & {
          owner_id: string
          nome_fantasia: string
        }
        Update: Partial<Database['public']['Tables']['empresas']['Row']>
        Relationships: []
      }
      empresa_members: {
        Row: {
          id: string
          empresa_id: string
          user_id: string
          role: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['empresa_members']['Row']> & {
          empresa_id: string
          user_id: string
        }
        Update: Partial<Database['public']['Tables']['empresa_members']['Row']>
        Relationships: []
      }
      vagas: {
        Row: {
          id: string
          empresa_id: string | null
          created_by: string
          title: string
          description_html: string | null
          employment_type: EmploymentType
          pricing_model: PricingModelVaga
          salary_min: number | null
          salary_max: number | null
          hourly_rate: number | null
          salary_visible: boolean
          location_city: string | null
          location_state: string | null
          is_remote: boolean
          category: string | null
          status: VagaStatus
          is_featured: boolean
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['vagas']['Row']> & {
          created_by: string
          title: string
          employment_type: EmploymentType
          pricing_model: PricingModelVaga
        }
        Update: Partial<Database['public']['Tables']['vagas']['Row']>
        Relationships: [
          {
            foreignKeyName: 'vagas_empresa_id_fkey'
            columns: ['empresa_id']
            isOneToOne: false
            referencedRelation: 'empresas'
            referencedColumns: ['id']
          },
        ]
      }
      candidato_profiles: {
        Row: {
          id: string
          headline: string | null
          bio_html: string | null
          desired_role: string | null
          desired_salary_min: number | null
          pretensao_visible: boolean
          availability: 'imediata' | '15_dias' | '30_dias' | 'a_combinar' | null
          linkedin_url: string | null
          portfolio_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['candidato_profiles']['Row']> & { id: string }
        Update: Partial<Database['public']['Tables']['candidato_profiles']['Row']>
        Relationships: [
          {
            foreignKeyName: 'candidato_profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      cv_variants: {
        Row: {
          id: string
          candidato_id: string
          title: string
          summary_html: string | null
          experiences: unknown[]
          education: unknown[]
          skills: string[]
          is_default: boolean
          is_public: boolean
          pdf_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['cv_variants']['Row']> & {
          candidato_id: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['cv_variants']['Row']>
        Relationships: []
      }
      candidaturas: {
        Row: {
          id: string
          vaga_id: string
          candidato_id: string
          cv_variant_id: string
          cover_note: string | null
          status: CandidaturaStatus
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['candidaturas']['Row']> & {
          vaga_id: string
          candidato_id: string
          cv_variant_id: string
        }
        Update: Partial<Database['public']['Tables']['candidaturas']['Row']>
        Relationships: [
          {
            foreignKeyName: 'candidaturas_vaga_id_fkey'
            columns: ['vaga_id']
            isOneToOne: false
            referencedRelation: 'vagas'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'candidaturas_cv_variant_id_fkey'
            columns: ['cv_variant_id']
            isOneToOne: false
            referencedRelation: 'cv_variants'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'candidaturas_candidato_id_fkey'
            columns: ['candidato_id']
            isOneToOne: false
            referencedRelation: 'candidato_profiles'
            referencedColumns: ['id']
          },
        ]
      }
      autonomo_profiles: {
        Row: {
          id: string
          headline: string | null
          category: string | null
          description_html: string | null
          pricing_model: PricingModelAutonomo
          hourly_rate: number | null
          delivery_rate_note: string | null
          service_area_city: string | null
          service_area_state: string | null
          serves_remote: boolean
          availability: string | null
          portfolio_urls: string[]
          status: 'active' | 'paused'
          is_featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['autonomo_profiles']['Row']> & {
          id: string
          pricing_model: PricingModelAutonomo
        }
        Update: Partial<Database['public']['Tables']['autonomo_profiles']['Row']>
        Relationships: [
          {
            foreignKeyName: 'autonomo_profiles_id_fkey'
            columns: ['id']
            isOneToOne: true
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      plans: {
        Row: {
          id: string
          audience: PlanAudience
          name: string
          stripe_price_id: string | null
          price_cents: number
          billing_interval: 'month' | 'year'
          max_active_vagas: number | null
          featured_placement: boolean
          cv_database_access: boolean
          is_active: boolean
          sort_order: number
        }
        Insert: Partial<Database['public']['Tables']['plans']['Row']> & {
          audience: PlanAudience
          name: string
        }
        Update: Partial<Database['public']['Tables']['plans']['Row']>
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          empresa_id: string | null
          autonomo_id: string | null
          plan_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['subscriptions']['Row']> & {
          plan_id: string
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
        }
        Update: Partial<Database['public']['Tables']['subscriptions']['Row']>
        Relationships: []
      }
      ads: {
        Row: {
          id: string
          subject_type: 'vaga' | 'autonomo' | 'empresa'
          subject_id: string
          placement: string | null
          starts_at: string | null
          ends_at: string | null
          status: 'pending' | 'active' | 'expired'
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['ads']['Row']> & {
          subject_type: 'vaga' | 'autonomo' | 'empresa'
          subject_id: string
        }
        Update: Partial<Database['public']['Tables']['ads']['Row']>
        Relationships: []
      }
      paginas_institucionais: {
        Row: {
          id: string
          slug: string
          title: string
          content_html: string
          updated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['paginas_institucionais']['Row']> & {
          slug: string
          title: string
        }
        Update: Partial<Database['public']['Tables']['paginas_institucionais']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
