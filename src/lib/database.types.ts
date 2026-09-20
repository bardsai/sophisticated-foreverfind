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
    PostgrestVersion: "14.15"
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
      blocks: {
        Row: {
          blocked_id: string
          blocker_id: string
          created_at: string
        }
        Insert: {
          blocked_id: string
          blocker_id: string
          created_at?: string
        }
        Update: {
          blocked_id?: string
          blocker_id?: string
          created_at?: string
        }
        Relationships: []
      }
      match_requests: {
        Row: {
          admin_id: string | null
          admin_note: string | null
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          admin_note?: string | null
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          admin_note?: string | null
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_requests_target_id_fkey"
            columns: ["target_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          id: string
          match_request_id: string
          user_a_id: string
          user_b_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_request_id: string
          user_a_id: string
          user_b_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_request_id?: string
          user_a_id?: string
          user_b_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_match_request_id_fkey"
            columns: ["match_request_id"]
            isOneToOne: true
            referencedRelation: "match_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_a_id_fkey"
            columns: ["user_a_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_user_b_id_fkey"
            columns: ["user_b_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          match_id: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_preferences: {
        Row: {
          deal_breakers: string[]
          id: string
          max_age: number | null
          max_distance_km: number | null
          min_age: number | null
          qualities: string[]
          updated_at: string
        }
        Insert: {
          deal_breakers?: string[]
          id: string
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          qualities?: string[]
          updated_at?: string
        }
        Update: {
          deal_breakers?: string[]
          id?: string
          max_age?: number | null
          max_distance_km?: number | null
          min_age?: number | null
          qualities?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_preferences_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_reviews: {
        Row: {
          admin_note: string | null
          created_at: string
          id: string
          photo_url: string
          profile_id: string
          reviewed_at: string | null
          status: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          id?: string
          photo_url: string
          profile_id: string
          reviewed_at?: string | null
          status?: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          id?: string
          photo_url?: string
          profile_id?: string
          reviewed_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_reviews_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_locations: {
        Row: {
          id: string
          latitude: number
          longitude: number
          updated_at: string
        }
        Insert: {
          id: string
          latitude: number
          longitude: number
          updated_at?: string
        }
        Update: {
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_locations_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          birthdate: string
          children_count: number
          city: string | null
          created_at: string
          display_name: string
          education_level: string | null
          gender: string | null
          genotype: string | null
          height_cm: number | null
          hometown: string | null
          id: string
          interests: string[]
          is_single_parent: boolean
          marital_status: string | null
          occupation: string | null
          onboarding_completed_at: string | null
          phone_number: string | null
          physique: string | null
          primary_photo_url: string | null
          push_token: string | null
          religion: string | null
          status: string
          terms_accepted_at: string | null
          updated_at: string
          wants_children: string | null
        }
        Insert: {
          bio?: string | null
          birthdate: string
          children_count?: number
          city?: string | null
          created_at?: string
          display_name: string
          education_level?: string | null
          gender?: string | null
          genotype?: string | null
          height_cm?: number | null
          hometown?: string | null
          id: string
          interests?: string[]
          is_single_parent?: boolean
          marital_status?: string | null
          occupation?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          physique?: string | null
          primary_photo_url?: string | null
          push_token?: string | null
          religion?: string | null
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Update: {
          bio?: string | null
          birthdate?: string
          children_count?: number
          city?: string | null
          created_at?: string
          display_name?: string
          education_level?: string | null
          gender?: string | null
          genotype?: string | null
          height_cm?: number | null
          hometown?: string | null
          id?: string
          interests?: string[]
          is_single_parent?: boolean
          marital_status?: string | null
          occupation?: string | null
          onboarding_completed_at?: string | null
          phone_number?: string | null
          physique?: string | null
          primary_photo_url?: string | null
          push_token?: string | null
          religion?: string | null
          status?: string
          terms_accepted_at?: string | null
          updated_at?: string
          wants_children?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reported_id: string
          reporter_id: string
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reported_id?: string
          reporter_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_reported_id_fkey"
            columns: ["reported_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_resolve_report: {
        Args: {
          p_report_id: string
          p_status: string
          p_suspend_reported?: boolean
        }
        Returns: {
          created_at: string
          details: string | null
          id: string
          reason: string
          reported_id: string
          reporter_id: string
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "reports"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_review_photo: {
        Args: { p_approve: boolean; p_note?: string; p_review_id: string }
        Returns: {
          admin_note: string | null
          created_at: string
          id: string
          photo_url: string
          profile_id: string
          reviewed_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_review_request: {
        Args: { p_approve: boolean; p_note?: string; p_request_id: string }
        Returns: {
          admin_id: string | null
          admin_note: string | null
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "match_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_blocked_pair: { Args: { a: string; b: string }; Returns: boolean }
      nearby_profile_ids: {
        Args: { p_max_distance_km: number }
        Returns: {
          distance_km: number
          profile_id: string
        }[]
      }
      request_match: {
        Args: { p_target_id: string }
        Returns: {
          admin_id: string | null
          admin_note: string | null
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "match_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      respond_to_request: {
        Args: { p_accept: boolean; p_request_id: string }
        Returns: {
          admin_id: string | null
          admin_note: string | null
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "match_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      send_message: {
        Args: { p_body: string; p_match_id: string }
        Returns: {
          body: string
          created_at: string
          id: string
          match_id: string
          sender_id: string
        }
        SetofOptions: {
          from: "*"
          to: "messages"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      submit_photo_for_review: {
        Args: { p_photo_url: string }
        Returns: {
          admin_note: string | null
          created_at: string
          id: string
          photo_url: string
          profile_id: string
          reviewed_at: string | null
          status: string
        }
        SetofOptions: {
          from: "*"
          to: "photo_reviews"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      withdraw_request: {
        Args: { p_request_id: string }
        Returns: {
          admin_id: string | null
          admin_note: string | null
          created_at: string
          id: string
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "match_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
