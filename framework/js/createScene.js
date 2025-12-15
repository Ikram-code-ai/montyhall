import * as THREE from 'three';
import Table from './table';
import armoire from './armoire';
import { Products } from './products';



class createScene {
    constructor() {
        // Initialiser les propriétés pour l'interaction
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredProduct = null;
        this.tooltip = null;
        this.cupboard = null; // Référence à l'armoire
        
        // Créer le tooltip une seule fois
        this.createTooltip();
    }

    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.style.position = 'absolute';
        this.tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        this.tooltip.style.color = 'white';
        this.tooltip.style.padding = '8px 12px';
        this.tooltip.style.borderRadius = '5px';
        this.tooltip.style.fontSize = '16px';
        this.tooltip.style.fontWeight = 'bold';
        this.tooltip.style.display = 'none';
        this.tooltip.style.pointerEvents = 'none';
        this.tooltip.style.zIndex = '9999';
        document.body.appendChild(this.tooltip);
    }

    Show_tips(cupboardObj) {
        // Stocker la référence à l'armoire
        this.cupboard = cupboardObj;
        
        // Configurer les écouteurs d'événements
        window.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates
            this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update tooltip position
            if (this.tooltip) {
                this.tooltip.style.left = event.clientX + 15 + 'px';
                this.tooltip.style.top = event.clientY + 15 + 'px';
            }
        });

        // Listen for clicks to navigate to game URLs
        window.addEventListener('click', () => {
            if (this.hoveredProduct) {
                const url = this.hoveredProduct.userData.url;
                if (url) {
                    window.open(url, '_blank');
                }
            }
        });
    }

    updateProductInteractions(camera) {
        if (!this.cupboard || !camera || !this.raycaster) {
            return;
        }
        
        // Update the picking ray with the camera and mouse position
        this.raycaster.setFromCamera(this.mouse, camera);
        
        try {
            // Get all product meshes
            const products = this.cupboard.getProducts().getAllProductMeshes();
            
            if (!products || products.length === 0) {
                return;
            }
            
            // Calculate objects intersecting the picking ray
            const intersects = this.raycaster.intersectObjects(products);
            
            // Reset hover state
            if (this.hoveredProduct) {
                this.hoveredProduct.material.emissive.setHex(0x000000);
                this.hoveredProduct = null;
                if (this.tooltip) this.tooltip.style.display = 'none';
            }
            
            // Set new hover state
            if (intersects.length > 0) {
                this.hoveredProduct = intersects[0].object;
                this.hoveredProduct.material.emissive.setHex(0x222222);
                
                // Show tooltip with game name
                if (this.tooltip) {
                    this.tooltip.textContent = this.hoveredProduct.name;
                    this.tooltip.style.display = 'block';
                }
            }
        } catch (error) {
            console.error("Error in updateProductInteractions:", error);
        }
    }
    
    createScene(){}

    createPlane(width, height, texture, type = "floor"){
        let plane;
        if(type === "floor"){
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, width, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        else if(type === "wall"){
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, height, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        else{
            plane = new THREE.Mesh(
                new THREE.PlaneGeometry(width, height, 1, 1),
                new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
            );
        }
        return plane;
    }

    createBox(scene, textures, fw, dimensions, YoffSet){
        const floor_texture = fw.loadTexture(textures[0], {repeat : 6});
        const ground = this.createPlane(dimensions.x, dimensions.y, floor_texture);
        ground.rotation.x = Math.PI / 2;
        ground.position.y = YoffSet;
        scene.add(ground);

        const wall_texture = fw.loadTexture(textures[1], {repeat : 2});
        const wall1 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall1.position.z = ground.position.z - ground.geometry.parameters.width / 2;
        wall1.position.y = ground.position.y + wall1.geometry.parameters.height / 2;
        scene.add(wall1);

        const wall2 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall2.position.z = ground.position.z + ground.geometry.parameters.width / 2;
        wall2.position.y = ground.position.y + wall2.geometry.parameters.height / 2;
        scene.add(wall2);

        const wall3 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall3.position.x = ground.position.x - ground.geometry.parameters.width / 2;
        wall3.position.y = ground.position.y + wall3.geometry.parameters.height / 2;
        wall3.rotation.y = Math.PI / 2;
        scene.add(wall3);

        const wall4 = this.createPlane(dimensions.x,dimensions.y, wall_texture, "wall");
        wall4.position.x = ground.position.x + ground.geometry.parameters.width / 2;
        wall4.position.y = ground.position.y + wall4.geometry.parameters.height / 2;
        wall4.rotation.y = Math.PI / 2;
        scene.add(wall4);

        const ceiling_texture = fw.loadTexture(textures[2], {repeat : 6});
        const ceiling = this.createPlane(dimensions.x,dimensions.y, ceiling_texture);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = ground.position.y + wall1.geometry.parameters.height;
        scene.add(ceiling);
    }

    createTable(scene, fw, {width, depth}){
        let table = new Table(width,depth);
        scene.add(table.getTable());
        fw.attachLight( table.getTable(),{color : 'white', intensity :  2, name : "tableLight"});
        return table.getTable();
    }
    
    createProducts(scene, fw, {width, depth, height}){
        console.log("Creating products with dimensions:", {width, depth, height});
        
        // Valeurs par défaut si les paramètres sont manquants
        width = Number(width) || 100;
        depth = Number(depth) || 25; 
        height = Number(height) || 20;
        
        let products = new Products();
        
        // Passez un nombre de produitsPerShelf explicite
        products.createProducts(width, depth, height, 5); 
        
        scene.add(products.getProducts());
        return products.getProducts();
    }
}

export default createScene;

