import { RECEIPT_CATEGORIES } from './categories';

// Keyword-to-category mapping for a fabrication/welding business
const KEYWORD_MAP: Record<string, string[]> = {
  raw_materials: [
    'steel', 'metal', 'iron', 'aluminium', 'aluminum', 'copper', 'brass', 'pipe', 'tube',
    'plate', 'sheet', 'bar', 'rod', 'beam', 'angle', 'channel', 'flat', 'mesh',
    'hardware', 'bolt', 'nut', 'screw', 'rivet', 'washer', 'fastener',
    'building', 'timber', 'cement', 'concrete', 'sand', 'aggregate',
  ],
  welding_supplies: [
    'weld', 'electrode', 'wire', 'flux', 'argon', 'co2', 'mig', 'tig', 'arc',
    'cutting disc', 'grinding disc', 'abrasive', 'solder', 'brazing',
    'afrox', 'airliquide', 'air liquide',
  ],
  tools_equipment: [
    'tool', 'drill', 'grinder', 'saw', 'clamp', 'vice', 'hammer', 'spanner',
    'wrench', 'plier', 'measure', 'tape', 'level', 'machine', 'compressor',
    'generator', 'jack', 'hoist', 'winch', 'makita', 'bosch', 'dewalt', 'hilti',
  ],
  transport: [
    'transport', 'delivery', 'freight', 'courier', 'shipping', 'truck', 'vehicle',
    'taxi', 'uber', 'bolt', 'petrol station', 'toll', 'parking',
  ],
  ppe_safety: [
    'safety', 'ppe', 'helmet', 'glove', 'goggle', 'boot', 'overall', 'mask',
    'visor', 'earplug', 'harness', 'fire extinguisher', 'first aid',
  ],
  fuel_gas: [
    'fuel', 'diesel', 'petrol', 'gasoline', 'gas', 'lpg', 'propane', 'acetylene',
    'oxygen', 'nitrogen', 'shell', 'engen', 'caltex', 'total energies', 'bp',
    'sasol', 'galp',
  ],
  maintenance: [
    'maintenance', 'repair', 'service', 'fix', 'spare', 'bearing', 'belt',
    'filter', 'oil', 'lubricant', 'grease', 'hydraulic', 'pneumatic',
  ],
  subcontractor: [
    'subcontractor', 'contractor', 'labour', 'labor', 'manpower', 'hire',
    'rental', 'consulting', 'engineering',
  ],
  office_admin: [
    'office', 'stationery', 'paper', 'ink', 'toner', 'printer', 'computer',
    'phone', 'airtime', 'data', 'internet', 'subscription', 'insurance',
    'accounting', 'legal', 'bank', 'swazibank', 'fnb', 'nedbank', 'standard bank',
  ],
  utilities: [
    'electric', 'electricity', 'water', 'sewage', 'waste', 'municipal', 'council',
    'eswatini electricity', 'seb', 'ewsc',
  ],
};

export function suggestCategory(storeName: string): string | null {
  if (!storeName || storeName.trim().length < 2) return null;
  const lower = storeName.toLowerCase();

  for (const [category, keywords] of Object.entries(KEYWORD_MAP)) {
    for (const kw of keywords) {
      if (lower.includes(kw)) {
        return category;
      }
    }
  }
  return null;
}
