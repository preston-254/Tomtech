// Admin Dashboard JavaScript
let currentEditingProduct = null;
let productImages = [];

// Firebase configuration
let firebaseApp = null;
let firebaseDatabase = null;
let firebaseInitialized = false;

// Initialize Firebase - Uses config embedded in HTML (window.FIREBASE_CONFIG)
function initializeFirebase() {
    if (firebaseInitialized && firebaseApp) return firebaseApp;
    
    // Get config from window.FIREBASE_CONFIG (embedded in HTML)
    if (typeof window === 'undefined' || !window.FIREBASE_CONFIG) {
        console.error('❌ Firebase config not found. Make sure window.FIREBASE_CONFIG is set in HTML.');
        return null;
    }
    
    const firebaseConfig = window.FIREBASE_CONFIG;
    
    // Validate required fields
    if (!firebaseConfig.apiKey || !firebaseConfig.databaseURL) {
        console.error('❌ Invalid Firebase config - missing required fields');
        return null;
    }
    
    try {
        if (typeof firebase === 'undefined') {
            console.error('❌ Firebase SDK not loaded');
            return null;
        }
        
        if (firebase.apps.length === 0) {
            firebaseApp = firebase.initializeApp(firebaseConfig);
            firebaseDatabase = firebase.database();
            firebaseInitialized = true;
            console.log('✅ Firebase initialized successfully');
            return firebaseApp;
        } else {
            firebaseApp = firebase.app();
            firebaseDatabase = firebase.database();
            firebaseInitialized = true;
            return firebaseApp;
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        return null;
    }
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (typeof checkAuth === 'function') {
        checkAuth();
    }

    // Initialize components
    initializeProducts();
    initializeModals();
    initializeSettings();
    updateStats();

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (typeof adminLogout === 'function') {
                adminLogout();
            }
        });
    }
});

// Initialize products
async function initializeProducts() {
    // Initialize Firebase
    initializeFirebase();
    
    await loadProducts();
    renderProductsTable();

    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', function() {
            openProductModal();
        });
    }
}

// Load products from localStorage and Firebase
async function loadProducts() {
    // First, try to load from Firebase (for cross-device sync)
    let firebaseProducts = null;
    try {
        firebaseProducts = await loadFromFirebase();
        if (firebaseProducts && firebaseProducts.length > 0) {
            // Save Firebase products to localStorage for offline access
            localStorage.setItem('tomtechProducts', JSON.stringify(firebaseProducts));
            localStorage.setItem('tomtechProductsLastUpdate', Date.now().toString());
            console.log('✅ Loaded products from Firebase:', firebaseProducts.length, 'products');
            return firebaseProducts;
        } else if (firebaseProducts !== null) {
            console.log('⚠️ No products found in Firebase');
        }
    } catch (error) {
        console.warn('Failed to load from Firebase:', error);
    }
    
    // Fallback to localStorage
    const stored = localStorage.getItem('tomtechProducts');
    if (stored) {
        try {
            const products = JSON.parse(stored);
            console.log('📦 Loaded products from localStorage:', products.length, 'products');
            return products;
        } catch (e) {
            console.error('Error loading products:', e);
        }
    }
    
    // If no stored products AND no Firebase products, initialize with default products
    console.log('🆕 No products found. Initializing with default products.');
    return initializeDefaultProducts();
}

// Load products from Firebase
async function loadFromFirebase() {
    try {
        initializeFirebase();
        if (!firebaseDatabase) {
            console.log('⚠️ Firebase not initialized');
            return null;
        }
        
        const snapshot = await firebaseDatabase.ref('products').once('value');
        const products = snapshot.val();
        
        if (products && Array.isArray(products) && products.length > 0) {
            console.log('✅ Loaded', products.length, 'products from Firebase');
            return products;
        } else if (products && typeof products === 'object') {
            // If it's an object, convert to array
            const productsArray = Object.values(products);
            if (productsArray.length > 0) {
                console.log('✅ Loaded', productsArray.length, 'products from Firebase (converted from object)');
                return productsArray;
            }
        }
        
        return null;
    } catch (error) {
        console.error('❌ Firebase load error:', error);
        return null;
    }
}

// Load products from cloud storage
async function loadFromCloud() {
    const url = getJsonBinUrl();
    if (!url || !JSONBIN_API_KEY) return null;
    
    try {
        const response = await fetch(url + '/latest', {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.record && Array.isArray(data.record)) {
                return data.record;
            }
        }
    } catch (error) {
        console.warn('JSONBin.io load failed:', error);
    }
    
    return null;
}

// Initialize default products (migrate from script.js)
// Only call this if NO products exist anywhere (first time setup)
function initializeDefaultProducts() {
    console.log('🆕 Initializing default products (first time setup)');
    const defaultProducts = [
        { id: 1, name: 'OBD II(16PIN)', price: 2700, image: 'images/products/IMG-20251230-WA0027.jpg', description: 'Universal 16-pin OBD II diagnostic cable compatible with all modern vehicles. Read and clear engine codes, monitor real-time data, and perform comprehensive vehicle diagnostics. Perfect for DIY mechanics and professional technicians. Easy plug-and-play installation!', category: 'Diagnostic Tools', tags: ['OBD', 'diagnostic', 'cable'], availability: 'in_stock', featured: false },
        { id: 2, name: 'AUTEL OBDII CABLE', price: 4500, image: 'images/products/IMG-20251230-WA0028.jpg', description: 'Premium AUTEL OBDII diagnostic cable with advanced features. Compatible with AUTEL diagnostic scanners for professional-grade vehicle analysis. Access deep system diagnostics, ECU programming, and advanced functions. High-quality construction ensures reliable performance!', category: 'Diagnostic Tools', tags: ['AUTEL', 'OBD', 'cable'], availability: 'in_stock', featured: false },
        { id: 3, name: 'LAUNCH(16 PIN)CABLE', price: 3500, image: 'images/products/IMG-20251230-WA0029.jpg', description: 'Professional LAUNCH 16-pin diagnostic cable for comprehensive vehicle scanning. Compatible with LAUNCH diagnostic tools for ECU programming, key programming, and system diagnostics. Durable design with premium connectors for long-lasting performance!', category: 'Diagnostic Tools', tags: ['LAUNCH', 'cable', 'diagnostic'], availability: 'in_stock', featured: false },
        { id: 4, name: 'CAR IMAGE SYSTEM', price: 4500, image: 'images/products/IMG-20251230-WA0030.jpg', description: 'Advanced car imaging and backup camera system. Enhance your vehicle safety with high-quality rearview cameras, parking sensors, and multi-camera setups. Easy installation with plug-and-play design. Perfect visibility in all conditions - day or night!', category: 'Safety & Security', tags: ['camera', 'safety', 'parking'], availability: 'in_stock', featured: false },
        { id: 5, name: 'CATALYTIC CONVERTER', price: 6500, image: 'images/products/IMG-20251230-WA0031.jpg', description: 'High-performance catalytic converter replacement. Restore your vehicle\'s exhaust efficiency and reduce harmful emissions. Compatible with multiple vehicle models. Improve fuel economy and engine performance. Professional installation available!', category: 'Exhaust Systems', tags: ['exhaust', 'emissions', 'converter'], availability: 'in_stock', featured: false },
        { id: 6, name: 'CENTRAL DOOR LOCKING SYSTEM', price: 3500, image: 'images/products/IMG-20251230-WA0032.jpg', description: 'Complete central door locking system with remote control. Lock and unlock all doors simultaneously with the push of a button. Includes key fob, actuators, and wiring. Easy installation for most vehicles. Enhance security and convenience for your car!', category: 'Safety & Security', tags: ['locking', 'security', 'remote'], availability: 'in_stock', featured: false }
    ];
    
    // Save to localStorage and try to sync to cloud
    saveProducts(defaultProducts);
    return defaultProducts;
}

// Save products to both localStorage and cloud (Firebase)
async function saveProducts(products) {
    // Save to localStorage immediately (for offline access)
    localStorage.setItem('tomtechProducts', JSON.stringify(products));
    localStorage.setItem('tomtechProductsLastUpdate', Date.now().toString());
    
    // Also save to Firebase for cross-device sync
    try {
        const synced = await saveToFirebase(products);
        if (synced) {
            console.log('✅ Products synced to Firebase successfully');
            return true;
        } else {
            console.log('⚠️ Firebase not configured. Products saved locally only.');
            return false;
        }
    } catch (error) {
        console.error('❌ Failed to sync to Firebase:', error);
        return false;
    }
}

// Save products to Firebase
async function saveToFirebase(products) {
    try {
        initializeFirebase();
        if (!firebaseDatabase) {
            console.log('⚠️ Firebase not initialized');
            return false;
        }
        
        await firebaseDatabase.ref('products').set(products);
        console.log('✅ Products saved to Firebase:', products.length, 'products');
        return true;
    } catch (error) {
        console.error('❌ Firebase save error:', error);
        return false;
    }
}

// Save products to cloud storage
async function saveToCloud(products) {
    // Check if cloud sync is configured
    if (!JSONBIN_API_KEY || JSONBIN_API_KEY.length === 0) {
        console.log('⚠️ Cloud sync not configured - no Master Key found');
        return false;
    }
    
    // If no Bin ID, create a new bin first
    if (!JSONBIN_BIN_ID || JSONBIN_BIN_ID.length === 0) {
        console.log('📦 Creating new bin...');
        try {
            const createResponse = await fetch('https://api.jsonbin.io/v3/b', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': JSONBIN_API_KEY,
                    'X-Bin-Name': 'Tomtech Products'
                },
                body: JSON.stringify(products)
            });
            
            if (createResponse.ok) {
                const data = await createResponse.json();
                JSONBIN_BIN_ID = data.metadata.id;
                localStorage.setItem('tomtechJsonBinId', JSONBIN_BIN_ID);
                
                // Also store in a way accessible to all devices
                // Store in a meta tag or global variable that can be accessed
                try {
                    // Store in document for cross-device access
                    document.documentElement.setAttribute('data-bin-id', JSONBIN_BIN_ID);
                } catch (e) {}
                
                console.log('✅ Bin created successfully:', JSONBIN_BIN_ID);
                console.log('💡 Bin ID saved. Other devices can access products using this Bin ID.');
                return true;
            } else {
                const errorData = await createResponse.json().catch(() => ({}));
                console.error('❌ Failed to create bin:', errorData.message || createResponse.statusText);
                return false;
            }
        } catch (error) {
            console.error('❌ Error creating bin:', error);
            return false;
        }
    }
    
    // Bin exists, update it
    const url = getJsonBinUrl();
    if (!url) {
        console.error('❌ Invalid Bin ID');
        return false;
    }
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Master-Key': JSONBIN_API_KEY,
                'X-Bin-Name': 'Tomtech Products'
            },
            body: JSON.stringify(products)
        });
        
        if (response.ok) {
            console.log('✅ Products updated in cloud successfully');
            return true;
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Failed to update bin:', errorData.message || response.statusText, 'Status:', response.status);
            
            // If bin was deleted, try to create a new one
            if (response.status === 404) {
                console.log('📦 Bin not found, creating new one...');
                JSONBIN_BIN_ID = '';
                localStorage.removeItem('tomtechJsonBinId');
                return await saveToCloud(products); // Recursively try to create
            }
            
            return false;
        }
    } catch (error) {
        console.error('❌ JSONBin.io sync failed:', error);
        return false;
    }
}

// Get all products (synchronous version for immediate access)
function getProducts() {
    const stored = localStorage.getItem('tomtechProducts');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Error loading products:', e);
        }
    }
    return [];
}

// Render products table
function renderProductsTable() {
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;

    const products = getProducts();
    tbody.innerHTML = '';

    if (products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No products found. Click "Add Product" to get started.</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <img src="${product.image || 'images/placeholder.jpg'}" alt="${product.name}" class="table-image" onerror="this.src='images/placeholder.jpg'">
            </td>
            <td><strong>${product.name}</strong></td>
            <td>KES ${product.price?.toLocaleString() || '0'}</td>
            <td>${product.category || 'Uncategorized'}</td>
            <td>
                <span class="badge ${product.availability === 'in_stock' ? 'badge-success' : 'badge-danger'}">
                    ${product.availability === 'in_stock' ? 'In Stock' : 'Out of Stock'}
                </span>
            </td>
            <td>
                ${product.featured ? '<span class="badge badge-featured">Featured</span>' : '-'}
            </td>
            <td>
                <div class="table-actions">
                    <button class="btn-icon btn-edit" onclick="editProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                    </button>
                    <button class="btn-icon btn-delete" onclick="deleteProduct(${product.id})">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Update stats
function updateStats() {
    const products = getProducts();
    const total = products.length;
    const featured = products.filter(p => p.featured).length;
    const inStock = products.filter(p => p.availability === 'in_stock').length;
    const outOfStock = products.filter(p => p.availability === 'out_of_stock').length;

    document.getElementById('totalProducts').textContent = total;
    document.getElementById('featuredProducts').textContent = featured;
    document.getElementById('inStockProducts').textContent = inStock;
    document.getElementById('outOfStockProducts').textContent = outOfStock;
}

// Initialize modals
function initializeModals() {
    const productModal = document.getElementById('productModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const productForm = document.getElementById('productForm');

    if (closeModal) {
        closeModal.addEventListener('click', closeProductModal);
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeProductModal);
    }

    if (productModal) {
        productModal.addEventListener('click', function(e) {
            if (e.target === productModal) {
                closeProductModal();
            }
        });
    }

    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }

    // Image upload
    const imageInput = document.getElementById('productImages');
    const imageUploadButton = document.getElementById('imageUploadButton');
    const imageUploadArea = document.getElementById('imageUploadArea');
    
    if (imageInput) {
        imageInput.addEventListener('change', handleImageUpload);
    }
    
    // Make upload button trigger file input
    if (imageUploadButton && imageInput) {
        imageUploadButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            imageInput.click();
        });
    }
    
    // Also make the upload area clickable
    if (imageUploadArea && imageInput) {
        imageUploadArea.addEventListener('click', function(e) {
            // Only trigger if clicking on the area itself, not on buttons or previews
            if (e.target === imageUploadArea || e.target.classList.contains('image-upload-placeholder')) {
                imageInput.click();
            }
        });
    }
}

// Open product modal
function openProductModal(productId = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    currentEditingProduct = productId;
    productImages = [];

    if (productId) {
        // Edit mode
        modalTitle.textContent = 'Edit Product';
        const product = getProducts().find(p => p.id === productId);
        if (product) {
            fillProductForm(product);
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add Product';
        form.reset();
        document.getElementById('imagePreviewContainer').innerHTML = '';
    }

    modal.classList.add('active');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('active');
    currentEditingProduct = null;
    productImages = [];
    document.getElementById('productForm').reset();
    document.getElementById('imagePreviewContainer').innerHTML = '';
}

// Fill product form
function fillProductForm(product) {
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productPrice').value = product.price || '';
    document.getElementById('productDescription').value = product.description || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productTags').value = product.tags?.join(', ') || '';
    document.getElementById('productAvailability').value = product.availability || 'in_stock';
    document.getElementById('productFeatured').checked = product.featured || false;

    // Handle images
    productImages = product.images || [product.image].filter(Boolean);
    renderImagePreviews();
}

// Handle product form submit
async function handleProductSubmit(e) {
    e.preventDefault();

    const products = getProducts();
    const productData = {
        name: document.getElementById('productName').value,
        price: parseFloat(document.getElementById('productPrice').value),
        description: document.getElementById('productDescription').value,
        category: document.getElementById('productCategory').value,
        tags: document.getElementById('productTags').value.split(',').map(t => t.trim()).filter(Boolean),
        availability: document.getElementById('productAvailability').value,
        featured: document.getElementById('productFeatured').checked,
        images: productImages.length > 0 ? productImages : [productImages[0] || 'images/placeholder.jpg']
    };

    if (currentEditingProduct) {
        // Update existing product
        const index = products.findIndex(p => p.id === currentEditingProduct);
        if (index !== -1) {
            products[index] = { ...products[index], ...productData };
        }
    } else {
        // Add new product
        const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
        productData.id = newId;
        productData.image = productImages[0] || 'images/placeholder.jpg';
        products.push(productData);
    }

    const synced = await saveProducts(products);
    renderProductsTable();
    updateStats();
    closeProductModal();

    // Show success message with sync status
    const hasCloudConfig = localStorage.getItem('tomtechJsonBinKey') && localStorage.getItem('tomtechJsonBinId');
    if (synced) {
        alert('✅ Product saved successfully! It has been synced to the cloud and will appear on other devices.');
    } else if (hasCloudConfig) {
        alert('✅ Product saved locally! (Cloud sync failed - check your Master Key in Settings)');
    } else {
        alert('✅ Product saved locally! (Cloud sync not configured - go to Settings to enable cross-device sync)');
    }
}

// Handle image upload
function handleImageUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Store as base64 or file path
                // For simplicity, we'll store the file name/path
                // In production, you'd upload to a server
                const imageData = e.target.result;
                productImages.push(imageData);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    });
}

// Render image previews
function renderImagePreviews() {
    const container = document.getElementById('imagePreviewContainer');
    if (!container) return;

    container.innerHTML = '';

    productImages.forEach((image, index) => {
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.innerHTML = `
            <img src="${image}" alt="Preview ${index + 1}">
            <button type="button" class="image-preview-remove" onclick="removeImage(${index})">&times;</button>
        `;
        container.appendChild(preview);
    });
}

// Remove image
function removeImage(index) {
    productImages.splice(index, 1);
    renderImagePreviews();
}

// Edit product
function editProduct(id) {
    openProductModal(id);
}

// Delete product
function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        const products = getProducts();
        const filtered = products.filter(p => p.id !== id);
        saveProducts(filtered);
        renderProductsTable();
        updateStats();
    }
}

// Initialize settings
function initializeSettings() {
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsModal = document.getElementById('closeSettingsModal');
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    const testSyncBtn = document.getElementById('testSyncBtn');

    // Load WhatsApp number
    const whatsappNumber = localStorage.getItem('tomtechWhatsAppNumber') || '254702466009';
    
    if (document.getElementById('whatsappNumber')) {
        document.getElementById('whatsappNumber').value = whatsappNumber;
    }

    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            settingsModal.classList.add('active');
        });
    }

    if (closeSettingsModal) {
        closeSettingsModal.addEventListener('click', function() {
            settingsModal.classList.remove('active');
        });
    }

    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', function() {
            settingsModal.classList.remove('active');
        });
    }


    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', function() {
            const whatsappNumber = document.getElementById('whatsappNumber').value;
            
            if (whatsappNumber) {
                localStorage.setItem('tomtechWhatsAppNumber', whatsappNumber);
                alert('Settings saved successfully!');
                settingsModal.classList.remove('active');
            } else {
                alert('Please enter a valid WhatsApp number');
            }
        });
    }

    if (settingsModal) {
        settingsModal.addEventListener('click', function(e) {
            if (e.target === settingsModal) {
                settingsModal.classList.remove('active');
            }
        });
    }
}

// Make functions globally available
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.removeImage = removeImage;

