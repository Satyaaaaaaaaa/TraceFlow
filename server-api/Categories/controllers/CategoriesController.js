const { Category } = require("../../common/models/Category");

// Category hierarchy with React Icon names
const categoryHierarchy = [
    {
        name: 'Electronics',
        icon: 'FaTv',
        subcategories: [
            {
                name: 'Mobile Phones',
                icon: 'FaMobileAlt',
                subcategories: [
                    'Smartphones', 'Feature Phones', 'Refurbished Phones',
                    'Mobile Accessories', 'Power Banks', 'Screen Protectors & Cases'
                ]
            },
            {
                name: 'Laptops & Computers',
                icon: 'FaLaptop',
                subcategories: [
                    'Laptops', 'Desktops', 'Gaming PCs',
                    'Monitors', 'Computer Accessories', 'Storage Devices'
                ]
            },
            {
                name: 'Home Appliances',
                icon: 'FaPlug',
                subcategories: [
                    'Refrigerators', 'Washing Machines', 'Air Conditioners',
                    'Microwave Ovens', 'Vacuum Cleaners', 'Water Purifiers'
                ]
            },
            'Tablets', 'Audio (Headphones, Speakers)', 'Cameras',
            'Smart Wearables', 'Accessories & Peripherals'
        ]
    },
    {
        name: 'Fashion & Clothing',
        icon: 'FaTshirt',
        subcategories: [
            'Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing',
            'Ethnic Wear', 'Winter Wear', 'Innerwear & Sleepwear'
        ]
    },
    {
        name: 'Footwear',
        icon: 'FaShoePrints',
        subcategories: [
            'Men\'s Footwear', 'Women\'s Footwear', 'Sports Shoes',
            'Casual Shoes', 'Formal Shoes', 'Slippers & Sandals'
        ]
    },
    {
        name: 'Watches & Accessories',
        icon: 'FaClock',
        subcategories: [
            'Men\'s Watches', 'Women\'s Watches', 'Smart Watches',
            'Sunglasses', 'Wallets & Belts', 'Jewelry'
        ]
    },
    {
        name: 'Beauty & Personal Care',
        icon: 'FaSprayCan',
        subcategories: [
            'Skincare', 'Haircare', 'Makeup',
            'Fragrances', 'Grooming', 'Personal Hygiene'
        ]
    },
    {
        name: 'Health & Wellness',
        icon: 'FaHeartbeat',
        subcategories: [
            'Vitamins & Supplements', 'Medical Devices', 'Fitness Equipment',
            'Ayurvedic Products', 'Personal Health Care'
        ]
    },
    {
        name: 'Groceries',
        icon: 'FaShoppingBasket',
        subcategories: [
            'Staples (Rice, Flour, Pulses)', 'Snacks & Beverages',
            'Cooking Oils & Ghee', 'Packaged Foods',
            'Spices & Masalas', 'Organic Products'
        ]
    },
    {
        name: 'Kitchen & Dining',
        icon: 'FaUtensils',
        subcategories: [
            'Cookware', 'Dinner Sets', 'Kitchen Storage',
            'Kitchen Tools', 'Drinkware', 'Bakeware'
        ]
    },
    {
        name: 'Furniture',
        icon: 'FaCouch',
        subcategories: [
            'Living Room Furniture', 'Bedroom Furniture',
            'Office Furniture', 'Storage Furniture', 'Outdoor Furniture'
        ]
    },
    {
        name: 'Home Decor',
        icon: 'FaPaintRoller',
        subcategories: [
            'Wall Art', 'Clocks', 'Lamps & Lighting',
            'Curtains & Cushions', 'Vases & Showpieces'
        ]
    },
    {
        name: 'Books & Stationery',
        icon: 'FaBook',
        subcategories: [
            'Academic Books', 'Fiction & Non-Fiction',
            'Competitive Exam Books', 'Notebooks & Diaries',
            'Office Supplies', 'Art Supplies'
        ]
    },
    {
        name: 'Sports & Fitness',
        icon: 'FaRunning',
        subcategories: [
            'Gym Equipment', 'Yoga & Fitness Accessories',
            'Sportswear', 'Outdoor Sports', 'Indoor Games', 'Cycling'
        ]
    },
    {
        name: 'Toys & Games',
        icon: 'FaGamepad',
        subcategories: [
            'Soft Toys', 'Educational Toys', 'Action Figures',
            'Board Games', 'Puzzles', 'Remote Control Toys'
        ]
    },
    {
        name: 'Automobile Accessories',
        icon: 'FaCar',
        subcategories: [
            'Car Accessories', 'Bike Accessories', 'Car Electronics',
            'Helmets', 'Vehicle Care Products'
        ]
    },
    {
        name: 'Tools & Hardware',
        icon: 'FaTools',
        subcategories: [
            'Power Tools', 'Hand Tools', 'Electrical Tools',
            'Plumbing Tools', 'Safety Equipment'
        ]
    },
    {
        name: 'Pet Supplies',
        icon: 'FaPaw',
        subcategories: [
            'Dog Supplies', 'Cat Supplies', 'Pet Food',
            'Grooming Products', 'Pet Toys', 'Aquatic Supplies'
        ]
    },
    {
        name: 'Baby Care',
        icon: 'FaBaby',
        subcategories: [
            'Diapers & Wipes', 'Baby Food', 'Baby Clothing',
            'Toys & Learning', 'Baby Grooming', 'Baby Gear'
        ]
    }
];

// Icon mapping for simple subcategories (no icon specified)
const defaultIcons = {
    'Tablets': 'FaTabletAlt',
    'Audio (Headphones, Speakers)': 'FaHeadphones',
    'Cameras': 'FaCamera',
    'Smart Wearables': 'FaWatch',
    'Accessories & Peripherals': 'FaKeyboard',
    'Men\'s Clothing': 'FaMale',
    'Women\'s Clothing': 'FaFemale',
    'Kids\' Clothing': 'FaChild',
    'Ethnic Wear': 'FaVest',
    'Winter Wear': 'FaMitten',
    'Innerwear & Sleepwear': 'FaTshirt',
    'Men\'s Footwear': 'FaShoePrints',
    'Women\'s Footwear': 'FaShoePrints',
    'Sports Shoes': 'FaRunning',
    'Casual Shoes': 'FaShoePrints',
    'Formal Shoes': 'FaShoePrints',
    'Slippers & Sandals': 'FaShoePrints',
    'Men\'s Watches': 'FaClock',
    'Women\'s Watches': 'FaClock',
    'Smart Watches': 'FaClock',
    'Sunglasses': 'FaGlasses',
    'Wallets & Belts': 'FaWallet',
    'Jewelry': 'FaGem',
    'Skincare': 'FaHandSparkles',
    'Haircare': 'FaAirFreshener',
    'Makeup': 'FaMagic',
    'Fragrances': 'FaSprayCan',
    'Grooming': 'FaCut',
    'Personal Hygiene': 'FaPumpSoap',
    'Vitamins & Supplements': 'FaPills',
    'Medical Devices': 'FaStethoscope',
    'Fitness Equipment': 'FaDumbbell',
    'Ayurvedic Products': 'FaLeaf',
    'Personal Health Care': 'FaHeart',
    'Staples (Rice, Flour, Pulses)': 'FaSeedling',
    'Snacks & Beverages': 'FaCookie',
    'Cooking Oils & Ghee': 'FaBottleDroplet',
    'Packaged Foods': 'FaBoxOpen',
    'Spices & Masalas': 'FaPepperHot',
    'Organic Products': 'FaLeaf',
    'Cookware': 'FaUtensils',
    'Dinner Sets': 'FaPlateWheat',
    'Kitchen Storage': 'FaJar',
    'Kitchen Tools': 'FaKitchenSet',
    'Drinkware': 'FaMugHot',
    'Bakeware': 'FaCookie',
    'Living Room Furniture': 'FaCouch',
    'Bedroom Furniture': 'FaBed',
    'Office Furniture': 'FaChair',
    'Storage Furniture': 'FaBoxArchive',
    'Outdoor Furniture': 'FaUmbrellaBeach',
    'Wall Art': 'FaPaintBrush',
    'Clocks': 'FaClock',
    'Lamps & Lighting': 'FaLightbulb',
    'Curtains & Cushions': 'FaRug',
    'Vases & Showpieces': 'FaWineBottle',
    'Academic Books': 'FaGraduationCap',
    'Fiction & Non-Fiction': 'FaBookOpen',
    'Competitive Exam Books': 'FaFileSignature',
    'Notebooks & Diaries': 'FaBook',
    'Office Supplies': 'FaPen',
    'Art Supplies': 'FaPalette',
    'Gym Equipment': 'FaDumbbell',
    'Yoga & Fitness Accessories': 'FaSpa',
    'Sportswear': 'FaTshirt',
    'Outdoor Sports': 'FaHiking',
    'Indoor Games': 'FaChess',
    'Cycling': 'FaBicycle',
    'Soft Toys': 'FaGhost',
    'Educational Toys': 'FaBrain',
    'Action Figures': 'FaRobot',
    'Board Games': 'FaChessBoard',
    'Puzzles': 'FaPuzzlePiece',
    'Remote Control Toys': 'FaGamepad',
    'Car Accessories': 'FaCar',
    'Bike Accessories': 'FaMotorcycle',
    'Car Electronics': 'FaCarBattery',
    'Helmets': 'FaHardHat',
    'Vehicle Care Products': 'FaSoap',
    'Power Tools': 'FaBolt',
    'Hand Tools': 'FaTools',
    'Electrical Tools': 'FaPlug',
    'Plumbing Tools': 'FaFaucet',
    'Safety Equipment': 'FaHelmetSafety',
    'Dog Supplies': 'FaDog',
    'Cat Supplies': 'FaCat',
    'Pet Food': 'FaBowlFood',
    'Grooming Products': 'FaScissors',
    'Pet Toys': 'FaBone',
    'Aquatic Supplies': 'FaFish',
    'Diapers & Wipes': 'FaBaby',
    'Baby Food': 'FaBottleWater',
    'Baby Clothing': 'FaShirt',
    'Toys & Learning': 'FaShapes',
    'Baby Grooming': 'FaBabyCarriage',
    'Baby Gear': 'FaBaby'
};

// Helper to get icon for a subcategory
function getIconForSubcategory(name) {
    return defaultIcons[name] || 'FaBox';
}

// Helper: Create categories recursively
async function createCategoryHierarchy(data, parentId = null) {
    let created = 0;
    
    for (const item of data) {
        let name, icon, subs;
        
        if (typeof item === 'string') {
            name = item;
            icon = getIconForSubcategory(name);
            subs = [];
        } else {
            name = item.name;
            icon = item.icon || 'FaBox';
            subs = item.subcategories || [];
        }
        
        // Check if exists
        let cat = await Category.findOne({ where: { name, parentId } });
        
        if (!cat) {
            cat = await Category.create({ name, parentId, icon });
            created++;
            console.log(`  ✓ Created: ${name} (${icon})`);
        }
        
        if (subs.length > 0) {
            created += await createCategoryHierarchy(subs, cat.id);
        }
    }
    
    return created;
}

module.exports = {
    // Get flat list
    getCategories: async (req, res) => {
        try {
            const categories = await Category.findAll({
                attributes: ["id", "name", "parentId", "icon"],
                order: [['name', 'ASC']]
            });

            return res.status(200).json({
                status: true,
                categories: categories
            });
        } catch (error) {
            console.error("Error fetching categories:", error);
            return res.status(500).json({
                status: false,
                message: "Failed to fetch categories"
            });
        }
    },

    // Get hierarchical tree - OPTIMIZED
    getCategoryTree: async (req, res) => {
        try {
            const allCategories = await Category.findAll({
                attributes: ["id", "name", "parentId", "icon"],
                order: [['name', 'ASC']],
                raw: true
            });

            const categoryMap = {};
            const tree = [];

            allCategories.forEach(cat => {
                categoryMap[cat.id] = {
                    id: cat.id,
                    name: cat.name,
                    icon: cat.icon,
                    subcategories: []
                };
            });

            allCategories.forEach(cat => {
                if (cat.parentId === null) {
                    tree.push(categoryMap[cat.id]);
                } else if (categoryMap[cat.parentId]) {
                    categoryMap[cat.parentId].subcategories.push({
                        id: cat.id,
                        name: cat.name,
                        icon: cat.icon
                    });
                }
            });

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-cache');
            
            return res.status(200).json({
                status: true,
                categories: tree
            });
        } catch (error) {
            console.error("Error fetching category tree:", error);
            return res.status(500).json({
                status: false,
                message: "Failed to fetch category tree"
            });
        }
    },

    // Seed categories
    seedCategories: async (req, res) => {
        try {
            console.log('🌱 Seeding categories...');
            const count = await createCategoryHierarchy(categoryHierarchy);
            console.log(`✅ Seeded ${count} categories`);
            
            return res.status(200).json({
                status: true,
                message: 'Categories seeded successfully',
                created: count
            });
        } catch (error) {
            console.error("Seeding error:", error);
            return res.status(500).json({
                status: false,
                message: "Failed to seed categories"
            });
        }
    },

    // Reset and seed
    resetCategories: async (req, res) => {
        try {
            console.log('🗑️  Resetting categories...');
            await Category.destroy({ where: {}, truncate: true, cascade: true });
            const count = await createCategoryHierarchy(categoryHierarchy);
            
            return res.status(200).json({
                status: true,
                message: 'Categories reset and seeded successfully',
                created: count
            });
        } catch (error) {
            console.error("Reset error:", error);
            return res.status(500).json({
                status: false,
                message: "Failed to reset categories"
            });
        }
    },

    // Get seed status
    getSeedStatus: async (req, res) => {
        try {
            const total = await Category.count();
            const main = await Category.count({ where: { parentId: null } });
            
            return res.status(200).json({
                status: true,
                seeded: total > 0,
                totalCategories: total,
                mainCategories: main,
                subcategories: total - main
            });
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: error.message
            });
        }
    }
};