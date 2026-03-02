const { CategoryAttribute } = require('../common/models/CategoryAttribute');
const { Category } = require('../common/models/Category');

const attributeDefinitions = {
  // ==================== ELECTRONICS ====================
  
  // Mobile Phones (ID: 2) and all its subcategories
  'Mobile Phones': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Oppo', 'Vivo', 'Realme', 'Google', 'Motorola', 'Nokia', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'ram', attributeType: 'dropdown', predefinedValues: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], isRequired: false, displayOrder: 2 },
    { attributeName: 'storage', attributeType: 'dropdown', predefinedValues: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], isRequired: false, displayOrder: 3 },
    { attributeName: 'screenSize', attributeType: 'dropdown', predefinedValues: ['5 inch', '5.5 inch', '6 inch', '6.5 inch', '6.7 inch', '7 inch'], isRequired: false, displayOrder: 4 },
    { attributeName: 'battery', attributeType: 'dropdown', predefinedValues: ['3000mAh', '4000mAh', '5000mAh', '6000mAh'], isRequired: false, displayOrder: 5 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Blue', 'Green', 'Red', 'Gold', 'Silver', 'Space Grey', 'Midnight', 'Purple'], isRequired: true, displayOrder: 6 },
    { attributeName: 'processor', attributeType: 'text', isRequired: false, displayOrder: 7 },
    { attributeName: 'camera', attributeType: 'text', isRequired: false, displayOrder: 8 }
  ],

  // Laptops & Computers (ID: 9)
  'Laptops & Computers': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Acer', 'MSI', 'Razer', 'Microsoft', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'processor', attributeType: 'dropdown', predefinedValues: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 3', 'AMD Ryzen 5', 'AMD Ryzen 7', 'AMD Ryzen 9', 'Apple M1', 'Apple M2', 'Apple M3'], isRequired: false, displayOrder: 2 },
    { attributeName: 'ram', attributeType: 'dropdown', predefinedValues: ['4GB', '8GB', '16GB', '32GB', '64GB'], isRequired: false, displayOrder: 3 },
    { attributeName: 'storage', attributeType: 'dropdown', predefinedValues: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '500GB HDD', '1TB HDD', '2TB HDD'], isRequired: false, displayOrder: 4 },
    { attributeName: 'screenSize', attributeType: 'dropdown', predefinedValues: ['13 inch', '14 inch', '15.6 inch', '17 inch'], isRequired: false, displayOrder: 5 },
    { attributeName: 'graphicsCard', attributeType: 'dropdown', predefinedValues: ['Integrated', 'NVIDIA GTX 1650', 'NVIDIA RTX 3050', 'NVIDIA RTX 3060', 'NVIDIA RTX 4060', 'AMD Radeon', 'Other'], isRequired: false, displayOrder: 6 },
    { attributeName: 'operatingSystem', attributeType: 'dropdown', predefinedValues: ['Windows 11', 'Windows 10', 'macOS', 'Linux', 'Chrome OS'], isRequired: false, displayOrder: 7 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Silver', 'Space Grey', 'Black', 'White', 'Blue', 'Gold'], isRequired: false, displayOrder: 8 }
  ],

  // Home Appliances (ID: 16)
  'Home Appliances': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['LG', 'Samsung', 'Whirlpool', 'Bosch', 'IFB', 'Godrej', 'Haier', 'Voltas', 'Blue Star', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'capacity', attributeType: 'text', isRequired: false, displayOrder: 2 },
    { attributeName: 'powerConsumption', attributeType: 'text', isRequired: false, displayOrder: 3 },
    { attributeName: 'energyRating', attributeType: 'dropdown', predefinedValues: ['1 Star', '2 Star', '3 Star', '4 Star', '5 Star'], isRequired: false, displayOrder: 4 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['White', 'Black', 'Silver', 'Grey', 'Red', 'Blue'], isRequired: false, displayOrder: 5 },
    { attributeName: 'warranty', attributeType: 'dropdown', predefinedValues: ['1 Year', '2 Years', '3 Years', '5 Years', '10 Years'], isRequired: false, displayOrder: 6 }
  ],

  // Tablets (ID: 23)
  'Tablets': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Apple', 'Samsung', 'Lenovo', 'Xiaomi', 'Realme', 'Amazon', 'Microsoft', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'screenSize', attributeType: 'dropdown', predefinedValues: ['7 inch', '8 inch', '10 inch', '11 inch', '12.9 inch'], isRequired: false, displayOrder: 2 },
    { attributeName: 'storage', attributeType: 'dropdown', predefinedValues: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'], isRequired: false, displayOrder: 3 },
    { attributeName: 'ram', attributeType: 'dropdown', predefinedValues: ['2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'], isRequired: false, displayOrder: 4 },
    { attributeName: 'connectivity', attributeType: 'dropdown', predefinedValues: ['WiFi Only', 'WiFi + Cellular'], isRequired: false, displayOrder: 5 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Space Grey', 'Silver', 'Gold', 'Black', 'White', 'Blue'], isRequired: false, displayOrder: 6 }
  ],

  // Audio (ID: 24)
  'Audio (Headphones, Speakers)': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Sony', 'JBL', 'Bose', 'Boat', 'Apple', 'Samsung', 'Sennheiser', 'Audio-Technica', 'Skullcandy', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'type', attributeType: 'dropdown', predefinedValues: ['In-Ear', 'On-Ear', 'Over-Ear', 'Earbuds', 'TWS', 'Neckband', 'Portable Speaker', 'Home Speaker'], isRequired: true, displayOrder: 2 },
    { attributeName: 'connectivity', attributeType: 'dropdown', predefinedValues: ['Bluetooth', 'Wired', 'Wireless', 'Both'], isRequired: false, displayOrder: 3 },
    { attributeName: 'batteryLife', attributeType: 'text', isRequired: false, displayOrder: 4 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Blue', 'Red', 'Green', 'Pink', 'Silver'], isRequired: false, displayOrder: 5 }
  ],

  // Cameras (ID: 25)
  'Cameras': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', 'GoPro', 'DJI', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'type', attributeType: 'dropdown', predefinedValues: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera', 'Instant Camera'], isRequired: true, displayOrder: 2 },
    { attributeName: 'megapixels', attributeType: 'text', isRequired: false, displayOrder: 3 },
    { attributeName: 'videoResolution', attributeType: 'dropdown', predefinedValues: ['720p', '1080p', '4K', '6K', '8K'], isRequired: false, displayOrder: 4 },
    { attributeName: 'lensType', attributeType: 'text', isRequired: false, displayOrder: 5 }
  ],

  // Smart Wearables (ID: 26)
  'Smart Wearables': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Apple', 'Samsung', 'Fitbit', 'Garmin', 'Amazfit', 'Noise', 'Boat', 'Fossil', 'Other'], isRequired: true, displayOrder: 1 },
    { attributeName: 'type', attributeType: 'dropdown', predefinedValues: ['Smartwatch', 'Fitness Band', 'Smart Ring'], isRequired: true, displayOrder: 2 },
    { attributeName: 'displaySize', attributeType: 'text', isRequired: false, displayOrder: 3 },
    { attributeName: 'batteryLife', attributeType: 'text', isRequired: false, displayOrder: 4 },
    { attributeName: 'waterResistance', attributeType: 'dropdown', predefinedValues: ['IP67', 'IP68', '5ATM', '10ATM', 'Not Water Resistant'], isRequired: false, displayOrder: 5 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'Silver', 'Gold', 'Rose Gold', 'Blue', 'Green', 'Red'], isRequired: false, displayOrder: 6 }
  ],

  // ==================== FASHION & CLOTHING ====================
  
  'Fashion & Clothing': [
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', '5XL'], isRequired: true, displayOrder: 1 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple', 'Orange', 'Grey', 'Brown', 'Navy', 'Beige', 'Maroon', 'Olive'], isRequired: true, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Leather', 'Synthetic', 'Rayon', 'Nylon', 'Spandex', 'Mixed'], isRequired: false, displayOrder: 3 },
    { attributeName: 'fit', attributeType: 'dropdown', predefinedValues: ['Slim Fit', 'Regular Fit', 'Loose Fit', 'Oversized', 'Tailored', 'Relaxed'], isRequired: false, displayOrder: 4 },
    { attributeName: 'pattern', attributeType: 'dropdown', predefinedValues: ['Solid', 'Striped', 'Checkered', 'Printed', 'Floral', 'Abstract', 'Geometric'], isRequired: false, displayOrder: 5 }
  ],

  "Men's Clothing": [
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['S', 'M', 'L', 'XL', 'XXL', '3XL', '38', '40', '42', '44', '46'], isRequired: true, displayOrder: 1 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Blue', 'Grey', 'Navy', 'Green', 'Brown', 'Red', 'Other'], isRequired: true, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Cotton', 'Polyester', 'Denim', 'Linen', 'Wool', 'Mixed'], isRequired: false, displayOrder: 3 },
    { attributeName: 'fit', attributeType: 'dropdown', predefinedValues: ['Slim Fit', 'Regular Fit', 'Relaxed Fit'], isRequired: false, displayOrder: 4 }
  ],

  "Women's Clothing": [
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40'], isRequired: true, displayOrder: 1 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Red', 'Blue', 'Pink', 'Green', 'Yellow', 'Purple', 'Orange', 'Beige', 'Other'], isRequired: true, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Cotton', 'Silk', 'Chiffon', 'Georgette', 'Rayon', 'Polyester', 'Crepe', 'Mixed'], isRequired: false, displayOrder: 3 },
    { attributeName: 'occasion', attributeType: 'dropdown', predefinedValues: ['Casual', 'Formal', 'Party', 'Wedding', 'Festive', 'Daily Wear'], isRequired: false, displayOrder: 4 }
  ],

  "Kids' Clothing": [
    { attributeName: 'age', attributeType: 'dropdown', predefinedValues: ['0-6 months', '6-12 months', '1-2 years', '2-3 years', '3-4 years', '4-5 years', '5-6 years', '7-8 years', '9-10 years', '11-12 years'], isRequired: true, displayOrder: 1 },
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y', '4-5Y', '5-6Y', '7-8Y', '9-10Y', '11-12Y'], isRequired: true, displayOrder: 2 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Red', 'Blue', 'Pink', 'Yellow', 'Green', 'Purple', 'Orange', 'White', 'Black'], isRequired: true, displayOrder: 3 },
    { attributeName: 'gender', attributeType: 'dropdown', predefinedValues: ['Boys', 'Girls', 'Unisex'], isRequired: true, displayOrder: 4 }
  ],

  // ==================== FOOTWEAR ====================
  
  'Footwear': [
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['5', '6', '7', '8', '9', '10', '11', '12', '13'], isRequired: true, displayOrder: 1 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Brown', 'Tan', 'Grey', 'Blue', 'Red', 'Green', 'Navy', 'Beige'], isRequired: true, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Leather', 'Synthetic', 'Canvas', 'Suede', 'Mesh', 'Rubber', 'Fabric'], isRequired: false, displayOrder: 3 },
    { attributeName: 'type', attributeType: 'dropdown', predefinedValues: ['Sneakers', 'Formal Shoes', 'Casual Shoes', 'Sports Shoes', 'Sandals', 'Slippers', 'Boots'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== WATCHES & ACCESSORIES ====================
  
  'Watches & Accessories': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Casio', 'Titan', 'Fastrack', 'Fossil', 'Timex', 'Seiko', 'Citizen', 'Daniel Wellington', 'Michael Kors', 'Other'], isRequired: false, displayOrder: 1 },
    { attributeName: 'dialSize', attributeType: 'dropdown', predefinedValues: ['36mm', '38mm', '40mm', '42mm', '44mm', '46mm'], isRequired: false, displayOrder: 2 },
    { attributeName: 'strapMaterial', attributeType: 'dropdown', predefinedValues: ['Leather', 'Metal', 'Silicone', 'Fabric', 'Rubber', 'Stainless Steel'], isRequired: false, displayOrder: 3 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'Silver', 'Gold', 'Rose Gold', 'Brown', 'Blue', 'White'], isRequired: false, displayOrder: 4 },
    { attributeName: 'type', attributeType: 'dropdown', predefinedValues: ['Analog', 'Digital', 'Smartwatch', 'Chronograph'], isRequired: false, displayOrder: 5 }
  ],

  // ==================== FURNITURE ====================
  
  'Furniture': [
    { attributeName: 'dimensions', attributeType: 'text', isRequired: false, displayOrder: 1 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Solid Wood', 'Engineered Wood', 'Metal', 'Plastic', 'Glass', 'Fabric', 'Leather', 'Rattan', 'Bamboo', 'Mixed'], isRequired: false, displayOrder: 2 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Natural Wood', 'Walnut', 'Teak', 'Oak', 'White', 'Black', 'Brown', 'Grey', 'Beige', 'Blue', 'Green'], isRequired: false, displayOrder: 3 },
    { attributeName: 'weight', attributeType: 'text', isRequired: false, displayOrder: 4 },
    { attributeName: 'assembly', attributeType: 'dropdown', predefinedValues: ['Pre-Assembled', 'DIY Assembly', 'Professional Assembly Available'], isRequired: false, displayOrder: 5 },
    { attributeName: 'warranty', attributeType: 'dropdown', predefinedValues: ['6 Months', '1 Year', '2 Years', '3 Years', '5 Years'], isRequired: false, displayOrder: 6 }
  ],

  // ==================== SPORTS & FITNESS ====================
  
  'Sports & Fitness': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Nike', 'Adidas', 'Puma', 'Reebok', 'Decathlon', 'Nivia', 'Cosco', 'Yonex', 'Other'], isRequired: false, displayOrder: 1 },
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['S', 'M', 'L', 'XL', 'XXL', 'Free Size'], isRequired: false, displayOrder: 2 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'White', 'Blue', 'Red', 'Green', 'Yellow', 'Grey', 'Orange'], isRequired: false, displayOrder: 3 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Polyester', 'Nylon', 'Spandex', 'Cotton', 'Mesh', 'Synthetic', 'Rubber', 'PVC'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== BOOKS & STATIONERY ====================
  
  'Books & Stationery': [
    { attributeName: 'language', attributeType: 'dropdown', predefinedValues: ['English', 'Hindi', 'Bengali', 'Tamil', 'Telugu', 'Marathi', 'Other'], isRequired: false, displayOrder: 1 },
    { attributeName: 'binding', attributeType: 'dropdown', predefinedValues: ['Paperback', 'Hardcover', 'Spiral Bound', 'Loose Sheets'], isRequired: false, displayOrder: 2 },
    { attributeName: 'pages', attributeType: 'text', isRequired: false, displayOrder: 3 },
    { attributeName: 'publisher', attributeType: 'text', isRequired: false, displayOrder: 4 }
  ],

  // ==================== TOYS & GAMES ====================
  
  'Toys & Games': [
    { attributeName: 'ageGroup', attributeType: 'dropdown', predefinedValues: ['0-2 years', '3-5 years', '6-8 years', '9-12 years', '13+ years'], isRequired: true, displayOrder: 1 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Plastic', 'Wood', 'Fabric', 'Metal', 'Mixed'], isRequired: false, displayOrder: 2 },
    { attributeName: 'batteryRequired', attributeType: 'dropdown', predefinedValues: ['Yes', 'No'], isRequired: false, displayOrder: 3 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Multicolor', 'Red', 'Blue', 'Pink', 'Yellow', 'Green', 'Purple'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== BABY CARE ====================
  
  'Baby Care': [
    { attributeName: 'ageGroup', attributeType: 'dropdown', predefinedValues: ['0-6 months', '6-12 months', '1-2 years', '2-3 years', '3+ years'], isRequired: true, displayOrder: 1 },
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['Newborn', 'Small', 'Medium', 'Large', 'Extra Large'], isRequired: false, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Cotton', 'Organic Cotton', 'Polyester', 'Mixed', 'Plastic'], isRequired: false, displayOrder: 3 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Pink', 'Blue', 'White', 'Yellow', 'Green', 'Multicolor'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== PET SUPPLIES ====================
  
  'Pet Supplies': [
    { attributeName: 'petType', attributeType: 'dropdown', predefinedValues: ['Dog', 'Cat', 'Bird', 'Fish', 'Small Animals', 'Reptile'], isRequired: true, displayOrder: 1 },
    { attributeName: 'size', attributeType: 'dropdown', predefinedValues: ['Small', 'Medium', 'Large', 'Extra Large'], isRequired: false, displayOrder: 2 },
    { attributeName: 'breed', attributeType: 'text', isRequired: false, displayOrder: 3 },
    { attributeName: 'flavor', attributeType: 'dropdown', predefinedValues: ['Chicken', 'Beef', 'Fish', 'Lamb', 'Vegetable', 'Mixed'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== GROCERIES ====================
  
  'Groceries': [
    { attributeName: 'weight', attributeType: 'dropdown', predefinedValues: ['100g', '250g', '500g', '1kg', '2kg', '5kg', '10kg', '25kg'], isRequired: true, displayOrder: 1 },
    { attributeName: 'brand', attributeType: 'text', isRequired: false, displayOrder: 2 },
    { attributeName: 'organic', attributeType: 'dropdown', predefinedValues: ['Yes', 'No'], isRequired: false, displayOrder: 3 },
    { attributeName: 'expiryDate', attributeType: 'text', isRequired: false, displayOrder: 4 }
  ],

  // ==================== KITCHEN & DINING ====================
  
  'Kitchen & Dining': [
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Stainless Steel', 'Aluminum', 'Non-Stick', 'Cast Iron', 'Ceramic', 'Glass', 'Plastic', 'Wood', 'Silicone'], isRequired: false, displayOrder: 1 },
    { attributeName: 'capacity', attributeType: 'text', isRequired: false, displayOrder: 2 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Silver', 'Black', 'White', 'Red', 'Blue', 'Green', 'Multicolor'], isRequired: false, displayOrder: 3 },
    { attributeName: 'dishwasherSafe', attributeType: 'dropdown', predefinedValues: ['Yes', 'No'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== TOOLS & HARDWARE ====================
  
  'Tools & Hardware': [
    { attributeName: 'brand', attributeType: 'dropdown', predefinedValues: ['Bosch', 'Black+Decker', 'Stanley', 'DeWalt', 'Makita', 'Taparia', 'Other'], isRequired: false, displayOrder: 1 },
    { attributeName: 'powerSource', attributeType: 'dropdown', predefinedValues: ['Electric', 'Battery', 'Manual', 'Pneumatic'], isRequired: false, displayOrder: 2 },
    { attributeName: 'voltage', attributeType: 'dropdown', predefinedValues: ['220V', '110V', '12V', '18V', '24V'], isRequired: false, displayOrder: 3 },
    { attributeName: 'warranty', attributeType: 'dropdown', predefinedValues: ['6 Months', '1 Year', '2 Years', '3 Years', '5 Years'], isRequired: false, displayOrder: 4 }
  ],

  // ==================== AUTOMOBILE ACCESSORIES ====================
  
  'Automobile Accessories': [
    { attributeName: 'vehicleType', attributeType: 'dropdown', predefinedValues: ['Car', 'Bike', 'SUV', 'Truck', 'Universal'], isRequired: true, displayOrder: 1 },
    { attributeName: 'brand', attributeType: 'text', isRequired: false, displayOrder: 2 },
    { attributeName: 'material', attributeType: 'dropdown', predefinedValues: ['Plastic', 'Metal', 'Rubber', 'Fabric', 'Leather', 'Synthetic'], isRequired: false, displayOrder: 3 },
    { attributeName: 'color', attributeType: 'dropdown', predefinedValues: ['Black', 'Grey', 'Beige', 'Red', 'Blue', 'Silver'], isRequired: false, displayOrder: 4 }
  ]
};

async function seedCategoryAttributes() {
  try {
    console.log('🌱 Seeding category attributes...');
    let created = 0;
    let skipped = 0;

    for (const [categoryName, attributes] of Object.entries(attributeDefinitions)) {
      // Find category (search in name, handle exact matches)
      const category = await Category.findOne({ 
        where: { name: categoryName } 
      });
      
      if (!category) {
        console.log(`⚠️  Category "${categoryName}" not found, skipping...`);
        skipped++;
        continue;
      }

      console.log(`\n📦 Processing: ${categoryName} (ID: ${category.id})`);

      // Create attributes for this category
      for (const attr of attributes) {
        const existing = await CategoryAttribute.findOne({
          where: {
            categoryId: category.id,
            attributeName: attr.attributeName
          }
        });

        if (!existing) {
          await CategoryAttribute.create({
            categoryId: category.id,
            ...attr
          });
          created++;
          console.log(`  ✓ ${attr.attributeName} (${attr.attributeType})`);
        } else {
          console.log(`  - ${attr.attributeName} (already exists)`);
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`   Created: ${created} attributes`);
    console.log(`   Skipped: ${skipped} categories not found`);
    
    return { success: true, created, skipped };
  } catch (error) {
    console.error('❌ Error seeding attributes:', error);
    throw error;
  }
}

module.exports = { seedCategoryAttributes };
