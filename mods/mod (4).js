
(function () {
    "use strict";

    if (window.Electricity) return;

    let attempts = 0;

    function install() {

        if (
            typeof THREE === "undefined" ||
            typeof BLOCK_TYPES === "undefined" ||
            typeof BLOCK_MATERIALS === "undefined" ||
            typeof INVENTORY_BLOCK_NAMES === "undefined" ||
            typeof INVENTORY_BLOCK_ICONS === "undefined" ||
            typeof createBlockMesh !== "function" ||
            typeof WORLD_EDITS === "undefined" ||
            typeof WORLD_CHUNKS === "undefined" ||
            typeof setWorldBlock !== "function"
        ) {
            if (++attempts < 80) {
                setTimeout(install, 250);
            } else {
                console.error("Electricity: API incompatibil.");
            }
            return;
        }

        const blocks = new Map();
        const catalog = [];
        const toggles = new Map();

        let powered = new Set();

        const geometry = new THREE.BoxGeometry(1, 1, 1);

        const directions = [
            [1,0,0], [-1,0,0],
            [0,1,0], [0,-1,0],
            [0,0,1], [0,0,-1]
        ];

        const lights = [];
        let lightScene = null;

        function key(x, y, z) {
            return `${x},${y},${z}`;
        }

        function inWorld() {
            const screen =
                document.getElementById("game-screen");

            return screen &&
                !screen.classList.contains("hidden") &&
                (
                    typeof gameRunning === "undefined" ||
                    gameRunning
                );
        }

        // =========================
        // TEXTURI ELECTRICE
        // =========================

        function texture(color, style, active) {

            const canvas = document.createElement("canvas");

            canvas.width = 32;
            canvas.height = 32;

            const ctx = canvas.getContext("2d");

            ctx.fillStyle = "#30373c";
            ctx.fillRect(0,0,32,32);

            ctx.strokeStyle = "#13191c";
            ctx.lineWidth = 2;
            ctx.strokeRect(1,1,30,30);

            ctx.fillStyle = active ? "#72ff73" : "#48514b";

            ctx.fillRect(3,3,3,3);
            ctx.fillRect(26,26,3,3);

            if (style === "wire") {

                ctx.fillStyle = color;
                ctx.fillRect(0,12,32,8);
                ctx.fillRect(12,0,8,32);

                ctx.fillStyle =
                    active ? "#fff0a1" : "#594e36";

                ctx.fillRect(0,15,32,2);
                ctx.fillRect(15,0,2,32);

            } else if (style === "lamp") {

                ctx.fillStyle = active ? color : "#555b60";
                ctx.fillRect(4,4,24,24);

                ctx.strokeStyle = "#b5b5b5";
                ctx.strokeRect(4,4,24,24);

                ctx.fillStyle = active
                    ? "#ffffff"
                    : "#3b3f42";

                ctx.fillRect(8,9,16,2);
                ctx.fillRect(8,15,16,2);
                ctx.fillRect(8,21,16,2);

            } else if (style === "switch") {

                ctx.fillStyle = "#8a939a";
                ctx.fillRect(5,5,22,22);

                ctx.fillStyle = active
                    ? "#42d65c"
                    : "#d44242";

                ctx.fillRect(
                    11,
                    active ? 6 : 17,
                    10,
                    9
                );

                ctx.fillStyle = "#dddddd";

                ctx.fillRect(
                    14,
                    active ? 11 : 13,
                    4,
                    8
                );

            } else if (style === "source") {

                ctx.fillStyle = color;
                ctx.fillRect(4,4,24,24);

                ctx.fillStyle = active
                    ? "#fff09b"
                    : "#747474";

                ctx.beginPath();
                ctx.moveTo(17,5);
                ctx.lineTo(8,18);
                ctx.lineTo(15,18);
                ctx.lineTo(12,28);
                ctx.lineTo(25,13);
                ctx.lineTo(17,13);
                ctx.closePath();
                ctx.fill();

            } else {

                ctx.fillStyle = "#141b18";
                ctx.fillRect(4,5,24,22);

                ctx.fillStyle =
                    active ? "#73ff73" : "#8b3333";

                for (let i = 0; i < 4; i++) {
                    ctx.fillRect(7 + i * 5, 10, 3, 12);
                }
            }

            const result = new THREE.CanvasTexture(canvas);

            result.magFilter = THREE.NearestFilter;
            result.minFilter = THREE.NearestFilter;
            result.generateMipmaps = false;

            return result;
        }

        function material(color, style, active) {

            return new THREE.MeshLambertMaterial({
                map: texture(color, style, active),

                emissive: active
                    ? new THREE.Color(color)
                    : 0x000000,

                emissiveIntensity: active
                    ? (style === "lamp" ? 0.9 : 0.18)
                    : 0
            });
        }

        // =========================
        // INREGISTRARE BLOCURI
        // =========================

        function register(
            name,
            role,
            style,
            color,
            enabled = true,
            visible = true
        ) {

            const id = BLOCK_TYPES.length;

            const block = {
                id,
                name,
                role,
                style,
                color,
                enabled,

                off: material(color, style, false),
                on: material(color, style, true)
            };

            BLOCK_TYPES.push({
                name: name,
                color: color
            });

            BLOCK_MATERIALS[id] =
                role === "source" && enabled
                    ? block.on
                    : block.off;

            INVENTORY_BLOCK_NAMES[id] = name;
            INVENTORY_BLOCK_ICONS[id] = "⚡";

            if (
                typeof BLOCK_COLORS !== "undefined" &&
                Array.isArray(BLOCK_COLORS)
            ) {
                BLOCK_COLORS[id] =
                    new THREE.Color(color).getHex();
            }

            blocks.set(id, block);

            if (visible) catalog.push(block);

            return id;
        }

        const battery = register(
            "Baterie",
            "source",
            "source",
            "#4b954d"
        );

        const generatorOff = register(
            "Generator",
            "source",
            "source",
            "#566e8a",
            false
        );

        const switchOff = register(
            "Intrerupator",
            "switch",
            "switch",
            "#929b9e",
            false
        );

        register(
            "Cablu de cupru",
            "wire",
            "wire",
            "#b87333"
        );

        register(
            "Cablu albastru",
            "wire",
            "wire",
            "#3989d8"
        );

        register(
            "Cablu rosu",
            "wire",
            "wire",
            "#d84949"
        );

        register(
            "Lampa alba",
            "sink",
            "lamp",
            "#fff5d7"
        );

        register(
            "Lampa rosie",
            "sink",
            "lamp",
            "#ff4040"
        );

        register(
            "Lampa albastra",
            "sink",
            "lamp",
            "#4099ff"
        );

        register(
            "Lampa verde",
            "sink",
            "lamp",
            "#40ff80"
        );

        register(
            "Cutie de distributie",
            "wire",
            "panel",
            "#b8b8b8"
        );

        register(
            "Indicator energie",
            "sink",
            "panel",
            "#65ed75"
        );

        // Stari interne suplimentare.

        const generatorOn = register(
            "Generator pornit",
            "source",
            "source",
            "#566e8a",
            true,
            false
        );

        const switchOn = register(
            "Intrerupator pornit",
            "switch",
            "switch",
            "#929b9e",
            true,
            false
        );

        toggles.set(generatorOff, generatorOn);
        toggles.set(generatorOn, generatorOff);

        toggles.set(switchOff, switchOn);
        toggles.set(switchOn, switchOff);

        // =========================
        // MOTOR 3D
        // =========================

        function blockMaterial(block, position) {

            return powered.has(position) ||
                (
                    block.role === "source" &&
                    block.enabled
                ) ||
                (
                    block.role === "switch" &&
                    block.enabled
                )
                ? block.on
                : block.off;
        }

        const oldMesh = createBlockMesh;

        createBlockMesh = function(type, x, y, z) {

            const block = blocks.get(type);

            if (!block) {
                return oldMesh.apply(this, arguments);
            }

            const mesh = new THREE.Mesh(
                geometry,
                blockMaterial(block, key(x,y,z))
            );

            mesh.position.set(x,y,z);

            mesh.userData = {
                type,
                x,
                y,
                z,
                electricity: true
            };

            return mesh;
        };

        // =========================
        // LUMINA IN LUME
        // =========================

        function removeLights() {

            for (const light of lights) {
                if (light.parent) {
                    light.parent.remove(light);
                }
            }

            lights.length = 0;
            lightScene = null;
        }

        function updateLights(nodes) {

            if (
                typeof scene === "undefined" ||
                !scene ||
                typeof player === "undefined" ||
                !player
            ) return;

            if (lightScene !== scene) {

                removeLights();
                lightScene = scene;

                // Maximum 4 lumini simultan.
                for (let i = 0; i < 4; i++) {

                    const light = new THREE.PointLight(
                        0xffffff, 0, 7
                    );

                    scene.add(light);
                    lights.push(light);
                }
            }

            const nearest = [];

            for (const position of powered) {

                const block = nodes.get(position);

                if (!block || block.style !== "lamp") {
                    continue;
                }

                const [x,y,z] =
                    position.split(",").map(Number);

                const distance =
                    Math.hypot(
                        x - player.x,
                        y - player.y,
                        z - player.z
                    );

                if (distance <= 16) {
                    nearest.push({
                        x,y,z,block,distance
                    });
                }
            }

            nearest.sort(
                (a,b) => a.distance - b.distance
            );

            lights.forEach((light, i) => {

                const lamp = nearest[i];

                if (!lamp) {
                    light.intensity = 0;
                    return;
                }

                light.color.set(lamp.block.color);

                light.position.set(
                    lamp.x,
                    lamp.y + 0.6,
                    lamp.z
                );

                light.intensity = 1.2;
            });
        }

        // =========================
        // RETEA ELECTRICA
        // =========================

        function refreshCircuit() {

            if (!inWorld()) {

                powered.clear();
                removeLights();
                return;
            }

            const nodes = new Map();
            const next = new Set();
            const queue = [];

            for (const [position, type] of WORLD_EDITS) {

                const block = blocks.get(type);

                if (!block) continue;

                if (
                    typeof position !== "string" ||
                    !/^-?\d+,-?\d+,-?\d+$/.test(position)
                ) continue;

                nodes.set(position, block);

                if (
                    block.role === "source" &&
                    block.enabled
                ) {

                    queue.push(position);
                    next.add(position);
                }
            }

            // Energia circula intre blocurile vecine.

            for (let i = 0; i < queue.length; i++) {

                const current = queue[i];

                const [x,y,z] =
                    current.split(",").map(Number);

                for (const [dx,dy,dz] of directions) {

                    const neighbor =
                        key(x+dx,y+dy,z+dz);

                    if (next.has(neighbor)) continue;

                    const block = nodes.get(neighbor);

                    if (!block || !block.enabled) {
                        continue;
                    }

                    next.add(neighbor);

                    // Lampile si indicatoarele
                    // consuma energie, nu o transmit.

                    if (block.role !== "sink") {
                        queue.push(neighbor);
                    }
                }
            }

            const changed =
                next.size !== powered.size ||
                [...next].some(p => !powered.has(p));

            powered = next;

            // Actualizam aspectul blocurilor.

            if (changed) {

                for (const group of WORLD_CHUNKS.values()) {

                    for (const mesh of group.children) {

                        const data = mesh.userData;

                        if (!data || !data.electricity) {
                            continue;
                        }

                        const block = blocks.get(data.type);

                        if (!block) continue;

                        mesh.material = blockMaterial(
                            block,
                            key(data.x,data.y,data.z)
                        );
                    }
                }
            }

            updateLights(nodes);
        }

        // =========================
        // INTERACTIUNE CU F
        // =========================

        function interact() {

            if (
                !inWorld() ||
                typeof getTargetBlock !== "function"
            ) return false;

            const hit = getTargetBlock();

            if (
                !hit ||
                hit.distance > 6 ||
                !hit.object.userData
            ) return false;

            const {x,y,z,type} =
                hit.object.userData;

            const replacement = toggles.get(type);

            if (replacement === undefined) {
                return false;
            }

            setWorldBlock(x,y,z,replacement);

            refreshCircuit();

            return true;
        }

        // =========================
        // CATALOG ELECTRICITY
        // =========================

        const open = document.createElement("button");

        open.id = "electricity-button";
        open.textContent = "⚡ Electricity";

        open.style.cssText = `
            position:fixed;
            right:15px;
            bottom:155px;
            padding:10px;
            color:#fff;
            background:#846414;
            border:2px solid #ffe083;
            border-radius:8px;
            z-index:99990;
            cursor:pointer;
            display:none;
        `;

        const panel = document.createElement("div");

        panel.style.cssText = `
            display:none;
            position:fixed;
            left:50%;
            top:12%;
            transform:translateX(-50%);
            width:min(480px,90vw);
            max-height:75vh;
            overflow:auto;
            box-sizing:border-box;
            padding:16px;
            color:#fff;
            background:#202923;
            border:2px solid #f1ce58;
            border-radius:12px;
            z-index:99999;
        `;

        const heading = document.createElement("h2");
        heading.textContent = "⚡ Electricity 1.0";

        const help = document.createElement("p");

        help.textContent =
            "K: Catalog | F: Pornire / Oprire";

        const info = document.createElement("p");

        const grid = document.createElement("div");

        grid.style.cssText = `
            display:grid;
            grid-template-columns:
                repeat(auto-fit,minmax(105px,1fr));
            gap:8px;
            margin-bottom:12px;
        `;

        for (const block of catalog) {

            const button =
                document.createElement("button");

            button.style.cssText = `
                padding:8px;
                border:1px solid #b4a452;
                background:#344238;
                color:white;
                border-radius:7px;
                cursor:pointer;
            `;

            const img = document.createElement("img");

            img.src =
                block.on.map.image.toDataURL();

            img.style.cssText = `
                display:block;
                width:48px;
                height:48px;
                margin:0 auto 8px;
                image-rendering:pixelated;
            `;

            button.append(
                img,
                document.createTextNode(block.name)
            );

            button.onclick = function() {

                if (
                    typeof INVENTORY_GAME_MODE === "undefined" ||
                    INVENTORY_GAME_MODE !== "creative"
                ) {

                    info.textContent =
                        "Catalogul este disponibil in Creative.";

                    return;
                }

                if (
                    typeof PLAYER_INVENTORY === "undefined" ||
                    typeof SELECTED_SLOT === "undefined" ||
                    typeof renderInventory !== "function"
                ) return;

                PLAYER_INVENTORY[SELECTED_SLOT] = {
                    type: block.id,
                    count: Infinity
                };

                renderInventory();

                panel.style.display = "none";
            };

            grid.appendChild(button);
        }

        const close = document.createElement("button");

        close.textContent = "Inchide";

        close.onclick = function() {
            panel.style.display = "none";
        };

        function toggleCatalog() {

            if (!inWorld()) return;

            info.textContent =
                "12 blocuri | Circuit virtual";

            if (panel.style.display === "none") {

                if (document.pointerLockElement) {
                    document.exitPointerLock();
                }

                panel.style.display = "block";

            } else {
                panel.style.display = "none";
            }
        }

        open.onclick = toggleCatalog;

        panel.append(
            heading,
            help,
            info,
            grid,
            close
        );

        document.body.append(open,panel);

        for (const event of [
            "mousedown",
            "mouseup",
            "click",
            "pointerdown",
            "pointerup"
        ]) {

            panel.addEventListener(
                event,
                e => e.stopPropagation()
            );

            open.addEventListener(
                event,
                e => e.stopPropagation()
            );
        }

        document.addEventListener(
            "keydown",
            function(e) {

                if (!inWorld() || e.repeat) return;

                if (
                    e.target?.closest?.(
                        "input,textarea,select"
                    )
                ) return;

                if (e.code === "KeyK") {

                    e.preventDefault();
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

            const visible = inWorld();

            open.style.display =
                visible ? "block" : "none";

            if (!visible) {
                panel.style.display = "none";
            }

            refreshCircuit();

        }, 500);

        window.Electricity = {

            version: "1.0",
            count: catalog.length,
            blocks: catalog,

            refresh: refreshCircuit,

            get poweredBlocks() {
                return powered.size;
            }
        };

        console.log(
            "ELECTRICITY 1.0: 12 BLOCURI INCARCATE!"
        );
    }

    install();
})();
