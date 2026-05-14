import { useEffect, useMemo, useState } from 'react';
import { Receipt as ReceiptIcon, HardDrive, LogOut, BarChart3, FileText } from 'lucide-react';
import { ReceiptUploadForm } from '@/components/ReceiptUploadForm';
import { ReceiptList } from '@/components/ReceiptList';
import { ReceiptFilters, emptyFilters, type ReceiptFilterValues } from '@/components/ReceiptFilters';
import { useReceipts } from '@/hooks/use-receipts';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import Dashboard from '@/pages/Dashboard';

const Index = () => {
  const { signOut } = useAuth();
  const { receipts, loading, fetchReceipts, addReceipt, deleteReceipt, updateExtractedData, reExtract } = useReceipts();
  const [tab, setTab] = useState<'receipts' | 'dashboard'>('receipts');
  const [filters, setFilters] = useState<ReceiptFilterValues>(emptyFilters);

  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (!(r.store_name || '').toLowerCase().includes(q)) return false;
      }
      if (filters.dateFrom && r.receipt_date) {
        if (new Date(r.receipt_date) < filters.dateFrom) return false;
      }
      if (filters.dateTo && r.receipt_date) {
        const to = new Date(filters.dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(r.receipt_date) > to) return false;
      }
      if (filters.amountMin && (r.amount == null || r.amount < Number(filters.amountMin))) return false;
      if (filters.amountMax && (r.amount == null || r.amount > Number(filters.amountMax))) return false;
      if (filters.category && r.category !== filters.category) return false;
      return true;
    });
  }, [receipts, filters]);

  useEffect(() => {
    fetchReceipts();
  }, [fetchReceipts]);

  const totalSizeKb = useMemo(
    () => receipts.reduce((sum, r) => sum + (r.image_size_kb || 0), 0),
    [receipts]
  );

  const uniqueStoreNames = useMemo(
    () => [...new Set(receipts.map((r) => r.store_name).filter(Boolean))] as string[],
    [receipts]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b backdrop-blur-sm">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <ReceiptIcon className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-foreground leading-tight">RST SPILWORKS</h1>
              <p className="text-xs text-muted-foreground">Receipt Scanner</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
              <HardDrive className="h-3.5 w-3.5" />
              <span>{receipts.length}</span>
              <span className="text-muted-foreground/50">·</span>
              <span>{totalSizeKb < 1024 ? `${Math.round(totalSizeKb)} KB` : `${(totalSizeKb / 1024).toFixed(1)} MB`}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-lg mx-auto px-4 flex border-t">
          <button
            onClick={() => setTab('receipts')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'receipts'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" /> Receipts
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              tab === 'dashboard'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <BarChart3 className="h-4 w-4" /> Dashboard
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {tab === 'receipts' ? (
          <>
            <ReceiptUploadForm onSubmit={addReceipt} loading={loading} />
            <ReceiptFilters filters={filters} onChange={setFilters} storeNames={uniqueStoreNames} />
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display font-semibold text-foreground">Recent Receipts</h2>
                {filteredReceipts.length !== receipts.length && (
                  <span className="text-xs text-muted-foreground">{filteredReceipts.length} of {receipts.length}</span>
                )}
              </div>
              <ReceiptList receipts={filteredReceipts} onDelete={deleteReceipt} onUpdateExtracted={updateExtractedData} onReExtract={reExtract} loading={loading} />
            </div>
          </>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
};

export default Index;
