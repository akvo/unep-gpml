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

// Section registry – drives TOC sidebar + section rendering for Excel countries
export const SECTION_REGISTRY = [
  { key: 'production', title: 'Production', textKey: 'production' },
  { key: 'trade', title: 'Trade', textKey: 'trade' },
  { key: 'consumption', title: 'Consumption', textKey: 'consumption' },
  {
    key: 'waste-management',
    title: 'Waste Management',
    textKey: 'wasteManagement',
  },
  {
    key: 'environment',
    title: 'Plastics in the Environment',
    textKey: 'environment',
  },
  {
    key: 'life-cycle-insights',
    title: 'Life Cycle Insights',
    textKey: 'lifeCycleInsights',
  },
]

// Countries that use Excel/JSON data instead of Strapi
export const EXCEL_COUNTRY_CODES = ['KHM', 'ZAF', 'SEN', 'JPN', 'ECU', 'PER', 'IND', 'MUS']

// Charts that must always fetch data from Strapi layers, even for Excel countries
export const STRAPI_LAYER_CHARTS = [
  'plasticImportExportLine',
  'plasticImportExportBar',
  'plasticImportExportPie',
]

// Sections whose text content should be fetched from Strapi, even for Excel countries
export const STRAPI_CONTENT_SECTIONS = ['trade']

// Excel-based category definitions (sidebar items for Excel countries)
export const EXCEL_CATEGORY_IDS = {
  PRODUCTION: 'production',
  TRADE: 'trade',
  CONSUMPTION: 'consumption',
  WASTE_MANAGEMENT: 'waste-management-xl',
  ENVIRONMENT: 'environment',
  LIFE_CYCLE_INSIGHTS: 'life-cycle-insights',
}

export const EXCEL_CATEGORIES = [
  {
    id: EXCEL_CATEGORY_IDS.PRODUCTION,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.PRODUCTION,
      name: 'Production',
      categoryDescription: 'Production',
    },
  },
  {
    id: EXCEL_CATEGORY_IDS.TRADE,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.TRADE,
      name: 'Trade',
      categoryDescription: 'Trade',
    },
  },
  {
    id: EXCEL_CATEGORY_IDS.CONSUMPTION,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.CONSUMPTION,
      name: 'Consumption',
      categoryDescription: 'Consumption',
    },
  },
  {
    id: EXCEL_CATEGORY_IDS.WASTE_MANAGEMENT,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.WASTE_MANAGEMENT,
      name: 'Waste Management',
      categoryDescription: 'Waste Management',
    },
  },
  {
    id: EXCEL_CATEGORY_IDS.ENVIRONMENT,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.ENVIRONMENT,
      name: 'Plastics in the Environment',
      categoryDescription: 'Plastics in the Environment',
    },
  },
  {
    id: EXCEL_CATEGORY_IDS.LIFE_CYCLE_INSIGHTS,
    attributes: {
      categoryId: EXCEL_CATEGORY_IDS.LIFE_CYCLE_INSIGHTS,
      name: 'Life Cycle Insights',
      categoryDescription: 'Life Cycle Insights',
    },
  },
]
