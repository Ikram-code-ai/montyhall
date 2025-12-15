import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import createScene from './createScene';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import CTABanner from './CTABanner';
import Modal from './modal';
import { Products } from './products';
import armoire from './armoire';


class Framework {
    CTABannerParameter;         // Contains the following keys: Banner, navbar, container
    mainParameters;             // Contains the following keys: scene, camera, renderer, cameraOrbital
    pendingLoads = false;       // Boolean to check if there are pending loads
    pendingCopies = false;      // Boolean to check if there are pending copies
    numberPendingLoads = 0;     // Number of pending loads
    numberPendingCopies = 0;    // Number of pending copies

    /**
     * Constructs a new Framework object with a default scene, camera, and renderer.
     * To get the scene, camera, and renderer, use the mainParameters attribute.
     */
    constructor(){
        console.log('Framework constructor');
        
        const Banner = new CTABanner();
        var navbar = Banner.getNavbar();
        var container = Banner.getContainer();
        
        this.CTABannerParameter = {"Banner": Banner,"navbar": navbar, "container": container};
        this.mainParameters = this.#init();
        
    }

    /**
     * Function to enable or disable the resizing and centered of the application.
     * It helps to keep all object at there place and with the right size when the window is resized.
     *
     * @param {THREE.WebGLRenderer} renderer - The renderer responsible for rendering the scene.
     * @param {Window} window - The browser window containing the Three.js canvas.
     * @param {THREE.PerspectiveCamera} camera - The camera used to view the scene, typically a PerspectiveCamera.
     * @param {boolean} enabled - A boolean to enable or disable the resizing. Defaults to true.
     */
    onResize({renderer, window, camera, enabled} = {}){
        let params = {
            renderer : this.mainParameters.renderer, 
            window : this.window, 
            camera : this.mainParameters.camera,
            enabled : true
        };
        if(renderer){params.renderer = renderer;}
        if(window){params.window = window;}
        if(camera){params.camera = camera;}
        if(enabled === false){params.enabled = false;}

        if (params.enabled === false) {
            console.log('onResize disabled');
            params.window.removeEventListener('resize', this.boundResize); // Use bound resize here
        } else {
            console.log('onResize enabled');
            this.boundResize = this.#resize.bind(this, params.renderer, params.window, params.camera); // Bind resize with parameters
            params.window.addEventListener('resize', this.boundResize); // Add the bound resize listener
        }
    }
 
    /**
     * Updates the occlusion visibility of objects in the scene to optimize performance.
     * Objects that are far from the camera or completely occluded by other objects will be hidden.
     * Only objects of type THREE.Mesh will be considered for occlusion visibility.
     * 
     * @param {THREE.Camera} camera - The camera position, from which the raycasting will start.
     * @param {number} cameraDistanceThreshold - The maximum distance at which to check for occlusion.
     *     Objects farther than this threshold will be hidden automatically.
     * @param {THREE.Raycaster} raycaster - The raycaster used for detecting intersections between objects.
     * @param {THREE.Vector3} direction - A reusable vector to specify the direction of the raycasting.
     */
    updateOcclusionVisibility(camera, cameraDistanceThreshold, raycaster, direction) {
        const scene = window.scene;
        scene.children.forEach((object) => {
            
            if (object.isMesh) {
                console.log('object is mesh');
                object.visible = !this.#isObjectFullyOccluded(object, scene, camera, cameraDistanceThreshold, raycaster, direction);
            }
        });
    }
 
    /**
     * Attach a light to an object in the scene with the specified color and intensity.
     * The light is positioned above the object, slightly offset in the y-direction.
     * @param {THREE.Object3D} object - The object to which the light will be attached.
     * @param {string} color - The color of the light, specified as a hexadecimal string.
     * @param {number} intensity - The intensity of the light, typically between 0 and 1.
     * @returns {THREE.DirectionalLight} - The created light object.
     */
    attachLight(object, {color , intensity, name} = {}){
        let defaultParams = {
            color : '#ffffff',
            intensity : 1,
            name : "light" + object.name
        };

        if(color){defaultParams.color = color;}
        if(intensity){defaultParams.intensity = intensity;}
        if(name){defaultParams.name = name;}

        const scene = window.scene;
        const directionalLight = new THREE.DirectionalLight(defaultParams.color, defaultParams.intensity);
        directionalLight.position.set(object.position.x, object.position.y + object.scale.y + 2, object.position.z);
        directionalLight.name = defaultParams.name;
        scene.add(directionalLight);
        return directionalLight;
    }

    /**
     * Begin the loading screen when we want to wait for model to be loaded.
     * @returns {HTMLElement} - The created loading screen element.
     */
    startLoadingScreen(){
        const loadingScreen = document.createElement('div');
        loadingScreen.id = 'loading-screen';
        loadingScreen.style.position = 'fixed';
        loadingScreen.style.top = '0';
        loadingScreen.style.left = '0';
        loadingScreen.style.width = '100%';
        loadingScreen.style.height = '100%';
        loadingScreen.style.backgroundColor = '#000';
        loadingScreen.style.color = '#fff';
        loadingScreen.style.display = 'flex';
        loadingScreen.style.justifyContent = 'center';
        loadingScreen.style.alignItems = 'center';
        loadingScreen.style.zIndex = '1000';
        loadingScreen.image = document.createElement('img');
        loadingScreen.image.src = 'https://terra-numerica.org/files/2020/10/cropped-favicon-rond.png';
        loadingScreen.image.style.width = '100px';
        loadingScreen.appendChild(loadingScreen.image);
        loadingScreen.innerHTML += '<h1><pre>  Loading</pre></h1>';

        var pos = 115;
        for(let i = 0; i < 4; i++){
            const loadingDot = document.createElement('div');
            loadingDot.style.width = '10px';
            loadingDot.style.height = '10px';
            loadingDot.style.backgroundColor = '#fff';
            loadingDot.style.borderRadius = '50%';
            loadingDot.style.position = 'absolute';
            loadingDot.style.left = window.innerWidth / 2 + pos + 20 * i + 'px';
            loadingDot.style.top = window.innerHeight / 2 - 4 + 'px';
            loadingDot.style.animation = 'bounce 2s infinite';
            loadingDot.style.animationDelay = 0.15 * i + 's';
            loadingScreen.appendChild(loadingDot);
        }

        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes bounce {
            0%, 100% {
                transform: translateY(0);
            }
            50% {
                transform: translateY(-15px);
            }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(loadingScreen);

        return loadingScreen;
    }

    /**
     * Remove the loading screen.
     */
    removeLoadingScreen(){
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.remove();
    }

// ---------------------- 3D Model functions ----------------------

    /**
     * Loads a 3D model from a specified path and adds it to the scene with a given name and size.
     * The model is set to invisible after loading. To get back the model, use .then() to give the model to a variable you have already defined.
     * 
     * @param {string} path - The path to the GLTF model file.
     * @param {string} name - The name to assign to the loaded model.
     * @param {number} size - The scale factor to apply to the model after loading.
     * @param {number} timeToWait - The delay (in milliseconds) to wait after loading the model.
     * @param {boolean} visible - A boolean to set the visibility of the model after loading.
     * @param {Object} position - The position to set the model after loading.
     * @param {Object} rotation - The rotation to set the model after loading.
     * @returns {THREE.Object3D} - The loaded model object.
     */
    async loadModel(path, name, {size, timeToWait, visible, position, rotation} = {}) {
        let defaultParams = {
            size : 1,
            timeToWait : 500,
            visible : false,
            position : {x: 0, y: 0, z: 0},
            rotation : {x: 0, y: 0, z: 0}
        }

        if(size){defaultParams.size = size;}
        if(timeToWait){defaultParams.timeToWait = timeToWait;}
        if(visible){defaultParams.visible = visible;}
        if(position){defaultParams.position = position;}
        if(rotation){defaultParams.rotation = rotation;}

        const loader = new GLTFLoader();
        let scene = window.scene;
    
        let model3D = await new Promise((resolve, reject) => {
            loader.load(path, (gltf) => {
                gltf.scene.scale.set(defaultParams.size, defaultParams.size, defaultParams.size);
                gltf.scene.name = name;
                gltf.scene.userData = {size: defaultParams.size};
                scene.add(gltf.scene);
                gltf.scene.position.set(defaultParams.position.x, defaultParams.position.y, defaultParams.position.z);
                gltf.scene.rotation.set(defaultParams.rotation.x, defaultParams.rotation.y, defaultParams.rotation.z);
                gltf.scene.visible = defaultParams.visible;
                console.log("Model uploaded: " + name);
                resolve(gltf.scene);
            }, undefined, reject);
        });
    
        return model3D;
    }
    

    /**
     * Creates a copy of an existing model in the scene, using the specified name and size.
     * The copied model is positioned at the origin (0, 0, 0) and made visible.
     * The name of the copy is generated by appending "_copy" followed by an incrementing index or an index given when the function is call.
     * 
     * @param {string} name - The name of the model to copy.
     * @param {number} [size=1] - The scale factor to apply to the copied model.
     * @param {number} [counter=0] - It can add a number to append to the copied model name. If nothing is given, it will resume its own naming.
     * @param {number} [timeToWait=100] - The delay (in milliseconds) to wait after creating the copy.
     * @param {Object} [position={x: 0, y: 0, z: 0}] - The position to set the copied model.
     * @param {Object} [rotation={x: 0, y: 0, z: 0}] - The rotation to set the copied model.
     * @returns {THREE.Object3D} - The created copy object.
     */
    async create_copy(name, {size, counter, timeToWait, position, rotation} = {}){
        this.pendingCopies = true;
        this.numberPendingCopies++;

        let scene = window.scene;
        let copy;
        while (!copy) {
            copy = scene.getObjectByName(name)?.clone();
            if (!copy) await new Promise(r => setTimeout(r, 25));
        }

        let defaultParams = {
            size : scene.getObjectByName(name).userData.size,
            counter : 0,
            timeToWait : 200,
            position : {x: 0, y: 0, z: 0},
            rotation : {x: 0, y: 0, z: 0}
        }

        if(size){defaultParams.size = size;}
        if(counter){defaultParams.counter = counter;}
        if(timeToWait){defaultParams.timeToWait = timeToWait;}
        if(position){defaultParams.position = position;}
        if(rotation){defaultParams.rotation = rotation;}

        copy.position.set(defaultParams.position.x, defaultParams.position.y, defaultParams.position.z);
        copy.scale.set(defaultParams.size, defaultParams.size, defaultParams.size);
        copy.rotation.set(defaultParams.rotation.x, defaultParams.rotation.y, defaultParams.rotation.z);
        copy.visible = true;

        if(defaultParams.counter === 0){
            let i=0
            for(let j=0; j<scene.children.length; j++) {
                if(scene.children[j].name.includes(name+"_copy")) {
                    i++;
                }
            }
            copy.name = name + "_copy" + i;
        }
        else{
            copy.name = name + "_copy" + counter;
            if(scene.getObjectByName(copy.name) != undefined) {
                console.log("copy name : " + copy.name +  " already exists");
                return;
            }
        }
        scene.add(copy);
        console.log("copy created from : " + name + " \nwith name : " + copy.name);
        
        this.numberPendingCopies--;
        if(this.numberPendingCopies === 0){
            this.pendingCopies = false;
        }
        return copy;
    }

    /**
     * Deletes a copy of a model in the scene with the specified name.
     * @param {String} name  The name of the model to delete
     * @returns {Boolean} - Returns true if the copy was deleted, false otherwise.
     */
    async delete_copy(name){
        while(this.pendingCopies){
            console.log("waiting for pending copies or loads");
            await new Promise(r => setTimeout(r, 250));
        }
        let scene = window.scene;
        scene.remove(scene.getObjectByName(name));
        console.log("copy deleted : " + name);
        return scene.getObjectByName(name) === undefined
    }

    /**
     * Deletes all copies of a model in the scene with the specified name with the original model.
     * @param {*} name  The name of the model to delete
     * @returns {Boolean} - Returns true if the copies were deleted, false otherwise.
     */
    async delete_model(name){
        while(this.pendingCopies || this.pendingLoads){
            console.log("waiting for pending copies or loads");
            await new Promise(r => setTimeout(r, 250));
        }

        let scene = window.scene;
        let alldeleted = false
        let beginning = 0
        while(!alldeleted){
            if(beginning < scene.children.length){
                for(let i = beginning; i < scene.children.length; i++){
                    if(scene.children[i].name === name || scene.children[i].name.includes(name+"_copy")){
                        scene.remove(scene.children[i]);
                        beginning = i;
                        break
                    }
                    else if(i === scene.children.length - 1){
                        alldeleted = true;
                    }
                }
            }
            else{
                alldeleted = true;
            }
        }
        console.log("model deleted : " + name);
        return scene.getObjectByName(name) === undefined
    }

    /**
     * Load a texture from a specified path and apply it to a material with optional repeat.
     * The texture is set to repeat in both the S and T directions by default.
     * 
     * @param {string} path - The path to the texture image file.
     * @param {number} [repeatHorizontal=1] - The number of times to repeat the texture in the horizontal direction.
     * @param {number} [repeatVertical=1] - The number of times to repeat the texture in the vertical direction.
     * @param {number} [repeat=1] - The number of times to repeat the texture in both directions.
     * @returns {THREE.Texture} - The loaded texture object.
     */
    loadTexture(path, {repeatHorizontal, repeatVertical, repeat} = {}){
        let defaultParams = { 
            repeat : 1,
            repeatHorizontal : 1,
            repeatVertical : 1
        };

        if(repeat){
            defaultParams.repeat = repeat,
            defaultParams.repeatHorizontal = repeat,
            defaultParams.repeatVertical = repeat
            ;}
        if(repeatHorizontal){defaultParams.repeatHorizontal = repeatHorizontal;}
        if(repeatVertical){defaultParams.repeatVertical = repeatVertical;}
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load(path);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(defaultParams.repeatHorizontal, defaultParams.repeatVertical);
        return texture; 
    }

    /**
     * Create a simple scene with a box geometry and apply textures to its faces.
     * The box is centered at the origin (0, 0, 0) and has dimensions specified by the 'dimensions' object.
     * To access to the top layer of the table, use the name you initilized the table with and .children[0].
     * 
     * @param {Integer} width - The width of the table.
     * @param {Integer} depth - The depth of the table.
     * @param {Integer} YoffSet - The Y offset of the table.
     * @param {Integer} widthSpace - The width of the space between the table and the wall.
     * @param {Integer} heightSpace - The height of the space between the table and the ceiling.
     * @param {string} floor - The path to the texture image file for the floor. By default, it is a wood floor.
     * @param {string} wall - The path to the texture image file for the walls. By default, it is a brick wall.
     * @param {string} ceiling - The path to the texture image file for the ceiling. By default, it is a wood ceiling.
     * @returns {THREE.Mesh} - The created box mesh object.
     */
    addSimpleSceneWithTable({width, depth, YoffSet, widthSpace, heightSpace, floor, wall, ceiling} = {}){
        
        let defaultParams = {
            width : 50,
            depth : 50,
            YoffSet : -10,
            widthSpace : 250,
            heightSpace : 250,
            floor : "./framework/textures/wood_floor.jpg",
            wall : "./framework/textures/wall.jpg",
            ceiling : "./framework/textures/roof.jpg"
        }

        if(width){defaultParams.width = width;}
        if(depth){defaultParams.depth = depth;}
        if(YoffSet){defaultParams.YoffSet = YoffSet;}
        if(widthSpace){defaultParams.widthSpace = widthSpace;}
        if(heightSpace){defaultParams.heightSpace = heightSpace;}
        if(floor){defaultParams.floor = floor;}
        if(wall){defaultParams.wall = wall;}
        if(ceiling){defaultParams.ceiling = ceiling;}
        
        const cs = new createScene();
        const scene = window.scene;
        let dimensions= {x : defaultParams.widthSpace, y: defaultParams.heightSpace};
        var textures = [defaultParams.floor, defaultParams.wall, defaultParams.ceiling];
        cs.createBox(scene, textures, this, dimensions, defaultParams.YoffSet);
        const table = cs.createTable(scene, this, {width : defaultParams.width, depth : defaultParams.depth});
        
        const cupboard = this.addInteractiveCupboard({width :80,depth : 100,height: 10});
        
        const tips = cs.Show_tips();
        return table && cupboard;
    }

    /**
     * Add a scene with a box geometry and apply textures to its faces. The floor is at YoffSet beginning at (0,0,0).
     * @param {Integer} width - The width of the box. 
     * @param {Integer} height - The height of the box.
     * @param {Integer} YoffSet - The Y offset of the box.
     * @param {String} floor - The path to the texture image file for the floor. By default, it is a wood floor. 
     * @param {String} wall - The path to the texture image file for the walls. By default, it is a brick wall.
     * @param {String} ceiling - The path to the texture image file for the ceiling. By default, it is a wood ceiling. 
     */
    addSimpleSceneWithoutTable({width, height, YoffSet, floor, wall, ceiling} = {}){

        let defaultParams = {
            width : 250,
            height : 250,
            YoffSet : -10,
            floor : "./framework/textures/wood_floor.jpg",
            wall : "./framework/textures/wall.jpg",
            ceiling : "./framework/textures/roof.jpg"
        }

        if(width){defaultParams.width = width;}
        if(height){defaultParams.height = height;}
        if(YoffSet){defaultParams.YoffSet = YoffSet;}
        if(floor){defaultParams.floor = floor;}
        if(wall){defaultParams.wall = wall;}
        if(ceiling){defaultParams.ceiling = ceiling;}

        const cs = new createScene();
        const scene = window.scene;
        let dimensions= {x : defaultParams.width, y: defaultParams.height};
        var textures = [defaultParams.floor, defaultParams.wall, defaultParams.ceiling];
        cs.createBox(scene, textures, this, dimensions, defaultParams.YoffSet);
    }

    /**Function to add a scene from an existing json file
     * @param {String} path - The path to the json file
     */
    async addSceneFromJson(path){
        const loader = new THREE.ObjectLoader();
        const scene = window.scene;
        var camera;
        await new Promise((resolve, reject) => {
            loader.load(path, function (obj) {
            scene.add(obj);
            console.log("Scene was added from json file");
            if(obj.getObjectByProperty("type", "PerspectiveCamera") != undefined){
                camera = obj.getObjectByProperty("type", "PerspectiveCamera");
            }
            else if(obj.getObjectByProperty("type", "OrthographicCamera") != undefined){
                camera = obj.getObjectByProperty("type", "OrthographicCamera");
            }
            resolve();
            }, undefined, reject);
        });
        if(camera != undefined){
        this.mainParameters.camera = camera;}
    }

    /**
     * Creates an interactive cupboard/cabinet with product display capabilities.
     * This cupboard will be added to the scene and can be interacted with.
     *
     * @param {Object} [options={}] - Configuration options
     * @param {number} [options.width=80] - Width of the cupboard
     * @param {number} [options.depth=100] - Depth of the cupboard
     * @param {number} [options.height=10] - Height of the cupboard
     * @returns {Object} The created cupboard object
     */
    addInteractiveCupboard({width, depth, height}) {
        // Import dynamique des modules nécessaires
        import('./armoire.js').then(({ default: Armoire }) => {
                // Créer l'armoire
                const cupboard = new Armoire(width, depth, height);
                this.mainParameters.scene.add(cupboard.getCupboard());
                // Configurer l'interactivité
                this.setupProductInteractions(cupboard);
                return cupboard;
        });
    }

    /**
     * Sets up interactive capabilities for product viewing in the cupboard.
     * Initializes raycasting and event listeners for hover and click interactions.
     * 
     * @param {Object} cupboard - The cupboard object to add interaction to
     */
    setupProductInteractions(cupboard) {
        // Initialiser le raycaster s'il n'existe pas déjà
        this.productRaycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.hoveredProduct = null;
        this.cupboard = cupboard;
        
        // Créer le tooltip
        this.createTooltip();
        
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

    /**
     * Updates interactive elements and raycasting in the scene.
     * Should be called in the animation loop to keep interactions current.
     *
     * @param {THREE.Camera} camera - The camera used for raycasting and interaction
     */
    update(camera) {
        // Mettre à jour les interactions avec les produits
        this.updateProductInteractions(camera);
       
    }

    /**
     * Creates a tooltip element for displaying information about hovered products.
     * The tooltip appears near the cursor when hovering over interactive elements.
     */
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

    /**
     * Updates product interactions by performing raycasting from the camera.
     * Handles hover states and tooltip visibility based on cursor position.
     *
     * @param {THREE.Camera} camera - The camera to use for raycasting
     */
    updateProductInteractions(camera) {
        if (!this.cupboard || !camera || !this.productRaycaster || !this.mouse) {
            return;
        }
        
        // Update the picking ray with the camera and mouse position
        this.productRaycaster.setFromCamera(this.mouse, camera);
        
        try {
            // Get all product meshes
            const products = this.cupboard.getProducts().getAllProductMeshes();
            
            if (!products || products.length === 0) {
                return;
            }
            
            // Calculate objects intersecting the picking ray
            const intersects = this.productRaycaster.intersectObjects(products);
            
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

    /**
     * Creates tips/tooltips for interactive elements in the scene.
     * Sets up event listeners for hovering and clicking on interactive objects.
     * 
     * @returns {HTMLElement} The created tooltip element
     */
    Show_tips(){
        // Create tooltip element for displaying game names
        const tooltip = document.createElement('div');
        tooltip.style.position = 'absolute';
        tooltip.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        tooltip.style.color = 'white';
        tooltip.style.padding = '5px 10px';
        tooltip.style.borderRadius = '5px';
        tooltip.style.fontSize = '14px';
        tooltip.style.display = 'none';
        tooltip.style.pointerEvents = 'none';
        document.body.appendChild(tooltip);
    
        // Listen for mouse moves to detect hovering
        window.addEventListener('mousemove', (event) => {
            // Calculate mouse position in normalized device coordinates
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            
            // Update tooltip position
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY + 15 + 'px';
        });
    
        // Listen for clicks to navigate to game URLs
        window.addEventListener('click', () => {
            if (hoveredProduct) {
                const url = hoveredProduct.userData.url;
                window.open(url, '_blank');
            }
        });
    
       
        
    }



// ---------------------- Navbar functions ----------------------

    /**
     * Add a button to the navbar with the specified text and onclick function.
     * 
     * @param {string} textButton - The text to display on the button.
     * @param {Function} onclickFunction - The function to execute when the button is clicked.
     * @param {boolean} [hover=true] - A boolean to enable or disable hover effects on the button. Defaults to true.
     * @param {Array<string>} [classesOfTheButton=["a"]] - An array of classes to apply to the button element.
     * @returns {HTMLElement} - The created button element.
     */
    addButtonToNavbar({textButton = "click me", onclickFunction = () => alert("click"),hover = true, classesOfTheButton = ["a"]} = {}){
        let defaultParams = {
            textButton : "click me",
            onclickFunction : () => alert("click"),
            hover : true,
            classesOfTheButton : ["a"]
        };

        if(textButton){defaultParams.textButton = textButton;}
        if(onclickFunction){defaultParams.onclickFunction = onclickFunction;}
        if(hover){defaultParams.hover = hover;}
        if(classesOfTheButton){defaultParams.classesOfTheButton = classesOfTheButton;}

        const Banner = this.CTABannerParameter.Banner;
        const navbar = this.CTABannerParameter.navbar;
        const container = this.CTABannerParameter.container;
        Banner.create_button({ text: defaultParams.textButton, onClick: defaultParams.onclickFunction, classes: defaultParams.classesOfTheButton });
        
        var buttonToChange = document.getElementById("navbar0").children[document.getElementById("navbar0").children.length - 1];
        return buttonToChange;
    }

    /**
     * Add a dropdown menu to the navbar with the specified text and list of dropdown items.
     * Each dropdown item is an object with a 'text' property and an 'onClick' function.
     * 
     * @param {string} textButton - The text to display on the dropdown button.
     * @param {Array<{text: string, onClick: Function}>} dropdownList - An array of dropdown items.
     * @returns {HTMLElement} - The created dropdown button element.
     */
    addDropdownToNavbar({textButton , dropdownList} = {}){
        let defaultParams = {
            textButton : "DropDown",
            dropdownList : [{ text: "Parameters", onClick: () => alert("Hello!") }]
        };

        if(textButton){defaultParams.textButton = textButton;}
        if(dropdownList){defaultParams.dropdownList = dropdownList;}

        const Banner = this.CTABannerParameter.Banner;
        const navbar = this.CTABannerParameter.navbar;
        const container = this.CTABannerParameter.container;

        Banner.create_dropdown({buttonText: defaultParams.textButton, menuId: defaultParams.textButton });
        Banner.create_dropdown_list(defaultParams.textButton, defaultParams.dropdownList);  

        var buttonToChange = document.getElementById("navbar0").children[document.getElementById("navbar0").children.length - 1];
        return buttonToChange;
    }

    /**
     * Change the text which is displayed on the button at the specified index in the navbar.
     * @param {Integer} buttonNumber The button which text will be changed. Value between 1 and +infinity
     * @param {String} newText The text which will replace the current text of the button
     */
    changeTextOfButton(buttonNumber, newText){
        var buttonToChange = document.getElementById("navbar0").children[buttonNumber];
        buttonToChange.textContent = newText;
    }

    /**
     * Change the text which is displayed on the dropdown button at the specified index in the navbar.
     * @param {Integer} dropdownNumber The dropdown which text will be changed. Value between 1 and +infinity
     * @param {Integer} dropBoxToChange The dropbox which text will be changed. Value between 0 and the number of button in the drop down.
     * @param {String} newText The text which will replace the current text of the dropdown
     */
    changeTextOfDropdown(dropdownNumber,dropBoxToChange, newText){
        var dropDown = document.getElementById("navbar0").children[dropdownNumber];
        if(dropDown.children[1].length <= dropBoxToChange){
            console.log("The button is out of range");
            return;
        }
        else{
            if(dropBoxToChange == 0) {
                var dropBox = dropDown.children[dropBoxToChange];
                dropBox.textContent = newText;
            }
            else{
                var dropBox = dropDown.children[1].children[dropBoxToChange-1];
                dropBox.textContent = newText;
            }
        }


        
    }

    /**
     * Get the width of the browser window.
     * @returns {number} - The width of the browser window in pixels.
     */
    getWindowWidth(){return window.innerWidth;}

    /**
     * Get the height of the browser window.
     * @returns {number} - The height of the browser window in pixels.
     */
    getWindowHeight(){return window.innerHeight - document.getElementById("navbar0").offsetHeight;}

//---------------------- Modal functions ----------------------
/**
 * Creates a customizable modal window for controls, parameters, and user interaction.
 * The modal can be dragged, styled with different themes, and populated with various UI elements.
 * 
 * @param {Object} [options={}] - Configuration options for the modal
 * @param {string} [options.title="Parameters"] - The title displayed in the modal header
 * @param {boolean} [options.draggable=true] - Whether the modal can be moved by dragging
 * @param {boolean} [options.showCloseButton=true] - Whether to show a close button in the modal
 * @param {Object} [options.position] - Initial position of the modal
 * @param {number} [options.position.right=10] - Distance from right edge as percentage
 * @param {number} [options.position.top=10] - Distance from top edge as percentage
 * @param {string} [options.width="300px"] - Width of the modal (CSS value)
 * @param {boolean} [options.visible=true] - Whether the modal is initially visible
 * @param {string} [options.id="controlPanel"] - Unique ID for the modal element
 * @param {string} [options.theme="light"] - Color theme ("light" or "dark")
 * @returns {Object} An object containing methods to interact with the modal
 */
getPermanentModal({title, draggable, showCloseButton, position, width, visible, id, theme} = {}){
    const md = new Modal(this.CTABannerParameter.Banner);
    const ModalControls = md.getPermanentModal({title:title, draggable:draggable, showCloseButton:showCloseButton, position:position, width:width, visible:visible, id:id, theme:theme});
    return {
    /**
     * Adds a button to the modal with customizable styling and behavior.
     * 
     * @param {string} text - Text displayed on the button
     * @param {Function} onClick - Function to execute when the button is clicked
     * @param {Object} [options={}] - Button styling options
     * @param {string} [options.width="80%"] - Width of the button (CSS value)
     * @param {string} [options.color="#4CAF50"] - Background color of the button
     * @param {string} [options.textColor="white"] - Text color of the button
     * @param {string} [options.hoverColor="#45a049"] - Background color when hovering
     * @returns {HTMLElement} The created button element
     */
    AddButtonToModal: (text, onClick, options = {}) => {
        ModalControls.addButton(text, onClick, options);
    },
    /**
     * Adds a slider input to the modal for selecting numeric values.
     * 
     * @param {string} label - Text label for the slider
     * @param {number} min - Minimum value of the slider
     * @param {number} max - Maximum value of the slider
     * @param {number} value - Initial value of the slider
     * @param {Function} onChange - Function called when the slider value changes
     * @param {Object} [options={}] - Additional configuration options
     * @param {number} [options.step=1] - Step increment for the slider
     * @param {Function} [options.formatValue] - Function to format the displayed value
     * @returns {Object} Object containing the slider, valueDisplay, and container elements
     */
    AddSliderToModal: (label, min, max, value, onChange, options = {}) => {
        ModalControls.addSlider(label, min, max, value, onChange, options);
    },
    /**
     * Adds a checkbox input to the modal.
     * 
     * @param {string} label - Text label for the checkbox
     * @param {boolean} checked - Initial checked state of the checkbox
     * @param {Function} onChange - Function called when the checkbox state changes
     * @returns {Object} Object containing the checkbox and container elements
     */
    AddCheckboxToModal: (label, checked, onChange) => {
        ModalControls.addCheckbox(label, checked, onChange);
    },
    /**
     * Adds a dropdown select input to the modal.
     * 
     * @param {string} label - Text label for the dropdown
     * @param {Array<Object>} options - Array of options for the dropdown
     * @param {string} options[].value - Value of each option
     * @param {string} [options[].label] - Display text for each option (defaults to value if not provided)
     * @param {string} selectedValue - Initially selected value
     * @param {Function} onChange - Function called when the selected option changes
     * @returns {Object} Object containing the select and container elements
     */
    AddDropDownToModal: (label, options, selectedValue, onChange) => {
        ModalControls.addDropDown(label, options, selectedValue, onChange);
    },
    /**
     * Adds a color picker input to the modal.
     * 
     * @param {string} label - Text label for the color picker
     * @param {string} initialColor - Initial color value in hexadecimal format (e.g., "#FF0000")
     * @param {Function} onChange - Function called when the selected color changes
     * @returns {Object} Object containing the colorPicker, valueDisplay, and container elements
     */
    AddColorPickerToModal: (label, initialColor, onChange) => {
        ModalControls.addColorPicker(label, initialColor, onChange);
    },
    /**
     * Adds a horizontal line separator to the modal.
     * 
     * @returns {HTMLElement} The created separator element
     */
    AddSeparatorToModal: () => {
        ModalControls.addSeparator();
    },
    /**
     * Adds a text label to the modal with customizable styling.
     * 
     * @param {string} text - Text content of the label
     * @param {Object} [options={}] - Styling options for the label
     * @param {string} [options.align="left"] - Text alignment ("left", "center", or "right")
     * @param {boolean} [options.bold=false] - Whether to display the text in bold
     * @param {string} [options.fontSize="inherit"] - Font size (CSS value)
     * @param {string} [options.color="inherit"] - Text color
     * @returns {HTMLElement} The created label element
     */
    AddLabelToModal: (text, options = {}) => {
        ModalControls.addLabel(text, options);
    },
    /**
     * Clears all content from the modal form container.
     */
    ClearFormModal: () => {
        md.clear();
    },
     /**
 * Toggles the collapsed state of the modal with a smooth animation.
 * When collapsed, only the header is visible; when expanded, all content is shown.
 * 
 * @returns {void}
 * @example
 * // Get a modal instance first
 * const modal = fw.getPermanentModal({title: "Settings"});
 * // Then toggle its collapsed state
 * modal.ToggleCollapseModal();
 */
ToggleCollapseModal: () => {
    ModalControls.toggleCollapse();
},

/**
 * Collapses the modal to show only the header with a smooth animation.
 * If the modal is already collapsed, this method has no effect.
 * 
 * @returns {void}
 * @example
 * // Get a modal instance first
 * const modal = fw.getPermanentModal({title: "Settings"});
 * // Then collapse it
 * modal.CollapseModal();
 */
CollapseModal: () => {
    ModalControls.collapse();
},

/**
 * Expands the modal to show all content with a smooth animation.
 * If the modal is already expanded, this method has no effect.
 * 
 * @returns {void}
 * @example
 * // Get a modal instance first
 * const modal = fw.getPermanentModal({title: "Settings"});
 * // Then expand it
 * modal.ExpandModal();
 */
ExpandModal: () => {
    ModalControls.expand();
}
}
}
// ---------------------- Private functions ----------------------

    /**
     * Private function to initialize the scene, camera and renderer.
     * @returns {Object} - Returns an object containing the scene, camera and renderer.
     */
    #init(){
        console.log('init');
        const scene = new THREE.Scene();
        window.scene = scene;
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(this.getWindowWidth(), this.getWindowHeight());
        document.body.appendChild(renderer.domElement);

        camera.position.z = 60;
        camera.position.y = 50;
        const cameraOrbital = new OrbitControls(camera, renderer.domElement);
        cameraOrbital.update();

        this.window = window;

        return {"scene": scene, "camera": camera, "renderer": renderer};

    }

    /**
     * Private function to resize the renderer and camera when the browser window is resized.
     * @param {*} renderer the renderer responsible for rendering the scene.
     * @param {*} window the browser window containing the Three.js canvas.
     * @param {*} camera the camera used to view the scene, typically a PerspectiveCamera.
     */
    #resize(renderer, window, camera){
        console.log('resize');
        renderer.setSize(window.innerWidth, window.innerHeight - document.getElementById("navbar0").offsetHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        let navbar = document.getElementById('navbar0');
        navbar = navbar.style.width = window.innerWidth + 'px';
        camera.updateProjectionMatrix();
    }

    /**
     * Private function to check if an object is fully occluded by other objects in the scene.
     * @param {*} object  The object to check for occlusion.
     * @param {*} camera  The camera position, from which the raycasting will start.
     * @param {*} cameraDistanceThreshold  The maximum distance at which to check for occlusion.
     * @param {*} raycaster  The raycaster used for detecting intersections between objects.
     * @param {*} direction  A reusable vector to specify the direction of the raycasting.
     * @returns {boolean} - Returns true if the object is fully occluded, false otherwise.
     */
    #isObjectFullyOccluded(object, camera, cameraDistanceThreshold, raycaster, direction) {
        const scene = window.scene;
        if (camera.position.distanceTo(object.position) > cameraDistanceThreshold) {
            return true;
        }

        const boundingBox = new THREE.Box3().setFromObject(object);
        const pointsToCheck = [
            boundingBox.getCenter(new THREE.Vector3()),  // Center point
            boundingBox.min,                             // Minimum corner
            boundingBox.max,                             // Maximum corner
        ];
        
        for (let point of pointsToCheck) {
            direction.subVectors(point, camera.position).normalize();
            raycaster.set(camera.position, direction);
            const intersects = raycaster.intersectObjects(scene.children, true);

            if (intersects.length > 0 && intersects[0].object === object) {
                return false;
            }
        }

        return true;  // All points are occluded
    }

}

export default Framework;