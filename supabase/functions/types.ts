export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      api_keys: {
        Row: {
          created_at: string
          id: string
          label: string
          role: Database["public"]["Enums"]["workspace_user_roles"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id: string
          label: string
          role: Database["public"]["Enums"]["workspace_user_roles"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string
          role?: Database["public"]["Enums"]["workspace_user_roles"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          created_at: string
          id: string
          response: Json | null
          updated_at: string
          variables: Json
          version_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          response?: Json | null
          updated_at?: string
          variables: Json
          version_id: string
        }
        Update: {
          created_at?: string
          id?: string
          response?: Json | null
          updated_at?: string
          variables?: Json
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "versions"
            referencedColumns: ["id"]
          },
        ]
      }
      keys: {
        Row: {
          created_at: string
          provider_id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          provider_id: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          provider_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "keys_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: true
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          completion_tokens: number | null
          created_at: string
          error: Json | null
          id: string
          prompt_tokens: number | null
          request: Json | null
          response: Json | null
          version_id: string | null
          workspace_id: string
        }
        Insert: {
          completion_tokens?: number | null
          created_at?: string
          error?: Json | null
          id?: string
          prompt_tokens?: number | null
          request?: Json | null
          response?: Json | null
          version_id?: string | null
          workspace_id: string
        }
        Update: {
          completion_tokens?: number | null
          created_at?: string
          error?: Json | null
          id?: string
          prompt_tokens?: number | null
          request?: Json | null
          response?: Json | null
          version_id?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prompts: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prompts_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          created_at: string
          id: string
          key: string
          models: Json
          name: string
          options: Json
          type: string
          updated_at: string
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          models?: Json
          name: string
          options?: Json
          type: string
          updated_at?: string
          user_id?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          models?: Json
          name?: string
          options?: Json
          type?: string
          updated_at?: string
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "providers_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      versions: {
        Row: {
          created_at: string
          evaluations: Json
          id: string
          number: number
          params: Json
          prompt_id: string
          provider_id: string | null
          published_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          evaluations?: Json
          id?: string
          number: number
          params?: Json
          prompt_id: string
          provider_id?: string | null
          published_at?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          evaluations?: Json
          id?: string
          number?: number
          params?: Json
          prompt_id?: string
          provider_id?: string | null
          published_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "versions_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "versions_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_users: {
        Row: {
          created_at: string
          role: Database["public"]["Enums"]["workspace_user_roles"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          role: Database["public"]["Enums"]["workspace_user_roles"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          role?: Database["public"]["Enums"]["workspace_user_roles"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_users_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_stats: {
        Args: {
          days: number
        }
        Returns: {
          day: string
          prompt_tokens: number
          completion_tokens: number
          count: number
          errors: number
        }[]
      }
      is_prompt_admin: {
        Args: {
          user_id: string
          prompt_id: string
        }
        Returns: boolean
      }
      is_prompt_reader: {
        Args: {
          user_id: string
          prompt_id: string
        }
        Returns: boolean
      }
      is_provider_admin: {
        Args: {
          user_id: string
          provider_id: string
        }
        Returns: boolean
      }
      is_provider_reader: {
        Args: {
          user_id: string
          provider_id: string
        }
        Returns: boolean
      }
      is_version_reader: {
        Args: {
          user_id: string
          version_id: string
        }
        Returns: boolean
      }
      is_workspace_admin: {
        Args: {
          user_id: string
          workspace_id: string
        }
        Returns: boolean
      }
      is_workspace_reader: {
        Args: {
          user_id: string
          workspace_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      workspace_user_roles: "admin" | "reader"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
