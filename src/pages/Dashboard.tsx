import { useEffect, useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, ReceiptText, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useReceipts } from '@/hooks/use-receipts';
import type { Receipt } from '@/hooks/use-receipts';
import { RECEIPT_CATEGORIES, getCategoryByValue } from '@/lib/categories';

const COLORS = [
  'hsl(25, 95%, 53%)',   // primary orange
  'hsl(200, 70%, 50%)',  // blue
  'hsl(150, 60%, 45%)',  // green
  'hsl(340, 65%, 55%)',  // pink
  'hsl(270, 55%, 55%)',  // purple
  'hsl(45, 85%, 50%)',   // gold
  'hsl(180, 50%, 45%)',  // teal
  'hsl(10, 70%, 55%)',   // red-orange
];

export default function Dashboard() {
  const { receipts, fetchReceipts } = useReceipts();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => { fetchReceipts(); }, [fetchReceipts]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);

  const monthReceipts = useMemo(() =>
    receipts.filter(r => {
      if (!r.receipt_date) return false;
      const d = new Date(r.receipt_date);
      return d >= monthStart && d <= monthEnd;
    }),
    [receipts, monthStart, monthEnd]
  );

  const totalSpent = useMemo(
    () => monthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0),
    [monthReceipts]
  );

  const byStore = useMemo(() => {
    const map: Record<string, number> = {};
    monthReceipts.forEach(r => {
      const store = r.store_name || 'Unknown';
      map[store] = (map[store] || 0) + (r.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [monthReceipts]);

  const byCategory = useMemo(() => {
    const map: Record<string, number> = {};
    monthReceipts.forEach(r => {
      const cat = getCategoryByValue(r.category);
      const label = cat ? cat.label : 'Uncategorised';
      map[label] = (map[label] || 0) + (r.amount || 0);
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value: Number(value.toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  }, [monthReceipts]);

  const CATEGORY_COLORS: Record<string, string> = useMemo(() => {
    const map: Record<string, string> = { 'Uncategorised': 'hsl(220, 10%, 60%)' };
    RECEIPT_CATEGORIES.forEach(c => {
      const hueMap: Record<string, string> = {
        'bg-orange-100': 'hsl(25, 85%, 55%)',
        'bg-red-100': 'hsl(0, 70%, 55%)',
        'bg-blue-100': 'hsl(215, 70%, 55%)',
        'bg-purple-100': 'hsl(270, 55%, 55%)',
        'bg-green-100': 'hsl(145, 60%, 42%)',
        'bg-yellow-100': 'hsl(45, 85%, 50%)',
        'bg-cyan-100': 'hsl(185, 55%, 45%)',
        'bg-pink-100': 'hsl(340, 65%, 55%)',
        'bg-slate-100': 'hsl(215, 15%, 50%)',
        'bg-emerald-100': 'hsl(160, 60%, 42%)',
        'bg-gray-100': 'hsl(220, 10%, 55%)',
      };
      map[c.label] = hueMap[c.color] || 'hsl(220, 10%, 55%)';
    });
    return map;
  }, []);

  const byDay = useMemo(() => {
    const map: Record<string, number> = {};
    monthReceipts.forEach(r => {
      if (!r.receipt_date) return;
      const day = format(new Date(r.receipt_date), 'MMM d');
      map[day] = (map[day] || 0) + (r.amount || 0);
    });
    return Object.entries(map)
      .map(([date, amount]) => ({ date, amount: Number(amount.toFixed(2)) }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [monthReceipts]);

  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));

  return (
    <div className="space-y-6">
      {/* Month Selector */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-display font-bold text-lg text-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Spent</p>
              <p className="font-display font-bold text-lg text-foreground">
                E{totalSpent.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ReceiptText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Receipts</p>
              <p className="font-display font-bold text-lg text-foreground">{monthReceipts.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {monthReceipts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <p className="font-display text-lg">No receipts this month</p>
          <p className="text-sm mt-1">Upload receipts to see your spending breakdown</p>
        </div>
      ) : (
        <>
          {/* Daily Spending Bar Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Daily Spending</CardTitle>
            </CardHeader>
            <CardContent className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byDay}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `E${v}`} width={55} />
                  <Tooltip formatter={(v: number) => [`E${v.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}`, 'Amount']} />
                  <Bar dataKey="amount" fill="hsl(25, 95%, 53%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By Store Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Spending by Store</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byStore}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    style={{ fontSize: 11 }}
                  >
                    {byStore.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`E${v.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* By Category Pie Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="45%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                    style={{ fontSize: 11 }}
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={CATEGORY_COLORS[entry.name] || COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => [`E${v.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}`, 'Spent']} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Breakdown List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Category Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat.name] || 'hsl(220,10%,55%)' }} />
                    <span className="text-sm text-foreground truncate">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    E{cat.value.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Store Breakdown List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Store Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {byStore.map((store, i) => (
                <div key={store.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-foreground truncate">{store.name}</span>
                  </div>
                  <span className="text-sm font-medium tabular-nums text-foreground">
                    E{store.value.toLocaleString('en-SZ', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
