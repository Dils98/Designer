// Horizontal Beams Functions

// Create horizontal beams that connect columns at regular intervals
function createHorizontalBeams(width, depth, height, sections, beamType, columnCount, columnType, offset) {
    // Clear existing beams
    horizontalBeams.forEach(beam => elevatorGroup.remove(beam));
    horizontalBeams = [];
    
    // Get column position adjustments
    const columnXPosition = parseInt(document.getElementById('columnXPosition').value) * 0.001;
    const columnZPosition = parseInt(document.getElementById('columnZPosition').value) * 0.001;
    
    // Get beam dimensions based on type
    let beamWidth, beamHeight, thickness;
    switch(beamType) {
        case 'rectTube50x30':
            beamWidth = 0.05;
            beamHeight = 0.03;
            thickness = 0.003175;
            break;
        case 'rectTube80x40':
            beamWidth = 0.08;
            beamHeight = 0.04;
            thickness = 0.003175;
            break;
        case 'rectTube100x50':
            beamWidth = 0.1;
            beamHeight = 0.05;
            thickness = 0.00635;
            break;
    }
    
    // Get column dimensions based on type
    let columnWidth, columnDepth;
    switch(columnType) {
        case 'hbeam100':
            columnWidth = 0.1;
            columnDepth = 0.1;
            break;
        case 'hbeam200':
            columnWidth = 0.2;
            columnDepth = 0.2;
            break;
        case 'hbeam300':
            columnWidth = 0.3;
            columnDepth = 0.3;
            break;
        case 'rectTube100x50':
            columnWidth = 0.1;   // Wider dimension
            columnDepth = 0.05;  // Narrower dimension
            break;
        case 'rectTube150x75':
            columnWidth = 0.15;  // Wider dimension
            columnDepth = 0.075; // Narrower dimension
            break;
        case 'cChannel80':
            columnWidth = 0.08;
            columnDepth = 0.04;
            break;
        case 'cChannel100':
            columnWidth = 0.1;
            columnDepth = 0.05;
            break;
        case 'cChannel150':
            columnWidth = 0.15;
            columnDepth = 0.075;
            break;
        case 'lAngle50x50':
            columnWidth = 0.05;
            columnDepth = 0.05;
            break;
        case 'lAngle75x75':
            columnWidth = 0.075;
            columnDepth = 0.075;
            break;
        case 'lAngle100x100':
            columnWidth = 0.1;
            columnDepth = 0.1;
            break;
        default:
            columnWidth = 0.1;
            columnDepth = 0.1;
    }
    
    // Calculate positions for horizontal beams
    const sectionHeight = height / (sections + 1);
    
    // Create an array to store corner positions of horizontal beams
    window.beamCorners = [];
    
    for (let i = 1; i <= sections; i++) {
        const yPos = sectionHeight * i;
        const levelCorners = {}; // Store corners for this level
        
        if (columnCount === 4) {
            // Calculate the actual positions where beams should connect to columns
            // Apply the column position adjustments to get correct positions
            const xOffset = width/2 + offset;
            const zOffset = depth/2 + offset;
            
            // Apply the position adjustment for corner positions
            const frontLeftX = -xOffset + columnXPosition;
            const frontLeftZ = zOffset - columnZPosition;
            
            const frontRightX = xOffset - columnXPosition;
            const frontRightZ = zOffset - columnZPosition;
            
            const backLeftX = -xOffset + columnXPosition;
            const backLeftZ = -zOffset + columnZPosition;
            
            const backRightX = xOffset - columnXPosition;
            const backRightZ = -zOffset + columnZPosition;
            
            // Store corner positions for this level with adjustments
            levelCorners.rightFront = new THREE.Vector3(frontRightX, yPos, frontRightZ);
            levelCorners.rightBack = new THREE.Vector3(backRightX, yPos, backRightZ);
            levelCorners.leftFront = new THREE.Vector3(frontLeftX, yPos, frontLeftZ);
            levelCorners.leftBack = new THREE.Vector3(backLeftX, yPos, backLeftZ);
            
            // Calculate beam lengths - these are now dynamic based on adjusted positions
            const frontBeamLength = Math.abs(frontRightX - frontLeftX);
            const backBeamLength = Math.abs(backRightX - backLeftX);
            const leftBeamLength = Math.abs(frontLeftZ - backLeftZ);
            const rightBeamLength = Math.abs(frontRightZ - backRightZ);
            
            // Front beam (between front-left and front-right columns)
            const frontBeam = createRectangularTubeBeam(
                frontBeamLength, 
                beamWidth, 
                beamHeight, 
                thickness
            );
            
            // Position at midpoint between adjusted front columns
            const frontMidX = (frontLeftX + frontRightX) / 2;
            frontBeam.position.set(frontMidX, yPos, frontLeftZ + columnDepth/2);
            frontBeam.rotation.y = Math.PI/2;
            frontBeam.rotation.x = Math.PI/2;
            
            elevatorGroup.add(frontBeam);
            horizontalBeams.push(frontBeam);
            
            // Back beam (between back-left and back-right columns)
            const backBeam = createRectangularTubeBeam(
                backBeamLength, 
                beamWidth, 
                beamHeight, 
                thickness
            );
            
            // Position at midpoint between adjusted back columns
            const backMidX = (backLeftX + backRightX) / 2;
            backBeam.position.set(backMidX, yPos, backLeftZ - columnDepth/2);
            backBeam.rotation.y = Math.PI/2;
            backBeam.rotation.x = Math.PI/2;
            
            elevatorGroup.add(backBeam);
            horizontalBeams.push(backBeam);
            
            // Left beam (between front-left and back-left columns)
            const leftBeam = createRectangularTubeBeam(
                leftBeamLength, 
                beamWidth, 
                beamHeight, 
                thickness
            );
            
            // Position at midpoint between adjusted left columns
            const leftMidZ = (frontLeftZ + backLeftZ) / 2;
            leftBeam.position.set(frontLeftX - columnWidth/2, yPos, leftMidZ);
            leftBeam.rotation.y = 0;
            leftBeam.rotation.z = Math.PI/2;
            
            elevatorGroup.add(leftBeam);
            horizontalBeams.push(leftBeam);
            
            // Right beam (between front-right and back-right columns)
            const rightBeam = createRectangularTubeBeam(
                rightBeamLength, 
                beamWidth, 
                beamHeight, 
                thickness
            );
            
            // Position at midpoint between adjusted right columns
            const rightMidZ = (frontRightZ + backRightZ) / 2;
            rightBeam.position.set(frontRightX + columnWidth/2, yPos, rightMidZ);
            rightBeam.rotation.y = 0;
            rightBeam.rotation.z = Math.PI/2;
            
            elevatorGroup.add(rightBeam);
            horizontalBeams.push(rightBeam);
            
            // Visualize the corner markers (for debugging)
            if (false) { // Set to true to see markers
                const markerGeometry = new THREE.SphereGeometry(0.05, 16, 16); // Made larger and more detailed
                const markerMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
                
                // Create markers at the exact corner positions
                Object.entries(levelCorners).forEach(([key, pos]) => {
                    const marker = new THREE.Mesh(markerGeometry, markerMaterial);
                    marker.position.copy(pos);
                    marker.name = `Marker-${i}-${key}`; // Name for debugging
                    elevatorGroup.add(marker);
                });
            }
            
            // Add this level's corners to the global array
            window.beamCorners.push(levelCorners);
            
        } else if (columnCount === 2) {
            // For front/back columns, connect them with a single beam
            // Apply the column position adjustments
            const frontZ = depth/2 + offset - columnZPosition;
            const backZ = -depth/2 - offset + columnZPosition;
            const beamLength = Math.abs(frontZ - backZ);
            
            const beam = createRectangularTubeBeam(
                beamLength, 
                beamWidth, 
                beamHeight, 
                thickness
            );
            
            if (columnType.includes('cChannel')) {
                // For C-channels, position beam at the open side
                beam.position.set(columnXPosition, yPos, frontZ + columnDepth/2);
                // Rotate 90 degrees to have wider side facing columns
                beam.rotation.x = Math.PI/2;
                elevatorGroup.add(beam);
                horizontalBeams.push(beam);
                
                const backBeam = createRectangularTubeBeam(
                    beamLength, 
                    beamWidth, 
                    beamHeight, 
                    thickness
                );
                backBeam.position.set(columnXPosition, yPos, backZ - columnDepth/2);
                // Rotate 90 degrees to have wider side facing columns
                backBeam.rotation.x = Math.PI/2;
                elevatorGroup.add(backBeam);
                horizontalBeams.push(backBeam);
            } else {
                // For other types, position beam in the middle
                beam.position.set(columnXPosition, yPos, (frontZ + backZ) / 2);
                // Rotate 90 degrees to have wider side facing columns
                beam.rotation.x = Math.PI/2;
                elevatorGroup.add(beam);
                horizontalBeams.push(beam);
            }
            
            // Store corner positions for this level with adjustments
            // These are needed for diagonal supports even in 2-column case
            levelCorners.rightFront = new THREE.Vector3(columnXPosition, yPos, frontZ);
            levelCorners.rightBack = new THREE.Vector3(columnXPosition, yPos, backZ);
            levelCorners.leftFront = new THREE.Vector3(columnXPosition, yPos, frontZ);
            levelCorners.leftBack = new THREE.Vector3(columnXPosition, yPos, backZ);
            
            // Add this level's corners to the global array
            window.beamCorners.push(levelCorners);
        }
        // For single column, no horizontal beams are needed
    }
}

// Create a rectangular tube beam
function createRectangularTubeBeam(length, width, height, thickness) {
    const group = new THREE.Group();
    const material = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        metalness: 0.7,
        roughness: 0.3
    });

    // Note: Width is the wider dimension, height is the narrower dimension
    // When creating beams, we want width to be horizontal and height to be vertical
    // This orientation is important for the rotations applied later
    
    // Create outer box with the exact specified length
    const outerGeometry = new THREE.BoxGeometry(width, height, length);
    const outerMesh = new THREE.Mesh(outerGeometry, material);
    
    // Create inner box (for hollow section) with matching length
    const innerWidth = width - thickness * 2;
    const innerHeight = height - thickness * 2;
    const innerGeometry = new THREE.BoxGeometry(innerWidth, innerHeight, length + 0.01);
    const innerMesh = new THREE.Mesh(innerGeometry, material);
    innerMesh.position.z = 0; // Adjusted to center perfectly
    
    // Create hollow tube by combining outer and inner
    const tube = new THREE.Group();
    tube.add(outerMesh);
    tube.add(innerMesh);
    
    group.add(tube);
    return group;
}

// Create diagonal supports between horizontal beams
function createDiagonalSupports(width, depth, height, sections, columnCount, columnType) {
    // Clear existing diagonal supports
    diagonalSupports.forEach(support => elevatorGroup.remove(support));
    diagonalSupports = [];
    
    // Initialize storage for corner distances
    window.cornerDistances = {};
    
    // Get beam dimensions based on type
    let beamWidth, beamHeight, thickness;
    switch(document.getElementById('horizontalBeamType').value) {
        case 'rectTube50x30':
            beamWidth = 0.05;
            beamHeight = 0.03;
            thickness = 0.003175;
            break;
        case 'rectTube80x40':
            beamWidth = 0.08;
            beamHeight = 0.04;
            thickness = 0.003175;
            break;
        case 'rectTube100x50':
            beamWidth = 0.1;
            beamHeight = 0.05;
            thickness = 0.00635;
            break;
    }
    
    // For 4 columns, create full diagonal supports
    if (columnCount === 4 && sections > 1 && window.beamCorners && window.beamCorners.length >= 2) {
        // Create side diagonal supports (left and right faces)
        createSideDiagonalSupports(sections, beamWidth, beamHeight, thickness);
        
        // Create front and back diagonal supports
        createFrontBackDiagonalSupports(sections, beamWidth, beamHeight, thickness);
    } 
    // For 2 columns, create only front-back diagonal supports
    else if (columnCount === 2 && sections > 1 && window.beamCorners && window.beamCorners.length >= 2) {
        // Create simpler diagonal supports for 2-column case
        createTwoColumnDiagonalSupports(sections, beamWidth, beamHeight, thickness);
    }
}

// Create diagonal supports for 2-column layout
function createTwoColumnDiagonalSupports(sections, beamWidth, beamHeight, thickness) {
    // Create diagonal supports using the stored corner positions
    for (let i = 1; i < sections; i++) {
        const lowerCorners = window.beamCorners[i-1];
        const upperCorners = window.beamCorners[i];
        
        if (!lowerCorners || !upperCorners) continue; // Skip if any corners are missing
        
        const isEvenSection = i % 2 === 0;
        
        // Calculate and store corner-to-corner distances
        const diagonalDistance = lowerCorners.rightFront.distanceTo(upperCorners.rightBack);
        window.cornerDistances[`section${i}_diagonal`] = diagonalDistance;
        
        // Update the display with the diagonal distance
        document.getElementById('cornerDistanceValue').textContent = Math.round(diagonalDistance * 1000);
        
        // Create zigzag pattern of diagonal supports
        if (isEvenSection) {
            // Front to back (top to bottom)
            createAndAddDiagonalBeam(
                lowerCorners.rightFront, 
                upperCorners.rightBack, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        } else {
            // Back to front (top to bottom)
            createAndAddDiagonalBeam(
                lowerCorners.rightBack, 
                upperCorners.rightFront, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        }
    }
}

// Create diagonal supports on the left and right sides
function createSideDiagonalSupports(sections, beamWidth, beamHeight, thickness) {
    // Create diagonal supports using the stored corner positions
    for (let i = 1; i < sections; i++) {
        const lowerCorners = window.beamCorners[i-1];
        const upperCorners = window.beamCorners[i];
        
        if (!lowerCorners || !upperCorners) continue; // Skip if any corners are missing
        
        const isEvenSection = i % 2 === 0;
        
        // Calculate and store corner-to-corner distances
        let rightDistance, leftDistance;
        
        if (isEvenSection) {
            rightDistance = lowerCorners.rightFront.distanceTo(upperCorners.rightBack);
            leftDistance = lowerCorners.leftBack.distanceTo(upperCorners.leftFront);
            window.cornerDistances[`section${i}_right`] = rightDistance;
            window.cornerDistances[`section${i}_left`] = leftDistance;
        } else {
            rightDistance = lowerCorners.rightBack.distanceTo(upperCorners.rightFront);
            leftDistance = lowerCorners.leftFront.distanceTo(upperCorners.leftBack);
            window.cornerDistances[`section${i}_right`] = rightDistance;
            window.cornerDistances[`section${i}_left`] = leftDistance;
        }
        
        // Update the display with the most recent corner distance
        document.getElementById('cornerDistanceValue').textContent = 
            Math.round(Math.max(rightDistance, leftDistance) * 1000);
        
        // Debug markers for diagonal endpoints with a different color
        if (false) { // Set to true to see connection points
            const connectionMarkerGeometry = new THREE.SphereGeometry(0.07, 16, 16);
            const connectionMarkerMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});
            
            const createConnectionMarker = (pos, name) => {
                const marker = new THREE.Mesh(connectionMarkerGeometry, connectionMarkerMaterial);
                marker.position.copy(pos);
                marker.name = name;
                elevatorGroup.add(marker);
            };
            
            if (isEvenSection) {
                createConnectionMarker(lowerCorners.rightFront, `DiagConnection-${i}-RightStart`);
                createConnectionMarker(upperCorners.rightBack, `DiagConnection-${i}-RightEnd`);
                createConnectionMarker(lowerCorners.leftBack, `DiagConnection-${i}-LeftStart`);
                createConnectionMarker(upperCorners.leftFront, `DiagConnection-${i}-LeftEnd`);
            } else {
                createConnectionMarker(lowerCorners.rightBack, `DiagConnection-${i}-RightStart`);
                createConnectionMarker(upperCorners.rightFront, `DiagConnection-${i}-RightEnd`);
                createConnectionMarker(lowerCorners.leftFront, `DiagConnection-${i}-LeftStart`);
                createConnectionMarker(upperCorners.leftBack, `DiagConnection-${i}-LeftEnd`);
            }
        }
        
        if (isEvenSection) {
            // Right face diagonal from bottom front to top back
            createAndAddDiagonalBeam(
                lowerCorners.rightFront, 
                upperCorners.rightBack, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
            
            // Left face diagonal from bottom back to top front
            createAndAddDiagonalBeam(
                lowerCorners.leftBack, 
                upperCorners.leftFront, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        } else {
            // Right face diagonal from bottom back to top front
            createAndAddDiagonalBeam(
                lowerCorners.rightBack, 
                upperCorners.rightFront, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
            
            // Left face diagonal from bottom front to top back
            createAndAddDiagonalBeam(
                lowerCorners.leftFront, 
                upperCorners.leftBack, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        }
    }
}

// Create diagonal supports on the front and back faces
function createFrontBackDiagonalSupports(sections, beamWidth, beamHeight, thickness) {
    // Create diagonal supports for front and back
    for (let i = 1; i < sections; i++) {
        const lowerCorners = window.beamCorners[i-1];
        const upperCorners = window.beamCorners[i];
        
        if (!lowerCorners || !upperCorners) continue; // Skip if any corners are missing
        
        const isEvenSection = i % 2 === 0;
        
        // Calculate and store front/back corner-to-corner distances
        let frontDistance, backDistance;
        
        if (isEvenSection) {
            // Reversed from original - now right to left for even sections
            frontDistance = lowerCorners.rightFront.distanceTo(upperCorners.leftFront);
            backDistance = lowerCorners.leftBack.distanceTo(upperCorners.rightBack);
            window.cornerDistances[`section${i}_front`] = frontDistance;
            window.cornerDistances[`section${i}_back`] = backDistance;
        } else {
            // Reversed from original - now left to right for odd sections
            frontDistance = lowerCorners.leftFront.distanceTo(upperCorners.rightFront);
            backDistance = lowerCorners.rightBack.distanceTo(upperCorners.leftBack);
            window.cornerDistances[`section${i}_front`] = frontDistance;
            window.cornerDistances[`section${i}_back`] = backDistance;
        }
        
        // Debug markers for front/back diagonal endpoints
        if (false) { // Set to true to see connection points
            const connectionMarkerGeometry = new THREE.SphereGeometry(0.07, 16, 16);
            const connectionMarkerMaterial = new THREE.MeshBasicMaterial({color: 0x0000ff}); // Blue markers for front/back
            
            const createConnectionMarker = (pos, name) => {
                const marker = new THREE.Mesh(connectionMarkerGeometry, connectionMarkerMaterial);
                marker.position.copy(pos);
                marker.name = name;
                elevatorGroup.add(marker);
            };
            
            if (isEvenSection) {
                // Markers for reversed pattern - right to left for even
                createConnectionMarker(lowerCorners.rightFront, `DiagConnection-${i}-FrontStart`);
                createConnectionMarker(upperCorners.leftFront, `DiagConnection-${i}-FrontEnd`);
                createConnectionMarker(lowerCorners.leftBack, `DiagConnection-${i}-BackStart`);
                createConnectionMarker(upperCorners.rightBack, `DiagConnection-${i}-BackEnd`);
            } else {
                // Markers for reversed pattern - left to right for odd
                createConnectionMarker(lowerCorners.leftFront, `DiagConnection-${i}-FrontStart`);
                createConnectionMarker(upperCorners.rightFront, `DiagConnection-${i}-FrontEnd`);
                createConnectionMarker(lowerCorners.rightBack, `DiagConnection-${i}-BackStart`);
                createConnectionMarker(upperCorners.leftBack, `DiagConnection-${i}-BackEnd`);
            }
        }
        
        if (isEvenSection) {
            // REVERSED: Front face diagonal from bottom right to top left
            createAndAddDiagonalBeam(
                lowerCorners.rightFront, 
                upperCorners.leftFront, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
            
            // REVERSED: Back face diagonal from bottom left to top right
            createAndAddDiagonalBeam(
                lowerCorners.leftBack, 
                upperCorners.rightBack, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        } else {
            // REVERSED: Front face diagonal from bottom left to top right
            createAndAddDiagonalBeam(
                lowerCorners.leftFront, 
                upperCorners.rightFront, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
            
            // REVERSED: Back face diagonal from bottom right to top left
            createAndAddDiagonalBeam(
                lowerCorners.rightBack, 
                upperCorners.leftBack, 
                beamWidth, beamHeight, thickness,
                elevatorGroup, diagonalSupports
            );
        }
    }
}

// Helper function to create and add a diagonal beam
function createAndAddDiagonalBeam(start, end, width, height, thickness, group, collection) {
    const beam = createExactDiagonalBeam(start.clone(), end.clone(), width, height, thickness);
    group.add(beam);
    collection.push(beam);
    return beam;
}

// Create a diagonal beam between two exact points
function createExactDiagonalBeam(start, end, width, height, thickness) {
    // Calculate the exact distance between the two points
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    
    // Create the beam with exact dimensions
    const beam = new THREE.Group();
    
    // Create beam material
    const material = new THREE.MeshStandardMaterial({
        color: 0x3498db,
        metalness: 0.7,
        roughness: 0.3
    });
    
    // Create a basic tube geometry - we'll rotate and position it correctly
    const tubeGeometry = new THREE.BoxGeometry(width, height, length);
    const tubeMesh = new THREE.Mesh(tubeGeometry, material);
    
    // Create inner hollow part
    const innerWidth = width - thickness * 2;
    const innerHeight = height - thickness * 2;
    const innerGeometry = new THREE.BoxGeometry(innerWidth, innerHeight, length + 0.01);
    const innerMesh = new THREE.Mesh(innerGeometry, material);
    innerMesh.material.side = THREE.BackSide; // Make inner side visible
    
    // Group the tube parts
    const tube = new THREE.Group();
    tube.add(tubeMesh);
    tube.add(innerMesh);
    beam.add(tube);
    
    // Calculate the center point between start and end
    const center = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
    
    // Position at center point
    beam.position.copy(center);
    
    // Orient along the direction
    direction.normalize();
    
    // Use quaternion to orient the beam along the direction vector
    // First, create a starting direction (along Z-axis for BoxGeometry)
    const startDirection = new THREE.Vector3(0, 0, 1);
    
    // Then determine rotation quaternion from start direction to target direction
    const quaternion = new THREE.Quaternion();
    quaternion.setFromUnitVectors(startDirection, direction);
    
    // Apply the rotation
    beam.setRotationFromQuaternion(quaternion);
    
    // Rotate the beam 90 degrees around its own axis to match the horizontal beams
    // This ensures the wider side faces the columns
    const axisRotation = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1), // Local Z axis (along beam length)
        Math.PI/2 // 90 degrees
    );
    beam.quaternion.multiply(axisRotation);
    
    return beam;
} 