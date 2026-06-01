import * as XLSX from 'xlsx';

export interface Template {
  id: string;
  name: string;
  description: string;
  fileName: string;
  version: string;
  updatedAt: string;
  columns: string[];
  sampleData?: any[][];
}

export const STANDARD_TEMPLATES: Template[] = [
  {
    id: 'product-catalogue',
    name: 'Product Catalogue Upload Template',
    description: 'Create new catalogues. Includes columns for Product Name, Article Code, SKU, Category, Price, and MOQ.',
    fileName: 'Product_Catalogue_Template',
    version: 'v2.1',
    updatedAt: '2026-05-15',
    columns: ['Product Name', 'Article Code', 'SKU', 'Category', 'Sub Category', 'Brand', 'Color', 'Size', 'MOQ', 'Offer Price', 'MRP', 'Quantity', 'Delivery Time', 'Description', 'Material', 'Unit', 'Image URL 1', 'Image URL 2', 'Image URL 3']
  },
  {
    id: 'bulk-addition',
    name: 'Bulk Product Addition Template',
    description: 'Add products to an existing catalogue in bulk without replacing current products.',
    fileName: 'Bulk_Product_Addition_Template',
    version: 'v1.5',
    updatedAt: '2025-11-20',
    columns: ['Catalogue Name', 'Article Code', 'Product Name', 'Color', 'Size', 'MOQ', 'Price', 'Inventory', 'Image URL']
  },
  {
    id: 'price-update',
    name: 'Product Price Update Template',
    description: 'Mass update prices for existing products using Article Code.',
    fileName: 'Price_Update_Template',
    version: 'v1.2',
    updatedAt: '2026-01-10',
    columns: ['Article Code', 'Existing Price', 'New Price', 'Effective Date']
  },
  {
    id: 'inventory-update',
    name: 'Inventory Update Template',
    description: 'Sync available stock quantities and locations from your factory floor.',
    fileName: 'Inventory_Update_Template',
    version: 'v1.4',
    updatedAt: '2026-03-05',
    columns: ['Article Code', 'Current Stock', 'New Stock', 'Warehouse Location']
  },
  {
    id: 'image-upload',
    name: 'Product Image Mapping Template',
    description: 'Bulk map image and video URLs to existing products via Article Code.',
    fileName: 'Product_Image_Mapping_Template',
    version: 'v1.1',
    updatedAt: '2025-09-12',
    columns: ['Article Code', 'Image URL 1', 'Image URL 2', 'Image URL 3', 'Video URL']
  },
  {
    id: 'quotation-upload',
    name: 'Quotation Upload Template',
    description: 'Draft complex custom quotes via Excel before sending to the buyer.',
    fileName: 'Quotation_Template',
    version: 'v1.3',
    updatedAt: '2026-02-28',
    columns: ['Product Name', 'Article Code', 'Quantity', 'Unit Price', 'Discount', 'Freight', 'GST', 'Delivery Timeline']
  },
  {
    id: 'dealer-pricelist',
    name: 'Dealer Price List Template',
    description: 'Set special dealer pricing, MOQs, and offer validities.',
    fileName: 'Dealer_Pricelist_Template',
    version: 'v1.0',
    updatedAt: '2026-04-01',
    columns: ['Article Code', 'Product Name', 'Dealer Price', 'MOQ', 'Offer Valid Till']
  }
];

export const SAMPLE_CATALOGUES: Template[] = [
  {
    id: 'sample-garment',
    name: 'Sample Garment Catalogue',
    description: 'Pre-filled with Men\'s Shirts, T-Shirts, Jeans, and Jackets. Includes sizes and colors.',
    fileName: 'Sample_Garment_Catalogue',
    version: 'v1.0',
    updatedAt: '2026-01-15',
    columns: ['Product Name', 'Article Code', 'Category', 'Color', 'Size', 'Offer Price', 'Image URL 1'],
    sampleData: [
      ['Men\'s Cotton Shirt', 'MCS-1001', 'Shirts', 'Navy Blue', 'L', 450, 'https://example.com/images/mcs1001.jpg'],
      ['Slim Fit Denim Jeans', 'JNS-2002', 'Jeans', 'Ice Blue', '32', 850, 'https://example.com/images/jns2002.jpg'],
      ['Winter Jacket', 'JKT-3005', 'Jackets', 'Olive', 'XL', 1250, 'https://example.com/images/jkt3005.jpg'],
    ]
  },
  {
    id: 'sample-footwear',
    name: 'Sample Footwear Catalogue',
    description: 'Example data for Sports Shoes, Casual Shoes, and Sandals.',
    fileName: 'Sample_Footwear_Catalogue',
    version: 'v1.0',
    updatedAt: '2026-01-15',
    columns: ['Product Name', 'Article Code', 'Category', 'Color', 'Size', 'Offer Price', 'Image URL 1'],
    sampleData: [
      ['Pro-Running Sneakers', 'RSK-990', 'Sports Shoes', 'Black/Red', '9', 1100, 'https://example.com/images/rsk990.jpg'],
      ['Leather Loafers', 'LLF-450', 'Casual Shoes', 'Brown', '8', 1450, 'https://example.com/images/llf450.jpg'],
      ['Slide Sandals', 'SND-105', 'Sandals', 'Black', '10', 350, 'https://example.com/images/snd105.jpg'],
    ]
  },
  {
    id: 'sample-furniture',
    name: 'Sample Furniture Catalogue',
    description: 'Format includes Chairs, Tables, and Cabinets with material and dimensions.',
    fileName: 'Sample_Furniture_Catalogue',
    version: 'v1.0',
    updatedAt: '2026-01-15',
    columns: ['Product Name', 'Article Code', 'Category', 'Material', 'Dimension', 'Offer Price', 'Image URL 1'],
    sampleData: [
      ['Ergonomic Office Chair', 'FRN-OCH-01', 'Chairs', 'Mesh & Chrome', '70x70x120cm', 3400, 'https://example.com/images/och01.jpg'],
      ['Reclaimed Wood Dining Table', 'FRN-DTB-05', 'Tables', 'Teak Wood', '180x90x75cm', 12500, 'https://example.com/images/dtb05.jpg'],
      ['Minimalist Study Desk', 'FRN-SDSK-02', 'Tables', 'Engineered Wood', '120x60x75cm', 2800, 'https://example.com/images/sdsk02.jpg'],
    ]
  },
  {
    id: 'sample-electronics',
    name: 'Sample Electronics Catalogue',
    description: 'Data for LED Products, Fans, and Switches including tech specs.',
    fileName: 'Sample_Electronics_Catalogue',
    version: 'v1.0',
    updatedAt: '2026-01-15',
    columns: ['Product Name', 'Article Code', 'Category', 'Wattage', 'Warranty', 'Offer Price', 'Image URL 1'],
    sampleData: [
      ['9W LED Bulb (Pack of 4)', 'ELC-BLB-09W', 'LED Products', '9W', '2 Years', 299, 'https://example.com/images/blb09w.jpg'],
      ['Ceiling Fan 1200mm', 'ELC-CFN-12', 'Fans', '75W', '2 Years', 1599, 'https://example.com/images/cfn12.jpg'],
      ['Modular Switch 6A', 'ELC-SWT-6A', 'Switches', 'N/A', '5 Years', 45, 'https://example.com/images/swt6a.jpg'],
    ]
  },
  {
    id: 'sample-fmcg',
    name: 'Sample FMCG Catalogue',
    description: 'Complete with Food Products, Beverages, and Packaged Goods.',
    fileName: 'Sample_FMCG_Catalogue',
    version: 'v1.0',
    updatedAt: '2026-01-15',
    columns: ['Product Name', 'Article Code', 'Category', 'Weight', 'Shelf Life', 'Offer Price', 'Image URL 1'],
    sampleData: [
      ['Roasted Almonds Premium', 'FMC-ALM-500', 'Food Products', '500g', '12 Months', 450, 'https://example.com/images/alm500.jpg'],
      ['Sparkling Apple Juice', 'FMC-JUC-1L', 'Beverages', '1 Liter', '6 Months', 120, 'https://example.com/images/juc1l.jpg'],
      ['Organic Green Tea', 'FMC-TEA-250', 'Beverages', '250g', '24 Months', 250, 'https://example.com/images/tea250.jpg'],
    ]
  }
];

export const getTemplateById = (templateId: string) => {
  return STANDARD_TEMPLATES.find(t => t.id === templateId) || 
         SAMPLE_CATALOGUES.find(t => t.id === templateId) || null;
};

// Generate dummy rows for standard templates that don't have explicit sampleData
const generatePlaceholderData = (columns: string[]) => {
  return [1, 2, 3].map(rowNum => {
    return columns.map((col, idx) => idx === 0 ? `Sample Data ${rowNum}` : `Data ${rowNum}`);
  });
};

export const downloadTemplateAsExcel = (templateId: string) => {
  const template = getTemplateById(templateId);
  if (!template) return;

  const data = template.sampleData || generatePlaceholderData(template.columns);
  const worksheet = XLSX.utils.aoa_to_sheet([template.columns, ...data]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  XLSX.writeFile(workbook, `${template.fileName}.xlsx`);
};

export const downloadTemplateAsCSV = (templateId: string) => {
  const template = getTemplateById(templateId);
  if (!template) return;

  const data = template.sampleData || generatePlaceholderData(template.columns);
  
  // Basic CSV conversion
  const rows = [template.columns, ...data];
  const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${template.fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
