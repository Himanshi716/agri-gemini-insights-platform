export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
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
