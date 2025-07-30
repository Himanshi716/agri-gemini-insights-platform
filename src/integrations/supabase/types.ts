export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      analytics_reports: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          file_url: string | null
          generated_at: string | null
          id: string
          report_type: string
          scheduled_for: string | null
          status: string | null
          title: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          report_type: string
          scheduled_for?: string | null
          status?: string | null
          title: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          generated_at?: string | null
          id?: string
          report_type?: string
          scheduled_for?: string | null
          status?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
          audit_notes: string | null
          certificate_number: string | null
          created_at: string
          documents_url: string[] | null
          expiry_date: string | null
          farm_id: string
          id: string
          issued_date: string | null
          standard_name: string
          status: Database["public"]["Enums"]["compliance_status"]
          updated_at: string
        }
        Insert: {
          audit_notes?: string | null
          certificate_number?: string | null
          created_at?: string
          documents_url?: string[] | null
          expiry_date?: string | null
          farm_id: string
          id?: string
          issued_date?: string | null
          standard_name: string
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
        }
        Update: {
          audit_notes?: string | null
          certificate_number?: string | null
          created_at?: string
          documents_url?: string[] | null
          expiry_date?: string | null
          farm_id?: string
          id?: string
          issued_date?: string | null
          standard_name?: string
          status?: Database["public"]["Enums"]["compliance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          category: string
          compliance_score: number | null
          created_at: string | null
          evidence_required: string[] | null
          id: string
          last_assessed: string | null
          next_assessment: string | null
          priority: string | null
          requirement_text: string
          standard_name: string
        }
        Insert: {
          category: string
          compliance_score?: number | null
          created_at?: string | null
          evidence_required?: string[] | null
          id?: string
          last_assessed?: string | null
          next_assessment?: string | null
          priority?: string | null
          requirement_text: string
          standard_name: string
        }
        Update: {
          category?: string
          compliance_score?: number | null
          created_at?: string | null
          evidence_required?: string[] | null
          id?: string
          last_assessed?: string | null
          next_assessment?: string | null
          priority?: string | null
          requirement_text?: string
          standard_name?: string
        }
        Relationships: []
      }
      crops: {
        Row: {
          actual_harvest_date: string | null
          area_hectares: number | null
          created_at: string
          expected_harvest_date: string | null
          farm_id: string
          id: string
          name: string
          notes: string | null
          planting_date: string | null
          status: Database["public"]["Enums"]["crop_status"]
          updated_at: string
          variety: string | null
        }
        Insert: {
          actual_harvest_date?: string | null
          area_hectares?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          planting_date?: string | null
          status?: Database["public"]["Enums"]["crop_status"]
          updated_at?: string
          variety?: string | null
        }
        Update: {
          actual_harvest_date?: string | null
          area_hectares?: number | null
          created_at?: string
          expected_harvest_date?: string | null
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          planting_date?: string | null
          status?: Database["public"]["Enums"]["crop_status"]
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crops_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      export_documents: {
        Row: {
          blockchain_hash: string | null
          content: Json | null
          created_at: string
          crop_id: string | null
          document_type: string
          farm_id: string
          file_url: string | null
          generated_by: string | null
          id: string
          qr_code_url: string | null
          status: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at: string
        }
        Insert: {
          blockchain_hash?: string | null
          content?: Json | null
          created_at?: string
          crop_id?: string | null
          document_type: string
          farm_id: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title: string
          updated_at?: string
        }
        Update: {
          blockchain_hash?: string | null
          content?: Json | null
          created_at?: string
          crop_id?: string | null
          document_type?: string
          farm_id?: string
          file_url?: string | null
          generated_by?: string | null
          id?: string
          qr_code_url?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "export_documents_crop_id_fkey"
            columns: ["crop_id"]
            isOneToOne: false
            referencedRelation: "crops"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "export_documents_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          latitude: number | null
          location_address: string | null
          longitude: number | null
          name: string
          size_hectares: number | null
          status: Database["public"]["Enums"]["farm_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          name: string
          size_hectares?: number | null
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          latitude?: number | null
          location_address?: string | null
          longitude?: number | null
          name?: string
          size_hectares?: number | null
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      iot_sensors: {
        Row: {
          created_at: string
          device_id: string | null
          farm_id: string
          id: string
          is_active: boolean
          last_reading_at: string | null
          latitude: number | null
          location_description: string | null
          longitude: number | null
          name: string
          type: Database["public"]["Enums"]["sensor_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          device_id?: string | null
          farm_id: string
          id?: string
          is_active?: boolean
          last_reading_at?: string | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name: string
          type: Database["public"]["Enums"]["sensor_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          device_id?: string | null
          farm_id?: string
          id?: string
          is_active?: boolean
          last_reading_at?: string | null
          latitude?: number | null
          location_description?: string | null
          longitude?: number | null
          name?: string
          type?: Database["public"]["Enums"]["sensor_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensors_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      real_time_data: {
        Row: {
          data_type: string
          id: string
          metadata: Json | null
          sensor_id: string
          timestamp: string | null
          unit: string
          value: number
        }
        Insert: {
          data_type: string
          id?: string
          metadata?: Json | null
          sensor_id: string
          timestamp?: string | null
          unit: string
          value: number
        }
        Update: {
          data_type?: string
          id?: string
          metadata?: Json | null
          sensor_id?: string
          timestamp?: string | null
          unit?: string
          value?: number
        }
        Relationships: []
      }
      sensor_readings: {
        Row: {
          id: string
          metadata: Json | null
          sensor_id: string
          timestamp: string
          unit: string
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          sensor_id: string
          timestamp?: string
          unit: string
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          sensor_id?: string
          timestamp?: string
          unit?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "sensor_readings_sensor_id_fkey"
            columns: ["sensor_id"]
            isOneToOne: false
            referencedRelation: "iot_sensors"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_compliance_score: {
        Args: { farm_id_param: string }
        Returns: number
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_email_confirmed: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      compliance_status: "pending" | "approved" | "rejected" | "expired"
      crop_status:
        | "planted"
        | "growing"
        | "harvesting"
        | "harvested"
        | "processed"
      document_status:
        | "draft"
        | "pending"
        | "approved"
        | "rejected"
        | "archived"
      farm_status: "active" | "inactive" | "under_inspection"
      sensor_type:
        | "temperature"
        | "humidity"
        | "soil_moisture"
        | "ph"
        | "light"
        | "co2"
      user_role: "farmer" | "admin" | "inspector" | "export_manager"
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
      compliance_status: ["pending", "approved", "rejected", "expired"],
      crop_status: [
        "planted",
        "growing",
        "harvesting",
        "harvested",
        "processed",
      ],
      document_status: ["draft", "pending", "approved", "rejected", "archived"],
      farm_status: ["active", "inactive", "under_inspection"],
      sensor_type: [
        "temperature",
        "humidity",
        "soil_moisture",
        "ph",
        "light",
        "co2",
      ],
      user_role: ["farmer", "admin", "inspector", "export_manager"],
    },
  },
} as const
