// Roller Gate Model
function createRollerGate(params = {}) {
    const {
        width = 6,
        height = 10
    } = params;

    const doorGroup = new THREE.Group();
    const panelCount = 20;
    const basePanelHeight = 0.5;
    const panelHeight = (height / panelCount) * (basePanelHeight / (10 / panelCount)); // Scale panel height based on total height
    
    // Calculate scaling factors
    const widthScale = width / 6; // Original width is 6
    const heightScale = height / 10; // Original height is 10

    // Shaft Box
    const shaftBox = new THREE.Mesh(
        new THREE.BoxGeometry(width, 1 * heightScale, 1 * widthScale),
        new THREE.MeshStandardMaterial({ color: 0x444444 })
    );
    shaftBox.position.set(0, height + (0.5 * heightScale), 0);
    doorGroup.add(shaftBox);

    // Side Guides
    const guideMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
    const guideHeight = height;
    const guideL = new THREE.Mesh(
        new THREE.BoxGeometry(0.3 * widthScale, guideHeight, 0.3 * widthScale), 
        guideMaterial
    );
    const guideR = new THREE.Mesh(
        new THREE.BoxGeometry(0.3 * widthScale, guideHeight, 0.3 * widthScale), 
        guideMaterial
    );
    guideL.position.set(-width/2 - (0.1 * widthScale), guideHeight / 2, 0);
    guideR.position.set(width/2 + (0.1 * widthScale), guideHeight / 2, 0);
    doorGroup.add(guideL, guideR);

    // Shutter Panels with realistic material and separation
    const shutterPanels = [];
    const textureLoader = new THREE.TextureLoader();
    const shutterTexture = textureLoader.load('https://i.imgur.com/w91T8Rs.jpg');
    const panelMaterial = new THREE.MeshStandardMaterial({ map: shutterTexture });

    for (let i = 0; i < panelCount; i++) {
        const panel = new THREE.Mesh(
            new THREE.BoxGeometry(width, panelHeight - (0.05 * heightScale), 0.1 * widthScale),
            panelMaterial
        );
        panel.position.set(0, i * panelHeight + (0.5 * heightScale), 0);
        doorGroup.add(panel);
        shutterPanels.push(panel);
    }

    // Add door functionality
    doorGroup.isOpen = false;
    let animationFrame = null;
    
    doorGroup.toggle = function() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        this.isOpen = !this.isOpen;
        animateGate();
    };
    
    function animateGate() {
        let speed = 0.1;
        let allDone = true;
        for (let i = 0; i < shutterPanels.length; i++) {
            let panel = shutterPanels[i];
            let targetY = doorGroup.isOpen ? height + (1 * heightScale) : i * panelHeight + (0.5 * heightScale);
            if (Math.abs(panel.position.y - targetY) > 0.02) {
                panel.position.y += (targetY - panel.position.y) * speed;
                allDone = false;
            }
        }
        if (!allDone) {
            animationFrame = requestAnimationFrame(animateGate);
        }
    }

    return doorGroup;
}

