const { Category } = require("../../common/models/Category");

// Category hierarchy
const categoryHierarchy = [
    {
        name: 'Electronics',
        icon: 'electronics.svg',
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
        icon: 'clothes.svg',
        subcategories: [
            'Men\'s Clothing', 'Women\'s Clothing', 'Kids\' Clothing',
            'Ethnic Wear', 'Winter Wear', 'Innerwear & Sleepwear'
        ]
    },
    {
        name: 'Footwear',
        icon: 'shoes.svg',
        subcategories: [
            'Men\'s Footwear', 'Women\'s Footwear', 'Sports Shoes',
            'Casual Shoes', 'Formal Shoes', 'Slippers & Sandals'
        ]
    },
    {
        name: 'Watches & Accessories',
        icon: 'watch.svg',
        subcategories: [
            'Men\'s Watches', 'Women\'s Watches', 'Smart Watches',
            'Sunglasses', 'Wallets & Belts', 'Jewelry'
        ]
    },
    {
        name: 'Beauty & Personal Care',
        icon: 'beauty.svg',
        subcategories: [
            'Skincare', 'Haircare', 'Makeup',
            'Fragrances', 'Grooming', 'Personal Hygiene'
        ]
    },
    {
        name: 'Health & Wellness',
        icon: 'heart.svg',
        subcategories: [
            'Vitamins & Supplements', 'Medical Devices', 'Fitness Equipment',
            'Ayurvedic Products', 'Personal Health Care'
        ]
    },
    {
        name: 'Groceries',
        icon: 'shopping.svg',
        subcategories: [
            'Staples (Rice, Flour, Pulses)', 'Snacks & Beverages',
            'Cooking Oils & Ghee', 'Packaged Foods',
            'Spices & Masalas', 'Organic Products'
        ]
    },
    {
        name: 'Kitchen & Dining',
        icon: 'utensil.svg',
        subcategories: [
            'Cookware', 'Dinner Sets', 'Kitchen Storage',
            'Kitchen Tools', 'Drinkware', 'Bakeware'
        ]
    },
    {
        name: 'Furniture',
        icon: 'couch.svg',
        subcategories: [
            'Living Room Furniture', 'Bedroom Furniture',
            'Office Furniture', 'Storage Furniture', 'Outdoor Furniture'
        ]
    },
    {
        name: 'Home Decor',
        icon: 'paint.svg',
        subcategories: [
            'Wall Art', 'Clocks', 'Lamps & Lighting',
            'Curtains & Cushions', 'Vases & Showpieces'
        ]
    },
    {
        name: 'Books & Stationery',
        icon: 'book.svg',
        subcategories: [
            'Academic Books', 'Fiction & Non-Fiction',
            'Competitive Exam Books', 'Notebooks & Diaries',
            'Office Supplies', 'Art Supplies'
        ]
    },
    {
        name: 'Sports & Fitness',
        icon: 'running.svg',
        subcategories: [
            'Gym Equipment', 'Yoga & Fitness Accessories',
            'Sportswear', 'Outdoor Sports', 'Indoor Games', 'Cycling'
        ]
    },
    {
        name: 'Toys & Games',
        icon: 'game.svg',
        subcategories: [
            'Soft Toys', 'Educational Toys', 'Action Figures',
            'Board Games', 'Puzzles', 'Remote Control Toys'
        ]
    },
    {
        name: 'Automobile Accessories',
        icon: 'car.svg',
        subcategories: [
            'Car Accessories', 'Bike Accessories', 'Car Electronics',
            'Helmets', 'Vehicle Care Products'
        ]
    },
    {
        name: 'Tools & Hardware',
        icon: 'tool.svg',
        subcategories: [
            'Power Tools', 'Hand Tools', 'Electrical Tools',
            'Plumbing Tools', 'Safety Equipment'
        ]
    },
    {
        name: 'Pet Supplies',
        icon: 'dog.svg',
        subcategories: [
            'Dog Supplies', 'Cat Supplies', 'Pet Food',
            'Grooming Products', 'Pet Toys', 'Aquatic Supplies'
        ]
    },
    {
        name: 'Baby Care',
        icon: 'baby.svg',
        subcategories: [
            'Diapers & Wipes', 'Baby Food', 'Baby Clothing',
            'Toys & Learning', 'Baby Grooming', 'Baby Gear'
        ]
    }
];

// Icon mapping for simple subcategories (no icon specified)
const defaultIcons = {
    'Tablets': 'tablet-alt.svg',
    'Audio (Headphones, Speakers)': 'headphones.svg',
    'Cameras': 'camera.svg',
    'Smart Wearables': 'watch.svg',
    'Accessories & Peripherals': 'keyboard.svg',

    'Men\'s Clothing': 'male.svg',
    'Women\'s Clothing': 'female.svg',
    'Kids\' Clothing': 'child.svg',
    'Ethnic Wear': 'vest.svg',
    'Winter Wear': 'mitten.svg',
    'Innerwear & Sleepwear': 'tshirt.svg',

    'Men\'s Footwear': 'shoe-prints.svg',
    'Women\'s Footwear': 'shoe-prints.svg',
    'Sports Shoes': 'running.svg',
    'Casual Shoes': 'shoe-prints.svg',
    'Formal Shoes': 'shoe-prints.svg',
    'Slippers & Sandals': 'shoe-prints.svg',

    'Men\'s Watches': 'clock.svg',
    'Women\'s Watches': 'clock.svg',
    'Smart Watches': 'clock.svg',

    'Sunglasses': 'glasses.svg',
    'Wallets & Belts': 'wallet.svg',
    'Jewelry': 'gem.svg',

    'Skincare': 'hand-sparkles.svg',
    'Haircare': 'air-freshener.svg',
    'Makeup': 'magic.svg',
    'Fragrances': 'spray-can.svg',
    'Grooming': 'cut.svg',
    'Personal Hygiene': 'pump-soap.svg',

    'Vitamins & Supplements': 'pills.svg',
    'Medical Devices': 'stethoscope.svg',
    'Fitness Equipment': 'dumbbell.svg',
    'Ayurvedic Products': 'leaf.svg',
    'Personal Health Care': 'heart.svg',

    'Staples (Rice, Flour, Pulses)': 'seedling.svg',
    'Snacks & Beverages': 'cookie.svg',
    'Cooking Oils & Ghee': 'bottle-droplet.svg',
    'Packaged Foods': 'box-open.svg',
    'Spices & Masalas': 'pepper-hot.svg',
    'Organic Products': 'leaf.svg',

    'Cookware': 'utensils.svg',
    'Dinner Sets': 'plate-wheat.svg',
    'Kitchen Storage': 'jar.svg',
    'Kitchen Tools': 'kitchen-set.svg',
    'Drinkware': 'mug-hot.svg',
    'Bakeware': 'cookie.svg',

    'Living Room Furniture': 'couch.svg',
    'Bedroom Furniture': 'bed.svg',
    'Office Furniture': 'chair.svg',
    'Storage Furniture': 'box-archive.svg',
    'Outdoor Furniture': 'umbrella-beach.svg',

    'Wall Art': 'paint-brush.svg',
    'Clocks': 'clock.svg',
    'Lamps & Lighting': 'lightbulb.svg',
    'Curtains & Cushions': 'rug.svg',
    'Vases & Showpieces': 'wine-bottle.svg',

    'Academic Books': 'graduation-cap.svg',
    'Fiction & Non-Fiction': 'book-open.svg',
    'Competitive Exam Books': 'file-signature.svg',
    'Notebooks & Diaries': 'book.svg',
    'Office Supplies': 'pen.svg',
    'Art Supplies': 'palette.svg',

    'Gym Equipment': 'dumbbell.svg',
    'Yoga & Fitness Accessories': 'spa.svg',
    'Sportswear': 'tshirt.svg',
    'Outdoor Sports': 'hiking.svg',
    'Indoor Games': 'chess.svg',
    'Cycling': 'bicycle.svg',

    'Soft Toys': 'ghost.svg',
    'Educational Toys': 'brain.svg',
    'Action Figures': 'robot.svg',
    'Board Games': 'chess-board.svg',
    'Puzzles': 'puzzle-piece.svg',
    'Remote Control Toys': 'gamepad.svg',

    'Car Accessories': 'car.svg',
    'Bike Accessories': 'motorcycle.svg',
    'Car Electronics': 'car-battery.svg',
    'Helmets': 'hard-hat.svg',
    'Vehicle Care Products': 'soap.svg',

    'Power Tools': 'bolt.svg',
    'Hand Tools': 'tools.svg',
    'Electrical Tools': 'plug.svg',
    'Plumbing Tools': 'faucet.svg',
    'Safety Equipment': 'helmet-safety.svg',

    'Dog Supplies': 'dog.svg',
    'Cat Supplies': 'cat.svg',
    'Pet Food': 'bowl-food.svg',
    'Grooming Products': 'scissors.svg',
    'Pet Toys': 'bone.svg',
    'Aquatic Supplies': 'fish.svg',

    'Diapers & Wipes': 'baby.svg',
    'Baby Food': 'bottle-water.svg',
    'Baby Clothing': 'shirt.svg',
    'Toys & Learning': 'shapes.svg',
    'Baby Grooming': 'baby-carriage.svg',
    'Baby Gear': 'baby.svg'
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

async function updateHierarchy(data, parentId = null) {

    for (const item of data) {

        let name, icon, subs;

        if (typeof item === "string") {
            name = item;
            icon = getIconForSubcategory(name);
            subs = [];
        } else {
            name = item.name;
            icon = item.icon || getIconForSubcategory(name);
            subs = item.subcategories || [];
        }

        // find existing category
        let category = await Category.findOne({
            where: { name, parentId }
        });

        if (category) {
            // update icon if changed
            if (category.icon !== icon) {
                await category.update({ icon });
                console.log(`🔄 Updated: ${name}`);
            }
        } else {
            category = await Category.create({
                name,
                parentId,
                icon
            });

            console.log(`Created: ${name}`);
        }

        updated++;

        if (subs.length > 0) {
            await updateHierarchy(subs, category.id);
        }
    }
}

//todo->
const getCategoryIconPath = (iconName) => {
    if (!iconName) return null;

    // if already absolute path or URL
    if (iconName.startsWith("http") || iconName.startsWith("/"))
        return iconName;

    return `uploads/icons/${iconName}`;
};

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
                    icon: getCategoryIconPath(cat.icon),
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
                        icon: getCategoryIconPath(cat.icon)
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
    //Cannot truncate a table referenced in a foreign key constraint (`ProductCategory`)',
    //update if exists and create if missing
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
    },
    updateCategories: async (req, res) => {
    try {
        console.log("Updating categories...");

        let updated = 0;

        await updateHierarchy(categoryHierarchy);

        return res.status(200).json({
            status: true,
            message: "Categories updated successfully",
            processed: updated
        });

    } catch (error) {
        console.error("Update error:", error);

        return res.status(500).json({
            status: false,
            message: "Failed to update categories"
        });
    }
},
};