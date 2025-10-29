export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string | null
          id: string
          lead_id: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["appointment_status"] | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          lead_id?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          body_md: string | null
          cover_url: string | null
          created_at: string | null
          excerpt: string | null
          id: string
          published: boolean | null
          slug: string
          title: string
        }
        Insert: {
          body_md?: string | null
          cover_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug: string
          title: string
        }
        Update: {
          body_md?: string | null
          cover_url?: string | null
          created_at?: string | null
          excerpt?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          title?: string
        }
        Relationships: []
      }
      finishes: {
        Row: {
          brand: string | null
          collection: string | null
          color_hex: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          brand?: string | null
          collection?: string | null
          color_hex?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          brand?: string | null
          collection?: string | null
          color_hex?: string | null
          id?: string
          image_url?: string | null
          name?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget_range: string | null
          city: string | null
          created_at: string | null
          desired_date: string | null
          email: string | null
          id: string
          media: Json | null
          message: string | null
          name: string
          phone_whatsapp: string
          source: string | null
        }
        Insert: {
          budget_range?: string | null
          city?: string | null
          created_at?: string | null
          desired_date?: string | null
          email?: string | null
          id?: string
          media?: Json | null
          message?: string | null
          name: string
          phone_whatsapp: string
          source?: string | null
        }
        Update: {
          budget_range?: string | null
          city?: string | null
          created_at?: string | null
          desired_date?: string | null
          email?: string | null
          id?: string
          media?: Json | null
          message?: string | null
          name?: string
          phone_whatsapp?: string
          source?: string | null
        }
        Relationships: []
      }
      lighting_presets: {
        Row: {
          cct_kelvin: number | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          cct_kelvin?: number | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          cct_kelvin?: number | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      materials: {
        Row: {
          category: string | null
          color_hex: string | null
          id: string
          name: string
          price_per_m2: number | null
          supplier: string | null
        }
        Insert: {
          category?: string | null
          color_hex?: string | null
          id?: string
          name: string
          price_per_m2?: number | null
          supplier?: string | null
        }
        Update: {
          category?: string | null
          color_hex?: string | null
          id?: string
          name?: string
          price_per_m2?: number | null
          supplier?: string | null
        }
        Relationships: []
      }
      media_gallery: {
        Row: {
          created_at: string | null
          dominant_hex: string | null
          height: number | null
          id: string
          tags: string[] | null
          title: string | null
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string | null
          dominant_hex?: string | null
          height?: number | null
          id?: string
          tags?: string[] | null
          title?: string | null
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string | null
          dominant_hex?: string | null
          height?: number | null
          id?: string
          tags?: string[] | null
          title?: string | null
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      pricing_packages: {
        Row: {
          description: string | null
          features: string[] | null
          id: string
          name: string
          starting_price: number | null
        }
        Insert: {
          description?: string | null
          features?: string[] | null
          id?: string
          name: string
          starting_price?: number | null
        }
        Update: {
          description?: string | null
          features?: string[] | null
          id?: string
          name?: string
          starting_price?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          environment: Database["public"]["Enums"]["environment_type"] | null
          gallery: string[] | null
          hero_image: string | null
          id: string
          mdf_finish_id: string | null
          size_m2: number | null
          slug: string
          status: Database["public"]["Enums"]["project_status"] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environment?: Database["public"]["Enums"]["environment_type"] | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          mdf_finish_id?: string | null
          size_m2?: number | null
          slug: string
          status?: Database["public"]["Enums"]["project_status"] | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environment?: Database["public"]["Enums"]["environment_type"] | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          mdf_finish_id?: string | null
          size_m2?: number | null
          slug?: string
          status?: Database["public"]["Enums"]["project_status"] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_mdf_finish_id_fkey"
            columns: ["mdf_finish_id"]
            isOneToOne: false
            referencedRelation: "finishes"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          approved: boolean | null
          author: string
          city: string | null
          created_at: string | null
          id: string
          photo_url: string | null
          rating: number | null
          text: string
        }
        Insert: {
          approved?: boolean | null
          author: string
          city?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          rating?: number | null
          text: string
        }
        Update: {
          approved?: boolean | null
          author?: string
          city?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          rating?: number | null
          text?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: { user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user"
      appointment_status: "novo" | "confirmado" | "feito" | "cancelado"
      environment_type: "cozinha" | "sala" | "quarto" | "gourmet" | "escritorio"
      project_status: "lead" | "producao" | "instalado" | "publicado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      appointment_status: ["novo", "confirmado", "feito", "cancelado"],
      environment_type: ["cozinha", "sala", "quarto", "gourmet", "escritorio"],
      project_status: ["lead", "producao", "instalado", "publicado"],
    },
  },
} as const
