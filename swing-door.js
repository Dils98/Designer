// Swing Door Model for Elevator Designer
function createSwingDoor(params = {}) {
    const {
        width = 2,
        height = 3,
        type = 'single'
    } = params;

    let doorGroup = new THREE.Group();
    let frameGroup = new THREE.Group();

    // Define materials
    const roughMetalMaterial = new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 1,
        roughness: 0.5
    });

    const handleMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x222222, 
        metalness: 0.8, 
        roughness: 0.3 
    });

    const frameMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x333333 
    });

    // Helper function to add door handle
    function addDoorHandle(door, side, height) {
        const handle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.02, 0.02, 0.15, 16), 
            handleMaterial
        );
        handle.rotation.z = Math.PI / 2;
        const xOffset = side === 'left' ? 0.05 : -0.05;
        handle.position.set(xOffset, height / 2, 0.06);
        door.add(handle);
    }

    // Create the door based on type
    function buildDoor(type, width, height) {
        doorGroup = new THREE.Group();
        frameGroup = new THREE.Group();
        
        const depth = 0.1;
        const doorMaterial = roughMetalMaterial;
        
        const frameThickness = 0.1;
        const frameDepth = 0.15;

        // Frame parts (fixed)
        const topFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth), 
            frameMaterial
        );
        topFrame.position.set(0, height + frameThickness / 2, 0);

        const bottomFrame = new THREE.Mesh(
            new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, frameDepth), 
            frameMaterial
        );
        bottomFrame.position.set(0, -frameThickness / 2, 0);

        const leftFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth), 
            frameMaterial
        );
        leftFrame.position.set(-width / 2 - frameThickness / 2, height / 2, 0);

        const rightFrame = new THREE.Mesh(
            new THREE.BoxGeometry(frameThickness, height, frameDepth), 
            frameMaterial
        );
        rightFrame.position.set(width / 2 + frameThickness / 2, height / 2, 0);

        frameGroup.add(topFrame, bottomFrame, leftFrame, rightFrame);

        if (type === 'single') {
            const geometry = new THREE.BoxGeometry(width, height, depth);
            const door = new THREE.Mesh(geometry, doorMaterial);
            addDoorHandle(door, 'left', height);
            const pivot = new THREE.Group();
            door.position.set(width / 2, height / 2, 0);
            pivot.position.set(-width / 2, 0, 0);
            pivot.add(door);
            doorGroup.add(pivot);
            doorGroup.userData = { pivot, width, single: true };
        } else {
            const halfWidth = width / 2;

            const geoLeft = new THREE.BoxGeometry(halfWidth, height, depth);
            const left = new THREE.Mesh(geoLeft, doorMaterial);
            addDoorHandle(left, 'left', height);
            const leftGroup = new THREE.Group();
            left.position.set(halfWidth / 2, height / 2, 0);
            leftGroup.add(left);
            leftGroup.position.set(-width / 2, 0, 0);

            const geoRight = new THREE.BoxGeometry(halfWidth, height, depth);
            const right = new THREE.Mesh(geoRight, doorMaterial);
            addDoorHandle(right, 'right', height);
            const rightGroup = new THREE.Group();
            right.position.set(-halfWidth / 2, height / 2, 0);
            rightGroup.add(right);
            rightGroup.position.set(width / 2, 0, 0);

            doorGroup.add(leftGroup);
            doorGroup.add(rightGroup);
            doorGroup.userData = { leftGroup, rightGroup, width, single: false };
        }

        return { doorGroup, frameGroup };
    }

    // Build initial door
    const { doorGroup: initialDoorGroup, frameGroup: initialFrameGroup } = buildDoor(type, width, height);
    doorGroup = initialDoorGroup;
    frameGroup = initialFrameGroup;

    // Add animation functionality
    let isOpen = false;
    let animationFrame = null;

    doorGroup.toggle = function() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        isOpen = !isOpen;
        const speed = 0.02;
        let t = 0;
        
        const animate = () => {
            if (t < 1) {
                t += speed;
                if (doorGroup.userData.single) {
                    doorGroup.userData.pivot.rotation.y = isOpen ? -Math.PI / 2 * t : -Math.PI / 2 * (1 - t);
                } else {
                    doorGroup.userData.leftGroup.rotation.y = isOpen ? Math.PI / 2 * t : Math.PI / 2 * (1 - t);
                    doorGroup.userData.rightGroup.rotation.y = isOpen ? -Math.PI / 2 * t : -Math.PI / 2 * (1 - t);
                }
                animationFrame = requestAnimationFrame(animate);
            }
        };
        
        animate();
    };
    
    doorGroup.isOpen = function() {
        return isOpen;
    };

    doorGroup.updateDimensions = function(newParams) {
        const updatedType = newParams.type || type;
        const updatedWidth = newParams.width || width;
        const updatedHeight = newParams.height || height;
        
        // Remove old door and frame
        while(doorGroup.children.length > 0) {
            const child = doorGroup.children[0];
            doorGroup.remove(child);
        }
        
        while(frameGroup.children.length > 0) {
            const child = frameGroup.children[0];
            frameGroup.remove(child);
        }
        
        // Build new door with updated dimensions
        const { doorGroup: newDoorGroup, frameGroup: newFrameGroup } = buildDoor(updatedType, updatedWidth, updatedHeight);
        
        // Copy children to the current groups
        newDoorGroup.children.forEach(child => {
            doorGroup.add(child.clone());
        });
        
        newFrameGroup.children.forEach(child => {
            frameGroup.add(child.clone());
        });
        
        // Copy userData
        doorGroup.userData = newDoorGroup.userData;
    };

    // Include frameGroup as part of the returned object
    const doorComplete = new THREE.Group();
    doorComplete.add(doorGroup);
    doorComplete.add(frameGroup);

    // Pass through functionality
    doorComplete.toggle = doorGroup.toggle;
    doorComplete.isOpen = doorGroup.isOpen;
    doorComplete.updateDimensions = doorGroup.updateDimensions;
    doorComplete.doorGroup = doorGroup;
    doorComplete.frameGroup = frameGroup;

    return doorComplete;
} 