import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.cafe.deleteMany();

  // Create default cafe
  const cafe = await prisma.cafe.create({
    data: {
      name: 'Apna Cafe',
      address: '123 Main Street, Local Area',
      phone: '9876543210',
      isOpen: true,
      openTime: '08:00 AM',
      closeTime: '10:00 PM',
    },
  });

  console.log(`☕ Created cafe: ${cafe.name} (ID: ${cafe.id})`);

  // ===== ALL MENU ITEMS =====
  const menuItems = [
    // ===== PIZZA =====
    { name: 'Classic Onion Pizza', description: 'Crispy thin crust topped with fresh onion rings and cheese', category: 'pizza', price: 99, sizes: [{ label: 'Medium', price: 99 }, { label: 'Large', price: 149 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Corn Delight Pizza', description: 'Sweet corn kernels with mozzarella cheese on a crispy base', category: 'pizza', price: 99, sizes: [{ label: 'Medium', price: 99 }, { label: 'Large', price: 149 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Simple Veggie Pizza', description: 'Loaded with bell peppers, onions, tomatoes and olives', category: 'pizza', price: 99, sizes: [{ label: 'Medium', price: 99 }, { label: 'Large', price: 149 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Veggie Crunch Pizza', description: 'Crunchy vegetables with special seasoning on cheese base', category: 'pizza', price: 119, sizes: [{ label: 'Medium', price: 119 }, { label: 'Large', price: 169 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Classic Cheese Pizza', description: 'Double cheese loaded pizza with oregano seasoning', category: 'pizza', price: 119, sizes: [{ label: 'Medium', price: 119 }, { label: 'Large', price: 169 }], imageUrl: 'pizza', isVeg: true, isBestseller: true },
    { name: 'Desi Tadka Pizza', description: 'Indian spiced pizza with paneer tikka and green chutney', category: 'pizza', price: 119, sizes: [{ label: 'Medium', price: 119 }, { label: 'Large', price: 169 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Spicy Jalapeno Fire Pizza', description: 'Hot jalapenos with red chilli flakes and cheese', category: 'pizza', price: 129, sizes: [{ label: 'Medium', price: 129 }, { label: 'Large', price: 179 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Cheese Fusion Pizza', description: 'Triple cheese blend with herbs on a stuffed crust', category: 'pizza', price: 129, sizes: [{ label: 'Medium', price: 129 }, { label: 'Large', price: 179 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Paneer Pizza', description: 'Tandoori paneer chunks with capsicum and onion', category: 'pizza', price: 149, sizes: [{ label: 'Medium', price: 149 }, { label: 'Large', price: 199 }], imageUrl: 'pizza', isVeg: true },
    { name: 'BBQ Paneer Pizza', description: 'Smoky BBQ sauce with grilled paneer and peppers', category: 'pizza', price: 179, sizes: [{ label: 'Medium', price: 179 }, { label: 'Large', price: 249 }], imageUrl: 'pizza', isVeg: true, isBestseller: true },
    { name: 'Farmhouse Pizza', description: 'Farm fresh veggies with mushrooms and extra cheese', category: 'pizza', price: 199, sizes: [{ label: 'Medium', price: 199 }, { label: 'Large', price: 299 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Cheese Paneer Overloaded', description: 'Extra loaded paneer with four cheese blend', category: 'pizza', price: 249, sizes: [{ label: 'Medium', price: 249 }, { label: 'Large', price: 349 }], imageUrl: 'pizza', isVeg: true },
    { name: 'Apna Cafe Special Pizza', description: 'Our signature pizza with secret recipe toppings', category: 'pizza', price: 399, imageUrl: 'pizza', isVeg: true, isBestseller: true },

    // ===== BURGERS =====
    { name: 'Aaloo Tikki Burger', description: 'Classic Indian spiced potato patty with fresh veggies', category: 'burgers', price: 39, imageUrl: 'burger', isVeg: true },
    { name: 'Herb Chilli Potato Patty Burger', description: 'Herb seasoned potato patty with green chilli kick', category: 'burgers', price: 59, imageUrl: 'burger', isVeg: true },
    { name: 'Veggie Burger Patty', description: 'Mixed vegetable patty with lettuce and mayo', category: 'burgers', price: 69, imageUrl: 'burger', isVeg: true },
    { name: 'Paneer Loaded Burger', description: 'Crispy paneer patty loaded with cheese and sauces', category: 'burgers', price: 99, imageUrl: 'burger', isVeg: true, isBestseller: true },
    { name: 'Thousand Island Burger', description: 'Juicy patty with thousand island dressing and pickles', category: 'burgers', price: 129, imageUrl: 'burger', isVeg: true },
    { name: 'Burger Overloaded', description: 'Double patty with extra cheese, jalapenos and sauces', category: 'burgers', price: 149, imageUrl: 'burger', isVeg: true },
    { name: 'Barbeque Burger', description: 'Smoky BBQ glazed patty with caramelized onions', category: 'burgers', price: 149, imageUrl: 'burger', isVeg: true },

    // ===== FRENCH FRIES =====
    { name: 'Classic Veg Fries', description: 'Golden crispy french fries with ketchup', category: 'fries', price: 39, imageUrl: 'fries', isVeg: true },
    { name: 'Mexican Peri Peri Fries', description: 'Spicy peri peri seasoned fries with dip', category: 'fries', price: 49, imageUrl: 'fries', isVeg: true, isBestseller: true },
    { name: 'Melt Cheesy Fries', description: 'Crispy fries smothered in melted cheese sauce', category: 'fries', price: 59, imageUrl: 'fries', isVeg: true },

    // ===== MOMOS =====
    { name: 'Veg Fry Momos', description: 'Crispy fried vegetable dumplings with chutney', category: 'momos', price: 49, imageUrl: 'momos', isVeg: true },
    { name: 'Paneer Fry Momos', description: 'Paneer stuffed fried momos with spicy sauce', category: 'momos', price: 59, imageUrl: 'momos', isVeg: true },
    { name: 'Cheese Veg Fry Momos', description: 'Cheesy vegetable fried momos', category: 'momos', price: 69, imageUrl: 'momos', isVeg: true },
    { name: 'Cheese Paneer Fry Momos', description: 'Cheese and paneer stuffed crispy momos', category: 'momos', price: 99, imageUrl: 'momos', isVeg: true, isBestseller: true },
    { name: 'Kadhai Gravy Veg Fry Momos', description: 'Fried veg momos in rich kadhai gravy', category: 'momos', price: 99, imageUrl: 'momos', isVeg: true },
    { name: 'Butter Gravy Veg Fry Momos', description: 'Veg momos in creamy butter gravy', category: 'momos', price: 99, imageUrl: 'momos', isVeg: true },
    { name: 'Kadhai Gravy Paneer Fry Momos', description: 'Paneer momos in spicy kadhai gravy', category: 'momos', price: 129, imageUrl: 'momos', isVeg: true },
    { name: 'Butter Gravy Paneer Fry Momos', description: 'Paneer momos in rich butter gravy', category: 'momos', price: 129, imageUrl: 'momos', isVeg: true },

    // ===== NEW ITEMS =====
    { name: 'Chilli Garlic Potato Shots', description: 'Crispy potato bites with chilli garlic seasoning', category: 'new', price: 50, imageUrl: 'fries', isVeg: true, isNew: true },
    { name: 'Cheesy Veg Fingers', description: 'Golden fried veggie fingers with cheese filling', category: 'new', price: 59, imageUrl: 'fries', isVeg: true, isNew: true },

    // ===== SHAKES & BEVERAGES =====
    { name: 'Cold Coffee', description: 'Rich and creamy iced cold coffee', category: 'shakes', price: 59, imageUrl: 'shakes', isVeg: true },
    { name: 'Oreo Shake', description: 'Thick Oreo cookie milkshake with whipped cream', category: 'shakes', price: 109, imageUrl: 'shakes', isVeg: true, isBestseller: true },
    { name: 'Kitkat Shake', description: 'Chocolate KitKat blended milkshake', category: 'shakes', price: 109, imageUrl: 'shakes', isVeg: true },
    { name: 'Red Bull', description: 'Energy drink — 250ml can', category: 'shakes', price: 120, imageUrl: 'shakes', isVeg: true },

    // ===== SOFT DRINKS =====
    { name: 'Coca Cola', description: 'Chilled Coca Cola', category: 'drinks', price: 20, sizes: [{ label: '200ml', price: 20 }, { label: '300ml', price: 40 }, { label: '750ml', price: 35 }], imageUrl: 'shakes', isVeg: true },
    { name: 'Thums Up', description: 'Chilled Thums Up', category: 'drinks', price: 20, sizes: [{ label: '200ml', price: 20 }, { label: '300ml', price: 40 }, { label: '750ml', price: 35 }], imageUrl: 'shakes', isVeg: true },
    { name: 'Sprite', description: 'Chilled Sprite', category: 'drinks', price: 20, sizes: [{ label: '200ml', price: 20 }, { label: '300ml', price: 40 }, { label: '750ml', price: 35 }], imageUrl: 'shakes', isVeg: true },

    // ===== COMBOS =====
    { name: 'Student Blast Combo', description: 'Perfect budget-friendly combo for students', category: 'combos', price: 99, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Aloo Tikki Burger + Classic Fries + Coke' },
    { name: 'Crispy Bite Combo', description: 'Crunchy and delicious combo meal', category: 'combos', price: 129, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Veggie Burger + Peri Peri Fries + Coke' },
    { name: 'Cheesy Treat Combo', description: 'Loaded with cheese goodness', category: 'combos', price: 179, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Paneer Loaded Burger + Cheesy Fries + Coke' },
    { name: 'Mini Pizza Deal', description: 'Pizza lover starter pack', category: 'combos', price: 139, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Classic Onion Pizza + Coke' },
    { name: 'Snack Pizza Combo', description: 'Pizza and fries - perfect pair', category: 'combos', price: 159, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Simple Veg Pizza + Fries + Coke' },
    { name: 'Paneer Lover Combo', description: 'For the paneer enthusiast', category: 'combos', price: 229, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Paneer Pizza + Coke' },
    { name: 'Momo Masti Combo', description: 'Momos party with sides', category: 'combos', price: 119, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Veg Fry Momos + Fries + Coke' },
    { name: 'Gravy Momo Combo', description: 'Momos in rich gravy', category: 'combos', price: 179, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Kadhai Veg Momos + Coke' },
    { name: 'Apna Mix Combo', description: 'Best of everything', category: 'combos', price: 179, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'Veggie Crunch Pizza + Aloo Tikki Burger + Coke' },
    { name: 'Premium King Combo', description: 'The ultimate premium feast', category: 'combos', price: 299, imageUrl: 'combo', isVeg: true, isCombo: true, comboContents: 'BBQ Paneer Pizza + Cold Coffee' },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.create({
      data: {
        ...item,
        cafeId: cafe.id,
      },
    });
  }

  console.log(`🍕 Created ${menuItems.length} menu items`);
  console.log('');
  console.log('===========================================');
  console.log(`✅ Seeding complete!`);
  console.log(`☕ Cafe ID: ${cafe.id}`);
  console.log('===========================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
