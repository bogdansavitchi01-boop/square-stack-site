
"use strict";

// SQUARE STACK STORE - PRODUCT PAGES

const PRODUCT_DATA = {
    "skin-explorator": {
        name: "Skin Explorator",
        category: "Skin",
        price: 20,
        image: "images/explorator.png.png",
        version: "—",
        description: "Skin Explorator este un produs digital pentru jucătorii Square Stack. Acesta îți permite să personalizezi aspectul personajului și să îi oferi o identitate vizuală diferită în lumea jocului. Este potrivit pentru cei care preferă explorarea și aventura.",
        features: [
            "Skin pentru personajul din Square Stack",
            "Personalizarea aspectului personajului",
            "Produs digital",
            "Preț afișat în MDL"
        ]
    },

    "skin-constructor": {
        name: "Skin Constructor",
        category: "Skin",
        price: 20,
        image: "images/constructor.png",
        version: "—",
        description: "Skin Constructor este destinat jucătorilor care iubesc construcțiile și dezvoltarea propriilor lumi. Poți folosi acest skin pentru a schimba aspectul personajului tău în Square Stack.",
        features: [
            "Skin pentru personajul din Square Stack",
            "Aspect cu tematică de construcții",
            "Produs digital",
            "Preț afișat în MDL"
        ]
    },

    "skin-robot": {
        name: "Skin Robot",
        category: "Skin",
        price: 20,
        image: "images/robot.png",
        version: "—",
        description: "Skin Robot aduce un aspect inspirat de roboți personajului tău din Square Stack. Este o alegere pentru jucătorii care preferă un stil tehnologic.",
        features: [
            "Skin pentru personajul din Square Stack",
            "Tematică robot",
            "Produs digital",
            "Preț afișat în MDL"
        ]
    },

    "texturi-natura": {
        name: "Texturi Natură",
        category: "Pachet de texturi",
        price: 30,
        image: "images/texturanatura.png",
        version: "—",
        description: "Texturi Natură este un pachet digital cu tematică inspirată de mediul natural. Acesta este destinat personalizării aspectului lumii Square Stack.",
        features: [
            "Pachet digital de texturi",
            "Tematică inspirată de natură",
            "Personalizarea aspectului jocului",
            "Preț afișat în MDL"
        ]
    },

    "texturi-minereuri": {
        name: "Texturi Minereuri",
        category: "Pachet de texturi",
        price: 30,
        image: "images/texturamines.png",
        version: "—",
        description: "Texturi Minereuri este un pachet digital destinat jucătorilor care doresc să personalizeze aspectul materialelor și minereurilor din Square Stack.",
        features: [
            "Pachet digital de texturi",
            "Tematică de minereuri",
            "Personalizarea aspectului jocului",
            "Preț afișat în MDL"
        ]
    },

    "advanced-building": {
        name: "Advanced Building",
        category: "Extensie",
        price: 40,
        image: "images/advancebulding.png",
        version: "1.0",
        description: "Advanced Building este o extensie Square Stack din categoria construcțiilor. Pagina produsului oferă informații despre extensie și acces rapid la coșul de cumpărături.",
        features: [
            "Extensie Square Stack",
            "Categorie: construcții",
            "Versiune afișată: 1.0",
            "Preț afișat în MDL"
        ]
    },

    "furniture-plus": {
        name: "Furniture Plus",
        category: "Extensie",
        price: 40,
        image: "images/furniture.png",
        version: "1.0",
        description: "Furniture Plus este o extensie Square Stack din categoria mobilierului. Este prezentată în magazin ca produs digital pentru personalizarea experienței de joc.",
        features: [
            "Extensie Square Stack",
            "Categorie: mobilier",
            "Versiune afișată: 1.0",
            "Preț afișat în MDL"
        ]
    },

    "technology": {
        name: "Technology",
        category: "Extensie",
        price: 40,
        image: "images/electriciti.png",
        version: "1.0",
        description: "Technology este o extensie Square Stack din categoria tehnologiei. Consultă informațiile disponibile despre produs înainte de cumpărare.",
        features: [
            "Extensie Square Stack",
            "Categorie: tehnologie",
            "Versiune afișată: 1.0",
            "Preț afișat în MDL"
        ]
    }
};

const CART_KEY = "square-stack-demo-cart-v2";

const productId = document.body.dataset.productId;
const product = PRODUCT_DATA[productId];
const app = document.getElementById("product-page");

function readCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem(CART_KEY) || "{}"
        );

        return cart && typeof cart === "object" ? cart : {};
    } catch {
        return {};
    }
}

function updateCartCount() {
    const cart = readCart();

    const count = Object.values(cart).reduce(
        (total, quantity) => total + (Number(quantity) || 0),
        0
    );

    const element = document.getElementById("cart-count");

    if (element) {
        element.textContent = count;
    }
}

function addProductToCart() {
    const cart = readCart();

    cart[productId] =
        (Number(cart[productId]) || 0) + 1;

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

    const status = document.getElementById("product-status");

    if (status) {
        status.textContent =
            "Produsul a fost adăugat în coș!";
    }

    updateCartCount();
}

function renderProduct() {
    if (!product) {
        app.innerHTML = `
            <h1>Produsul nu a fost găsit</h1>
            <a href="magazin.html">Înapoi la magazin</a>
        `;
        return;
    }

    app.innerHTML = `
        <nav class="product-breadcrumb">
            <a href="magazin.html">Magazin</a>
            <span>/</span>
            <span>${product.name}</span>
        </nav>

        <section class="product-hero">

            <div class="product-image-wrap">
                <img
                    class="product-main-image"
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.hidden=true; document.getElementById('image-fallback').hidden=false;"
                >

                <div id="image-fallback" class="image-fallback" hidden>
                    Imaginea produsului nu este disponibilă.
                </div>
            </div>

            <div class="product-summary">

                <span class="product-category">
                    ${product.category}
                </span>

                <h1>${product.name}</h1>

                <p class="product-short-description">
                    ${product.description}
                </p>

                <div class="product-price">
                    ${product.price} MDL
                </div>

                <p class="product-tax-note">
                    Preț afișat în lei moldovenești.
                </p>

                <button class="product-button" id="add-product">
                    Adaugă în coș
                </button>

                <a class="product-button secondary" href="magazin.html">
                    Înapoi la magazin
                </a>

                <p id="product-status" class="product-status"></p>

                <p class="cart-link">
                    Produse în coș:
                    <strong id="cart-count">0</strong>
                    ·
                    <a href="magazin.html">Vezi coșul</a>
                </p>

            </div>
        </section>

        <section class="product-section">
            <h2>Despre produs</h2>
            <p>${product.description}</p>
        </section>

        <section class="product-section">
            <h2>Caracteristici și avantaje</h2>

            <ul class="feature-list">
                ${product.features.map(feature =>
                    `<li>${feature}</li>`
                ).join("")}
            </ul>
        </section>

        <section class="product-info-grid">

            <article class="info-card">
                <span>Categorie</span>
                <strong>${product.category}</strong>
            </article>

            <article class="info-card">
                <span>Preț</span>
                <strong>${product.price} MDL</strong>
            </article>

            <article class="info-card">
                <span>Versiune</span>
                <strong>${product.version}</strong>
            </article>

            <article class="info-card">
                <span>Compatibilitate</span>
                <strong>Square Stack</strong>
            </article>

        </section>

        <section class="product-section">
            <h2>Instalare și utilizare</h2>

            <p>
                Instrucțiunile exacte de instalare vor fi adăugate
                în funcție de tipul produsului. Informațiile
                confirmate vor apărea aici.
            </p>
        </section>

        <section class="product-section faq-section">
            <h2>Întrebări frecvente</h2>

            <details>
                <summary>Cum cumpăr produsul?</summary>
                <p>
                    Apasă butonul Adaugă în coș și continuă
                    din pagina magazinului.
                </p>
            </details>

            <details>
                <summary>Unde găsesc coșul?</summary>
                <p>
                    Revino la magazin folosind butonul
                    Vezi coșul.
                </p>
            </details>

            <details>
                <summary>Este un produs digital?</summary>
                <p>
                    Produsele din acest catalog sunt prezentate
                    ca produse digitale Square Stack.
                </p>
            </details>
        </section>

        <section class="product-bottom">
            <h2>Pregătit să încerci produsul?</h2>

            <p>
                Adaugă produsul în coș și continuă cumpărăturile.
            </p>

            <button class="product-button" id="add-product-bottom">
                Adaugă în coș
            </button>
        </section>
    `;

    document.getElementById("add-product")
        .addEventListener("click", addProductToCart);

    document.getElementById("add-product-bottom")
        .addEventListener("click", addProductToCart);

    updateCartCount();
}

renderProduct();
