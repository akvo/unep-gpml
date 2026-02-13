// Category IDs
export const CATEGORY_IDS = {
  INDUSTRY_AND_TRADE: 'industry-and-trade',
  WASTE_MANAGEMENT: 'waste-management',
  ENVIRONMENTAL_IMPACT: 'environmental-impact',
  GOVERNANCE_AND_REGULATIONS: 'governance-and-regulations',
  OVERVIEW: 'overview',
}

// ArcGIS Layer IDs — Trade (Value)
export const LAYER_IDS = {
  // Import value layers
  TOTAL_IMPORT_VALUE: 'Total_plastic___value__import__V2_WFL1',
  PRIMARY_FORM_IMPORT_VALUE: 'Plastic_in_primary_form___value__import__V2_WFL1',
  INTERMEDIATE_FORM_IMPORT_VALUE:
    'Intermediate_forms_of_plastic___value__import__WFL1',
  FINAL_GOODS_IMPORT_VALUE:
    'Final_manufactured_plastic_goods___value__import__WFL1',
  INTERMEDIATE_MAN_IMPORT_VALUE: 'Intermediate_man___value__import__V2_WFL1',
  PLASTIC_WASTE_IMPORT_VALUE: 'Plastic_waste___value__import__V2_WFL1',

  // Export value layers
  TOTAL_EXPORT_VALUE: 'Total_plastic___value__export__V2_WFL1',
  PRIMARY_FORM_EXPORT_VALUE: 'Plastic_in_primary_form___value__export__V2_WFL1',
  INTERMEDIATE_FORM_EXPORT_VALUE:
    'Intermediate_forms_of_plastic___value__export__V2_WFL1',
  FINAL_GOODS_EXPORT_VALUE:
    'Final_manufactured_plastic_goods___value__export__V2_WFL1',
  INTERMEDIATE_MAN_EXPORT_VALUE: 'Intermediate_man___value__export__WFL1',
  PLASTIC_WASTE_EXPORT_VALUE: 'Plastic_waste___value__export__V2_WFL1',

  // Import weight layers
  PRIMARY_FORM_IMPORT_WEIGHT:
    'Plastics_in_primary_forms___weight__import__WFL1',
  INTERMEDIATE_FORM_IMPORT_WEIGHT:
    'Intermediate_forms_of_plastic_weight____import__WFL1',
  FINAL_GOODS_IMPORT_WEIGHT:
    'Final_manufactured_plastics_goods___weight__import__WFL1',
  INTERMEDIATE_MAN_IMPORT_WEIGHT: 'Intermediate___weight__import__WFL1',
  PLASTIC_WASTE_IMPORT_WEIGHT: 'Plastic_waste_weigth____import__WFL1',

  // Export weight layers
  PRIMARY_FORM_EXPORT_WEIGHT:
    'Plastics_in_primary_forms___weight__export__WFL1',
  INTERMEDIATE_FORM_EXPORT_WEIGHT:
    'Intermediate_forms_of_plastic_weight____export__WFL1',
  FINAL_GOODS_EXPORT_WEIGHT:
    'Final_manufactured_plastics_goods_weight____export__WFL1',
  INTERMEDIATE_MAN_EXPORT_WEIGHT: 'Intermediate___weight__export__WFL1',
  PLASTIC_WASTE_EXPORT_WEIGHT: 'Plastic_waste_weigth____export__WFL1',

  // Waste management layers
  MSW_NATIONAL: 'Municipal_solid_waste_generated_daily_per_capita_V3_WFL1',
  MSW_CITY: 'MSW_generation_rate__kg_cap_day__WFL1',
  PLASTIC_COMPOSITION_NATIONAL:
    'Municipal_solid_waste_plastic_composition_4_WFL1',
  PLASTIC_COMPOSITION_CITIES:
    'Proportion_of_plastic_waste_generated_WFL1',

  // Environmental impact layers
  OCEAN_ESCAPE: 'Mismanaged_plastic_waste_escaping_to_oceans_V3_WFL1',
  COAST_ESCAPE:
    'Mismanaged_plastic_waste_escaping_to_oceans_and_coasts_V3_WFL1',
  BEACH_ESCAPE: 'Mismanaged_plastic_waste_escaping_to_beaches_V3_WFL1',
}

// Supplementary weight layer IDs used in cleanArcGisFields
export const WEIGHT_LAYER_IDS = [
  LAYER_IDS.PRIMARY_FORM_IMPORT_WEIGHT,
  LAYER_IDS.INTERMEDIATE_FORM_IMPORT_WEIGHT,
  LAYER_IDS.FINAL_GOODS_IMPORT_WEIGHT,
  LAYER_IDS.INTERMEDIATE_MAN_IMPORT_WEIGHT,
  LAYER_IDS.PLASTIC_WASTE_IMPORT_WEIGHT,
  LAYER_IDS.PRIMARY_FORM_EXPORT_WEIGHT,
  LAYER_IDS.INTERMEDIATE_FORM_EXPORT_WEIGHT,
  LAYER_IDS.FINAL_GOODS_EXPORT_WEIGHT,
  LAYER_IDS.INTERMEDIATE_MAN_EXPORT_WEIGHT,
  LAYER_IDS.PLASTIC_WASTE_EXPORT_WEIGHT,
]

// Chart color palette
export const COLORS = {
  PRIMARY_DARK_BLUE: '#020A5B',
  ACCENT_YELLOW: '#FFB800',
  ACCENT_BLUE: '#00A4EC',
  ACCENT_GREEN: '#00C49A',
  TEXT_DARK: '#1B2738',
  WHITE: '#FFFFFF',
  BACKGROUND: '#F5F7FF',
}

// Series colors for stacked bar/pie charts
export const SERIES_COLORS = ['#384E85', '#FFB800', '#f56a00', '#A7AD3E', '#3498db']

// Mobile breakpoint
export const MOBILE_BREAKPOINT = 768

// Column split marker used in Handlebars templates
export const COLUMN_SPLIT_MARKER = '<!--NEW_COLUMN-->'
