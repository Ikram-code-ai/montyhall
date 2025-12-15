(function(){
  const THREE = window.THREE;
  if (!THREE) { console.error('Three.js non chargé'); return; }

  let etatJeu = 'choix';
  let porteAvecCadeau = 0;
  let porteChoisie = null;
  let porteOuverte = null;
  let aChangeLorsDernierePartie = null;
  let nbParties = 0, nbGagneEnChangeant = 0, nbGagneSansChanger = 0;

  document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('jeu');
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7); dir.castShadow = true; scene.add(dir);

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20,10), new THREE.MeshStandardMaterial({color:0x8b7355, roughness:0.8}));
    floor.rotation.x = -Math.PI/2; floor.position.y = -2; floor.receiveShadow = true; scene.add(floor);

    const portes3D = [];
    function creerPorte(x, index){
      const group = new THREE.Group(); group.position.set(x,0,0);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(2.2,4.2,0.3), new THREE.MeshStandardMaterial({color:0x654321, roughness:0.7}));
      frame.castShadow = true; frame.receiveShadow = true; group.add(frame);
      const door = new THREE.Mesh(new THREE.BoxGeometry(2,4,0.2), new THREE.MeshStandardMaterial({color:0x0f4d99, roughness:0.3, metalness:0.2}));
      door.position.set(0,0,0.15); door.castShadow = true; door.receiveShadow = true; door.geometry.translate(1,0,0); door.position.x = -1; group.add(door);
      scene.add(group);
      return {group, door, frame, isOpen:false, targetRotation:0, index};
    }
    portes3D.push(creerPorte(-4,0)); portes3D.push(creerPorte(0,1)); portes3D.push(creerPorte(4,2));

    function creerCadeau(){
      const g = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.8,0.8,0.8), new THREE.MeshStandardMaterial({color:0xff1744, roughness:0.3, metalness:0.1}));
      box.castShadow = true; g.add(box);
      const rH = new THREE.Mesh(new THREE.BoxGeometry(1,0.15,0.85), new THREE.MeshStandardMaterial({color:0xffd700})); g.add(rH);
      const rV = new THREE.Mesh(new THREE.BoxGeometry(0.15,1,0.85), new THREE.MeshStandardMaterial({color:0xffd700})); g.add(rV);
      const bow = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8), new THREE.MeshStandardMaterial({color:0xffd700})); bow.position.y = 0.5; g.add(bow);
      g.position.y = -1.6; g.visible = false; return g;
    }
    function creerChevre(){
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.3,0.6,8,16), new THREE.MeshStandardMaterial({color:0xcccccc})); body.rotation.z = Math.PI/2; body.position.y=-1.3; body.castShadow=true; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.25,16,16), new THREE.MeshStandardMaterial({color:0xcccccc})); head.position.set(0.5,-1.1,0); g.add(head);
      const hornMat = new THREE.MeshStandardMaterial({color:0x8b7355});
      const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,8), hornMat); h1.position.set(0.55,-0.9,-0.15); h1.rotation.z=-0.3; g.add(h1);
      const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.08,0.3,8), hornMat); h2.position.set(0.55,-0.9,0.15); h2.rotation.z=-0.3; g.add(h2);
      const legMat = new THREE.MeshStandardMaterial({color:0x8b8b8b});
      for(let i=0;i<4;i++){ const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.5), legMat); leg.position.set(i<2?0.2:-0.2, -1.8, i%2===0?-0.15:0.15); g.add(leg);} 
      g.visible=false; return g;
    }
    const objetsDerrierePortes = [];
    for(let i=0;i<3;i++){ const cadeau=creerCadeau(); cadeau.position.set(portes3D[i].group.position.x,0,-0.5); scene.add(cadeau); objetsDerrierePortes.push(cadeau); const chevre=creerChevre(); chevre.position.set(portes3D[i].group.position.x,0,-0.5); scene.add(chevre); objetsDerrierePortes.push(chevre); }

    const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
    renderer.domElement.addEventListener('click', (event)=>{
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left)/rect.width)*2 - 1;
      mouse.y = -((event.clientY - rect.top)/rect.height)*2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const objs = []; portes3D.forEach(p=>{ objs.push(p.door); objs.push(p.frame); });
      const hit = raycaster.intersectObjects(objs);
      if(hit.length>0){ const clicked = hit[0].object; const p = portes3D.find(pp=> pp.door===clicked || pp.frame===clicked ); if(p){ gererClicPorte(p.index); } }
    });

    const messageElt = document.getElementById('message');
    const boutonRejouerBas = document.getElementById('rejouer');
    const boutonRejouerTop = document.getElementById('btn-rejouer-top');
    const boutonAccueil = document.getElementById('btn-accueil');
    const boutonStats = document.getElementById('btn-stats');

    function ouvrirPorte(i){ portes3D[i].targetRotation = -Math.PI/2; portes3D[i].isOpen = true; }
    function fermerPorte(i){ portes3D[i].targetRotation = 0; portes3D[i].isOpen = false; }
    function montrerObjet(i, estCadeau){ const c=i*2, g=i*2+1; objetsDerrierePortes[c].visible=estCadeau; objetsDerrierePortes[g].visible=!estCadeau; }
    function cacherTous(){ objetsDerrierePortes.forEach(o=> o.visible=false); }

    function lancerNouvellePartie(){
      etatJeu='choix'; porteAvecCadeau = Math.floor(Math.random()*3); porteChoisie=null; porteOuverte=null; aChangeLorsDernierePartie=null;
      portes3D.forEach((p,i)=>{ fermerPorte(i); p.door.material.color.setHex(0x0f4d99); p.door.material.emissive.setHex(0x000000); });
      cacherTous(); if(messageElt) messageElt.textContent='Choisis une porte.';
    }
    function gererClicPorte(index){
      if(etatJeu==='termine') return;
      if(etatJeu==='choix'){
        porteChoisie = index;
        portes3D.forEach((p,i)=>{ if(i===index){ p.door.material.color.setHex(0x1ea3ff); p.door.material.emissive.setHex(0x1ea3ff); p.door.material.emissiveIntensity=0.3; } else { p.door.material.color.setHex(0x0f4d99); p.door.material.emissive.setHex(0x000000); p.door.material.emissiveIntensity=0; } });
        const possibles = [0,1,2].filter(i=> i!==porteChoisie && i!==porteAvecCadeau );
        porteOuverte = possibles[Math.floor(Math.random()*possibles.length)];
        if(porteOuverte!==null){ ouvrirPorte(porteOuverte); setTimeout(()=> montrerObjet(porteOuverte, false), 800); }
        if(messageElt) messageElt.textContent='Je révèle une porte sans cadeau. Tu gardes ou tu changes ?';
        etatJeu='switch'; return;
      }
      if(etatJeu==='switch'){
        if(porteChoisie===null) return; aChangeLorsDernierePartie = index!==porteChoisie; porteChoisie=index; revelerResultat();
      }
    }
    function revelerResultat(){
      if(porteChoisie===null) return; etatJeu='termine'; nbParties+=1;
      for(let i=0;i<3;i++){ if(i!==porteOuverte) ouvrirPorte(i); setTimeout(()=>{ if(i===porteAvecCadeau){ montrerObjet(i,true); portes3D[i].door.material.color.setHex(0x38c586); } else if(i!==porteOuverte){ montrerObjet(i,false); portes3D[i].door.material.color.setHex(0xf0774d);} }, 800 + i*200 ); }
      const gagne = porteChoisie===porteAvecCadeau;
      setTimeout(()=>{ if(!messageElt) return; if(gagne){ messageElt.textContent='🎉 Gagné ! Le cadeau était bien ici !'; if(aChangeLorsDernierePartie) nbGagneEnChangeant++; else nbGagneSansChanger++; } else { messageElt.textContent='😢 Raté pour cette fois, mais Monty adore qu\'on retente.'; } }, 1500);
    }
    function verifierFinPartieEt(action){ if(etatJeu!=='termine'){ alert('⏳ Tu dois d\'abord finir la partie avant d\'utiliser ce bouton.'); return; } action(); }
    function afficherStats(){ alert(`Nombre de parties : ${nbParties}\nVictoires en changeant de porte : ${nbGagneEnChangeant}\nVictoires en gardant la même porte : ${nbGagneSansChanger}`); }

    if(boutonRejouerBas) boutonRejouerBas.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    if(boutonRejouerTop) boutonRejouerTop.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    if(boutonAccueil) boutonAccueil.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    if(boutonStats) boutonStats.addEventListener('click', ()=> verifierFinPartieEt(afficherStats));

    window.addEventListener('resize', ()=>{ camera.aspect = container.clientWidth / container.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(container.clientWidth, container.clientHeight); });

    function animate(){ requestAnimationFrame(animate); portes3D.forEach(p=>{ const d = p.targetRotation - p.door.rotation.y; if(Math.abs(d)>0.01) p.door.rotation.y += d*0.1;}); objetsDerrierePortes.forEach(o=>{ if(o.visible) o.rotation.y += 0.01; }); renderer.render(scene, camera); }

    lancerNouvellePartie(); animate();
  });
})();
