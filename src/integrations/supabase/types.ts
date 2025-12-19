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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
      cta_content: {
        Row: {
          button_text: string | null
          button_url: string | null
          description: string | null
          headline: string
          id: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          description?: string | null
          headline?: string
          id?: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          description?: string | null
          headline?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          alt_text: string
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
        }
        Insert: {
          alt_text: string
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
        }
        Update: {
          alt_text?: string
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      mission_content: {
        Row: {
          cta_text: string | null
          cta_url: string | null
          heading: string
          id: string
          image_url: string | null
          paragraph: string
          updated_at: string
        }
        Insert: {
          cta_text?: string | null
          cta_url?: string | null
          heading?: string
          id?: string
          image_url?: string | null
          paragraph: string
          updated_at?: string
        }
        Update: {
          cta_text?: string | null
          cta_url?: string | null
          heading?: string
          id?: string
          image_url?: string | null
          paragraph?: string
          updated_at?: string
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          body: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          is_published: boolean | null
          published_at: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_published?: boolean | null
          published_at?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      order_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          field_changed: string
          id: string
          new_value: string | null
          old_value: string | null
          order_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          field_changed: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          order_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          field_changed?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          order_id: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_notes: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          is_internal: boolean | null
          note: string
          order_id: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note: string
          order_id: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          note?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_notes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          courier: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          estimated_delivery: string | null
          external_id: string | null
          id: string
          invoice_url: string | null
          postal_code: string
          shipped_at: string | null
          shipping_address: string
          shipping_cost: number
          status: string
          total_amount: number
          tracking_access_expires_at: string | null
          tracking_access_token: string | null
          tracking_number: string | null
          tracking_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          city: string
          courier?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          postal_code: string
          shipped_at?: string | null
          shipping_address: string
          shipping_cost?: number
          status?: string
          total_amount: number
          tracking_access_expires_at?: string | null
          tracking_access_token?: string | null
          tracking_number?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string
          courier?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          postal_code?: string
          shipped_at?: string | null
          shipping_address?: string
          shipping_cost?: number
          status?: string
          total_amount?: number
          tracking_access_expires_at?: string | null
          tracking_access_token?: string | null
          tracking_number?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          display_order: number
          icon: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          icon: string
          id: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          icon?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          image: string
          images: string[] | null
          is_active: boolean
          long_description: string | null
          name: string
          nutrition_calories: number | null
          nutrition_carbs: number | null
          nutrition_fat: number | null
          nutrition_protein: number | null
          original_price: number | null
          prep_time: string | null
          price: number
          rating: number
          reviews: number
          serving_size: string | null
          slug: string
          stock: number
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          id?: string
          image: string
          images?: string[] | null
          is_active?: boolean
          long_description?: string | null
          name: string
          nutrition_calories?: number | null
          nutrition_carbs?: number | null
          nutrition_fat?: number | null
          nutrition_protein?: number | null
          original_price?: number | null
          prep_time?: string | null
          price: number
          rating?: number
          reviews?: number
          serving_size?: string | null
          slug: string
          stock?: number
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          image?: string
          images?: string[] | null
          is_active?: boolean
          long_description?: string | null
          name?: string
          nutrition_calories?: number | null
          nutrition_carbs?: number | null
          nutrition_fat?: number | null
          nutrition_protein?: number | null
          original_price?: number | null
          prep_time?: string | null
          price?: number
          rating?: number
          reviews?: number
          serving_size?: string | null
          slug?: string
          stock?: number
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_points: {
        Row: {
          created_at: string
          description: string
          display_order: number
          heading: string
          icon_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          display_order?: number
          heading: string
          icon_name?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          display_order?: number
          heading?: string
          icon_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_order_for_tracking: {
        Args: { p_access_token: string }
        Returns: {
          city: string
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string
          id: string
          postal_code: string
          shipping_address: string
          shipping_cost: number
          status: string
          total_amount: number
          updated_at: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
