export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      contracts: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          expiry_date: string
          status: 'active' | 'expired' | 'pending'
          parties_involved: string[]
          pdf_url: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          expiry_date: string
          status: 'active' | 'expired' | 'pending'
          parties_involved: string[]
          pdf_url?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          expiry_date?: string
          status?: 'active' | 'expired' | 'pending'
          parties_involved?: string[]
          pdf_url?: string | null
          user_id?: string
        }
      }
    }
  }
}