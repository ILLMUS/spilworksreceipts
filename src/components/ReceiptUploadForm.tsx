import { useState, useRef, useEffect } from 'react';
import { Camera, Upload, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RECEIPT_CATEGORIES } from '@/lib/categories';
import { suggestCategory } from '@/lib/category-suggest';

interface ReceiptUploadFormProps {
  onSubmit: (file: File, storeName: string, amount: number | null, date: string, notes: string, category: string) => Promise<void>;
  loading: boolean;
}

export function ReceiptUploadForm({ onSubmit, loading }: ReceiptUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [storeName, setStoreName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('');
  const [autoSuggested, setAutoSuggested] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  // Auto-suggest category when store name changes
  useEffect(() => {
    const suggested = suggestCategory(storeName);
    if (suggested && !category) {
      setCategory(suggested);
      setAutoSuggested(true);
    } else if (suggested && autoSuggested) {
      setCategory(suggested);
    }
  }, [storeName]);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSubmit = async () => {
    if (!file) return;
    await onSubmit(file, storeName, amount ? parseFloat(amount) : null, date, notes, category);
    setFile(null);
    setPreview(null);
    setStoreName('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setCategory('');
    setAutoSuggested(false);
  };

  return (
    <Card className="border-2 border-dashed border-primary/30 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display">Scan Receipt</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {preview ? (
          <div className="relative rounded-lg overflow-hidden">
            <img src={preview} alt="Receipt preview" className="w-full max-h-48 object-cover rounded-lg" />
            <button
              onClick={() => { setFile(null); setPreview(null); }}
              className="absolute top-2 right-2 bg-foreground/70 text-background rounded-full w-6 h-6 flex items-center justify-center text-xs"
            >
              ×
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 h-20 flex-col gap-1"
              onClick={() => cameraRef.current?.click()}
            >
              <Camera className="h-5 w-5" />
              <span className="text-xs">Camera</span>
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-20 flex-col gap-1"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-5 w-5" />
              <span className="text-xs">Upload</span>
            </Button>
          </div>
        )}

        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />

        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="Store name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
          <Input placeholder="Amount (E)" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>

        <div className="relative">
          <Select value={category} onValueChange={(val) => { setCategory(val); setAutoSuggested(false); }}>
            <SelectTrigger>
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              {RECEIPT_CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  <span className="flex items-center gap-2">
                    <span className={`inline-block w-2.5 h-2.5 rounded-full ${cat.color} border ${cat.textColor.replace('text-', 'border-')}`} />
                    {cat.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {autoSuggested && category && (
            <span className="flex items-center gap-1 text-xs text-primary mt-1">
              <Sparkles className="h-3 w-3" /> Auto-suggested
            </span>
          )}
        </div>

        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        <Textarea placeholder="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />

        <Button onClick={handleSubmit} disabled={!file || loading} className="w-full">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Compressing & Saving...</> : 'Save Receipt'}
        </Button>
      </CardContent>
    </Card>
  );
}
