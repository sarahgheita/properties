// Hand-written to match supabase/migrations/*.sql. Once you have a live Supabase project,
// regenerate the authoritative version with:
//   npx supabase gen types typescript --project-id <your-project-id> > src/lib/database.types.ts

export type UserRole = "admin" | "user";
export type ListingType = "sale" | "rent";
export type ModerationStatus = "pending_review" | "approved" | "rejected" | "archived";
export type PropertyType =
  | "apartment"
  | "villa"
  | "townhouse"
  | "duplex"
  | "studio"
  | "chalet"
  | "office"
  | "shop"
  | "land"
  | "other";
export type InquiryStatus = "new" | "contacted" | "closed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string | null;
          phone: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
        Relationships: [];
      };
      properties: {
        Row: {
          id: string;
          owner_id: string;
          listing_type: ListingType;
          property_type: PropertyType;
          title: string;
          description: string;
          price: number;
          currency: string;
          rent_period: string | null;
          city: string;
          area: string;
          address_line: string | null;
          bedrooms: number | null;
          bathrooms: number | null;
          area_sqm: number | null;
          status: ModerationStatus;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          flagged: boolean;
          flag_reasons: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["properties"]["Row"]> & {
          owner_id: string;
          listing_type: ListingType;
          title: string;
          description: string;
          price: number;
          city: string;
          area: string;
        };
        Update: Partial<Database["public"]["Tables"]["properties"]["Row"]>;
        Relationships: [];
      };
      property_images: {
        Row: {
          id: string;
          property_id: string;
          storage_path: string;
          position: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_images"]["Row"]> & {
          property_id: string;
          storage_path: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_images"]["Row"]>;
        Relationships: [];
      };
      property_contacts: {
        Row: {
          property_id: string;
          contact_name: string;
          contact_phone: string;
          contact_email: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_contacts"]["Row"]> & {
          property_id: string;
          contact_name: string;
          contact_phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_contacts"]["Row"]>;
        Relationships: [];
      };
      property_requests: {
        Row: {
          id: string;
          requester_id: string;
          listing_type: ListingType;
          property_type: PropertyType | null;
          description: string;
          budget_min: number | null;
          budget_max: number | null;
          currency: string;
          city: string | null;
          area: string | null;
          bedrooms_min: number | null;
          status: ModerationStatus;
          rejection_reason: string | null;
          reviewed_by: string | null;
          reviewed_at: string | null;
          flagged: boolean;
          flag_reasons: string[];
          source: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_requests"]["Row"]> & {
          requester_id: string;
          listing_type: ListingType;
          description: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_requests"]["Row"]>;
        Relationships: [];
      };
      property_request_contacts: {
        Row: {
          request_id: string;
          contact_name: string;
          contact_phone: string;
          contact_email: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_request_contacts"]["Row"]> & {
          request_id: string;
          contact_name: string;
          contact_phone: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_request_contacts"]["Row"]>;
        Relationships: [];
      };
      property_inquiries: {
        Row: {
          id: string;
          property_id: string;
          requester_id: string;
          message: string;
          status: InquiryStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["property_inquiries"]["Row"]> & {
          property_id: string;
          requester_id: string;
          message: string;
        };
        Update: Partial<Database["public"]["Tables"]["property_inquiries"]["Row"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}
