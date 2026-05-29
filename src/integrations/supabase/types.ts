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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      badges_unlocked: {
        Row: {
          badge_key: string
          child_id: string
          unlocked_at: string
        }
        Insert: {
          badge_key: string
          child_id: string
          unlocked_at?: string
        }
        Update: {
          badge_key?: string
          child_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "badges_unlocked_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      child_profiles: {
        Row: {
          age_group: string
          avatar: string
          created_at: string
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          age_group: string
          avatar?: string
          created_at?: string
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          age_group?: string
          avatar?: string
          created_at?: string
          id?: string
          name?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "child_profiles_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_xp: {
        Row: {
          child_id: string
          day: string
          xp: number
        }
        Insert: {
          child_id: string
          day: string
          xp?: number
        }
        Update: {
          child_id?: string
          day?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "daily_xp_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exercises: {
        Row: {
          age_group: string
          audio_script: string | null
          correct_answer: string | null
          created_at: string
          difficulty: string | null
          explanation: string | null
          extra: Json | null
          id: string
          image_prompt: string | null
          options: Json | null
          pt_translation: string | null
          question: string
          skill: string | null
          topic: string | null
          type: string
          xp_reward: number
        }
        Insert: {
          age_group: string
          audio_script?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          extra?: Json | null
          id: string
          image_prompt?: string | null
          options?: Json | null
          pt_translation?: string | null
          question: string
          skill?: string | null
          topic?: string | null
          type: string
          xp_reward?: number
        }
        Update: {
          age_group?: string
          audio_script?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          extra?: Json | null
          id?: string
          image_prompt?: string | null
          options?: Json | null
          pt_translation?: string | null
          question?: string
          skill?: string | null
          topic?: string | null
          type?: string
          xp_reward?: number
        }
        Relationships: []
      }
      lesson_history: {
        Row: {
          child_id: string
          created_at: string
          emoji: string | null
          id: number
          title: string
          xp: number
        }
        Insert: {
          child_id: string
          created_at?: string
          emoji?: string | null
          id?: number
          title: string
          xp?: number
        }
        Update: {
          child_id?: string
          created_at?: string
          emoji?: string | null
          id?: number
          title?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "lesson_history_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
        }
        Relationships: []
      }
      progress: {
        Row: {
          child_id: string
          level_seen: number
          streak_count: number
          streak_last_day: string | null
          updated_at: string
          xp: number
        }
        Insert: {
          child_id: string
          level_seen?: number
          streak_count?: number
          streak_last_day?: string | null
          updated_at?: string
          xp?: number
        }
        Update: {
          child_id?: string
          level_seen?: number
          streak_count?: number
          streak_last_day?: string | null
          updated_at?: string
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: true
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      words_learned: {
        Row: {
          child_id: string
          created_at: string
          word: string
        }
        Insert: {
          child_id: string
          created_at?: string
          word: string
        }
        Update: {
          child_id?: string
          created_at?: string
          word?: string
        }
        Relationships: [
          {
            foreignKeyName: "words_learned_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "child_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      owns_child: { Args: { _child_id: string }; Returns: boolean }
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
