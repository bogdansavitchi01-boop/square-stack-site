
(function () {
    "use strict";

    if (window.Technology) return;

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
            typeof setWorldBlock !== "function" ||
            typeof getWorldBlock !== "function"
        ) {
            if (++attempts < 80) {
                setTimeout(install, 250);
            } else {
                console.error("Technology: API incompatibil.");
            }
            return;
        }

        const blocks = new Map();
        const catalog = [];
        const pairs = new Map();
        const notes = new Map();

        let powered = new Set();
        let active = null;
        let lastStatus = "";

        const directions = [
            [1,0,0],[-1,0,0],
            [0,1,0],[0,-1,0],
            [0,0,1],[0,0,-1]
        ];

        const models = [
            ["Calculator","computer","🖥️"],
            ["Laptop","laptop","💻"],
            ["Telefon","phone","📱"],
            ["Tableta","tablet","📲"],
            ["Televizor","tv","📺"],
            ["Consola","console","🎮"],
            ["Radio","radio","📻"],
            ["Boxa","speaker","🔊"],
            ["Router","router","📡"],
            ["Server","server","🖥️"],
            ["Ceas digital","clock","⏰"],
            ["Imprimanta","printer","🖨️"]
        ];

        function key(x,y,z) {
            return `${x},${y},${z}`;
        }

        function inWorld() {

            const screen =
                document.getElementById("game-screen");

            return screen &&
                !screen.classList.contains("hidden") &&
                gameRunning;
        }

        // ==========================
        // MODELE 3D
        // ==========================

        function geometry(kind,on) {

            const positions = [];
            const normals = [];
            const colors = [];

            const body = 0x303840;
            const metal = 0x89949e;
            const dark = 0x14191f;

            const display =
                on ? 0x399acf : 0x10171d;

            const led =
                on ? 0x54ff81 : 0x552828;

            function box(w,h,d,x,y,z,color) {

                const original =
                    new THREE.BoxGeometry(w,h,d);

                const g = original.toNonIndexed();

                g.translate(x,y,z);

                const p = g.attributes.position;
                const n = g.attributes.normal;
                const c = new THREE.Color(color);

                for (let i=0;i<p.count;i++) {

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

                    colors.push(c.r,c.g,c.b);
                }

                original.dispose();
                g.dispose();
            }

            function screen(w,h,x,y,z) {

                box(w,h,0.14,x,y,z,body);

                box(
                    w-0.08,h-0.08,0.02,
                    x,y,z+0.08,display
                );

                if (on) {

                    box(
                        w-0.13,0.045,0.025,
                        x,y+h/2-0.08,
                        z+0.095,0x8be1ff
                    );

                    for (let i=0;i<3;i++) {

                        box(
                            0.06,0.06,0.025,
                            x-w/3+i*0.1,
                            y-0.03,z+0.095,
                            [0x60e1a0,
                             0xffd465,
                             0xa687ff][i]
                        );
                    }
                }
            }

            // CALCULATOR
            if (kind === "computer") {

                screen(0.8,0.55,-0.04,0.12,-0.15);

                box(
                    0.09,0.25,0.09,
                    -0.04,-0.28,-0.15,metal
                );

                box(
                    0.4,0.07,0.3,
                    -0.04,-0.46,-0.15,body
                );

                box(
                    0.72,0.06,0.28,
                    0,-0.46,0.3,metal
                );

                for (let i=0;i<9;i++) {

                    box(
                        0.055,0.02,0.17,
                        -0.28+i*0.07,
                        -0.42,0.3,dark
                    );
                }
            }

            // LAPTOP
            if (kind === "laptop") {

                screen(0.89,0.5,0,-0.12,-0.32);

                box(
                    0.9,0.07,0.82,
                    0,-0.46,0,metal
                );

                for (let i=0;i<9;i++) {

                    box(
                        0.06,0.02,0.34,
                        -0.32+i*0.08,
                        -0.415,-0.08,dark
                    );
                }

                box(
                    0.25,0.015,0.19,
                    0,-0.415,0.25,body
                );
            }

            // TELEFON SI TABLETA
            if (
                kind === "phone" ||
                kind === "tablet"
            ) {

                const w =
                    kind==="phone" ? 0.32 : 0.8;

                const h =
                    kind==="phone" ? 0.62 : 0.72;

                screen(w,h,0,-0.5+h/2,0);
            }

            // TELEVIZOR
            if (kind === "tv") {

                screen(0.96,0.72,0,0.08,0);

                box(
                    0.1,0.2,0.14,
                    0,-0.37,0,metal
                );

                box(
                    0.65,0.05,0.4,
                    0,-0.475,0,body
                );
            }

            // CONSOLA
            if (kind === "console") {

                box(
                    0.85,0.25,0.65,
                    0,-0.375,0,body
                );

                box(
                    0.6,0.06,0.025,
                    0,-0.32,0.335,dark
                );

                box(
                    0.09,0.05,0.03,
                    0.3,-0.4,0.34,led
                );
            }

            // RADIO SI BOXA
            if (
                kind === "radio" ||
                kind === "speaker"
            ) {

                box(
                    0.85,0.65,0.65,
                    0,-0.175,0,body
                );

                const w =
                    kind==="radio" ? 0.2 : 0.3;

                for (const x of [-0.23,0.23]) {

                    box(
                        w,0.33,0.03,
                        x,-0.22,0.34,dark
                    );

                    box(
                        0.1,0.1,0.04,
                        x,-0.22,0.36,metal
                    );
                }

                box(
                    0.35,0.11,0.03,
                    0,0.07,0.34,display
                );
            }

            // ROUTER
            if (kind === "router") {

                box(
                    0.9,0.23,0.65,
                    0,-0.385,0,body
                );

                for (const x of [-0.36,0.36]) {

                    box(
                        0.06,0.7,0.06,
                        x,0.04,-0.25,metal
                    );
                }

                for(let i=0;i<5;i++) {

                    box(
                        0.06,0.06,0.03,
                        -0.3+i*0.14,
                        -0.35,0.34,led
                    );
                }
            }

            // SERVER
            if (kind === "server") {

                box(
                    0.88,1,0.85,
                    0,0,0,body
                );

                for(let i=0;i<5;i++) {

                    box(
                        0.75,0.13,0.03,
                        0,-0.36+i*0.18,
                        0.44,dark
                    );

                    box(
                        0.09,0.06,0.04,
                        0.3,-0.36+i*0.18,
                        0.46,led
                    );
                }
            }

            // CEAS DIGITAL
            if (kind === "clock") {

                box(
                    0.85,0.35,0.32,
                    0,-0.325,0,body
                );

                box(
                    0.72,0.22,0.025,
                    0,-0.32,0.18,dark
                );

                if (on) {

                    for(let i=0;i<4;i++) {

                        box(
                            0.08,0.12,0.02,
                            -0.22+i*0.145,
                            -0.32,0.195,led
                        );
                    }
                }
            }

            // IMPRIMANTA
            if (kind === "printer") {

                box(
                    0.88,0.44,0.85,
                    0,-0.28,0,metal
                );

                box(
                    0.7,0.08,0.32,
                    0,-0.02,0,body
                );

                box(
                    0.58,0.14,0.025,
                    0,-0.22,0.44,dark
                );

                box(
                    0.5,0.015,0.25,
                    0,-0.33,0.36,0xffffff
                );

                box(
                    0.07,0.06,0.03,
                    0.36,-0.12,0.44,led
                );
            }

            const g = new THREE.BufferGeometry();

            g.setAttribute(
                "position",
                new THREE.Float32BufferAttribute(
                    positions,3
                )
            );

            g.setAttribute(
                "normal",
                new THREE.Float32BufferAttribute(
                    normals,3
                )
            );

            g.setAttribute(
                "color",
                new THREE.Float32BufferAttribute(
                    colors,3
                )
            );

            g.computeBoundingSphere();

            return g;
        }

        // ==========================
        // INREGISTRARE DISPOZITIVE
        // ==========================

        const material =
            new THREE.MeshLambertMaterial({
                vertexColors:true
            });

        for (const [name,kind,icon] of models) {

            const off = geometry(kind,false);
            const on = geometry(kind,true);

            function register(standby) {

                const id = BLOCK_TYPES.length;

                const label =
                    name+(standby?" oprit":"");

                BLOCK_TYPES.push({
                    name:label,
                    color:"#39434d"
                });

                BLOCK_MATERIALS[id] = material;
                INVENTORY_BLOCK_NAMES[id] = label;
                INVENTORY_BLOCK_ICONS[id] = icon;

                if (
                    typeof BLOCK_COLORS !== "undefined" &&
                    Array.isArray(BLOCK_COLORS)
                ) {
                    BLOCK_COLORS[id] = 0x39434d;
                }

                const block = {
                    id,name,kind,icon,
                    standby,off,on
                };

                blocks.set(id,block);

                if (!standby) catalog.push(block);

                return id;
            }

            const running = register(false);
            const stopped = register(true);

            pairs.set(running,stopped);
            pairs.set(stopped,running);
        }

        // ==========================
        // CONECTARE CU ELECTRICITY
        // ==========================

        function calculatePower() {

            const result = new Set();

            if (
                !window.Electricity ||
                !Array.isArray(
                    window.Electricity.blocks
                )
            ) return result;

            const electrical = new Map(
                window.Electricity.blocks.map(
                    b=>[b.id,b]
                )
            );

            const network = new Map();
            const reached = new Set();
            const queue = [];

            for (const [position,type] of WORLD_EDITS) {

                if (
                    typeof position !== "string" ||
                    !/^-?\d+,-?\d+,-?\d+$/.test(position)
                ) continue;

                let block = electrical.get(type);

                const name = BLOCK_TYPES[type]?.name;

                // Starile interne din Electricity.

                if (name === "Generator pornit") {
                    block = {
                        role:"source",
                        enabled:true
                    };
                }

                if (name === "Intrerupator pornit") {
                    block = {
                        role:"switch",
                        enabled:true
                    };
                }

                if (
                    !block ||
                    !block.enabled ||
                    block.role==="sink"
                ) continue;

                network.set(position,block);

                if (block.role==="source") {

                    reached.add(position);
                    queue.push(position);
                }
            }

            // Propagarea curentului virtual.

            for(let i=0;i<queue.length;i++) {

                const [x,y,z] =
                    queue[i].split(",").map(Number);

                for(const [dx,dy,dz] of directions) {

                    const neighbor =
                        key(x+dx,y+dy,z+dz);

                    if (reached.has(neighbor)) continue;

                    if (!network.has(neighbor)) continue;

                    reached.add(neighbor);
                    queue.push(neighbor);
                }
            }

            // Dispozitivele primesc energie
            // de la blocurile electrice vecine.

            for (const [position,type] of WORLD_EDITS) {

                if (!blocks.has(type)) continue;

                if (
                    !/^-?\d+,-?\d+,-?\d+$/.test(position)
                ) continue;

                const [x,y,z] =
                    position.split(",").map(Number);

                if (
                    directions.some(([dx,dy,dz]) =>
                        reached.has(
                            key(x+dx,y+dy,z+dz)
                        )
                    )
                ) {
                    result.add(position);
                }
            }

            return result;
        }

        // ==========================
        // AFISAREA IN LUME
        // ==========================

        function shape(block,x,y,z) {

            return !block.standby &&
                powered.has(key(x,y,z))
                    ? block.on
                    : block.off;
        }

        const originalMesh = createBlockMesh;

        createBlockMesh = function(type,x,y,z) {

            const block = blocks.get(type);

            if (!block) {
                return originalMesh.apply(
                    this,arguments
                );
            }

            const mesh = new THREE.Mesh(
                shape(block,x,y,z),
                material
            );

            mesh.position.set(x,y,z);

            mesh.userData = {
                type,x,y,z,
                technology:true
            };

            return mesh;
        };

        function refreshPower() {

            const next = calculatePower();

            const changed =
                next.size !== powered.size ||
                [...next].some(p=>!powered.has(p));

            powered = next;

            if (!changed) return;

            for(const group of WORLD_CHUNKS.values()) {

                for(const mesh of group.children) {

                    const d = mesh.userData;

                    if (!d?.technology) continue;

                    const block = blocks.get(d.type);

                    if (!block) continue;

                    mesh.geometry = shape(
                        block,d.x,d.y,d.z
                    );
                }
            }
        }

        // ==========================
        // INTERFATA
        // ==========================

        const open =
            document.createElement("button");

        open.id = "technology-button";
        open.textContent = "💻 Technology";

        open.style.cssText = `
            display:none;
            position:fixed;
            right:15px;
            bottom:265px;
            padding:10px;
            background:#164c85;
            color:white;
            border:2px solid #7cc9ff;
            border-radius:8px;
            z-index:99990;
            cursor:pointer;
        `;

        const panel =
            document.createElement("div");

        panel.style.cssText = `
            display:none;
            position:fixed;
            left:50%;
            top:10%;
            transform:translateX(-50%);
            width:min(500px,90vw);
            max-height:78vh;
            overflow:auto;
            box-sizing:border-box;
            padding:16px;
            background:#142232;
            color:white;
            border:2px solid #79cfff;
            border-radius:12px;
            z-index:99999;
        `;

        function element(tag,text,parent=panel) {

            const el =
                document.createElement(tag);

            if (text !== undefined) {
                el.textContent = text;
            }

            parent.appendChild(el);

            return el;
        }

        function button(text,action,parent=panel) {

            const b = element("button",text,parent);

            b.style.cssText = `
                padding:10px;
                margin:4px;
                background:#245580;
                color:white;
                border:1px solid #79b1df;
                border-radius:7px;
                cursor:pointer;
            `;

            b.onclick = action;

            return b;
        }

        function input(type,value,parent=panel) {

            const field =
                element("input",undefined,parent);

            field.type = type;
            field.value = value;

            field.style.cssText = `
                box-sizing:border-box;
                width:100%;
                padding:9px;
                margin:5px 0;
                color:black;
                background:white;
            `;

            return field;
        }

        function show() {

            if (document.pointerLockElement) {
                document.exitPointerLock();
            }

            panel.style.display = "block";
        }

        function close() {

            active = null;
            lastStatus = "";

            panel.style.display = "none";
            panel.replaceChildren();
        }

        // ==========================
        // CATALOGUL TECHNOLOGY
        // ==========================

        function showCatalog() {

            if (!inWorld()) return;

            active = null;

            panel.replaceChildren();
            show();

            element("h2","💻 Technology 1.0");
            element("p","12 dispozitive | J: Catalog");

            element(
                "p",
                window.Electricity
                    ? "Electricity: conectat"
                    : "Instaleaza Electricity 1.0"
            );

            const grid =
                element("div",undefined);

            grid.style.cssText = `
                display:grid;
                grid-template-columns:
                    repeat(auto-fit,minmax(120px,1fr));
                gap:5px;
            `;

            for(const block of catalog) {

                button(
                    block.icon+" "+block.name,
                    function() {

                        if (
                            INVENTORY_GAME_MODE !==
                            "creative"
                        ) {
                            alert(
                                "Intra in modul Creative."
                            );
                            return;
                        }

                        PLAYER_INVENTORY[SELECTED_SLOT] = {
                            type:block.id,
                            count:Infinity
                        };

                        renderInventory();

                        close();
                    },
                    grid
                );
            }

            button("Inchide",close);
        }

        // ==========================
        // APLICATII VIRTUALE
        // ==========================

        function calculator(parent) {

            parent.replaceChildren();

            element("h3","Calculator",parent);

            const a = input("number","0",parent);
            const b = input("number","0",parent);

            const result =
                element("h2","0",parent);

            function calculate(op) {

                const x = Number(a.value);
                const y = Number(b.value);

                if (
                    !Number.isFinite(x) ||
                    !Number.isFinite(y)
                ) {
                    result.textContent = "Eroare";
                    return;
                }

                let r;

                if(op==="+") r=x+y;
                if(op==="-") r=x-y;
                if(op==="×") r=x*y;
                if(op==="÷") r=y===0 ? "Eroare" : x/y;

                result.textContent = String(r);
            }

            for(const op of ["+","-","×","÷"]) {

                button(
                    op,
                    ()=>calculate(op),
                    parent
                );
            }
        }

        function notepad(parent) {

            parent.replaceChildren();

            element("h3","Notite",parent);

            const world =
                typeof currentWorldId === "undefined"
                    ? "world"
                    : currentWorldId;

            const id =
                world+":"+key(
                    active.x,active.y,active.z
                );

            const area =
                element("textarea",undefined,parent);

            area.value = notes.get(id) || "";

            area.placeholder = "Scrie o notita...";

            area.style.cssText = `
                width:100%;
                min-height:130px;
                box-sizing:border-box;
                background:white;
                color:black;
                padding:10px;
            `;

            area.oninput = function() {
                notes.set(id,area.value);
            };

            element(
                "p",
                "Notitele sunt pastrate in sesiunea curenta.",
                parent
            );
        }

        function applications(block,parent) {

            const kind = block.kind;

            // COMPUTER, LAPTOP, TELEFON, TABLETA

            if (
                ["computer","laptop","phone","tablet"]
                    .includes(kind)
            ) {

                element(
                    "h3",
                    "Square OS 1.0",
                    parent
                );

                const app =
                    document.createElement("div");

                button(
                    "Calculator",
                    ()=>calculator(app),
                    parent
                );

                button(
                    "Notite",
                    ()=>notepad(app),
                    parent
                );

                button(
                    "Ceas",
                    function() {

                        app.replaceChildren();

                        const clock = element(
                            "h2",
                            new Date()
                                .toLocaleTimeString(),
                            app
                        );

                        clock.dataset.techClock = "1";
                    },
                    parent
                );

                parent.appendChild(app);
            }

            // TELEVIZOR

            if (kind === "tv") {

                const channels = [
                    ["Square Nature","🌳"],
                    ["Square News","📰"],
                    ["Square Kids","🎨"],
                    ["Square Music","🎵"],
                    ["Square Games","🎮"]
                ];

                let channel = 0;

                const screen =
                    element("h2","",parent);

                screen.style.cssText = `
                    padding:35px 10px;
                    text-align:center;
                    background:#245c78;
                    border:5px solid #090e15;
                `;

                function renderChannel() {

                    screen.textContent =
                        channels[channel][1]+" "+
                        channels[channel][0];
                }

                button(
                    "Canal -",
                    function() {

                        channel =
                            (channel+4)%5;

                        renderChannel();
                    },
                    parent
                );

                button(
                    "Canal +",
                    function() {

                        channel =
                            (channel+1)%5;

                        renderChannel();
                    },
                    parent
                );

                renderChannel();
            }

            // CONSOLA DE JOCURI

            if (kind === "console") {

                let score = 0;

                element(
                    "h3",
                    "Square Clicker",
                    parent
                );

                const label =
                    element("h2","Scor: 0 / 10",parent);

                button(
                    "🟩 Adauga punct",
                    function() {

                        if (score<10) score++;

                        label.textContent =
                            score===10
                                ? "Ai castigat!"
                                : "Scor: "+score+" / 10";
                    },
                    parent
                );

                button(
                    "Restart",
                    function() {

                        score=0;

                        label.textContent =
                            "Scor: 0 / 10";
                    },
                    parent
                );
            }

            // RADIO

            if (kind === "radio") {

                let station = 0;

                const stations = [
                    "Square FM",
                    "Nature FM",
                    "Games FM"
                ];

                const label =
                    element("h2",stations[0],parent);

                button(
                    "Urmatorul post",
                    function() {

                        station =
                            (station+1)%stations.length;

                        label.textContent =
                            stations[station];
                    },
                    parent
                );

                element(
                    "p",
                    "Posturi virtuale, fara transmisie audio.",
                    parent
                );
            }

            // BOXA

            if (kind === "speaker") {

                const label =
                    element("h3","Volum: 50%",parent);

                const volume =
                    input("range","50",parent);

                volume.min = 0;
                volume.max = 100;

                volume.oninput = function() {

                    label.textContent =
                        "Volum: "+volume.value+"%";
                };

                element(
                    "p",
                    "Control virtual al volumului.",
                    parent
                );
            }

            // ROUTER SI SERVER

            if (
                kind === "router" ||
                kind === "server"
            ) {

                element(
                    "h3",
                    "Sistem virtual online",
                    parent
                );

                const count =
                    element("p","",parent);

                function update() {

                    count.textContent =
                        "Dispozitive alimentate in lume: "+
                        powered.size;
                }

                button(
                    "Actualizeaza",
                    update,
                    parent
                );

                update();

                element(
                    "p",
                    "Simulare locala, fara internet real.",
                    parent
                );
            }

            // CEAS DIGITAL

            if (kind === "clock") {

                const clock =
                    element(
                        "h2",
                        new Date().toLocaleTimeString(),
                        parent
                    );

                clock.dataset.techClock = "1";
            }

            // IMPRIMANTA

            if (kind === "printer") {

                const text =
                    element("textarea",undefined,parent);

                text.placeholder = "Text pentru imprimare";

                text.style.cssText = `
                    width:100%;
                    min-height:100px;
                    box-sizing:border-box;
                    color:black;
                    background:white;
                `;

                const paper =
                    element("pre","",parent);

                paper.style.cssText = `
                    white-space:pre-wrap;
                    overflow-wrap:anywhere;
                `;

                button(
                    "Imprima virtual",
                    function() {

                        paper.style.cssText += `
                            background:white;
                            color:black;
                            padding:20px;
                        `;

                        paper.textContent =
                            text.value || "Pagina goala";
                    },
                    parent
                );
            }
        }

        // ==========================
        // MENIUL DISPOZITIVULUI
        // ==========================

        function renderDevice() {

            if (!active) return;

            const {x,y,z} = active;

            const type = getWorldBlock(x,y,z);
            const block = blocks.get(type);

            if (!block) {
                close();
                return;
            }

            const supplied =
                powered.has(key(x,y,z));

            lastStatus =
                type+":"+supplied;

            panel.replaceChildren();

            element(
                "h2",
                block.icon+" "+block.name
            );

            element(
                "p",
                supplied
                    ? "⚡ Energie conectata"
                    : "🔴 Fara energie"
            );

            if (!supplied) {

                element(
                    "p",
                    "Conecteaza dispozitivul la un cablu alimentat."
                );

                if (!window.Electricity) {

                    element(
                        "p",
                        "Electricity 1.0 nu este incarcat."
                    );
                }
            }

            button(
                block.standby
                    ? "Porneste"
                    : "Opreste",
                function() {

                    const next = pairs.get(type);

                    setWorldBlock(x,y,z,next);

                    refreshPower();
                    renderDevice();
                }
            );

            if (supplied && !block.standby) {

                const app =
                    element("div",undefined);

                applications(block,app);

            } else {

                element(
                    "h3",
                    "Dispozitiv oprit"
                );
            }

            button("Inchide",close);
        }

        function interact() {

            if (!inWorld()) return false;

            if (
                typeof getTargetBlock !== "function"
            ) return false;

            const hit = getTargetBlock();

            if (
                !hit ||
                hit.distance>5 ||
                !hit.object.userData
            ) return false;

            const {type,x,y,z} =
                hit.object.userData;

            if (!blocks.has(type)) return false;

            active = {x,y,z};

            refreshPower();

            show();
            renderDevice();

            return true;
        }

        // ==========================
        // COMENZI
        // ==========================

        open.onclick = function() {

            if (panel.style.display === "none") {
                showCatalog();
            } else {
                close();
            }
        };

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

        panel.addEventListener(
            "keydown",
            e=>e.stopPropagation()
        );

        window.addEventListener(
            "keydown",
            function(e) {

                if (!inWorld() || e.repeat) return;

                if (
                    e.target?.closest?.(
                        "input,textarea,select"
                    )
                ) return;

                if(e.code==="KeyJ") {

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    if (
                        panel.style.display==="none"
                    ) {
                        showCatalog();
                    } else {
                        close();
                    }

                    return;
                }

                if (
                    e.code==="Escape" &&
                    panel.style.display!=="none"
                ) {
                    close();
                    return;
                }

                if (
                    e.code==="KeyF" &&
                    panel.style.display==="none" &&
                    interact()
                ) {

                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            },
            true
        );

        // ==========================
        // ACTUALIZARE AUTOMATA
        // ==========================

        setInterval(function() {

            if (!inWorld()) {

                open.style.display = "none";

                powered.clear();
                close();

                return;
            }

            open.style.display = "block";

            refreshPower();

            if (active) {

                const {x,y,z} = active;

                const type =
                    getWorldBlock(x,y,z);

                const status =
                    type+":"+
                    powered.has(key(x,y,z));

                if (
                    !blocks.has(type) ||
                    status!==lastStatus
                ) {
                    renderDevice();
                }

                for(const clock of panel.querySelectorAll(
                    "[data-tech-clock]"
                )) {

                    clock.textContent =
                        new Date().toLocaleTimeString();
                }
            }

        },500);

        window.Technology = {
            version:"1.0",
            count:catalog.length,
            blocks:catalog,
            refresh:refreshPower
        };

        console.log(
            "TECHNOLOGY 1.0: 12 DISPOZITIVE INCARCATE!"
        );
    }

    install();
})();
