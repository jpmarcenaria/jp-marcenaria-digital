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
      activity_log: {
        Row: {
          acao: string
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown
          metadata: Json | null
          registro_id: string | null
          tabela: string | null
          timestamp: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          registro_id?: string | null
          tabela?: string | null
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          registro_id?: string | null
          tabela?: string | null
          timestamp?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      clientes: {
        Row: {
          ativo: boolean | null
          cep: string | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string
          data_nascimento: string | null
          email: string
          endereco: string | null
          estado: string | null
          id: number
          nome: string | null
          notas: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email: string
          endereco?: string | null
          estado?: string | null
          id?: number
          nome?: string | null
          notas?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cep?: string | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          data_nascimento?: string | null
          email?: string
          endereco?: string | null
          estado?: string | null
          id?: number
          nome?: string | null
          notas?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      fidelidade: {
        Row: {
          ativo: boolean | null
          cliente_id: number | null
          created_at: string | null
          data_inscricao: string | null
          data_proxima_avaliacao: string | null
          desconto_ativo: number | null
          historico: Json | null
          id: string
          pontos: number | null
          tier: Database["public"]["Enums"]["loyalty_tier"] | null
          total_gasto: number | null
          ultima_atividade: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: number | null
          created_at?: string | null
          data_inscricao?: string | null
          data_proxima_avaliacao?: string | null
          desconto_ativo?: number | null
          historico?: Json | null
          id?: string
          pontos?: number | null
          tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          total_gasto?: number | null
          ultima_atividade?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: number | null
          created_at?: string | null
          data_inscricao?: string | null
          data_proxima_avaliacao?: string | null
          desconto_ativo?: number | null
          historico?: Json | null
          id?: string
          pontos?: number | null
          tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          total_gasto?: number | null
          ultima_atividade?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fidelidade_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: true
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
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
      foto_magia_projects: {
        Row: {
          ambiente_image_url: string
          created_at: string
          id: string
          instrucoes: string | null
          movel_image_url: string
          result_image_url: string | null
          tipo_ambiente: string | null
          tipo_movel: string | null
        }
        Insert: {
          ambiente_image_url: string
          created_at?: string
          id?: string
          instrucoes?: string | null
          movel_image_url: string
          result_image_url?: string | null
          tipo_ambiente?: string | null
          tipo_movel?: string | null
        }
        Update: {
          ambiente_image_url?: string
          created_at?: string
          id?: string
          instrucoes?: string | null
          movel_image_url?: string
          result_image_url?: string | null
          tipo_ambiente?: string | null
          tipo_movel?: string | null
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
      materiais: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          codigo_referencia: string | null
          created_at: string | null
          data_ultima_atualizacao: string | null
          descricao: string | null
          fornecedor: string | null
          id: string
          localizacao_estoque: string | null
          metadata: Json | null
          nome: string
          preco_unitario: number | null
          quantidade_estoque: number | null
          quantidade_minima: number | null
          unidade_medida: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          codigo_referencia?: string | null
          created_at?: string | null
          data_ultima_atualizacao?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          localizacao_estoque?: string | null
          metadata?: Json | null
          nome: string
          preco_unitario?: number | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          unidade_medida?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          codigo_referencia?: string | null
          created_at?: string | null
          data_ultima_atualizacao?: string | null
          descricao?: string | null
          fornecedor?: string | null
          id?: string
          localizacao_estoque?: string | null
          metadata?: Json | null
          nome?: string
          preco_unitario?: number | null
          quantidade_estoque?: number | null
          quantidade_minima?: number | null
          unidade_medida?: string | null
          updated_at?: string | null
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
      relatorios: {
        Row: {
          anexos: string[] | null
          conteudo: string | null
          created_at: string | null
          data_geracao: string | null
          formato: string | null
          gerado_por: string | null
          id: string
          metadata: Json | null
          periodo_fim: string | null
          periodo_inicio: string | null
          status: string | null
          tipo: string
          titulo: string
        }
        Insert: {
          anexos?: string[] | null
          conteudo?: string | null
          created_at?: string | null
          data_geracao?: string | null
          formato?: string | null
          gerado_por?: string | null
          id?: string
          metadata?: Json | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: string | null
          tipo: string
          titulo: string
        }
        Update: {
          anexos?: string[] | null
          conteudo?: string | null
          created_at?: string | null
          data_geracao?: string | null
          formato?: string | null
          gerado_por?: string | null
          id?: string
          metadata?: Json | null
          periodo_fim?: string | null
          periodo_inicio?: string | null
          status?: string | null
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_gerado_por_fkey"
            columns: ["gerado_por"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      servicos: {
        Row: {
          cliente_id: number | null
          created_at: string | null
          data_conclusao_prevista: string | null
          data_conclusao_real: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          metadata: Json | null
          preco_estimado: number | null
          preco_final: number | null
          prioridade: number | null
          status: Database["public"]["Enums"]["service_status"] | null
          tags: string[] | null
          titulo: string
          updated_at: string | null
          usuario_responsavel_id: string | null
        }
        Insert: {
          cliente_id?: number | null
          created_at?: string | null
          data_conclusao_prevista?: string | null
          data_conclusao_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          preco_estimado?: number | null
          preco_final?: number | null
          prioridade?: number | null
          status?: Database["public"]["Enums"]["service_status"] | null
          tags?: string[] | null
          titulo: string
          updated_at?: string | null
          usuario_responsavel_id?: string | null
        }
        Update: {
          cliente_id?: number | null
          created_at?: string | null
          data_conclusao_prevista?: string | null
          data_conclusao_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          metadata?: Json | null
          preco_estimado?: number | null
          preco_final?: number | null
          prioridade?: number | null
          status?: Database["public"]["Enums"]["service_status"] | null
          tags?: string[] | null
          titulo?: string
          updated_at?: string | null
          usuario_responsavel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "servicos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "servicos_usuario_responsavel_id_fkey"
            columns: ["usuario_responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
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
      usuarios: {
        Row: {
          ativo: boolean | null
          auth_id: string | null
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          metadata: Json | null
          nome: string
          role: Database["public"]["Enums"]["user_role"] | null
          telefone: string | null
          ultimo_login: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          metadata?: Json | null
          nome: string
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          metadata?: Json | null
          nome?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          telefone?: string | null
          ultimo_login?: string | null
          updated_at?: string | null
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
      loyalty_tier: "bronze" | "silver" | "gold" | "platinum"
      service_status: "pending" | "in_progress" | "completed" | "cancelled"
      user_role: "admin" | "manager" | "employee" | "client"
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
      loyalty_tier: ["bronze", "silver", "gold", "platinum"],
      service_status: ["pending", "in_progress", "completed", "cancelled"],
      user_role: ["admin", "manager", "employee", "client"],
    },
  },
} as const
