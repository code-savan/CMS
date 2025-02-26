export interface Contract {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'pending' | 'expired';
  expiry_date: string;
  parties_involved: string[];
  pdf_url?: string;
  created_at: string;
  updated_at: string;
}
