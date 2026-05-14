import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { compressAndUploadImage, getReceiptImageUrl } from '@/lib/image-utils';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

export interface ReceiptItem {
  name: string;
  qty?: number;
  price: number;
}

export interface ExtractedData {
  store_name: string;
  store_address?: string | null;
  date?: string | null;
  time?: string | null;
  items: ReceiptItem[];
  subtotal?: number | null;
  tax?: number | null;
  total?: number | null;
  payment_method?: string | null;
  receipt_number?: string | null;
  raw_text?: string;
}

export interface Receipt {
  id: string;
  store_name: string | null;
  amount: number | null;
  receipt_date: string | null;
  notes: string | null;
  image_path: string | null;
  image_size_kb: number | null;
  extracted_data: ExtractedData | null;
  category: string | null;
  created_at: string;
}

export function useReceipts() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading receipts', description: error.message, variant: 'destructive' });
    } else {
      setReceipts((data as unknown as Receipt[]) || []);
    }
    setLoading(false);
  }, [toast]);

  const addReceipt = async (
    file: File,
    storeName: string,
    amount: number | null,
    receiptDate: string,
    notes: string,
    category: string
  ) => {
    setLoading(true);
    try {
      const { path, sizeKb } = await compressAndUploadImage(file);

      const { data: insertData, error } = await supabase.from('receipts').insert({
        store_name: storeName || null,
        amount,
        receipt_date: receiptDate || new Date().toISOString().split('T')[0],
        notes: notes || null,
        image_path: path,
        image_size_kb: sizeKb,
        user_id: user!.id,
        category: category || null,
      }).select('id').single();

      if (error) throw error;

      toast({ title: 'Receipt saved!', description: `Extracting text with AI...` });

      const imageUrl = getReceiptImageUrl(path);
      try {
        const { data: extractResult, error: extractError } = await supabase.functions.invoke('extract-receipt', {
          body: { image_url: imageUrl, receipt_id: insertData.id }
        });
        if (extractError) {
          console.error('Extraction error:', extractError);
          toast({ title: 'Receipt saved', description: 'AI extraction failed, but image is stored.', variant: 'default' });
        } else {
          toast({ title: 'Receipt processed!', description: 'Text extracted and formatted as document.' });
        }
      } catch (extractErr) {
        console.error('Extraction error:', extractErr);
      }

      await fetchReceipts();
    } catch (err: any) {
      toast({ title: 'Error saving receipt', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const updateExtractedData = async (receiptId: string, extractedData: ExtractedData) => {
    const { error } = await supabase.from('receipts').update({
      extracted_data: extractedData as any,
      store_name: extractedData.store_name || null,
      amount: extractedData.total ?? null,
    }).eq('id', receiptId);

    if (error) {
      toast({ title: 'Error updating receipt', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Receipt updated!' });
      await fetchReceipts();
    }
  };

  const reExtract = async (receipt: Receipt) => {
    if (!receipt.image_path) {
      toast({ title: 'No image', description: 'This receipt has no image to re-extract from.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const imageUrl = getReceiptImageUrl(receipt.image_path);
      toast({ title: 'Re-extracting...', description: 'Running AI extraction again.' });
      const { error: extractError } = await supabase.functions.invoke('extract-receipt', {
        body: { image_url: imageUrl, receipt_id: receipt.id }
      });
      if (extractError) throw extractError;
      toast({ title: 'Re-extraction complete!', description: 'Receipt data has been updated.' });
      await fetchReceipts();
    } catch (err: any) {
      toast({ title: 'Re-extraction failed', description: err.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  const deleteReceipt = async (receipt: Receipt) => {
    if (receipt.image_path) {
      await supabase.storage.from('receipts').remove([receipt.image_path]);
    }
    const { error } = await supabase.from('receipts').delete().eq('id', receipt.id);
    if (error) {
      toast({ title: 'Error deleting receipt', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Receipt deleted' });
      await fetchReceipts();
    }
  };

  return { receipts, loading, fetchReceipts, addReceipt, deleteReceipt, updateExtractedData, reExtract, getReceiptImageUrl };
}
