const express = require('express');
const router = express.Router();
const { Category } = require('../common/models/Category');

const categoryData = {
  'Electronics': [
    {
      name: 'Mobile Phones',
      subcategories: [
        'Smartphones',
        'Feature Phones',
        'Refurbished Phones',
        'Mobile Accessories',
        'Power Banks',
        'Screen Protectors & Cases'
      ]
    },
    {
      name: 'Laptops & Computers',
      subcategories: [
        'Laptops',
        'Desktops',
        'Gaming PCs',
        'Monitors',
        'Computer Accessories',
        'Storage Devices'
      ]
    },
    'Tablets',
    'Audio (Headphones, Speakers)',
    'Cameras',
    'Smart Wearables',
    {
      name: 'Home Appliances',
      subcategories: [
        'Refrigerators',
        'Washing Machines',
        'Air Conditioners',
        'Microwave Ovens',
        'Vacuum Cleaners',
        'Water Purifiers'
      ]
    },
    'Accessories & Peripherals'
  ],
  'Fashion & Clothing': [
    'Men\'s Clothing',
    'Women\'s Clothing',
    'Kids\' Clothing',
    'Ethnic Wear',
    'Winter Wear',
    'Innerwear & Sleepwear'
  ],
  'Footwear': [
    'Men\'s Footwear',
    'Women\'s Footwear',
    'Sports Shoes',
    'Casual Shoes',
    'Formal Shoes',
    'Slippers & Sandals'
  ],
  'Watches & Accessories': [
    'Men\'s Watches',
    'Women\'s Watches',
    'Smart Watches',
    'Sunglasses',
    'Wallets & Belts',
    'Jewelry'
  ],
  'Beauty & Personal Care': [
    'Skincare',
    'Haircare',
    'Makeup',
    'Fragrances',
    'Grooming',
    'Personal Hygiene'
  ],
  'Health & Wellness': [
    'Vitamins & Supplements',
    'Medical Devices',
    'Fitness Equipment',
    'Ayurvedic Products',
    'Personal Health Care'
  ],
  'Groceries': [
    'Staples (Rice, Flour, Pulses)',
    'Snacks & Beverages',
    'Cooking Oils & Ghee',
    'Packaged Foods',
    'Spices & Masalas',
    'Organic Products'
  ],
  'Kitchen & Dining': [
    'Cookware',
    'Dinner Sets',
    'Kitchen Storage',
    'Kitchen Tools',
    'Drinkware',
    'Bakeware'
  ],
  'Furniture': [
    'Living Room Furniture',
    'Bedroom Furniture',
    'Office Furniture',
    'Storage Furniture',
    'Outdoor Furniture'
  ],
  'Home Decor': [
    'Wall Art',
    'Clocks',
    'Lamps & Lighting',
    'Curtains & Cushions',
    'Vases & Showpieces'
  ],
  'Books & Stationery': [
    'Academic Books',
    'Fiction & Non-Fiction',
    'Competitive Exam Books',
    'Notebooks & Diaries',
    'Office Supplies',
    'Art Supplies'
  ],
  'Sports & Fitness': [
    'Gym Equipment',
    'Yoga & Fitness Accessories',
    'Sportswear',
    'Outdoor Sports',
    'Indoor Games',
    'Cycling'
  ],
  'Toys & Games': [
    'Soft Toys',
    'Educational Toys',
    'Action Figures',
    'Board Games',
    'Puzzles',
    'Remote Control Toys'
  ],
  'Automobile Accessories': [
    'Car Accessories',
    'Bike Accessories',
    'Car Electronics',
    'Helmets',
    'Vehicle Care Products'
  ],
  'Tools & Hardware': [
    'Power Tools',
    'Hand Tools',
    'Electrical Tools',
    'Plumbing Tools',
    'Safety Equipment'
  ],
  'Pet Supplies': [
    'Dog Supplies',
    'Cat Supplies',
    'Pet Food',
    'Grooming Products',
    'Pet Toys',
    'Aquatic Supplies'
  ],
  'Baby Care': [
    'Diapers & Wipes',
    'Baby Food',
    'Baby Clothing',
    'Toys & Learning',
    'Baby Grooming',
    'Baby Gear'
  ]
};

// POST /category/seed - Seed categories
router.post('/seed', async (req, res) => {
  try {
    // Check if categories already exist
    const existingCategories = await Category.findAll();
    
    if (existingCategories.length > 0) {
      return res.status(200).json({
        status: true,
        message: 'Categories already seeded',
        count: existingCategories.length
      });
    }

    console.log('🌱 Seeding categories...');
    let totalCreated = 0;

    // Create all main categories and their subcategories
    for (const [mainCategoryName, subcategories] of Object.entries(categoryData)) {
      // Create main category
      const mainCategory = await Category.create({
        name: mainCategoryName,
        parentId: null
      });
      totalCreated++;

      console.log(`  ✓ Created main category: ${mainCategoryName}`);

      // Create subcategories
      for (const subcategory of subcategories) {
        if (typeof subcategory === 'string') {
          // Simple subcategory (no nested subcategories)
          await Category.create({
            name: subcategory,
            parentId: mainCategory.id
          });
          totalCreated++;
          console.log(`    ✓ Created subcategory: ${subcategory}`);
        } else if (typeof subcategory === 'object' && subcategory.name) {
          // Subcategory with nested subcategories
          const parentSubcategory = await Category.create({
            name: subcategory.name,
            parentId: mainCategory.id
          });
          totalCreated++;
          console.log(`    ✓ Created subcategory: ${subcategory.name}`);

          // Create nested subcategories
          if (subcategory.subcategories) {
            for (const nestedSub of subcategory.subcategories) {
              await Category.create({
                name: nestedSub,
                parentId: parentSubcategory.id
              });
              totalCreated++;
              console.log(`      ✓ Created nested subcategory: ${nestedSub}`);
            }
          }
        }
      }
    }

    console.log('✅ Categories seeded successfully!');

    res.status(201).json({
      status: true,
      message: 'Categories seeded successfully',
      count: totalCreated
    });

  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    res.status(500).json({
      status: false,
      error: 'Failed to seed categories',
      message: error.message
    });
  }
});

// POST /category/seed/reset - Clear all categories and re-seed
router.post('/seed/reset', async (req, res) => {
  try {
    // Delete all categories
    const deletedCount = await Category.destroy({
      where: {},
      truncate: true,
      cascade: true
    });

    console.log(`🗑️  Deleted ${deletedCount} categories`);

    // Now re-seed
    console.log('🌱 Re-seeding categories...');
    let totalCreated = 0;

    for (const [mainCategoryName, subcategories] of Object.entries(categoryData)) {
      const mainCategory = await Category.create({
        name: mainCategoryName,
        parentId: null
      });
      totalCreated++;

      for (const subcategory of subcategories) {
        if (typeof subcategory === 'string') {
          await Category.create({
            name: subcategory,
            parentId: mainCategory.id
          });
          totalCreated++;
        } else if (typeof subcategory === 'object' && subcategory.name) {
          const parentSubcategory = await Category.create({
            name: subcategory.name,
            parentId: mainCategory.id
          });
          totalCreated++;

          if (subcategory.subcategories) {
            for (const nestedSub of subcategory.subcategories) {
              await Category.create({
                name: nestedSub,
                parentId: parentSubcategory.id
              });
              totalCreated++;
            }
          }
        }
      }
    }

    console.log('✅ Categories re-seeded successfully!');

    res.status(201).json({
      status: true,
      message: 'Categories reset and re-seeded successfully',
      deleted: deletedCount,
      created: totalCreated
    });

  } catch (error) {
    console.error('❌ Error resetting categories:', error);
    res.status(500).json({
      status: false,
      error: 'Failed to reset categories',
      message: error.message
    });
  }
});

// GET /category/seed/status - Check if categories are seeded
router.get('/seed/status', async (req, res) => {
  try {
    const count = await Category.count();
    const mainCategoriesCount = await Category.count({ where: { parentId: null } });

    res.status(200).json({
      status: true,
      seeded: count > 0,
      totalCategories: count,
      mainCategories: mainCategoriesCount,
      subcategories: count - mainCategoriesCount
    });
  } catch (error) {
    console.error('Error checking seed status:', error);
    res.status(500).json({
      status: false,
      error: 'Failed to check seed status'
    });
  }
});

module.exports = router;