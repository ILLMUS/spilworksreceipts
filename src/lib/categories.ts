export interface Category {
  value: string;
  label: string;
  color: string; // Tailwind bg class
  textColor: string; // Tailwind text class
}

export const RECEIPT_CATEGORIES: Category[] = [
  { value: 'raw_materials', label: 'Raw Materials', color: 'bg-orange-100', textColor: 'text-orange-700' },
  { value: 'welding_supplies', label: 'Welding Supplies', color: 'bg-red-100', textColor: 'text-red-700' },
  { value: 'tools_equipment', label: 'Tools & Equipment', color: 'bg-blue-100', textColor: 'text-blue-700' },
  { value: 'transport', label: 'Transport & Delivery', color: 'bg-purple-100', textColor: 'text-purple-700' },
  { value: 'ppe_safety', label: 'PPE & Safety', color: 'bg-green-100', textColor: 'text-green-700' },
  { value: 'fuel_gas', label: 'Fuel & Gas', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  { value: 'maintenance', label: 'Maintenance & Repairs', color: 'bg-cyan-100', textColor: 'text-cyan-700' },
  { value: 'subcontractor', label: 'Subcontractor & Labour', color: 'bg-pink-100', textColor: 'text-pink-700' },
  { value: 'office_admin', label: 'Office & Admin', color: 'bg-slate-100', textColor: 'text-slate-700' },
  { value: 'utilities', label: 'Utilities', color: 'bg-emerald-100', textColor: 'text-emerald-700' },
  { value: 'other', label: 'Other', color: 'bg-gray-100', textColor: 'text-gray-700' },
];

export function getCategoryByValue(value: string | null | undefined): Category | undefined {
  return RECEIPT_CATEGORIES.find((c) => c.value === value);
}
