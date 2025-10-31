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
      briefings: {
        Row: {
          ambientes: string[] | null
          anexos_urls: string[] | null
          created_at: string | null
          email: string | null
          id: string
          materiais_desejados: string[] | null
          medidas: string | null
          nome: string
          obra: string | null
          observacoes: string | null
          prazo: string | null
          telefone: string
          whatsapp_link: string | null
        }
        Insert: {
          ambientes?: string[] | null
          anexos_urls?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          materiais_desejados?: string[] | null
          medidas?: string | null
          nome: string
          obra?: string | null
          observacoes?: string | null
          prazo?: string | null
          telefone: string
          whatsapp_link?: string | null
        }
        Update: {
          ambientes?: string[] | null
          anexos_urls?: string[] | null
          created_at?: string | null
          email?: string | null
          id?: string
          materiais_desejados?: string[] | null
          medidas?: string | null
          nome?: string
          obra?: string | null
          observacoes?: string | null
          prazo?: string | null
          telefone?: string
          whatsapp_link?: string | null
        }
        Relationships: []
      }
      case_media: {
        Row: {
          alt: string | null
          case_id: string
          created_at: string | null
          id: string
          ordem: number | null
          tipo: string
          url: string
        }
        Insert: {
          alt?: string | null
          case_id: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          tipo: string
          url: string
        }
        Update: {
          alt?: string | null
          case_id?: string
          created_at?: string | null
          id?: string
          ordem?: number | null
          tipo?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_media_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          acabamento: string | null
          area_m2: number | null
          arquiteto: string | null
          capa_url: string | null
          categoria: string | null
          cidade: string | null
          created_at: string | null
          ficha_pdf_url: string | null
          id: string
          materiais_principais: string[] | null
          prazo_dias: number | null
          resumo: string | null
          slug: string
          titulo: string
        }
        Insert: {
          acabamento?: string | null
          area_m2?: number | null
          arquiteto?: string | null
          capa_url?: string | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string | null
          ficha_pdf_url?: string | null
          id?: string
          materiais_principais?: string[] | null
          prazo_dias?: number | null
          resumo?: string | null
          slug: string
          titulo: string
        }
        Update: {
          acabamento?: string | null
          area_m2?: number | null
          arquiteto?: string | null
          capa_url?: string | null
          categoria?: string | null
          cidade?: string | null
          created_at?: string | null
          ficha_pdf_url?: string | null
          id?: string
          materiais_principais?: string[] | null
          prazo_dias?: number | null
          resumo?: string | null
          slug?: string
          titulo?: string
        }
        Relationships: []
      }
      finishes: {
        Row: {
          brand: string | null
          collection: string | null
          color_hex: string | null
          created_at: string | null
          id: string
          image_url: string | null
          name: string
        }
        Insert: {
          brand?: string | null
          collection?: string | null
          color_hex?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
        }
        Update: {
          brand?: string | null
          collection?: string | null
          color_hex?: string | null
          created_at?: string | null
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
      materials: {
        Row: {
          acabamento: string | null
          cor: string | null
          created_at: string | null
          espessura: string | null
          ficha_url: string | null
          fornecedor: string | null
          id: string
          imagem_url: string | null
          nome: string
        }
        Insert: {
          acabamento?: string | null
          cor?: string | null
          created_at?: string | null
          espessura?: string | null
          ficha_url?: string | null
          fornecedor?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
        }
        Update: {
          acabamento?: string | null
          cor?: string | null
          created_at?: string | null
          espessura?: string | null
          ficha_url?: string | null
          fornecedor?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
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
      profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string | null
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          name?: string | null
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string | null
          phone?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          description: string | null
          environment: string | null
          gallery: string[] | null
          hero_image: string | null
          id: string
          mdf_finish_id: string | null
          size_m2: number | null
          slug: string
          status: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          environment?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          mdf_finish_id?: string | null
          size_m2?: number | null
          slug: string
          status?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          environment?: string | null
          gallery?: string[] | null
          hero_image?: string | null
          id?: string
          mdf_finish_id?: string | null
          size_m2?: number | null
          slug?: string
          status?: string | null
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
          text: string | null
        }
        Insert: {
          approved?: boolean | null
          author: string
          city?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          rating?: number | null
          text?: string | null
        }
        Update: {
          approved?: boolean | null
          author?: string
          city?: string | null
          created_at?: string | null
          id?: string
          photo_url?: string | null
          rating?: number | null
          text?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
