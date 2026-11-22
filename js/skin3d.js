// Previzualizare 3D locală, fără biblioteci externe. Skin standard 64x64, brațe clasice.
(() => {
    const dialog = document.getElementById('skin-modal');
    const stage = document.getElementById('skin-stage');
    const model = document.getElementById('skin-model');
    if (!dialog || !stage || !model) return;
    const scale = 6;
    let yaw = -25, pitch = -10, pointer = null;
    function rotate() { model.style.transform = `rotateX(${pitch}deg) rotateY(${yaw}deg)`; }
    function reset() { yaw = -25; pitch = -10; rotate(); }
    function cuboid(image, x, y, w, h, d, u, v) {
        const part = document.createElement('div');
        part.className = 'skin-part';
        part.style.transform = `translate3d(${x*scale}px,${y*scale}px,0)`;
        const faces = [
          [w,h,u+d,v+d,'rotateY(0deg)',d],
          [w,h,u+d+w+d,v+d,'rotateY(180deg)',d],
          [d,h,u,v+d,'rotateY(-90deg)',w],
          [d,h,u+d+w,v+d,'rotateY(90deg)',w],
          [w,d,u+d,v,'rotateX(90deg)',h],
          [w,d,u+d+w,v,'rotateX(-90deg)',h]
        ];
        for (const [fw,fh,fu,fv,rotation,depth] of faces) {
            const face = document.createElement('div');
            face.className = 'skin-face';
            face.style.width = `${fw*scale}px`;
            face.style.height = `${fh*scale}px`;
            face.style.marginLeft = `${-fw*scale/2}px`;
            face.style.marginTop = `${-fh*scale/2}px`;
            face.style.backgroundImage = `url("${image}")`;
            face.style.backgroundSize = `${64*scale}px ${64*scale}px`;
            face.style.backgroundPosition = `${-fu*scale}px ${-fv*scale}px`;
            face.style.transform = `${rotation} translateZ(${depth*scale/2}px)`;
            part.append(face);
        }
        model.append(part);
    }
    window.openSkin3D = product => {
        model.replaceChildren();
        document.getElementById('skin-title').textContent = product.name;
        const img = new Image();
        img.onload = () => {
            if (img.width !== 64 || img.height !== 64) { alert('Este necesar un skin standard 64×64.'); return; }
            if (dialog.open) dialog.close();
            model.replaceChildren();
            cuboid(product.image, 0,-12,8,8,8,0,0);
            cuboid(product.image, 0,-2,8,12,4,16,16);
            cuboid(product.image,-6,-2,4,12,4,40,16);
            cuboid(product.image,6,-2,4,12,4,32,48);
            cuboid(product.image,-2,10,4,12,4,0,16);
            cuboid(product.image,2,10,4,12,4,16,48);
            reset(); dialog.showModal(); stage.focus();
        };
        img.onerror = () => alert('Imaginea skinului nu a putut fi încărcată.');
        img.src = product.image;
    };
    document.getElementById('close-3d').onclick = () => dialog.close();
    document.getElementById('reset-3d').onclick = reset;
    stage.addEventListener('pointerdown', e => { pointer = [e.clientX,e.clientY]; stage.setPointerCapture(e.pointerId); });
    stage.addEventListener('pointermove', e => { if (!pointer) return; yaw += (e.clientX-pointer[0])*.6; pitch = Math.max(-80,Math.min(80,pitch-(e.clientY-pointer[1])*.6)); pointer=[e.clientX,e.clientY]; rotate(); });
    for (const event of ['pointerup','pointercancel','lostpointercapture']) stage.addEventListener(event, () => pointer=null);
    stage.addEventListener('keydown', e => { if (!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) return; e.preventDefault(); if(e.key==='ArrowLeft') yaw-=10; if(e.key==='ArrowRight') yaw+=10; if(e.key==='ArrowUp') pitch=Math.max(-80,pitch-10); if(e.key==='ArrowDown') pitch=Math.min(80,pitch+10); rotate(); });
})();
