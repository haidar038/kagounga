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
      admin_activity_logs: {
        Row: {
          action_type: string
          admin_email: string
          admin_id: string
          changes: Json | null
          created_at: string
          entity_id: string
          entity_name: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          action_type: string
          admin_email: string
          admin_id: string
          changes?: Json | null
          created_at?: string
          entity_id: string
          entity_name?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          action_type?: string
          admin_email?: string
          admin_id?: string
          changes?: Json | null
          created_at?: string
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          created_at: string
          created_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
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
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price: number
          product_id: string
          product_name: string
          quantity: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          order_id?: string | null
          price?: number
          product_id?: string
          product_name?: string
          quantity?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
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
          biteship_order_id: string | null
          city: string
          courier: string | null
          courier_code: string | null
          courier_name: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at: string | null
          estimated_delivery: string | null
          estimated_delivery_days: string | null
          external_id: string | null
          id: string
          invoice_url: string | null
          is_local_delivery: boolean | null
          payment_method: string | null
          postal_code: string
          service_code: string | null
          service_name: string | null
          shipped_at: string | null
          shipping_address: string
          shipping_cost: number
          shipping_notes: string | null
          status: string
          total_amount: number
          total_weight_kg: number | null
          tracking_access_expires_at: string | null
          tracking_access_token: string | null
          tracking_number: string | null
          tracking_token: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          biteship_order_id?: string | null
          city: string
          courier?: string | null
          courier_code?: string | null
          courier_name?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          estimated_delivery_days?: string | null
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          is_local_delivery?: boolean | null
          payment_method?: string | null
          postal_code: string
          service_code?: string | null
          service_name?: string | null
          shipped_at?: string | null
          shipping_address: string
          shipping_cost?: number
          shipping_notes?: string | null
          status?: string
          total_amount: number
          total_weight_kg?: number | null
          tracking_access_expires_at?: string | null
          tracking_access_token?: string | null
          tracking_number?: string | null
          tracking_token?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          biteship_order_id?: string | null
          city?: string
          courier?: string | null
          courier_code?: string | null
          courier_name?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          estimated_delivery_days?: string | null
          external_id?: string | null
          id?: string
          invoice_url?: string | null
          is_local_delivery?: boolean | null
          payment_method?: string | null
          postal_code?: string
          service_code?: string | null
          service_name?: string | null
          shipped_at?: string | null
          shipping_address?: string
          shipping_cost?: number
          shipping_notes?: string | null
          status?: string
          total_amount?: number
          total_weight_kg?: number | null
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
      product_reviews: {
        Row: {
          created_at: string
          guest_email: string | null
          guest_name: string | null
          helpful_count: number
          id: string
          moderated_at: string | null
          moderated_by: string | null
          moderation_note: string | null
          product_id: string
          rating: number
          review_text: string
          status: string
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          helpful_count?: number
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          product_id: string
          rating: number
          review_text: string
          status?: string
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_email?: string | null
          guest_name?: string | null
          helpful_count?: number
          id?: string
          moderated_at?: string | null
          moderated_by?: string | null
          moderation_note?: string | null
          product_id?: string
          rating?: number
          review_text?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          attributes: Json
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          name: string
          original_price: number | null
          price: number
          product_id: string
          sku: string
          stock: number
          updated_at: string
        }
        Insert: {
          attributes?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name: string
          original_price?: number | null
          price: number
          product_id: string
          sku: string
          stock?: number
          updated_at?: string
        }
        Update: {
          attributes?: Json
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          name?: string
          original_price?: number | null
          price?: number
          product_id?: string
          sku?: string
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string
          created_at: string
          description: string
          has_variants: boolean
          height_cm: number | null
          id: string
          image: string
          images: string[] | null
          is_active: boolean
          length_cm: number | null
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
          weight_kg: number
          width_cm: number | null
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          has_variants?: boolean
          height_cm?: number | null
          id?: string
          image: string
          images?: string[] | null
          is_active?: boolean
          length_cm?: number | null
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
          weight_kg?: number
          width_cm?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          has_variants?: boolean
          height_cm?: number | null
          id?: string
          image?: string
          images?: string[] | null
          is_active?: boolean
          length_cm?: number | null
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
          weight_kg?: number
          width_cm?: number | null
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
      refund_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          completed_at: string | null
          created_at: string
          id: string
          order_id: string
          payment_request_id: string | null
          reason: string
          reason_note: string | null
          refund_method: string | null
          requested_by: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          xendit_refund_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id: string
          payment_request_id?: string | null
          reason: string
          reason_note?: string | null
          refund_method?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          xendit_refund_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string
          payment_request_id?: string | null
          reason?: string
          reason_note?: string | null
          refund_method?: string | null
          requested_by?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          xendit_refund_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful_votes: {
        Row: {
          created_at: string
          guest_identifier: string | null
          id: string
          review_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          guest_identifier?: string | null
          id?: string
          review_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          guest_identifier?: string | null
          id?: string
          review_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_couriers: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          priority: number
          supports_intercity: boolean
          supports_local: boolean
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          priority?: number
          supports_intercity?: boolean
          supports_local?: boolean
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          priority?: number
          supports_intercity?: boolean
          supports_local?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      shipping_rates_cache: {
        Row: {
          cached_at: string | null
          courier_code: string
          destination_area_id: string | null
          destination_city: string
          expires_at: string
          id: string
          max_estimated_days: number | null
          min_estimated_days: number | null
          origin_city: string
          rate_amount: number
          service_code: string
          service_name: string
          weight_kg: number
        }
        Insert: {
          cached_at?: string | null
          courier_code: string
          destination_area_id?: string | null
          destination_city: string
          expires_at: string
          id?: string
          max_estimated_days?: number | null
          min_estimated_days?: number | null
          origin_city: string
          rate_amount: number
          service_code: string
          service_name: string
          weight_kg: number
        }
        Update: {
          cached_at?: string | null
          courier_code?: string
          destination_area_id?: string | null
          destination_city?: string
          expires_at?: string
          id?: string
          max_estimated_days?: number | null
          min_estimated_days?: number | null
          origin_city?: string
          rate_amount?: number
          service_code?: string
          service_name?: string
          weight_kg?: number
        }
        Relationships: []
      }
      shipping_services: {
        Row: {
          courier_id: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean
          max_estimated_days: number | null
          min_estimated_days: number | null
          service_code: string
          service_name: string
        }
        Insert: {
          courier_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_estimated_days?: number | null
          min_estimated_days?: number | null
          service_code: string
          service_name: string
        }
        Update: {
          courier_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          max_estimated_days?: number | null
          min_estimated_days?: number | null
          service_code?: string
          service_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipping_services_courier_id_fkey"
            columns: ["courier_id"]
            isOneToOne: false
            referencedRelation: "shipping_couriers"
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
      daily_payment_stats: {
        Row: {
          daily_revenue: number | null
          failed_transactions: number | null
          success_rate: number | null
          successful_transactions: number | null
          total_transactions: number | null
          transaction_date: string | null
        }
        Relationships: []
      }
      monthly_payment_stats: {
        Row: {
          failed_transactions: number | null
          month_start: string | null
          monthly_revenue: number | null
          success_rate: number | null
          successful_transactions: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      payment_statistics: {
        Row: {
          average_transaction_value: number | null
          failed_transactions: number | null
          failure_rate: number | null
          first_transaction_date: string | null
          last_transaction_date: string | null
          success_rate: number | null
          successful_transactions: number | null
          total_revenue: number | null
          total_transactions: number | null
        }
        Relationships: []
      }
      revenue_by_payment_method: {
        Row: {
          average_value: number | null
          payment_method: string | null
          success_rate: number | null
          successful_count: number | null
          total_revenue: number | null
          transaction_count: number | null
        }
        Relationships: []
      }
      weekly_payment_stats: {
        Row: {
          failed_transactions: number | null
          success_rate: number | null
          successful_transactions: number | null
          total_transactions: number | null
          week_start: string | null
          weekly_revenue: number | null
        }
        Relationships: []
      }
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
      get_payment_stats: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          average_transaction_value: number
          failed_transactions: number
          failure_rate: number
          success_rate: number
          successful_transactions: number
          total_revenue: number
          total_transactions: number
        }[]
      }
      get_product_with_variants: {
        Args: { p_product_id: string }
        Returns: {
          product_data: Json
          variants_data: Json
        }[]
      }
      get_refund_with_order: {
        Args: { p_refund_id: string }
        Returns: {
          order_data: Json
          refund_data: Json
        }[]
      }
      get_top_payment_methods: {
        Args: { limit_count?: number }
        Returns: {
          payment_method: string
          success_rate: number
          total_revenue: number
          transaction_count: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_order_refundable: { Args: { p_order_id: string }; Returns: boolean }
      log_admin_activity: {
        Args: {
          p_action_type: string
          p_admin_email: string
          p_admin_id: string
          p_changes?: Json
          p_entity_id: string
          p_entity_name?: string
          p_entity_type: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: string
      }
      product_has_variants: { Args: { p_product_id: string }; Returns: boolean }
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
