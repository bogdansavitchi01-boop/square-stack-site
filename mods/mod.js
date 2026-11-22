
(function () {
    "use strict";

    if (window.FurniturePlus) return;

    let attempts = 0;

    function install() {

        if (
            typeof THREE === "undefined" ||
            typeof BLOCK_TYPES === "undefined" ||
            typeof BLOCK_MATERIALS === "undefined" ||
            typeof INVENTORY_BLOCK_NAMES === "undefined" ||
            typeof INVENTORY_BLOCK_ICONS === "undefined" ||
            typeof createBlockMesh !== "function" ||
            typeof updatePlayer !== "function" ||
            typeof setWorldBlock !== "function" ||
            typeof getWorldBlock !== "function"
        ) {
            if (++attempts < 80) {
                setTimeout(install, 250);
            } else {
                console.error("Furniture Plus: API incompatibil.");
            }
            return;
        }

        const blocks = new Map();
        const catalog = [];
        const pairs = new Map();

        let seat = null;

        const colors = [
            ["Stejar", 0x98663e],
            ["Alb", 0xe8e8e5],
            ["Albastru", 0x416bbe]
        ];

        const models = [
            ["Scaun", "chair", "🪑", "Sufragerie"],
            ["Fotoliu", "armchair", "🛋️", "Sufragerie"],
            ["Canapea", "sofa", "🛋️", "Sufragerie"],
            ["Pat", "bed", "🛏️", "Dormitor"],
            ["Noptiera", "nightstand", "🗄️", "Dormitor"],
            ["Dulap", "wardrobe", "🚪", "Dormitor"],
            ["Frigider", "fridge", "🧊", "Bucatarie"],
            ["Chiuveta", "sink", "🚰", "Bucatarie"],
            ["Cuptor", "oven", "🍳", "Bucatarie"],
            ["Masa", "table", "🪵", "Birou"],
            ["Birou", "desk", "🖥️", "Birou"],
            ["Biblioteca", "bookshelf", "📚", "Birou"]
        ];

        const opening = [
            "wardrobe",
            "fridge",
            "oven",
            "nightstand"
        ];

        const sitting = [
            "chair",
            "armchair",
            "sofa",
            "bed"
        ];

        // ==========================
        // MOTORUL DE MOBILIER 3D
        // ==========================

        function makeGeometry(kind, color, opened) {

            const positions = [];
            const normals = [];
            const shades = [];

            function box(w,h,d,x,y,z,c) {

                const original =
                    new THREE.BoxGeometry(w,h,d);

                const g = original.toNonIndexed();

                g.translate(x,y,z);

                const p = g.attributes.position;
                const n = g.attributes.normal;

                const shade = new THREE.Color(c);

                for (let i = 0; i < p.count; i++) {

                    positions.push(
                        p.getX(i),
                        p.getY(i),
                        p.getZ(i)
                    );

                    normals.push(
                        n.getX(i),
                        n.getY(i),
                        n.getZ(i)
                    );

                    shades.push(
                        shade.r,
                        shade.g,
                        shade.b
                    );
                }

                original.dispose();
                g.dispose();
            }

            const dark = 0x47362b;
            const metal = 0xb9c3cb;
            const handle = 0xd6c58a;

            function legs(w,d,h) {

                for (const x of [-w,w]) {
                    for (const z of [-d,d]) {
                        box(
                            0.13,h,0.13,
                            x,-0.5+h/2,z,
                            dark
                        );
                    }
                }
            }

            // SCAUN
            if (kind === "chair") {

                legs(0.31,0.31,0.42);

                box(
                    0.8,0.15,0.8,
                    0,-0.03,0,color
                );

                box(
                    0.8,0.5,0.13,
                    0,0.25,-0.34,color
                );
            }

            // FOTOLIU SI CANAPEA
            if (
                kind === "armchair" ||
                kind === "sofa"
            ) {

                const w =
                    kind === "sofa" ? 0.98 : 0.8;

                box(
                    w,0.3,0.9,
                    0,-0.32,0,color
                );

                box(
                    w,0.65,0.19,
                    0,0.12,-0.35,color
                );

                for (const x of [-w/2+0.08,w/2-0.08]) {

                    box(
                        0.15,0.4,0.85,
                        x,-0.02,0,color
                    );
                }

                box(
                    w-0.32,0.14,0.63,
                    0,-0.1,0.08,
                    0xd7d7d7
                );
            }

            // PAT
            if (kind === "bed") {

                legs(0.34,0.34,0.2);

                box(
                    0.95,0.18,0.95,
                    0,-0.23,0,dark
                );

                box(
                    0.9,0.22,0.9,
                    0,-0.04,0,0xffffff
                );

                box(
                    0.88,0.07,0.6,
                    0,0.1,0.13,color
                );

                box(
                    0.55,0.13,0.24,
                    0,0.15,-0.28,0xffffff
                );

                box(
                    0.95,0.5,0.12,
                    0,0.05,-0.43,dark
                );
            }

            // MOBILIER CU USI
            if (opening.includes(kind)) {

                const h =
                    kind === "nightstand" ? 0.65 : 1;

                const mid = -0.5 + h/2;

                // Peretele din spate
                box(
                    0.94,h,0.08,
                    0,mid,-0.43,color
                );

                // Peretii laterali
                for (const x of [-0.43,0.43]) {
                    box(
                        0.08,h,0.86,
                        x,mid,0,color
                    );
                }

                // Partea de sus si baza
                box(
                    0.94,0.08,0.9,
                    0,-0.46,0,color
                );

                box(
                    0.94,0.08,0.9,
                    0,-0.54+h,0,color
                );

                // Raft interior
                box(
                    0.8,0.06,0.8,
                    0,mid,0,metal
                );

                const doorColor =
                    kind === "oven"
                    ? 0x26313a
                    : color;

                if (!opened) {

                    box(
                        0.9,h-0.1,0.1,
                        0,mid,0.44,doorColor
                    );

                    box(
                        0.08,0.18,0.05,
                        0.3,mid,0.5,handle
                    );

                } else {

                    box(
                        0.08,h-0.1,0.85,
                        -0.43,mid,0.85,doorColor
                    );

                    box(
                        0.06,0.18,0.06,
                        -0.36,mid,1.15,handle
                    );
                }

                // Butoane cuptor
                if (kind === "oven") {

                    for (const x of [-0.25,0,0.25]) {
                        box(
                            0.13,0.12,0.08,
                            x,0.37,0.48,metal
                        );
                    }
                }
            }

            // CHIUVETA
            if (kind === "sink") {

                box(
                    0.88,0.6,0.88,
                    0,-0.2,0,color
                );

                box(
                    0.85,0.08,0.85,
                    0,0.12,0,metal
                );

                for (const x of [-0.4,0.4]) {
                    box(
                        0.1,0.13,0.9,
                        x,0.2,0,metal
                    );
                }

                for (const z of [-0.4,0.4]) {
                    box(
                        0.8,0.13,0.1,
                        0,0.2,z,metal
                    );
                }

                // Robinet
                box(
                    0.1,0.34,0.1,
                    0,0.31,-0.3,metal
                );

                box(
                    0.1,0.1,0.3,
                    0,0.43,-0.16,metal
                );
            }

            // MASA SI BIROU
            if (
                kind === "table" ||
                kind === "desk"
            ) {

                legs(0.35,0.35,0.75);

                box(
                    0.98,0.12,0.98,
                    0,0.32,0,color
                );

                if (kind === "desk") {

                    box(
                        0.3,0.25,0.75,
                        0.28,0.12,0,color
                    );

                    box(
                        0.12,0.05,0.05,
                        0.28,0.12,0.41,handle
                    );
                }
            }

            // BIBLIOTECA
            if (kind === "bookshelf") {

                for (const x of [-0.44,0.44]) {
                    box(
                        0.1,1,0.8,
                        x,0,0,color
                    );
                }

                box(
                    0.9,1,0.1,
                    0,0,-0.36,color
                );

                for (const y of [-0.45,0,0.45]) {

                    box(
                        0.9,0.1,0.8,
                        0,y,0,color
                    );
                }

                const bookColors = [
                    0xc63b3b,
                    0x3c80bf,
                    0x509d53,
                    0xe0b941,
                    0x9152b4
                ];

                for (const y of [-0.23,0.23]) {

                    for (let i = 0; i < 5; i++) {

                        box(
                            0.13,0.32,0.5,
                            -0.29+i*0.145,
                            y,0.05,
                            bookColors[i]
                        );
                    }
                }
            }

            const geometry =
                new THREE.BufferGeometry();

            geometry.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(
                    positions,3
                )
            );

            geometry.setAttribute(
                "normal",
                new THREE.Float32BufferAttribute(
                    normals,3
                )
            );

            geometry.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(
                    shades,3
                )
            );

            geometry.computeBoundingSphere();

            return geometry;
        }

        // ==========================
        // INREGISTRAREA MOBILIERULUI
        // ==========================

        function register(
            name,kind,icon,category,color,
            opened=false
        ) {

            const id = BLOCK_TYPES.length;

            const material =
                new THREE.MeshLambertMaterial({
                    vertexColors: true
                });

            const geometry =
                makeGeometry(kind,color,opened);

            BLOCK_TYPES.push({
                name,
                color: "#" +
                    color.toString(16).padStart(6,"0")
            });

            BLOCK_MATERIALS[id] = material;
            INVENTORY_BLOCK_NAMES[id] = name;
            INVENTORY_BLOCK_ICONS[id] = icon;

            if (
                typeof BLOCK_COLORS !== "undefined" &&
                Array.isArray(BLOCK_COLORS)
            ) {
                BLOCK_COLORS[id] = color;
            }

            const block = {
                id,name,kind,icon,
                category,color,opened,
                geometry,material
            };

            blocks.set(id,block);

            if (!opened) catalog.push(block);

            return id;
        }

        for (const model of models) {

            const [name,kind,icon,category] = model;

            for (const [colorName,color] of colors) {

                const closed = register(
                    name+" "+colorName,
                    kind,icon,category,color
                );

                if (opening.includes(kind)) {

                    const opened = register(
                        name+" "+colorName+" deschis",
                        kind,icon,category,color,true
                    );

                    pairs.set(closed,opened);
                    pairs.set(opened,closed);
                }
            }
        }

        // ==========================
        // AFISARE IN LUMEA 3D
        // ==========================

        const originalMesh = createBlockMesh;

        createBlockMesh = function(type,x,y,z) {

            const block = blocks.get(type);

            if (!block) {
                return originalMesh.apply(
                    this,arguments
                );
            }

            const mesh = new THREE.Mesh(
                block.geometry,
                block.material
            );

            mesh.position.set(x,y,z);

            mesh.userData = {
                type,x,y,z,
                furniturePlus:true
            };

            return mesh;
        };

        function inWorld() {

            const screen =
                document.getElementById("game-screen");

            return screen &&
                !screen.classList.contains("hidden") &&
                gameRunning;
        }

        // ==========================
        // ASEZARE SI RIDICARE
        // ==========================

        function stand() {

            if (!seat) return;

            player.x = seat.oldX;
            player.y = seat.oldY;
            player.z = seat.oldZ;
            player.velocityY = 0;

            seat = null;

            if (typeof updateCamera === "function") {
                updateCamera();
            }
        }

        const originalUpdate = updatePlayer;

        updatePlayer = function(delta) {

            if (seat) {

                if (
                    !inWorld() ||
                    getWorldBlock(
                        seat.x,seat.y,seat.z
                    ) !== seat.type
                ) {
                    stand();
                } else {

                    player.x = seat.x;
                    player.y = seat.y + seat.height;
                    player.z = seat.z;

                    player.velocityY = 0;
                    player.grounded = true;

                    updateCamera();

                    updateWorldChunks(
                        player.x,player.z
                    );

                    return;
                }
            }

            return originalUpdate.apply(
                this,arguments
            );
        };

        // Ridicare inainte de iesirea din lume
        if (typeof pauseGame === "function") {

            const originalPause = pauseGame;

            pauseGame = function() {

                stand();

                return originalPause.apply(
                    this,arguments
                );
            };
        }

        if (typeof startWorld === "function") {

            const originalStart = startWorld;

            startWorld = function() {

                seat = null;

                return originalStart.apply(
                    this,arguments
                );
            };
        }

        // ==========================
        // INTERACTIUNE
        // ==========================

        function interact() {

            if (!inWorld()) return false;

            if (seat) {
                stand();
                return true;
            }

            if (
                typeof squareSeat !== "undefined" &&
                squareSeat
            ) return false;

            if (typeof getTargetBlock !== "function") {
                return false;
            }

            const hit = getTargetBlock();

            if (!hit || hit.distance > 4) {
                return false;
            }

            const {type,x,y,z} =
                hit.object.userData;

            const block = blocks.get(type);

            if (!block) return false;

            // Deschide sau inchide mobilierul
            if (pairs.has(type)) {

                setWorldBlock(
                    x,y,z,pairs.get(type)
                );

                return true;
            }

            // Asezare pe mobilier
            if (sitting.includes(block.kind)) {

                seat = {
                    type,x,y,z,

                    oldX:player.x,
                    oldY:player.y,
                    oldZ:player.z,

                    height:
                        block.kind === "bed"
                        ? 0.85 : 1.15
                };

                return true;
            }

            return false;
        }

        // ==========================
        // CATALOG
        // ==========================

        const open =
            document.createElement("button");

        open.id = "furniture-plus-button";

        open.textContent = "🛋️ Furniture Plus";

        open.style.cssText = `
            display:none;
            position:fixed;
            right:15px;
            bottom:210px;
            padding:10px;
            background:#654631;
            color:white;
            border:2px solid #d5a777;
            border-radius:9px;
            cursor:pointer;
            z-index:99990;
        `;

        const panel =
            document.createElement("div");

        panel.style.cssText = `
            display:none;
            position:fixed;
            top:10%;
            left:50%;
            transform:translateX(-50%);
            width:min(550px,90vw);
            max-height:78vh;
            overflow:auto;
            box-sizing:border-box;
            padding:16px;
            background:#30251f;
            color:white;
            border:2px solid #d5a777;
            border-radius:12px;
            z-index:99999;
        `;

        const title =
            document.createElement("h2");

        title.textContent = "Furniture Plus 1.0";

        const search =
            document.createElement("input");

        search.placeholder = "Cauta mobilier...";

        search.style.cssText = `
            width:100%;
            padding:10px;
            box-sizing:border-box;
            background:white;
            color:black;
        `;

        const filter =
            document.createElement("select");

        filter.style.cssText = `
            width:100%;
            padding:10px;
            margin:10px 0;
            background:white;
            color:black;
        `;

        for (const category of [
            "Toate",
            "Sufragerie",
            "Dormitor",
            "Bucatarie",
            "Birou"
        ]) {

            filter.add(
                new Option(category,category)
            );
        }

        const info =
            document.createElement("p");

        const grid =
            document.createElement("div");

        grid.style.cssText = `
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(110px,1fr));
            gap:8px;
            margin-bottom:12px;
        `;

        function render() {

            grid.replaceChildren();

            const query =
                search.value.trim().toLowerCase();

            for (const block of catalog) {

                if (
                    !block.name.toLowerCase()
                        .includes(query)
                ) continue;

                if (
                    filter.value !== "Toate" &&
                    block.category !== filter.value
                ) continue;

                const button =
                    document.createElement("button");

                button.style.cssText = `
                    background:#514136;
                    color:white;
                    border:1px solid #ae8c70;
                    border-radius:8px;
                    padding:12px;
                    cursor:pointer;
                `;

                button.textContent =
                    block.icon+" "+block.name;

                const preview =
                    document.createElement("div");

                preview.style.cssText = `
                    height:8px;
                    margin-top:8px;
                    border-radius:4px;
                    background:#${block.color
                        .toString(16).padStart(6,"0")};
                `;

                button.appendChild(preview);

                button.onclick = function() {

                    if (
                        INVENTORY_GAME_MODE !== "creative"
                    ) {

                        info.textContent =
                            "Intra intr-o lume Creative.";

                        return;
                    }

                    PLAYER_INVENTORY[SELECTED_SLOT] = {
                        type:block.id,
                        count:Infinity
                    };

                    renderInventory();

                    panel.style.display = "none";
                };

                grid.appendChild(button);
            }

            info.textContent =
                grid.children.length+
                " obiecte disponibile.";
        }

        function toggleCatalog() {

            if (!inWorld()) return;

            const visible =
                panel.style.display !== "none";

            if (!visible) {

                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }

                panel.style.display = "block";

                render();

            } else {
                panel.style.display = "none";
            }
        }

        const close =
            document.createElement("button");

        close.textContent = "Inchide";

        close.onclick = function() {
            panel.style.display = "none";
        };

        search.oninput = render;
        filter.onchange = render;
        open.onclick = toggleCatalog;

        panel.append(
            title,search,filter,
            info,grid,close
        );

        document.body.append(open,panel);

        for (const event of [
            "mousedown","mouseup","click",
            "pointerdown","pointerup"
        ]) {

            panel.addEventListener(
                event,e=>e.stopPropagation()
            );

            open.addEventListener(
                event,e=>e.stopPropagation()
            );
        }

        window.addEventListener(
            "keydown",function(e) {

                if (!inWorld() || e.repeat) return;

                if (
                    e.target?.closest?.(
                        "input,textarea,select"
                    )
                ) return;

                if (e.code === "KeyM") {

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    toggleCatalog();
                }

                if (
                    e.code === "KeyF" &&
                    panel.style.display === "none"
                ) {

                    if (interact()) {

                        e.preventDefault();
                        e.stopImmediatePropagation();
                    }
                }
            },
            true
        );

        setInterval(function() {

            open.style.display =
                inWorld() ? "block" : "none";

            if (!inWorld()) {

                panel.style.display = "none";
                seat = null;
            }

        },300);

        window.FurniturePlus = {
            version:"1.0",
            count:catalog.length,
            blocks:catalog
        };

        console.log(
            "FURNITURE PLUS: 36 OBIECTE INCARCATE!"
        );
    }

    install();
})();
