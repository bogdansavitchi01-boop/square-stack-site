
(function () {
    "use strict";

    if (window.AdvancedBuilding) return;

    const palette = [
        ["Alb", "#eeeeee"],
        ["Rosu", "#b54141"],
        ["Albastru", "#3969bd"],
        ["Verde", "#47984e"],
        ["Galben", "#e5c945"],
        ["Violet", "#914fc4"],
        ["Portocaliu", "#e38c39"],
        ["Roz", "#e58da8"],
        ["Maro", "#79553c"],
        ["Negru", "#35353b"]
    ];

    const categories = [
        ["Caramida", "brick"],
        ["Marmura", "marble"],
        ["Beton", "concrete"],
        ["Sticla", "glass"],
        ["Lampa", "lamp"],
        ["Lemn", "wood"],
        ["Scari", "stairs"],
        ["Gard", "fence"],
        ["Mobilier", "furniture"],
        ["Usa", "door"]
    ];

    const blocks = [];
    let attempts = 0;

    function makeTexture(color, style, seed) {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;

        const ctx = canvas.getContext("2d");

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 32, 32);

        for (let y = 0; y < 32; y++) {
            for (let x = 0; x < 32; x++) {
                seed = (seed * 1664525 + 1013904223) >>> 0;

                ctx.fillStyle = seed % 2
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.08)";

                ctx.fillRect(x, y, 1, 1);
            }
        }

        if (style === "brick") {
            ctx.fillStyle = "#666666";

            for (let y = 0; y < 32; y += 8) {
                ctx.fillRect(0, y, 32, 1);

                for (let x = y % 16; x < 32; x += 16) {
                    ctx.fillRect(x, y, 1, 8);
                }
            }
        }

        if (style === "marble") {
            ctx.fillStyle = "rgba(255,255,255,0.5)";

            for (let i = 0; i < 32; i++) {
                ctx.fillRect(i, (i * 2) % 32, 2, 2);
            }
        }

        if (["wood", "door", "fence", "furniture"].includes(style)) {
            ctx.fillStyle = "rgba(0,0,0,0.28)";

            for (let x = 0; x < 32; x += 8) {
                ctx.fillRect(x, 0, 1, 32);
            }
        }

        if (style === "door") {
            ctx.fillStyle = "#e7c45b";
            ctx.fillRect(24, 15, 4, 4);
        }

        if (style === "glass" || style === "lamp") {
            ctx.strokeStyle = "#eeeeee";
            ctx.lineWidth = 2;
            ctx.strokeRect(1, 1, 30, 30);
        }

        const texture = new THREE.CanvasTexture(canvas);

        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;

        if (THREE.SRGBColorSpace) {
            texture.colorSpace = THREE.SRGBColorSpace;
        } else if (THREE.sRGBEncoding) {
            texture.encoding = THREE.sRGBEncoding;
        }

        return texture;
    }

    // Creeaza forme 3D din mai multe cuburi.
    function makeShape(parts) {
        const positions = [];
        const normals = [];
        const uvs = [];

        for (const part of parts) {
            const [w, h, d, x, y, z] = part;

            const box = new THREE.BoxGeometry(w, h, d);
            const geo = box.index ? box.toNonIndexed() : box;

            geo.translate(x, y, z);

            positions.push(...geo.attributes.position.array);
            normals.push(...geo.attributes.normal.array);
            uvs.push(...geo.attributes.uv.array);

            geo.dispose();

            if (geo !== box) box.dispose();
        }

        const result = new THREE.BufferGeometry();

        result.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(positions, 3)
        );

        result.setAttribute(
            "normal",
            new THREE.Float32BufferAttribute(normals, 3)
        );

        result.setAttribute(
            "uv",
            new THREE.Float32BufferAttribute(uvs, 2)
        );

        return result;
    }

    function install() {
        if (
            typeof THREE === "undefined" ||
            typeof BLOCK_TYPES === "undefined" ||
            typeof BLOCK_MATERIALS === "undefined" ||
            typeof INVENTORY_BLOCK_NAMES === "undefined" ||
            typeof INVENTORY_BLOCK_ICONS === "undefined" ||
            typeof createBlockMesh !== "function"
        ) {
            if (++attempts < 40) {
                setTimeout(install, 250);
            } else {
                console.error(
                    "Advanced Building: API incompatibil."
                );
            }
            return;
        }

        const start = BLOCK_TYPES.length;

        const shapes = {
            cube: new THREE.BoxGeometry(1, 1, 1),

            stairs: makeShape([
                [1, 0.5, 1, 0, -0.25, 0],
                [1, 0.5, 0.5, 0, 0.25, -0.25]
            ]),

            fence: makeShape([
                [0.2, 1, 0.2, 0, 0, 0],
                [1, 0.15, 0.15, 0, 0.2, 0],
                [1, 0.15, 0.15, 0, -0.15, 0]
            ]),

            furniture: makeShape([
                [1, 0.18, 1, 0, 0.35, 0],
                [0.15, 0.8, 0.15, -0.35, -0.1, -0.35],
                [0.15, 0.8, 0.15, 0.35, -0.1, -0.35],
                [0.15, 0.8, 0.15, -0.35, -0.1, 0.35],
                [0.15, 0.8, 0.15, 0.35, -0.1, 0.35]
            ]),

            door: makeShape([
                [1, 1, 0.15, 0, 0, -0.42]
            ]),

            openDoor: makeShape([
                [0.15, 1, 1, -0.42, 0, 0]
            ])
        };

        const registered = new Map();
        const doorPairs = new Map();

        function register(name, style, color, material, geometry) {
            const id = BLOCK_TYPES.length;

            BLOCK_TYPES.push({
                name: name,
                color: color
            });

            BLOCK_MATERIALS[id] = material;
            INVENTORY_BLOCK_NAMES[id] = name;
            INVENTORY_BLOCK_ICONS[id] = "🧱";

            if (typeof BLOCK_COLORS !== "undefined") {
                BLOCK_COLORS[id] = new THREE.Color(color).getHex();
            }

            const block = {
                id, name, style, color, material, geometry
            };

            registered.set(id, block);

            return block;
        }

        for (const [category, style] of categories) {

            for (const [colorName, color] of palette) {

                const texture = makeTexture(
                    color, style, blocks.length + 1
                );

                const material = new THREE.MeshLambertMaterial({
                    map: texture,
                    transparent: style === "glass",
                    opacity: style === "glass" ? 0.45 : 1,
                    depthWrite: style !== "glass",

                    emissive: style === "lamp"
                        ? new THREE.Color(color)
                        : 0x000000,

                    emissiveIntensity: style === "lamp"
                        ? 0.7 : 0
                });

                const block = register(
                    category + " " + colorName,
                    style,
                    color,
                    material,
                    shapes[style] || shapes.cube
                );

                blocks.push(block);
            }
        }

        // Stari suplimentare pentru usile deschise.
        for (const block of blocks.filter(b => b.style === "door")) {

            const opened = register(
                block.name + " - deschisa",
                "openDoor",
                block.color,
                block.material,
                shapes.openDoor
            );

            doorPairs.set(block.id, opened.id);
            doorPairs.set(opened.id, block.id);
        }

        const originalMesh = createBlockMesh;

        createBlockMesh = function (type, x, y, z) {

            const block = registered.get(type);

            if (!block) {
                return originalMesh.apply(this, arguments);
            }

            const mesh = new THREE.Mesh(
                block.geometry,
                block.material
            );

            mesh.position.set(x, y, z);
            mesh.userData = { type, x, y, z };

            return mesh;
        };

        function inWorld() {
            const screen = document.getElementById("game-screen");

            return screen &&
                !screen.classList.contains("hidden") &&
                (
                    typeof gameRunning === "undefined" ||
                    gameRunning
                );
        }

        function toggleDoor() {
            if (!inWorld()) return;

            if (
                typeof getTargetBlock !== "function" ||
                typeof setWorldBlock !== "function"
            ) return;

            const hit = getTargetBlock();

            if (!hit) return;

            const { type, x, y, z } = hit.object.userData;
            const next = doorPairs.get(type);

            if (next !== undefined) {
                setWorldBlock(x, y, z, next);
            }
        }

        function createMenu() {
            if (document.getElementById("advanced-building")) return;

            const open = document.createElement("button");

            open.id = "advanced-building";
            open.textContent = "🧱 Advanced Building";

            open.style.cssText = `
                position:fixed;
                bottom:100px;
                right:15px;
                z-index:99990;
                padding:12px;
                background:#326b49;
                color:white;
                border:2px solid #8be4a6;
                border-radius:9px;
                cursor:pointer;
                display:none;
            `;

            const panel = document.createElement("div");

            panel.style.cssText = `
                display:none;
                position:fixed;
                top:12%;
                left:50%;
                transform:translateX(-50%);
                width:min(520px,90vw);
                max-height:75vh;
                overflow:auto;
                background:#182820;
                color:white;
                border:2px solid #72dc95;
                border-radius:12px;
                padding:16px;
                box-sizing:border-box;
                z-index:99999;
            `;

            const title = document.createElement("h2");
            title.textContent = "Advanced Building 1.0";

            const subtitle = document.createElement("p");
            subtitle.textContent =
                "100 blocuri | B - Catalog | U - Usa";

            const search = document.createElement("input");

            search.placeholder = "Cauta un bloc...";
            search.style.cssText =
                "width:100%;padding:10px;box-sizing:border-box;color:black;background:white";

            const filter = document.createElement("select");

            filter.style.cssText =
                "width:100%;padding:8px;margin:10px 0;color:black;background:white";

            filter.add(new Option("Toate categoriile", "all"));

            for (const [name, style] of categories) {
                filter.add(new Option(name, style));
            }

            const grid = document.createElement("div");

            grid.style.cssText = `
                display:grid;
                grid-template-columns:repeat(auto-fit,minmax(105px,1fr));
                gap:7px;
            `;

            const info = document.createElement("p");

            function selectBlock(block) {
                if (
                    typeof INVENTORY_GAME_MODE === "undefined" ||
                    INVENTORY_GAME_MODE !== "creative"
                ) {
                    info.textContent = "Intra intr-o lume Creative.";
                    return;
                }

                if (
                    typeof PLAYER_INVENTORY === "undefined" ||
                    typeof SELECTED_SLOT === "undefined" ||
                    typeof renderInventory !== "function"
                ) {
                    info.textContent = "Inventarul nu este disponibil.";
                    return;
                }

                PLAYER_INVENTORY[SELECTED_SLOT] = {
                    type: block.id,
                    count: Infinity
                };

                renderInventory();
                panel.style.display = "none";
            }

            function render() {
                grid.replaceChildren();

                const query = search.value.toLowerCase();

                for (const block of blocks) {
                    if (!block.name.toLowerCase().includes(query)) {
                        continue;
                    }

                    if (
                        filter.value !== "all" &&
                        block.style !== filter.value
                    ) {
                        continue;
                    }

                    const button = document.createElement("button");

                    button.style.cssText = `
                        padding:8px;
                        background:#304638;
                        border:1px solid #689879;
                        border-radius:8px;
                        color:white;
                        cursor:pointer;
                    `;

                    const img = document.createElement("img");

                    img.src = block.material.map.image.toDataURL();
                    img.alt = block.name;
                    img.style.cssText = `
                        width:46px;
                        height:46px;
                        display:block;
                        margin:auto auto 5px;
                        image-rendering:pixelated;
                    `;

                    button.append(
                        img,
                        document.createTextNode(block.name)
                    );

                    button.onclick = () => selectBlock(block);

                    grid.appendChild(button);
                }

                info.textContent =
                    grid.children.length + " blocuri disponibile";
            }

            function toggleMenu() {
                if (!inWorld()) return;

                if (panel.style.display === "none") {
                    if (document.pointerLockElement) {
                        document.exitPointerLock();
                    }

                    panel.style.display = "block";
                    render();

                } else {
                    panel.style.display = "none";
                }
            }

            const close = document.createElement("button");
            close.textContent = "Inchide";
            close.onclick = () => panel.style.display = "none";

            search.oninput = render;
            filter.onchange = render;
            open.onclick = toggleMenu;

            for (const event of ["mousedown", "mouseup", "click", "keydown", "keyup"]) {
                panel.addEventListener(event, e => e.stopPropagation());
                open.addEventListener(event, e => e.stopPropagation());
            }

            document.addEventListener("keydown", function (e) {
                if (!inWorld() || e.repeat) return;

                if (e.target.closest("input,select,textarea")) return;

                if (e.code === "KeyB") toggleMenu();

                if (
                    e.code === "KeyU" &&
                    panel.style.display === "none"
                ) toggleDoor();
            });

            panel.append(
                title, subtitle, search,
                filter, info, grid, close
            );

            document.body.append(open, panel);

            setInterval(function () {
                const visible = inWorld();

                open.style.display = visible ? "block" : "none";

                if (!visible) panel.style.display = "none";
            }, 300);
        }

        window.AdvancedBuilding = {
            version: "1.0",
            count: blocks.length,
            firstId: start,
            blocks: blocks
        };

        if (document.body) {
            createMenu();
        } else {
            document.addEventListener("DOMContentLoaded", createMenu);
        }

        console.log(
            "ADVANCED BUILDING: 100 BLOCURI INCARCATE!"
        );
    }

    install();
})();
