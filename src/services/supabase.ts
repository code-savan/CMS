import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadContractPDF = async (file: File, contractId: string) => {
  try {
    // Create a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${contractId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from('contracts')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: 'application/pdf'
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('contracts')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};
