
// Square Stack Store 2.2
// Sistem comun pentru toate paginile produselor

const products = {
    '1index.html': {
        id: 'skin-explorator',
        name: 'Skin Explorator',
        category: 'Skin',
        image: 'images/explorator.png.png',
        price: 20,
        version: '1.0',
        description: 'Un skin original Square Stack, creat pentru jucătorii care iubesc explorarea lumilor 3D. Potrivit pentru aventuri, descoperirea locurilor noi și construirea propriilor povești.',
        features: [
            'Design original Square Stack',
            'Aspect inspirat de exploratori',
            'Potrivit pentru lumea 3D',
            'Creat pentru aventuri'
        ]
    },

    '2index.html': {
        id: 'skin-constructor',
        name: 'Skin Constructor',
        category: 'Skin',
        image: 'images/constructor.png',
        price: 20,
        version: '1.0',
        description: 'Un skin creat pentru jucătorii pasionați de construcții. Potrivit pentru proiectarea caselor, clădirilor și orașelor.',
        features: [
            'Design original',
            'Tematică de constructor',
            'Potrivit pentru modul Creative',
            'Creat pentru Square Stack'
        ]
    },

    '3index.html': {
        id: 'skin-robot',
        name: 'Skin Robot',
        category: 'Skin',
        image: 'images/robot.png',
        price: 20,
        version: '1.0',
        description: 'Un personaj robot original pentru Square Stack, cu tematică tehnologică și aspect futurist.',
        features: [
            'Personaj robot original',
            'Design tehnologic',
            'Tematică futuristă',
            'Potrivit pentru multiplayer'
        ]
    },

    '4index.html': {
        id: 'texturi-natura',
        name: 'Texturi Natură',
        category: 'Pachet de texturi',
        image: 'images/texturanatura.png',
        price: 30,
        version: '1.0',
        description: 'Un pachet demonstrativ de texturi naturale pentru personalizarea mediului din Square Stack.',
        features: [
            'Tematică inspirată din natură',
            'Personalizarea lumii',
            'Pachet demonstrativ',
            'Creat pentru Square Stack'
        ]
    },

    '5index.html': {
        id: 'texturi-minereuri',
        name: 'Texturi Minereuri',
        category: 'Pachet de texturi',
        image: 'images/texturamines.png',
        price: 30,
        version: '1.0',
        description: 'Pachet demonstrativ de texturi pentru minereurile din Square Stack, cu o tematică vizuală dedicată resurselor subterane.',
        features: [
            'Tematică de minereuri',
            'Personalizarea resurselor',
            'Pachet demonstrativ',
            'Creat pentru Square Stack'
        ]
    },

    '6index.html': {
        id: 'advanced-building',
        name: 'Advanced Building',
        category: 'Mod',
        image: 'images/advancebulding.png',
        price: 40,
        version: '1.0',
        description: 'Un mod dedicat construcțiilor avansate. Include o tematică de construcție cu blocuri noi, sticlă colorată, marmură și uși interactive.',
        features: [
            'Blocuri noi',
            'Sticlă colorată',
            'Marmură decorativă',
            'Uși interactive',
            'Posibilități suplimentare de design'
        ]
    },

    '7index.html': {
        id: 'furniture-plus',
        name: 'Furniture Plus',
        category: 'Mod',
        image: 'images/furniture.png',
        price: 40,
        version: '1.0',
        description: 'Un pachet de mobilier și decorațiuni pentru casele și clădirile din Square Stack. Amenajează camere și creează spații personalizate.',
        features: [
            'Mese și scaune',
            'Canapele',
            'Mobilier decorativ',
            'Decorațiuni pentru interior',
            'Personalizarea locuințelor'
        ]
    },

    '8index.html': {
        id: 'technology',
        name: 'Technology',
        category: 'Mod',
        image: 'images/electriciti.png',
        price: 40,
        version: '1.0',
        description: 'Un mod cu tematică modernă, dedicat tehnologiei și automatizării. Include sisteme de energie, electricitate și blocuri interactive.',
        features: [
            'Sisteme de energie',
            'Electricitate',
            'Blocuri interactive',
            'Tematică tehnologică',
            'Construcții moderne'
        ]
    },

    '9index.html': {
        id: 'electricity',
        name: 'Electricity',
        category: 'Mod',
        icon: '⚡',
        price: 40,
        version: '1.0',
        description: 'Un pachet cu tematică electrică pentru Square Stack. Creează baze moderne, instalații și construcții cu sisteme electrice și utilaje.',
        features: [
            'Sisteme electrice',
            'Cabluri',
            'Utilaje moderne',
            'Construcții tehnologice',
            'Tematică de automatizare'
        ]
    }
};

// IDENTIFICAREA PAGINII
const pageName = window.location.pathname.split('/').pop();
const product = products[pageName];

// ELEMENTE HTML
const $ = id => document.getElementById(id);

// AFIȘAREA PRODUSULUI
function renderProduct() {
    if (!product) {
        document.body.innerHTML = '<h1>Produsul nu a fost găsit!</h1>';
        return;
    }

    const name = $('product-name');
    const image = $('product-image');
    const price = $('product-price');
    const description = $('product-description');
    const category = $('product-category');
    const version = $('product-version');
    const features = $('product-features');

    if (name) name.textContent = product.name;
    if (price) price.textContent = product.price + ' MDL';
    if (description) description.textContent = product.description;
    if (category) category.textContent = product.category;
    if (version) version.textContent = 'Versiunea ' + product.version;

    if (image) {
        if (product.image) {
            image.src = product.image;
            image.alt = product.name;
            image.hidden = false;
        } else {
            image.hidden = true;
        }
    }

    if (features) {
        features.replaceChildren();

        product.features.forEach(feature => {
            const li = document.createElement('li');
            li.textContent = feature;
            features.appendChild(li);
        });
    }

    updateCartButton();
}

// COȘUL DE CUMPĂRĂTURI
const CART_KEY = 'square-stack-demo-cart-v2';

function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    } catch {
        return {};
    }
}

function addToCart() {
    if (!product) return;

    const cart = getCart();
    const current = Number.isInteger(cart[product.id])
        ? cart[product.id]
        : 0;

    if (current >= 99) {
        alert('Ai atins limita de 99 de bucăți!');
        return;
    }

    cart[product.id] = current + 1;

    localStorage.setItem(CART_KEY, JSON.stringify(cart));

    updateCartButton();

    const message = $('product-message');

    if (message) {
        message.textContent =
            product.name + ' a fost adăugat în coș!';
    }
}

// ACTUALIZARE BUTON
function updateCartButton() {
    const button = $('add-to-cart');
    if (!button || !product) return;

    const cart = getCart();
    const quantity = cart[product.id] || 0;

    button.textContent = quantity > 0
        ? 'Adaugă încă un produs (' + quantity + ' în coș)'
        : 'Adaugă în coș';
}

// BUTON CUMPĂRARE
const addButton = $('add-to-cart');

if (addButton) {
    addButton.addEventListener('click', addToCart);
}

// ÎNAPOI LA MAGAZIN
const backButton = $('back-to-store');

if (backButton) {
    backButton.addEventListener('click', () => {
        window.location.href = 'index.html';
    });
}

// PORNIRE
renderProduct();

console.log('Square Stack Product Page pornit!');
