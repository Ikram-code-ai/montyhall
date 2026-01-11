
(function(){
  // on recupere three.js depuis la page html
  const THREE = window.THREE;
  if (!THREE) { console.error('Three.js non chargé'); return; }

  // variables pour gerer l etat du jeu
  let etatJeu = 'choix';           // peut etre "choix", "switch" ou "termine"
  let porteAvecCadeau = 0;         // numero de la porte qui cache le cadeau (0, 1 ou 2)
  let porteChoisie = null;         // la porte que le joueur a choisi
  let porteOuverte = null;         // la porte que monty a ouvert pour montrer une chevre
  let aChangeLorsDernierePartie = null;  // est ce que le joueur a change de porte ou pas

  // variables pour les statistiques
  let nbParties = 0;               // nombre total de parties jouees
  let nbGagneEnChangeant = 0;      // victoires quand on change de porte
  let nbGagneSansChanger = 0;      // victoires quand on garde sa porte

  // on attend que la page soit chargee avant de lancer le jeu
  document.addEventListener('DOMContentLoaded', () => {
    // on recupere le conteneur du jeu dans le html
    const container = document.getElementById('jeu');
    if (!container) return;

    // --- configuration de la scene 3d ---
    
    // creation de la scene three.js avec un fond bleu ciel
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);

    // creation de la camera en perspective
    // le joueur voit la scene de face, un peu en hauteur
    const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 10);  // position: centre, un peu en haut, recule de 10
    camera.lookAt(0, 0, 0);         // la camera regarde le centre

    // creation du renderer webgl avec antialiasing pour un rendu plus lisse
    const renderer = new THREE.WebGLRenderer({ antialias:true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;                    // on active les ombres
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;     // ombres douces
    container.appendChild(renderer.domElement);           // on ajoute le canvas au html

    // --- lumieres ---
    
    // lumiere ambiante pour eclairer toute la scene uniformement
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    
    // lumiere directionnelle comme le soleil, elle cree des ombres
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5,10,7);
    dir.castShadow = true;
    scene.add(dir);

    // --- sol ---
    
    // on cree le sol en bois marron
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20,10),
      new THREE.MeshStandardMaterial({color:0x8b7355, roughness:0.8})
    );
    floor.rotation.x = -Math.PI/2;   // on le met a plat (horizontal)
    floor.position.y = -2;           // on le descend sous les portes
    floor.receiveShadow = true;      // le sol recoit les ombres
    scene.add(floor);

    // --- portes ---
    
    // tableau qui va contenir les 3 portes
    const portes3D = [];
    
    // fonction pour creer une porte 3d
    // x = position horizontale, index = numero de la porte (0, 1 ou 2)
    function creerPorte(x, index){
      const group = new THREE.Group();
      group.position.set(x,0,0);
      
      // cadre de la porte en bois marron
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(2.2,4.2,0.3),
        new THREE.MeshStandardMaterial({color:0x654321, roughness:0.7})
      );
      frame.castShadow = true;
      frame.receiveShadow = true;
      group.add(frame);
      
      // la porte elle meme en bleu
      // on decale le pivot pour qu elle s ouvre sur le cote
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(2,4,0.2),
        new THREE.MeshStandardMaterial({color:0x0f4d99, roughness:0.3, metalness:0.2})
      );
      door.position.set(0,0,0.15);
      door.castShadow = true;
      door.receiveShadow = true;
      door.geometry.translate(1,0,0);  // on decale la geometrie pour le pivot
      door.position.x = -1;            // on recentre la porte
      group.add(door);
      
      scene.add(group);
      
      // on retourne un objet avec toutes les infos de la porte
      return {group, door, frame, isOpen:false, targetRotation:0, index};
    }
    
    // on cree les 3 portes: gauche, centre, droite
    portes3D.push(creerPorte(-4,0));
    portes3D.push(creerPorte(0,1));
    portes3D.push(creerPorte(4,2));

    // --- cadeau ---
    
    // fonction pour creer le modele 3d du cadeau
    function creerCadeau(){
      const g = new THREE.Group();
      
      // la boite rouge du cadeau
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(1.4,1.4,1.4),
        new THREE.MeshStandardMaterial({color:0xff1744, roughness:0.35, metalness:0.2})
      );
      box.castShadow = true;
      g.add(box);
      
      // ruban horizontal dore
      const rH = new THREE.Mesh(
        new THREE.BoxGeometry(1.6,0.18,1.45),
        new THREE.MeshStandardMaterial({color:0xffd700, roughness:0.25})
      );
      g.add(rH);
      
      // ruban vertical dore
      const rV = new THREE.Mesh(
        new THREE.BoxGeometry(0.18,1.6,1.45),
        new THREE.MeshStandardMaterial({color:0xffd700, roughness:0.25})
      );
      g.add(rV);
      
      // noeud sur le dessus du cadeau
      const bow = new THREE.Mesh(
        new THREE.SphereGeometry(0.32,12,12),
        new THREE.MeshStandardMaterial({color:0xffe36a, roughness:0.35})
      );
      bow.position.y = 0.85;
      g.add(bow);

      // position et visibilite initiales
      g.position.y = -0.3;
      g.visible = false;  // cache au debut
      
      // donnees pour l animation de flottement
      g.userData.baseY = g.position.y;
      g.userData.phase = Math.random() * Math.PI * 2;
      
      return g;
    }
    
    // --- chevre ---
    
    // fonction pour creer le modele 3d de la chevre
    function creerChevre(){
      const g = new THREE.Group();
      
      // materiaux pour le corps de la chevre
      const bodyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.05 });
      const accentMat = new THREE.MeshStandardMaterial({ color: 0xe8d7c5, roughness: 0.45 });
      
      // corps de la chevre (capsule horizontale)
      const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.5,1.1,8,16), bodyMat);
      body.rotation.z = Math.PI/2;
      body.position.y=-0.4;
      body.castShadow=true;
      g.add(body);
      
      // tete de la chevre (sphere)
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.42,16,16), bodyMat);
      head.position.set(0.95,-0.1,0);
      g.add(head);
      
      // museau de la chevre
      const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 12), accentMat);
      muzzle.position.set(1.22, -0.1, 0);
      g.add(muzzle);
      
      // yeux noirs
      const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), eyeMat);
      eyeL.position.set(1.05, -0.02, -0.15);
      g.add(eyeL);
      const eyeR = eyeL.clone();
      eyeR.position.z = 0.15;
      g.add(eyeR);
      
      // cornes de la chevre
      const hornMat = new THREE.MeshStandardMaterial({color:0x8b7355, metalness:0.35});
      const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.45,10), hornMat);
      h1.position.set(1.0,0.12,-0.22);
      h1.rotation.z=-0.3;
      g.add(h1);
      const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.12,0.45,10), hornMat);
      h2.position.set(1.0,0.12,0.22);
      h2.rotation.z=-0.3;
      g.add(h2);
      
      // pattes de la chevre (4 pattes)
      const legMat = new THREE.MeshStandardMaterial({color:0x6a6a6a, roughness:0.5});
      for(let i=0;i<4;i++){
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.12,0.12,0.85), legMat);
        leg.position.set(i<2?0.35:-0.35, -0.95, i%2===0?-0.22:0.22);
        g.add(leg);
      } 
      
      // position et visibilite initiales
      g.visible=false;  // cache au debut
      g.userData.baseY = -0.5;
      g.userData.phase = Math.random() * Math.PI * 2;
      
      return g;
    }
    
    // --- placement des objets derriere les portes ---
    
    // tableau qui contient tous les objets (cadeaux et chevres)
    // pour chaque porte: indice pair = cadeau, indice impair = chevre
    const objetsDerrierePortes = [];
    
    for(let i=0;i<3;i++){
      // on place les objets au centre de chaque porte
      const xFrame = portes3D[i].group.position.x;
      
      // on cree et place un cadeau derriere cette porte
      const cadeau = creerCadeau();
      cadeau.position.set(xFrame, -0.3, -0.15);
      scene.add(cadeau);
      objetsDerrierePortes.push(cadeau);
      
      // on cree et place une chevre derriere cette porte
      const chevre = creerChevre();
      chevre.position.set(xFrame, -0.5, -0.15);
      scene.add(chevre);
      objetsDerrierePortes.push(chevre);
    }

    // --- detection des clics sur les portes ---
    
    // raycaster pour detecter sur quel objet 3d on clique
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // quand on clique sur le canvas
    renderer.domElement.addEventListener('click', (event)=>{
      // on calcule la position de la souris en coordonnees normalisees (-1 a 1)
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left)/rect.width)*2 - 1;
      mouse.y = -((event.clientY - rect.top)/rect.height)*2 + 1;
      
      // on lance un rayon depuis la camera vers la souris
      raycaster.setFromCamera(mouse, camera);
      
      // on teste la collision avec toutes les portes et cadres
      const objs = [];
      portes3D.forEach(p=>{ objs.push(p.door); objs.push(p.frame); });
      const hit = raycaster.intersectObjects(objs);
      
      // si on a touche quelque chose, on trouve quelle porte c est
      if(hit.length>0){
        const clicked = hit[0].object;
        const p = portes3D.find(pp=> pp.door===clicked || pp.frame===clicked );
        if(p){
          gererClicPorte(p.index);
        }
      }
    });

    // --- elements html du jeu ---
    
    // on recupere les elements html pour les messages et boutons
    const messageElt = document.getElementById('message');
    const boutonRejouerBas = document.getElementById('rejouer');
    const boutonRejouerTop = document.getElementById('btn-rejouer-top');
    const boutonAccueil = document.getElementById('btn-accueil');
    const boutonStats = document.getElementById('btn-stats');

    // --- fonctions pour ouvrir et fermer les portes ---
    
    // ouvre une porte (animation geree dans animate)
    function ouvrirPorte(i){
      portes3D[i].targetRotation = -Math.PI/2;  // rotation cible: 90 degres
      portes3D[i].isOpen = true;
    }
    
    // ferme une porte
    function fermerPorte(i){
      portes3D[i].targetRotation = 0;  // rotation cible: fermee
      portes3D[i].isOpen = false;
    }

    // --- fonctions pour afficher/cacher les objets ---
    
    // montre l objet derriere la porte i (cadeau ou chevre)
    function montrerObjet(i, estCadeau){
      const c=i*2, g=i*2+1;  // indices dans le tableau
      objetsDerrierePortes[c].visible=estCadeau;    // cadeau
      objetsDerrierePortes[g].visible=!estCadeau;   // chevre
    }
    
    // cache tous les objets
    function cacherTous(){
      objetsDerrierePortes.forEach(o=> o.visible=false);
    }

    // --- logique du jeu ---
    
    // demarre une nouvelle partie
    function lancerNouvellePartie(){
      etatJeu='choix';
      porteAvecCadeau = Math.floor(Math.random()*3);  // on place le cadeau au hasard
      porteChoisie=null;
      porteOuverte=null;
      aChangeLorsDernierePartie=null;
      
      // on remet toutes les portes fermees et bleues
      portes3D.forEach((p,i)=>{
        fermerPorte(i);
        p.door.material.color.setHex(0x0f4d99);
        p.door.material.emissive.setHex(0x000000);
      });
      
      cacherTous();
      
      if(messageElt) messageElt.textContent='Choisis une porte.';
    }
    
    // gere le clic sur une porte selon l etat du jeu
    function gererClicPorte(index){
      // si la partie est finie on fait rien
      if(etatJeu==='termine') return;
      
      // etape 1: le joueur choisit une porte
      if(etatJeu==='choix'){
        porteChoisie = index;
        
        // on met en surbrillance la porte choisie
        portes3D.forEach((p,i)=>{
          if(i===index){
            p.door.material.color.setHex(0x1ea3ff);         // bleu clair
            p.door.material.emissive.setHex(0x1ea3ff);      // brillance
            p.door.material.emissiveIntensity=0.3;
          } else {
            p.door.material.color.setHex(0x0f4d99);         // bleu normal
            p.door.material.emissive.setHex(0x000000);      // pas de brillance
            p.door.material.emissiveIntensity=0;
          }
        });
        
        // monty ouvre une porte avec une chevre (pas celle du joueur ni celle du cadeau)
        const possibles = [0,1,2].filter(i=> i!==porteChoisie && i!==porteAvecCadeau );
        porteOuverte = possibles[Math.floor(Math.random()*possibles.length)];
        
        // on ouvre la porte et on montre la chevre apres un delai
        if(porteOuverte!==null){
          ouvrirPorte(porteOuverte);
          setTimeout(()=> montrerObjet(porteOuverte, false), 800);
        }
        
        if(messageElt) messageElt.textContent='Je révèle une porte sans cadeau. Tu gardes ou tu changes ?';
        etatJeu='switch';
        return;
      }
      
      // etape 2: le joueur decide de garder ou changer
      if(etatJeu==='switch'){
        if(porteChoisie===null) return;
        
        // on note si le joueur a change de porte
        aChangeLorsDernierePartie = index!==porteChoisie;
        porteChoisie=index;
        
        // on revele le resultat
        revelerResultat();
      }
    }
    
    // revele toutes les portes et affiche le resultat
    function revelerResultat(){
      if(porteChoisie===null) return;
      
      etatJeu='termine';
      nbParties+=1;
      
      // on ouvre toutes les portes et on montre ce qu il y a derriere
      for(let i=0;i<3;i++){
        if(i!==porteOuverte) ouvrirPorte(i);
        
        setTimeout(()=>{
          if(i===porteAvecCadeau){
            montrerObjet(i,true);                           // on montre le cadeau
            portes3D[i].door.material.color.setHex(0x38c586);  // vert = gagne
          } else if(i!==porteOuverte){
            montrerObjet(i,false);                          // on montre la chevre
            portes3D[i].door.material.color.setHex(0xf0774d);  // orange = perdu
          }
        }, 800 + i*200 );
      }
      
      // on affiche le message de victoire ou defaite
      const gagne = porteChoisie===porteAvecCadeau;
      setTimeout(()=>{
        if(!messageElt) return;
        if(gagne){
          messageElt.textContent='🎉 Gagné ! Le cadeau était bien ici !';
          // on met a jour les stats
          if(aChangeLorsDernierePartie) nbGagneEnChangeant++;
          else nbGagneSansChanger++;
        } else {
          messageElt.textContent='😢 Raté pour cette fois, mais Monty adore qu\'on retente.';
        }
      }, 1500);
    }
    
    // verifie que la partie est finie avant de faire une action
    function verifierFinPartieEt(action){
      if(etatJeu!=='termine'){
        alert('⏳ Tu dois d\'abord finir la partie avant d\'utiliser ce bouton.');
        return;
      }
      action();
    }
    
    // affiche les statistiques dans une popup
    function afficherStats(){
      alert(`Nombre de parties : ${nbParties}\nVictoires en changeant de porte : ${nbGagneEnChangeant}\nVictoires en gardant la même porte : ${nbGagneSansChanger}`);
    }

    // --- evenements des boutons ---
    
    // bouton rejouer en bas
    if(boutonRejouerBas) boutonRejouerBas.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    
    // bouton rejouer en haut
    if(boutonRejouerTop) boutonRejouerTop.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    
    // bouton accueil (recommence aussi une partie)
    if(boutonAccueil) boutonAccueil.addEventListener('click', ()=> verifierFinPartieEt(lancerNouvellePartie));
    
    // bouton statistiques
    if(boutonStats) boutonStats.addEventListener('click', ()=> verifierFinPartieEt(afficherStats));

    // --- redimensionnement de la fenetre ---
    
    // quand la fenetre change de taille on ajuste la camera et le renderer
    window.addEventListener('resize', ()=>{
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // --- boucle d animation ---
    
    // cette fonction tourne en boucle a 60 fps
    function animate(){
      requestAnimationFrame(animate);
      
      // animation d ouverture des portes (interpolation douce)
      portes3D.forEach(p=>{
        const d = p.targetRotation - p.door.rotation.y;
        if(Math.abs(d)>0.01) p.door.rotation.y += d*0.1;
      });
      
      // temps actuel pour les animations
      const t = performance.now() * 0.001;
      
      // animation des objets visibles (rotation + flottement)
      objetsDerrierePortes.forEach(o=>{
        if(o.visible){
          // rotation lente
          o.rotation.y += 0.012;
          
          // effet de flottement haut/bas
          if(o.userData && typeof o.userData.baseY === 'number'){
            o.position.y = o.userData.baseY + Math.sin(t * 1.4 + o.userData.phase) * 0.08;
          }
        }
      });
      
      // on dessine la scene
      renderer.render(scene, camera);
    }

    // on lance le jeu
    lancerNouvellePartie();
    animate();
  });
})();
