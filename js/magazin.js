
// Square Stack Store 2.2
// Catalog, produse și coș de cumpărături

const products = [
    {
        id: 'skin-explorator',
        name: 'Skin Explorator',
        category: 'skin',
        image: 'images/explorator.png.png',
        price: 20,
        description: 'Skin verde pentru explorare.'
    },
    {
        id: 'skin-constructor',
        name: 'Skin Constructor',
        category: 'skin',
        image: 'images/constructor.png',
        price: 20,
        description: 'Skin pentru construcții.'
    },
    {
        id: 'skin-robot',
        name: 'Skin Robot',
        category: 'skin',
        image: 'images/robot.png',
        price: 20,
        description: 'Personaj robot original.'
    },
    {
        id: 'texturi-natura',
        name: 'Texturi Natură',
        category: 'texture',
        image: 'images/texturanatura.png',
        price: 30,
        description: 'Pachet demonstrativ de texturi naturale.'
    },
    {
        id: 'texturi-minereuri',
        name: 'Texturi Minereuri',
        category: 'texture',
        image: 'images/texturamines.png',
        price: 30,
        description: 'Pachet demonstrativ de minereuri.'
    },
    {
        id: 'advanced-building',
        name: 'Advanced Building',
        category: 'mod',
        image: 'images/advancebulding.png',
        price: 40,
        version: '1.0',
        description: 'Mod de construcții avansate cu blocuri noi, sticlă colorată, marmură și uși interactive.'
    },
    {
        id: 'furniture-plus',
        name: 'Furniture Plus',
        category: 'mod',
        image: 'images/furniture.png',
        price: 40,
        version: '1.0',
        description: 'Mobilier nou, mese, scaune, canapele și decorațiuni.'
    },
    {
        id: 'technology',
        name: 'Technology',
        category: 'mod',
        image: 'images/electriciti.png',
        price: 40,
        version: '1.0',
        description: 'Mod tehnologic cu energie, electricitate și blocuri interactive.'
    }
];

// PAGINILE PRODUSELOR
const productPages = {
    'skin-explorator': '1index.html',
    'skin-constructor': '2index.html',
    'skin-robot': '3index.html',
    'texturi-natura': '4index.html',
    'texturi-minereuri': '5index.html',
    'advanced-building': '6index.html',
    'furniture-plus': '7index.html',
    'technology': '8index.html'
};

// COȘUL
const key = 'square-stack-demo-cart-v2';
let cart = {};

try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');

    if (saved && typeof saved === 'object' && !Array.isArray(saved)) {
        for (const p of products) {
            const q = saved[p.id];

            if (Number.isInteger(q) && q > 0) {
                cart[p.id] = Math.min(q, 99);
            }
        }
    }
} catch (e) {
    cart = {};
}

// ELEMENTE HTML
const $ = id => document.getElementById(id);

// SALVARE COȘ
function save() {
    try {
        localStorage.setItem(key, JSON.stringify(cart));
    } catch (e) {
        console.warn('Coșul nu a putut fi salvat.');
    }
}

// PREȚ
function money(n) {
    return n.toLocaleString('ro-RO') + ' MDL';
}

// DESCHIDE PAGINA PRODUSULUI
function openProductPage(id) {
    const page = productPages[id];

    if (page) {
        window.location.href = page;
    }
}

// AFIȘARE PRODUSE
function renderProducts() {
    const grid = $('products');
    const search = $('search');
    const filter = $('filter');

    if (!grid || !search || !filter) {
        console.error('Lipsesc elemente HTML ale magazinului!');
        return;
    }

    grid.innerHTML = '';

    const query = search.value.toLowerCase().trim();
    const category = filter.value;

    const filtered = products.filter(product => {
        return (
            (category === 'all' || product.category === category) &&
            (product.name + ' ' + product.description)
                .toLowerCase()
                .includes(query)
        );
    });

    if ($('no-results')) {
        $('no-results').hidden = filtered.length > 0;
    }

    filtered.forEach(product => {
        const card = document.createElement('article');
        card.className = 'card';

        // IMAGINE
        const preview = document.createElement('div');
        preview.className = 'preview';

        if (product.image) {
            const img = document.createElement('img');

            img.src = product.image;
            img.alt = product.name;
            img.style.width = '128px';
            img.style.imageRendering = 'pixelated';

            img.onerror = () => {
                img.remove();
                preview.textContent = '📦';
            };

            preview.appendChild(img);
        } else {
            preview.textContent = '📦';
        }

        // NUME
        const name = document.createElement('h3');
        name.textContent = product.name;

        if (product.category === 'mod') {
            name.textContent += ' ' + product.version;
        }

        // LINK PAGINĂ PRODUS
        name.style.cursor = 'pointer';
        name.title = 'Vezi produsul';

        name.addEventListener('click', () => {
            openProductPage(product.id);
        });

        preview.style.cursor = 'pointer';
        preview.title = 'Vezi produsul';

        preview.addEventListener('click', () => {
            openProductPage(product.id);
        });

        // DESCRIERE
        const description = document.createElement('p');
        description.textContent = product.description;

        // PREȚ
        const price = document.createElement('p');
        price.className = 'price';
        price.textContent = money(product.price);

        // BUTON COȘ
        const button = document.createElement('button');

        button.className = 'btn';
        button.textContent = 'Adaugă în coș';

        button.addEventListener('click', () => {
            addToCart(product.id);
        });

        // ADAUGĂ ÎN CARD
        card.append(
            preview,
            name,
            description,
            price,
            button
        );

        grid.appendChild(card);
    });
}

// ADAUGĂ ÎN COȘ
function addToCart(id) {
    const product = products.find(p => p.id === id);

    if (!product) return;

    cart[id] = Math.min((cart[id] || 0) + 1, 99);

    save();
    renderCart();

    if ($('message')) {
        $('message').textContent =
            product.name + ' a fost adăugat în coș!';
    }
}

// AFIȘARE COȘ
function renderCart() {
    const holder = $('cart-items');

    if (!holder) return;

    holder.replaceChildren();

    let total = 0;

    const entries = products.filter(p => cart[p.id] > 0);

    if (!entries.length) {
        const p = document.createElement('p');
        p.textContent = 'Coșul este gol.';
        holder.append(p);
    }

    for (const p of entries) {
        const q = cart[p.id];

        total += p.price * q;

        const row = document.createElement('div');
        row.className = 'cart-row';

        const name = document.createElement('strong');
        name.textContent = p.name;

        const cost = document.createElement('div');

        const small = document.createElement('small');
        small.textContent = money(p.price * q);

        cost.append(small);

        const controls = document.createElement('div');
        controls.className = 'qty';

        // SCĂDERE
        const minus = document.createElement('button');
        minus.textContent = '−';

        minus.setAttribute(
            'aria-label',
            'Scade cantitatea pentru ' + p.name
        );

        minus.onclick = () => change(p.id, -1);

        // CANTITATE
        const count = document.createElement('span');
        count.textContent = String(q);

        // CREȘTERE
        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.disabled = q >= 99;

        plus.setAttribute(
            'aria-label',
            'Crește cantitatea pentru ' + p.name
        );

        plus.onclick = () => change(p.id, 1);

        // ȘTERGERE
        const remove = document.createElement('button');
        remove.textContent = 'Șterge';

        remove.onclick = () => {
            delete cart[p.id];
            save();
            renderCart();
        };

        controls.append(
            minus,
            count,
            plus,
            remove
        );

        row.append(
            name,
            cost,
            controls
        );

        holder.append(row);
    }

    if ($('total')) {
        $('total').textContent = money(total);
    }

    if ($('checkout')) {
        $('checkout').disabled = entries.length === 0;
    }
}

// MODIFICĂ CANTITATEA
function change(id, delta) {
    const next = (cart[id] || 0) + delta;

    if (next <= 0) {
        delete cart[id];
    } else {
        cart[id] = Math.min(next, 99);
    }

    save();
    renderCart();
}

// CĂUTARE
if ($('search')) {
    $('search').addEventListener('input', renderProducts);
}

// FILTRARE
if ($('filter')) {
    $('filter').addEventListener('change', renderProducts);
}

// FINALIZARE COMANDĂ DEMO
if ($('checkout')) {
    $('checkout').addEventListener('click', () => {
        const entries = products.filter(p => cart[p.id] > 0);

        if (!entries.length) {
            $('message').textContent = 'Coșul este gol!';
            return;
        }

        let total = 0;

        let orderMessage =
            'Bună! Doresc să comand următoarele produse:\n\n';

        entries.forEach(product => {
            const quantity = cart[product.id];
            const subtotal = product.price * quantity;

            total += subtotal;

            orderMessage +=
                '• ' + product.name +
                ' ' + (product.version || '') +
                ' | Cantitate: ' + quantity +
                ' | Preț: ' + subtotal + ' MDL\n';
        });

        orderMessage +=
            '\nTOTAL COMANDĂ: ' + total + ' MDL\n\n' +
            'Comandă Square Stack Store.';

        // COMPLETEAZĂ MESAJUL
        if ($('mesaj')) {
            $('mesaj').value = orderMessage;
        }

        // DUCE CLIENTUL LA FORMULAR
        if ($('formular-squarestack')) {
            $('formular-squarestack').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }

        if ($('mesaj')) {
            $('mesaj').focus({
                preventScroll: true
            });
        }

        if ($('message')) {
            $('message').textContent =
                'Completează numele și emailul pentru a trimite comanda!';
        }
    });
}

// PORNIRE MAGAZIN
renderProducts();
renderCart();

console.log('Square Stack Store 2.2 pornit!');
