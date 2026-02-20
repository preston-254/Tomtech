// Cart Management
let cart = [];

// Get WhatsApp number from localStorage (set in admin dashboard)
function getWhatsAppNumber() {
    return localStorage.getItem('tomtechWhatsAppNumber') || '254702466009';
}

// Firebase initialization for main website
let firebaseApp = null;
let firebaseDatabase = null;

function initializeFirebaseMain() {
    if (firebaseApp) return firebaseApp;
    
    // Try to get config from multiple sources (priority order)
    let config = null;
    
    // 1. Try from window.FIREBASE_CONFIG (embedded in HTML)
    if (typeof window !== 'undefined' && window.FIREBASE_CONFIG) {
        config = window.FIREBASE_CONFIG;
        console.log('✅ Using Firebase config from HTML');
    }
    // 2. Try from localStorage
    else {
        const savedConfig = localStorage.getItem('tomtechFirebaseConfig');
        if (savedConfig) {
            try {
                config = JSON.parse(savedConfig);
                console.log('✅ Using Firebase config from localStorage');
            } catch (e) {
                console.error('Error parsing Firebase config from localStorage:', e);
            }
        }
    }
    
    // 3. Try from meta tag (fallback)
    if (!config) {
        const metaTag = document.querySelector('meta[name="firebase-config"]');
        if (metaTag && metaTag.content) {
            try {
                config = JSON.parse(metaTag.content);
                console.log('✅ Using Firebase config from meta tag');
                // Also save to localStorage for future use
                localStorage.setItem('tomtechFirebaseConfig', metaTag.content);
            } catch (e) {
                console.error('Error parsing Firebase config from meta tag:', e);
            }
        }
    }
    
    if (!config) {
        console.log('⚠️ Firebase config not found. Products will load from localStorage only.');
        return null;
    }
    
    try {
        if (typeof firebase !== 'undefined' && firebase.apps.length === 0) {
            firebaseApp = firebase.initializeApp(config);
            firebaseDatabase = firebase.database();
            console.log('✅ Firebase initialized on main website');
            return firebaseApp;
        } else if (typeof firebase !== 'undefined') {
            firebaseApp = firebase.app();
            firebaseDatabase = firebase.database();
            return firebaseApp;
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
    }
    
    return null;
}

// Load products from Firebase (for main website)
async function loadProductsFromCloud() {
    try {
        initializeFirebaseMain();
        if (!firebaseDatabase) {
            return null;
        }
        
        const snapshot = await firebaseDatabase.ref('products').once('value');
        const products = snapshot.val();
        
        if (products && Array.isArray(products) && products.length > 0) {
            localStorage.setItem('tomtechProducts', JSON.stringify(products));
            localStorage.setItem('tomtechProductsLastUpdate', Date.now().toString());
            console.log('✅ Loaded products from Firebase:', products.length, 'products');
            return products;
        } else if (products && typeof products === 'object') {
            const productsArray = Object.values(products);
            if (productsArray.length > 0) {
                localStorage.setItem('tomtechProducts', JSON.stringify(productsArray));
                localStorage.setItem('tomtechProductsLastUpdate', Date.now().toString());
                console.log('✅ Loaded products from Firebase:', productsArray.length, 'products');
                return productsArray;
            }
        }
    } catch (error) {
        console.warn('Failed to load from Firebase:', error);
    }
    
    return null;
}

// Load products from localStorage (managed in admin dashboard)
function loadProducts() {
    const stored = localStorage.getItem('tomtechProducts');
    if (stored) {
        try {
            const storedProducts = JSON.parse(stored);
            // Merge with default products to ensure fullDescription and importance exist
            const defaultProducts = getDefaultProducts();
            return storedProducts.map(storedProduct => {
                const defaultProduct = defaultProducts.find(dp => dp.id === storedProduct.id || dp.name === storedProduct.name);
                if (defaultProduct) {
                    // Merge stored product with default product, keeping stored product's data but adding missing fields
                    return {
                        ...defaultProduct,
                        ...storedProduct,
                        // Keep fullDescription and importance from default if not in stored
                        fullDescription: storedProduct.fullDescription || defaultProduct.fullDescription,
                        importance: storedProduct.importance || defaultProduct.importance
                    };
                }
                return storedProduct;
            });
        } catch (e) {
            console.error('Error loading products:', e);
        }
    }
    // Fallback to default products if none in storage
    return getDefaultProducts();
}

// Default products (fallback)
function getDefaultProducts() {
    return [
        {
            id: 1,
            name: 'OBD II(16PIN)',
            price: 2700,
            image: 'images/products/IMG-20251230-WA0027.jpg',
            description: 'Universal 16-pin OBD II diagnostic cable compatible with all modern vehicles. Read and clear engine codes, monitor real-time data, and perform comprehensive vehicle diagnostics.',
            fullDescription: 'Universal 16-pin OBD II diagnostic cable compatible with all modern vehicles manufactured after 1996. This essential tool allows you to read and clear engine codes, monitor real-time data, and perform comprehensive vehicle diagnostics.\n\n**Why It\'s Important:**\n• **Save Money on Diagnostics:** Avoid expensive mechanic fees by diagnosing issues yourself\n• **Prevent Major Repairs:** Early detection of problems prevents costly breakdowns\n• **Maintain Vehicle Health:** Regular diagnostics keep your engine running efficiently\n• **DIY Friendly:** Easy plug-and-play installation - no technical expertise needed\n• **Universal Compatibility:** Works with all OBD II compliant vehicles (1996 and newer)\n• **Real-Time Monitoring:** Track engine performance, fuel economy, and emissions data\n\n**Perfect For:** DIY mechanics, car enthusiasts, and anyone who wants to understand their vehicle better. Essential for maintaining your car\'s performance and catching issues before they become expensive repairs.',
            importance: 'Essential diagnostic tool that saves money on mechanic fees and helps maintain vehicle health.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 2,
            name: 'AUTEL OBDII CABLE',
            price: 4500,
            image: 'images/products/IMG-20251230-WA0028.jpg',
            description: 'Premium AUTEL OBDII diagnostic cable with advanced features. Compatible with AUTEL diagnostic scanners for professional-grade vehicle analysis.',
            fullDescription: 'Premium AUTEL OBDII diagnostic cable designed for professional-grade vehicle analysis. This high-quality cable is specifically engineered for AUTEL diagnostic scanners, providing access to deep system diagnostics, ECU programming, and advanced functions.\n\n**Why It\'s Important:**\n• **Professional Diagnostics:** Access advanced diagnostic functions beyond basic OBD II\n• **ECU Programming:** Essential for ECU tuning, programming, and modifications\n• **Deep System Access:** Read ABS, SRS, transmission, and other system codes\n• **Reliable Performance:** High-quality construction ensures consistent, error-free connections\n• **Professional Grade:** Used by automotive technicians and ECU specialists\n• **Future-Proof:** Compatible with latest AUTEL scanner models and software updates\n• **Cost Effective:** One-time investment saves thousands on professional diagnostic services\n\n**Perfect For:** Professional mechanics, ECU tuners, and serious automotive enthusiasts who need advanced diagnostic capabilities. Essential for anyone performing ECU programming or deep vehicle diagnostics.',
            importance: 'Professional-grade cable essential for advanced diagnostics and ECU programming.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 3,
            name: 'LAUNCH(16 PIN)CABLE',
            price: 3500,
            image: 'images/products/IMG-20251230-WA0029.jpg',
            description: 'Professional LAUNCH 16-pin diagnostic cable for comprehensive vehicle scanning. Compatible with LAUNCH diagnostic tools for ECU programming and key programming.',
            fullDescription: 'Professional LAUNCH 16-pin diagnostic cable engineered for comprehensive vehicle scanning and advanced diagnostics. This premium cable is specifically designed for LAUNCH diagnostic tools, enabling ECU programming, key programming, and complete system diagnostics.\n\n**Why It\'s Important:**\n• **Key Programming:** Essential for programming car keys and remotes - saves hundreds on dealer services\n• **ECU Functions:** Access ECU programming, tuning, and modification capabilities\n• **Complete Diagnostics:** Scan all vehicle systems including engine, transmission, ABS, and airbags\n• **Professional Quality:** Durable design with premium connectors ensures reliable, long-lasting performance\n• **LAUNCH Compatibility:** Specifically designed for LAUNCH diagnostic scanners\n• **Multi-System Access:** Read codes from all vehicle modules, not just engine\n• **Investment Protection:** High-quality cable protects your expensive diagnostic equipment\n\n**Perfect For:** Automotive professionals, key programming specialists, and technicians who need reliable access to all vehicle systems. Essential for anyone offering key programming or ECU services.',
            importance: 'Critical tool for key programming and comprehensive vehicle diagnostics.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 4,
            name: 'CAR IMAGE SYSTEM',
            price: 4500,
            image: 'images/products/IMG-20251230-WA0030.jpg',
            description: 'Advanced car imaging and backup camera system. Enhance your vehicle safety with high-quality rearview cameras and parking sensors.',
            fullDescription: 'Advanced car imaging and backup camera system designed to significantly enhance your vehicle safety and driving confidence. This comprehensive system includes high-quality rearview cameras, parking sensors, and multi-camera setups for complete visibility.\n\n**Why It\'s Important:**\n• **Prevent Accidents:** Eliminate blind spots and prevent costly collisions while reversing\n• **Protect Your Vehicle:** Avoid expensive bodywork repairs from parking mishaps\n• **Insurance Benefits:** Reduce accident risk may lower insurance premiums\n• **Night Vision:** High-quality cameras provide clear visibility in all lighting conditions\n• **Parking Confidence:** Park safely in tight spaces without fear of hitting obstacles\n• **Multi-Camera Setup:** Optional front and side cameras for 360-degree visibility\n• **Easy Installation:** Plug-and-play design makes installation simple\n• **Peace of Mind:** Know exactly what\'s behind you before reversing\n\n**Perfect For:** All drivers, especially those with larger vehicles, families with children, and anyone who wants enhanced safety. Essential for preventing costly accidents and protecting your investment.',
            importance: 'Prevents accidents and expensive repairs while providing peace of mind.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 5,
            name: 'CATALYTIC CONVERTER',
            price: 6500,
            image: 'images/products/IMG-20251230-WA0031.jpg',
            description: 'High-performance catalytic converter replacement. Restore your vehicle\'s exhaust efficiency and reduce harmful emissions.',
            fullDescription: 'High-performance catalytic converter replacement designed to restore your vehicle\'s exhaust efficiency and significantly reduce harmful emissions. This essential component is compatible with multiple vehicle models and directly impacts fuel economy and engine performance.\n\n**Why It\'s Important:**\n• **Fix Check Engine Light:** Resolve emission-related error codes and pass inspections\n• **Improve Fuel Economy:** Restore proper exhaust flow increases MPG by 5-15%\n• **Restore Engine Power:** Clogged converters reduce power - replacement restores performance\n• **Legal Compliance:** Required for vehicle registration and emissions testing\n• **Environmental Responsibility:** Reduce harmful emissions and protect the environment\n• **Prevent Engine Damage:** Failed converters can cause backpressure and engine issues\n• **Cost Savings:** Better fuel economy saves money on gas over time\n• **Vehicle Value:** Properly functioning exhaust system maintains resale value\n\n**Perfect For:** Vehicles with check engine lights, failed emissions tests, or reduced performance. Essential for maintaining legal compliance and optimal engine efficiency.',
            importance: 'Restores engine performance, improves fuel economy, and ensures legal compliance.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 6,
            name: 'CENTRAL DOOR LOCKING SYSTEM',
            price: 3500,
            image: 'images/products/IMG-20251230-WA0032.jpg',
            description: 'Complete central door locking system with remote control. Lock and unlock all doors simultaneously with the push of a button.',
            fullDescription: 'Complete central door locking system with advanced remote control functionality. This comprehensive kit includes key fob, actuators, wiring, and all necessary components to upgrade your vehicle with modern convenience and enhanced security.\n\n**Why It\'s Important:**\n• **Enhanced Security:** Lock all doors instantly with one button - prevents theft and break-ins\n• **Convenience:** No more manually locking each door - save time and effort\n• **Safety Feature:** Quickly lock all doors in emergency situations\n• **Modern Upgrade:** Transform older vehicles with modern convenience features\n• **Remote Access:** Lock/unlock from distance - perfect for checking if doors are secure\n• **Child Safety:** Prevent children from accidentally opening doors while driving\n• **Vehicle Value:** Modern locking system increases resale value\n• **Peace of Mind:** Know your vehicle is secure with the push of a button\n\n**Perfect For:** Older vehicles without central locking, vehicles with broken locking systems, and anyone wanting modern convenience. Essential for enhanced security and daily convenience.',
            importance: 'Enhances vehicle security and provides modern convenience features.',
            availability: 'in_stock',
            featured: false
        },
        {
            id: 7,
            name: 'CAR ALARM SYSTEM',
            price: 6500,
            image: 'images/products/IMG-20251230-WA0033.jpg',
            description: 'Premium car alarm system with motion sensors, shock sensors, and remote control. Loud 120dB siren alerts you to unauthorized access.',
            fullDescription: 'Premium car alarm system featuring advanced motion sensors, shock sensors, and comprehensive remote control. This professional-grade security system includes a loud 120dB siren, keyless entry, remote start capability, and multi-layer anti-theft protection.\n\n**Why It\'s Important:**\n• **Theft Prevention:** Deter thieves with loud alarm and visible security system\n• **Protect Your Investment:** Vehicles are valuable assets - protect them from theft and vandalism\n• **Insurance Benefits:** Many insurance companies offer discounts for installed alarm systems\n• **Peace of Mind:** Know your vehicle is protected 24/7, even when you\'re away\n• **Remote Monitoring:** Some systems allow smartphone alerts when alarm is triggered\n• **Motion Detection:** Advanced sensors detect any movement or impact on your vehicle\n• **Keyless Entry:** Convenient access without fumbling for keys\n• **Remote Start:** Start your vehicle from distance - warm up in winter, cool down in summer\n• **Vehicle Recovery:** Some systems include GPS tracking for vehicle recovery\n\n**Perfect For:** All vehicle owners, especially those in high-theft areas, owners of valuable vehicles, and anyone who wants maximum security. Essential protection for your valuable investment.',
            importance: 'Essential security system that protects your vehicle investment and provides peace of mind.',
            availability: 'in_stock',
            featured: false
        }
    ];
}

// Products Data - Loaded from localStorage, cloud, or default
// Will be initialized in initProducts() which is async
let products = [];

// Order via WhatsApp for single product
function orderViaWhatsApp(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const whatsappNumber = getWhatsAppNumber();
    const productUrl = window.location.origin + window.location.pathname + '#products';
    
    let message = `Hello! I'm interested in ordering:\n\n`;
    message += `*${product.name}*\n`;
    message += `Price: KES ${product.price.toLocaleString()}\n`;
    if (product.description) {
        message += `\n${product.description}\n`;
    }
    message += `\nProduct Link: ${productUrl}\n\n`;
    message += `Please confirm availability and payment details.`;

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Initialize Products
async function initProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    // Try to load from cloud first (for cross-device sync)
    const cloudProducts = await loadProductsFromCloud();
    if (cloudProducts && cloudProducts.length > 0) {
        products = cloudProducts;
    } else {
        // Reload products in case they were updated in admin
        products = loadProducts();
    }
    
    // Merge with default products to ensure fullDescription and importance exist
    const defaultProducts = getDefaultProducts();
    products = products.map(storedProduct => {
        const defaultProduct = defaultProducts.find(dp => dp.id === storedProduct.id || dp.name === storedProduct.name);
        if (defaultProduct) {
            return {
                ...defaultProduct,
                ...storedProduct,
                fullDescription: storedProduct.fullDescription || defaultProduct.fullDescription,
                importance: storedProduct.importance || defaultProduct.importance
            };
        }
        return storedProduct;
    });
    
    // Refresh products when page becomes visible (in case admin updated them)
    document.addEventListener('visibilitychange', async function() {
        if (!document.hidden) {
            const cloudProducts = await loadProductsFromCloud();
            if (cloudProducts && cloudProducts.length > 0) {
                products = cloudProducts;
            } else {
                products = loadProducts();
            }
            // Merge with defaults
            const defaultProducts = getDefaultProducts();
            products = products.map(storedProduct => {
                const defaultProduct = defaultProducts.find(dp => dp.id === storedProduct.id || dp.name === storedProduct.name);
                if (defaultProduct) {
                    return {
                        ...defaultProduct,
                        ...storedProduct,
                        fullDescription: storedProduct.fullDescription || defaultProduct.fullDescription,
                        importance: storedProduct.importance || defaultProduct.importance
                    };
                }
                return storedProduct;
            });
            renderProducts();
        }
    });
    
    renderProducts();
}

// Taupe banner HTML (inserted between first and second half of products)
function getTaupeBannerHTML() {
    return `
        <div class="taupe-banner" aria-hidden="true">
            <div class="taupe-banner-inner">
                <p class="taupe-banner-text">Quality automotive parts &mdash; trusted by professionals</p>
                <p class="taupe-banner-sub">Free advice • Fast delivery • Expert support</p>
            </div>
        </div>
    `;
}

// Render products (separated for reuse)
function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    const midpoint = Math.ceil(products.length / 2);
    const firstHalf = products.slice(0, midpoint);
    const secondHalf = products.slice(midpoint);

    function productCardHTML(product) {
        const isOutOfStock = product.availability === 'out_of_stock';
        const isInStock = product.availability === 'in_stock';
        const stockBadge = isOutOfStock ? '<span class="stock-badge out-of-stock">Out of Stock</span>' : '';
        const stockStatus = isInStock ? '<span class="stock-status in-stock">In Stock</span>' : '<span class="stock-status out-of-stock-status">Out of Stock</span>';
        const featuredBadge = product.featured ? '<span class="stock-badge featured">Featured</span>' : '';
        const productImage = product.image || product.images?.[0] || 'images/placeholder.jpg';
        return `
        <div class="product-card" data-product-id="${product.id}">
            <div class="product-image-wrapper">
                ${featuredBadge}
                ${stockBadge}
                <img src="${productImage}" alt="${product.name}" class="product-image" onclick="viewProductImage('${productImage}', '${product.name.replace(/'/g, "\\'")}')" style="cursor: pointer;" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22%3E%3Crect fill=%22%23f0f0f0%22 width=%22200%22 height=%22200%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22 fill=%22%23999%22%3ENo Image%3C/text%3E%3C/svg%3E'">
                <div class="product-overlay" onclick="event.stopPropagation()">
                    ${!isOutOfStock ? `<button class="btn btn-primary product-btn" onclick="event.stopPropagation(); addToCart(${product.id})">Add to Cart</button>` : ''}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name" onclick="openProductModal(${product.id})" style="cursor: pointer;">${product.name}</h3>
                <p class="product-description">${product.description ? product.description.substring(0, 100) + '...' : ''}</p>
                ${product.importance ? `<p class="product-importance">${product.importance}</p>` : ''}
                ${product.category ? `<p class="product-category" style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 8px;">${product.category}</p>` : ''}
                <button class="btn-read-more" onclick="openProductDescriptionModal(${product.id})">Read More</button>
                <div class="product-availability">
                    ${stockStatus}
                </div>
                <div class="product-footer">
                    <span class="product-price">KES ${product.price.toLocaleString()}</span>
                    ${!isOutOfStock ? `<button class="btn-buy" onclick="addToCart(${product.id})">Buy</button>` : '<button class="btn-buy" disabled style="opacity: 0.5; cursor: not-allowed;">Unavailable</button>'}
                </div>
            </div>
        </div>
    `;
    }

    const bannerHTML = products.length > 1 ? getTaupeBannerHTML() : '';
    productsGrid.innerHTML = firstHalf.map(productCardHTML).join('') + bannerHTML + secondHalf.map(productCardHTML).join('');

    // Add animation to product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(card);
    });
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    animateCartIcon();
    showNotification(`${product.name} added to cart!`);
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartUI();
    }
}

function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const checkoutBtn = document.getElementById('checkoutBtn');

    if (cartCount) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }

    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="cart-empty">Your cart is empty</p>';
            if (checkoutBtn) checkoutBtn.disabled = true;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="this.style.display='none'">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>KES ${item.price.toLocaleString()}</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${item.id}, -1)" class="quantity-btn">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, 1)" class="quantity-btn">+</button>
                        <button onclick="removeFromCart(${item.id})" class="remove-btn">&times;</button>
                    </div>
                    <div class="cart-item-total">KES ${(item.price * item.quantity).toLocaleString()}</div>
                </div>
            `).join('');
            if (checkoutBtn) checkoutBtn.disabled = false;
        }
    }

    if (cartTotal) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.textContent = `KES ${total.toLocaleString()}`;
    }
}

function checkoutToWhatsApp() {
    if (cart.length === 0) return;

    const whatsappNumber = getWhatsAppNumber();
    const productUrl = window.location.origin + window.location.pathname + '#products';
    
    let message = 'Hello! I would like to order the following:\n\n';
    cart.forEach((item, index) => {
        message += `${index + 1}. *${item.name}* x${item.quantity} - KES ${(item.price * item.quantity).toLocaleString()}\n`;
        message += `   Link: ${productUrl}\n\n`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `*Total: KES ${total.toLocaleString()}*\n\n`;
    message += 'Please confirm availability and payment details.';

    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Cart Sidebar Toggle
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartClose = document.getElementById('cartClose');
const cartOverlay = document.getElementById('cartOverlay');

if (cartBtn) {
    cartBtn.addEventListener('click', () => {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
}

if (cartClose) {
    cartClose.addEventListener('click', closeCart);
}

if (cartOverlay) {
    cartOverlay.addEventListener('click', closeCart);
}

function closeCart() {
    cartSidebar.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

// Service Booking Modal
const bookingModal = document.getElementById('bookingModal');
const bookingOverlay = document.getElementById('bookingOverlay');
const bookingClose = document.getElementById('bookingClose');
const bookingForm = document.getElementById('bookingForm');

function openBookingModal(serviceName = '') {
    if (bookingModal) {
        if (serviceName && document.getElementById('bookingService')) {
            const select = document.getElementById('bookingService');
            const option = Array.from(select.options).find(opt => opt.text.includes(serviceName));
            if (option) option.selected = true;
        }
        bookingModal.classList.add('active');
        bookingOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

if (bookingClose) {
    bookingClose.addEventListener('click', closeBookingModal);
}

if (bookingOverlay) {
    bookingOverlay.addEventListener('click', closeBookingModal);
}

function closeBookingModal() {
    bookingModal.classList.remove('active');
    bookingOverlay.classList.remove('active');
    document.body.style.overflow = '';
    if (bookingForm) bookingForm.reset();
}

if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const service = document.getElementById('bookingService').value;
        const name = document.getElementById('bookingName').value;
        const phone = document.getElementById('bookingPhone').value;
        const vehicle = document.getElementById('bookingVehicle').value;
        const date = document.getElementById('bookingDate').value;
        const notes = document.getElementById('bookingNotes').value;

        let message = `Hello! I would like to book a service:\n\n`;
        message += `Service: ${document.getElementById('bookingService').options[document.getElementById('bookingService').selectedIndex].text}\n`;
        message += `Name: ${name}\n`;
        message += `Phone: ${phone}\n`;
        message += `Vehicle: ${vehicle}\n`;
        message += `Preferred Date: ${date}\n`;
        if (notes) message += `Notes: ${notes}\n`;

        const whatsappNumber = getWhatsAppNumber();
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
        
        closeBookingModal();
        showNotification('Service booking request sent to WhatsApp!');
    });
}

// Add "Book Service" buttons to service cards
function addBookServiceButtons() {
    document.querySelectorAll('.service-card').forEach(card => {
        const title = card.querySelector('.service-title').textContent;
        if (!card.querySelector('.btn-book-service')) {
            const btn = document.createElement('button');
            btn.className = 'btn-book-service';
            btn.textContent = 'Book Service';
            btn.onclick = () => openBookingModal(title);
            card.appendChild(btn);
        }
    });
}

// Animations
function animateCartIcon() {
    const cartIcon = document.getElementById('cartBtn');
    if (cartIcon) {
        cartIcon.style.animation = 'bounce 0.5s ease';
        setTimeout(() => {
            cartIcon.style.animation = '';
        }, 500);
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Mobile Navigation Toggle
function initMobileMenu() {
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (navToggle && navMenu) {
        // Remove any existing event listeners by cloning
        const newToggle = navToggle.cloneNode(true);
        navToggle.parentNode.replaceChild(newToggle, navToggle);
        
        newToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navMenu.classList.toggle('active');
            
            const spans = newToggle.querySelectorAll('span');
            if (navMenu.classList.contains('active')) {
                spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                spans[1].style.opacity = '0';
                spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
            } else {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu) {
                navMenu.classList.remove('active');
                const navToggle = document.getElementById('navToggle');
                if (navToggle) {
                    const spans = navToggle.querySelectorAll('span');
                    if (spans.length >= 3) {
                        spans[0].style.transform = 'none';
                        spans[1].style.opacity = '1';
                        spans[2].style.transform = 'none';
                    }
                }
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        const isClickInsideMenu = navMenu && navMenu.contains(e.target);
        const isClickOnToggle = navToggle && navToggle.contains(e.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            const spans = navToggle.querySelectorAll('span');
            if (spans.length >= 3) {
                spans[0].style.transform = 'none';
                spans[1].style.opacity = '1';
                spans[2].style.transform = 'none';
            }
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Header scroll effect
let lastScroll = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }
    
    lastScroll = currentScroll;
});

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('input[type="text"]').value;
        const email = contactForm.querySelector('input[type="email"]').value;
        const phone = contactForm.querySelector('input[type="tel"]').value;
        const service = contactForm.querySelector('select').value;
        const message = contactForm.querySelector('textarea').value;
        
        let whatsappMessage = `Hello! I have an inquiry:\n\n`;
        whatsappMessage += `Name: ${name}\n`;
        whatsappMessage += `Email: ${email}\n`;
        whatsappMessage += `Phone: ${phone}\n`;
        if (service) whatsappMessage += `Service: ${contactForm.querySelector('select').options[contactForm.querySelector('select').selectedIndex].text}\n`;
        if (message) whatsappMessage += `Message: ${message}\n`;

        const whatsappNumber = getWhatsAppNumber();
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, '_blank');
        
        showNotification('Message sent to WhatsApp!');
        contactForm.reset();
    });
}

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards
document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Scroll reveal animation for sections
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

// Add reveal class to sections
document.querySelectorAll('section').forEach(section => {
    section.classList.add('reveal');
    revealObserver.observe(section);
});

// Initialize on page load
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    initProducts();
    updateCartUI();
    addBookServiceButtons();
});


// WhatsApp Float Button
function openWhatsApp() {
    const whatsappNumber = getWhatsAppNumber();
    const message = 'Hello! I would like to inquire about your services.';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// Chatbot Functions
let chatbotOpen = false;

function toggleChatbot() {
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotToggle = document.getElementById('chatbotToggle');
    
    chatbotOpen = !chatbotOpen;
    
    if (chatbotOpen) {
        chatbotContainer.classList.add('active');
        chatbotToggle.style.display = 'none';
    } else {
        chatbotContainer.classList.remove('active');
        chatbotToggle.style.display = 'flex';
    }
}

function sendChatbotMessage() {
    const input = document.getElementById('chatbotInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addChatbotMessage(message, 'user');
    input.value = '';
    
    // Simulate bot response
    setTimeout(() => {
        const botResponse = getBotResponse(message);
        addChatbotMessage(botResponse, 'bot');
    }, 1000);
}

function handleChatbotKeyPress(event) {
    if (event.key === 'Enter') {
        sendChatbotMessage();
    }
}

function addChatbotMessage(text, type) {
    const messagesContainer = document.getElementById('chatbotMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}-message`;
    
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = type === 'bot' ? '🤖' : 'You';
    
    const content = document.createElement('div');
    content.className = 'message-content';
    
    // Support multi-line text with formatting
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        if (line.trim()) {
            const p = document.createElement('p');
            // Check if line contains bold markers
            if (line.includes('**')) {
                const parts = line.split(/(\*\*.*?\*\*)/g);
                parts.forEach(part => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        const strong = document.createElement('strong');
                        strong.textContent = part.replace(/\*\*/g, '');
                        p.appendChild(strong);
                    } else if (part.trim()) {
                        p.appendChild(document.createTextNode(part));
                    }
                });
            } else {
                p.textContent = line;
            }
            if (index > 0) {
                p.style.marginTop = '0.5rem';
            }
            content.appendChild(p);
        } else if (index < lines.length - 1 && lines[index + 1].trim()) {
            // Add spacing between paragraphs
            const br = document.createElement('br');
            content.appendChild(br);
        }
    });
    
    messageDiv.appendChild(avatar);
    messageDiv.appendChild(content);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function getBotResponse(userMessage) {
    const message = userMessage.toLowerCase();
    
    // Greetings
    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        return 'Hello! I\'m Tom, your automotive assistant. I can help you learn about our services, products, and answer questions about TOM TECH AUTOCARE. What would you like to know?';
    }
    
    // Services - General
    if ((message.includes('service') || message.includes('what do you do') || message.includes('what services')) && 
        !message.includes('car key') && !message.includes('ecu') && !message.includes('dpf') && 
        !message.includes('egr') && !message.includes('adblue') && !message.includes('tuning') && 
        !message.includes('airbag') && !message.includes('alarm') && !message.includes('diagnosis')) {
        return 'We offer comprehensive automotive services including:\n\n• Car Key Programming - Program new keys and remotes\n• ECU Repair & Programming - Fix and update vehicle ECUs\n• DPF/EGR/Adblue Delete - Remove emissions systems\n• ECU Tuning - Enhance performance and fuel economy\n• Car Alarms & Tracking - Security systems\n• Diagnosis & Repair - Professional diagnostics\n\nWhat service interests you? I can provide detailed benefits!';
    }
    
    // Car Key Programming
    if (message.includes('car key') || message.includes('key programming') || message.includes('key fob')) {
        return '🔑 **Car Key Programming Benefits:**\n\n✅ **Cost-Effective:** Save money compared to dealership key replacement\n✅ **Universal Compatibility:** Works with all vehicle makes and models\n✅ **Quick Service:** Fast programming and key duplication\n✅ **Enhanced Security:** Restores full immobilizer functionality\n✅ **Lost Key Solution:** Create new keys even without originals\n\nWe program new keys, duplicate existing ones, and repair key fobs. Contact us at 0702466009 for a quote!';
    }
    
    // ECU Services
    if (message.includes('ecu repair') || message.includes('ecu programming')) {
        return '⚙️ **ECU Repair & Programming Benefits:**\n\n✅ **Restore Performance:** Fix engine issues and restore power\n✅ **Latest Software:** Get the newest ECU updates and bug fixes\n✅ **Cost Savings:** Repair instead of expensive ECU replacement\n✅ **Improved Efficiency:** Better fuel economy and engine response\n✅ **Error Code Fixes:** Resolve persistent check engine lights\n\nWe diagnose, repair, and program ECUs for all vehicles. What ECU issue are you experiencing?';
    }
    
    // DPF Delete
    if (message.includes('dpf') || message.includes('diesel particulate filter')) {
        return '🔧 **DPF Delete Benefits:**\n\n✅ **Better Fuel Economy:** Improved MPG by eliminating regeneration cycles\n✅ **Increased Power:** More engine power and torque\n✅ **Reduced Maintenance:** No more DPF cleaning or replacement costs\n✅ **No Breakdowns:** Eliminates DPF-related failures and limp mode\n✅ **Longer Engine Life:** Reduced backpressure improves engine health\n\nWe professionally remove DPF systems and reprogram ECUs. This service is popular for diesel vehicles!';
    }
    
    // EGR Delete
    if (message.includes('egr') || message.includes('exhaust gas recirculation')) {
        return '🛠️ **EGR Delete Benefits:**\n\n✅ **Cleaner Engine:** Prevents carbon buildup in intake system\n✅ **Better Throttle Response:** Improved acceleration and responsiveness\n✅ **Reduced Maintenance:** No EGR valve cleaning or replacement\n✅ **Improved Performance:** Better air flow and engine efficiency\n✅ **Longer Engine Life:** Prevents carbon-related engine damage\n\nWe remove EGR systems and reprogram your ECU. Great for diesel and some petrol engines!';
    }
    
    // Adblue Delete
    if (message.includes('adblue') || message.includes('scr') || message.includes('urea')) {
        return '💧 **Adblue Delete Benefits:**\n\n✅ **No More Refills:** Eliminates Adblue fluid costs\n✅ **Reduced Maintenance:** No Adblue system repairs needed\n✅ **Better Reliability:** Prevents Adblue system failures\n✅ **Cost Savings:** Save on fluid and system maintenance\n✅ **No Warning Lights:** Eliminates Adblue-related error codes\n\nWe remove Adblue/SCR systems and modify ECUs. Perfect for vehicles with Adblue issues!';
    }
    
    // ECU Tuning
    if (message.includes('ecu tuning') || message.includes('tuning') || message.includes('performance tuning')) {
        return '⚡ **ECU Tuning Benefits:**\n\n✅ **More Power:** Increased horsepower and torque output\n✅ **Better Fuel Economy:** Optimized fuel maps for efficiency\n✅ **Improved Throttle Response:** Faster acceleration\n✅ **Customized Performance:** Tuned to your driving style\n✅ **Removed Limitations:** Unlock factory performance restrictions\n\nWe offer professional ECU tuning for enhanced vehicle performance. What vehicle do you drive?';
    }
    
    // Airbag SRS
    if (message.includes('airbag') || message.includes('srs') || message.includes('supplemental restraint')) {
        return '🛡️ **AIRBAG SRS Programming Benefits:**\n\n✅ **Safety Restoration:** Restores airbag functionality after deployment\n✅ **Clear Warning Lights:** Removes SRS error codes and warnings\n✅ **Cost Effective:** Much cheaper than dealer repairs\n✅ **Compliance:** Ensures safety systems work properly\n✅ **Module Programming:** Programs new airbag modules correctly\n\nWe reset and program airbag systems. Essential for safety after accidents!';
    }
    
    // Car Alarms
    if (message.includes('alarm') || message.includes('tracking') || message.includes('security')) {
        return '🚨 **Car Alarms & Tracking Benefits:**\n\n✅ **Theft Prevention:** Deters thieves with loud alarms and sensors\n✅ **Real-Time Tracking:** GPS tracking for vehicle recovery\n✅ **Remote Monitoring:** Monitor your vehicle via smartphone\n✅ **Peace of Mind:** Know your vehicle is protected 24/7\n✅ **Insurance Benefits:** May reduce insurance premiums\n\nWe install advanced alarm systems and GPS tracking. Protect your investment!';
    }
    
    // Diagnosis
    if (message.includes('diagnosis') || message.includes('diagnostic') || message.includes('repair')) {
        return '🔍 **Diagnosis & Repair Benefits:**\n\n✅ **Accurate Problem Identification:** Professional diagnostic equipment\n✅ **Faster Repairs:** Quick identification saves time\n✅ **Cost Effective:** Avoid unnecessary part replacements\n✅ **Comprehensive Checks:** Full vehicle system analysis\n✅ **Expert Solutions:** Professional repair recommendations\n\nWe use advanced diagnostic tools to identify and fix vehicle issues. What problem is your vehicle experiencing?';
    }
    
    // Website questions
    if (message.includes('website') || message.includes('site') || message.includes('online')) {
        return '🌐 **About Our Website:**\n\n✅ **Browse Products:** View our automotive products with prices\n✅ **Search Function:** Easily find products using the search bar\n✅ **Product Details:** Click products to see full information\n✅ **WhatsApp Ordering:** Order directly via WhatsApp\n✅ **Service Booking:** Book services through our contact form\n✅ **Dark Mode:** Toggle between light and dark themes\n\nYou can search products, view details, add to cart, and order via WhatsApp. What would you like to explore?';
    }
    
    // Products
    if (message.includes('product') || message.includes('what do you sell') || message.includes('items')) {
        return '📦 **Our Products:**\n\nWe sell automotive parts and accessories including:\n• OBD II diagnostic cables\n• AUTEL and LAUNCH cables\n• Car imaging systems\n• Catalytic converters\n• Central locking systems\n• Car alarm systems\n\nBrowse our products section to see prices and details. You can search for specific items or click any product for more information!';
    }
    
    // Price
    if (message.includes('price') || message.includes('cost') || message.includes('how much')) {
        return '💰 **Pricing Information:**\n\nOur prices vary by service and product:\n• Check the Products section for product prices\n• Service prices depend on your vehicle and specific needs\n• Contact us at 0702466009 for accurate quotes\n• We offer competitive pricing and quality service\n\nWould you like a quote for a specific service or product?';
    }
    
    // Location
    if (message.includes('location') || message.includes('address') || message.includes('where')) {
        return '📍 **Our Location:**\n\n**TOM TECH AUTOCARE LIMITED**\nALONG PARKROAD, NEAR BLUEHUT HOTEL\nOPP MUSLIM ACADEMY, NGARA\n\nWe\'re easy to find and have parking available. Would you like directions or to schedule a visit?';
    }
    
    // Contact
    if (message.includes('contact') || message.includes('phone') || message.includes('call') || message.includes('whatsapp')) {
        return '📞 **Contact Us:**\n\n**Phone:** 0702466009 or 0720466009\n**Email:** TOMTECHAUTOCARE@GMAIL.COM\n**WhatsApp:** Click the green WhatsApp button to chat!\n**Location:** ALONG PARKROAD, NEAR BLUEHUT HOTEL, NGARA\n\nWe\'re here to help! Call or WhatsApp us anytime.';
    }
    
    // Hours
    if (message.includes('hour') || message.includes('time') || message.includes('open') || message.includes('when')) {
        return '🕐 **Business Hours:**\n\n**Monday - Saturday:** 8:00 AM to 6:00 PM\n**Sunday:** By appointment only\n\nWe\'re open most days for your convenience. You can also book appointments outside these hours.';
    }
    
    // About company
    if (message.includes('about') || message.includes('company') || message.includes('who are you')) {
        return '🏢 **About TOM TECH AUTOCARE:**\n\nWe are experts in ECU programming, automotive electronics, and vehicle diagnostics. We specialize in:\n\n✅ Professional ECU services\n✅ Car key programming\n✅ Emissions system modifications\n✅ Performance tuning\n✅ Vehicle security systems\n\nWith years of experience, we provide quality service for all vehicle makes and models. How can we help you today?';
    }
    
    // Default response
    return 'Thank you for your message! I can help you with:\n\n• Service information and benefits\n• Product details and pricing\n• Website navigation\n• Contact information\n• Business hours and location\n\nTry asking about our services, products, or how to use the website. For immediate assistance, call 0702466009!';
}

// Dark Mode Toggle
const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', currentTheme);

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

// Search Functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput || !searchResults) return;
    
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim().toLowerCase();
        
        if (query.length < 2) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            return;
        }
        
        searchTimeout = setTimeout(() => {
            const filtered = products.filter(product => 
                product.name.toLowerCase().includes(query) ||
                (product.description && product.description.toLowerCase().includes(query)) ||
                (product.category && product.category.toLowerCase().includes(query)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
            );
            
            if (filtered.length === 0) {
                searchResults.innerHTML = '<div class="search-result-item" style="justify-content: center; color: var(--text-secondary);">No products found</div>';
            } else {
                searchResults.innerHTML = filtered.slice(0, 5).map(product => `
                    <div class="search-result-item" onclick="openProductModal(${product.id}); searchInput.value=''; searchResults.classList.remove('active');">
                        <img src="${product.image || product.images?.[0] || 'images/placeholder.jpg'}" alt="${product.name}" onerror="this.style.display='none'">
                        <div class="search-result-item-info">
                            <div class="search-result-item-name">${product.name}</div>
                            <div class="search-result-item-price">KES ${product.price.toLocaleString()}</div>
                        </div>
                    </div>
                `).join('');
            }
            
            searchResults.classList.add('active');
        }, 300);
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });
}

// Product Detail Modal
let currentModalProduct = null;

function openProductModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProduct = product;
    const modal = document.getElementById('productModalOverlay');
    const modalImage = document.getElementById('productModalImage');
    const modalName = document.getElementById('productModalName');
    const modalPrice = document.getElementById('productModalPrice');
    const modalDescription = document.getElementById('productModalDescription');
    const modalAvailability = document.getElementById('productModalAvailability');
    const modalDetails = document.getElementById('productModalDetails');
    const modalThumbnails = document.getElementById('productModalThumbnails');
    const addToCartBtn = document.getElementById('productModalAddToCart');
    const buyNowBtn = document.getElementById('productModalBuyNow');
    
    if (!modal) return;
    
    // Set product data
    const productImages = product.images || [product.image].filter(Boolean);
    modalImage.src = productImages[0] || 'images/placeholder.jpg';
    modalName.textContent = product.name;
    modalPrice.textContent = `KES ${product.price.toLocaleString()}`;
    modalDescription.textContent = product.description || 'No description available.';
    
    // Availability
    const isInStock = product.availability === 'in_stock';
    modalAvailability.innerHTML = isInStock 
        ? '<span class="stock-status in-stock">In Stock</span>' 
        : '<span class="stock-status out-of-stock-status">Out of Stock</span>';
    
    // Details
    let detailsHTML = '<h3>Product Details</h3><ul>';
    if (product.category) detailsHTML += `<li><strong>Category:</strong> ${product.category}</li>`;
    if (product.tags && product.tags.length > 0) detailsHTML += `<li><strong>Tags:</strong> ${product.tags.join(', ')}</li>`;
    detailsHTML += `<li><strong>Availability:</strong> ${isInStock ? 'In Stock' : 'Out of Stock'}</li>`;
    if (product.featured) detailsHTML += `<li><strong>Featured Product</strong></li>`;
    detailsHTML += '</ul>';
    modalDetails.innerHTML = detailsHTML;
    
    // Thumbnails
    if (productImages.length > 1) {
        modalThumbnails.innerHTML = productImages.map((img, index) => `
            <img src="${img}" alt="Thumbnail ${index + 1}" class="product-modal-thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="changeModalImage('${img}', this)">
        `).join('');
    } else {
        modalThumbnails.innerHTML = '';
    }
    
    // Buttons
    if (isInStock) {
        addToCartBtn.disabled = false;
        addToCartBtn.onclick = () => { addToCart(productId); closeProductModal(); };
        buyNowBtn.disabled = false;
        buyNowBtn.onclick = () => { addToCart(productId); closeCart(); openCart(); closeProductModal(); };
    } else {
        addToCartBtn.disabled = true;
        buyNowBtn.disabled = true;
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    const modal = document.getElementById('productModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    currentModalProduct = null;
}

function changeModalImage(imageSrc, thumbnail) {
    const modalImage = document.getElementById('productModalImage');
    if (modalImage) {
        modalImage.src = imageSrc;
    }
    // Update active thumbnail
    document.querySelectorAll('.product-modal-thumbnail').forEach(thumb => {
        thumb.classList.remove('active');
    });
    if (thumbnail) thumbnail.classList.add('active');
}

// Advanced Cart Features
function saveCartForLater() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'error');
        return;
    }
    
    localStorage.setItem('tomtechSavedCart', JSON.stringify(cart));
    const savedInfo = document.getElementById('cartSavedInfo');
    if (savedInfo) {
        savedInfo.style.display = 'block';
        setTimeout(() => {
            savedInfo.style.display = 'none';
        }, 3000);
    }
    showNotification('Cart saved for later!', 'success');
}

function loadSavedCart() {
    const saved = localStorage.getItem('tomtechSavedCart');
    if (saved) {
        try {
            const savedCart = JSON.parse(saved);
            if (confirm('You have a saved cart. Would you like to restore it?')) {
                cart = savedCart;
                updateCartUI();
                showNotification('Cart restored!', 'success');
            }
        } catch (e) {
            console.error('Error loading saved cart:', e);
        }
    }
}

// Service Cards Collapsible Functionality
function initServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        const toggle = card.querySelector('.service-toggle');
        const header = card.querySelector('.service-header');
        
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                const isActive = card.classList.contains('active');
                
                // Close all other cards
                serviceCards.forEach(otherCard => {
                    if (otherCard !== card) {
                        otherCard.classList.remove('active');
                    }
                });
                
                // Toggle current card
                card.classList.toggle('active', !isActive);
            });
        }
        
        // Also allow clicking the header to toggle
        if (header) {
            header.addEventListener('click', function(e) {
                if (e.target !== toggle && !toggle.contains(e.target)) {
                    toggle.click();
                }
            });
        }
    });
}

// Close mobile menu when clicking outside
function initMenuCloseOnOutsideClick() {
    const navMenu = document.getElementById('navMenu');
    const navToggle = document.getElementById('navToggle');
    
    if (navMenu && navToggle) {
        document.addEventListener('click', function(e) {
            const isClickInsideMenu = navMenu.contains(e.target);
            const isClickOnToggle = navToggle.contains(e.target);
            
            if (!isClickInsideMenu && !isClickOnToggle && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                const spans = navToggle.querySelectorAll('span');
                if (spans.length >= 3) {
                    spans[0].style.transform = 'none';
                    spans[1].style.opacity = '1';
                    spans[2].style.transform = 'none';
                }
            }
        });
    }
}

// Inject service images from images/services/{data-service}.jpg or .png
function initServiceImages() {
    document.querySelectorAll('.service-card').forEach(function(card) {
        const slug = card.getAttribute('data-service');
        const title = (card.querySelector('.service-title') || {}).textContent || '';
        if (!slug || card.querySelector('.service-image-wrapper')) return;
        const wrapper = document.createElement('div');
        wrapper.className = 'service-image-wrapper';
        const img = document.createElement('img');
        img.alt = title;
        img.className = 'service-image';
        img.loading = 'lazy';
        var base = 'images/services/' + slug;
        img.onerror = function() {
            if (this.src.endsWith('.jpg')) {
                this.src = base + '.png';
            } else {
                wrapper.style.display = 'none';
            }
        };
        img.src = base + '.jpg';
        wrapper.appendChild(img);
        card.insertBefore(wrapper, card.firstChild);
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initSearch();
    loadSavedCart();
    initMobileMenu();
    initServiceImages();
    initServiceCards();
    initMenuCloseOnOutsideClick();
    
    // Product modal close handlers
    const modalClose = document.getElementById('productModalClose');
    const modalOverlay = document.getElementById('productModalOverlay');
    
    if (modalClose) {
        modalClose.addEventListener('click', closeProductModal);
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                closeProductModal();
            }
        });
    }
    
    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProductModal();
            closeProductDescriptionModal();
        }
    });
});

// Product Description Modal
function openProductDescriptionModal(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    // If no fullDescription, use description or show message
    if (!product.fullDescription) {
        product.fullDescription = product.description || 'No detailed description available for this product.';
    }
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('productDescriptionModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'productDescriptionModal';
        modal.className = 'product-description-modal';
        modal.innerHTML = `
            <div class="product-description-modal-overlay" onclick="closeProductDescriptionModal()"></div>
            <div class="product-description-modal-content">
                <button class="product-description-modal-close" onclick="closeProductDescriptionModal()">&times;</button>
                <div class="product-description-header">
                    <img id="productDescriptionImage" src="" alt="" class="product-description-image">
                    <div class="product-description-title-section">
                        <h2 id="productDescriptionName" class="product-description-name"></h2>
                        <p id="productDescriptionPrice" class="product-description-price"></p>
                    </div>
                </div>
                <div id="productDescriptionContent" class="product-description-content"></div>
                <div class="product-description-actions">
                    <button class="btn btn-primary" onclick="addToCart(${productId}); closeProductDescriptionModal();">Add to Cart</button>
                    <button class="btn btn-secondary" onclick="closeProductDescriptionModal()">Close</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Populate modal content
    const productImage = document.getElementById('productDescriptionImage');
    const productName = document.getElementById('productDescriptionName');
    const productPrice = document.getElementById('productDescriptionPrice');
    const productContent = document.getElementById('productDescriptionContent');
    
    if (productImage) productImage.src = product.image || product.images?.[0] || 'images/placeholder.jpg';
    if (productName) productName.textContent = product.name;
    if (productPrice) productPrice.textContent = `KES ${product.price.toLocaleString()}`;
    
    if (productContent) {
        // Format the full description with line breaks and bold text
        const lines = product.fullDescription.split('\n');
        productContent.innerHTML = lines.map(line => {
            if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
                const text = line.trim().replace(/\*\*/g, '');
                return `<h3 class="description-section-title">${text}</h3>`;
            } else if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
                return `<p class="description-bullet-point">${line.trim()}</p>`;
            } else if (line.trim()) {
                return `<p class="description-paragraph">${line.trim()}</p>`;
            }
            return '';
        }).join('');
    }
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductDescriptionModal() {
    const modal = document.getElementById('productDescriptionModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

window.closeProductDescriptionModal = closeProductDescriptionModal;

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.openBookingModal = openBookingModal;
window.checkoutToWhatsApp = checkoutToWhatsApp;
window.openWhatsApp = openWhatsApp;
window.toggleChatbot = toggleChatbot;
window.sendChatbotMessage = sendChatbotMessage;
window.handleChatbotKeyPress = handleChatbotKeyPress;
window.openProductModal = openProductModal;
window.closeProductModal = closeProductModal;
window.changeModalImage = changeModalImage;
window.openProductDescriptionModal = openProductDescriptionModal;
window.closeProductDescriptionModal = closeProductDescriptionModal;
window.saveCartForLater = saveCartForLater;
window.viewProductImage = viewProductImage;

// Product Image Viewer
function viewProductImage(imageSrc, productName) {
    // Create image viewer overlay
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer-overlay';
    viewer.innerHTML = `
        <div class="image-viewer-container">
            <button class="image-viewer-close">&times;</button>
            <img src="${imageSrc}" alt="${productName}" class="image-viewer-image">
            <div class="image-viewer-caption">${productName}</div>
        </div>
    `;
    
    document.body.appendChild(viewer);
    document.body.style.overflow = 'hidden';
    
    // Close on click
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer || e.target.classList.contains('image-viewer-close')) {
            document.body.removeChild(viewer);
            document.body.style.overflow = '';
        }
    });
    
    // Close on Escape key
    const closeHandler = function(e) {
        if (e.key === 'Escape') {
            if (document.body.contains(viewer)) {
                document.body.removeChild(viewer);
                document.body.style.overflow = '';
            }
            document.removeEventListener('keydown', closeHandler);
        }
    };
    document.addEventListener('keydown', closeHandler);
}
