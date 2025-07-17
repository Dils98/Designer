// Function to export operation as video
async function exportOperationVideo() {
    try {
        // First check if MediaRecorder is available
        if (!window.MediaRecorder) {
            alert('Your browser does not support video recording. Please try using Chrome or Firefox.');
            return;
        }
        
        // Create a modal with recording controls
        const modal = document.createElement('div');
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0,0,0,0.7)';
        modal.style.zIndex = '9999';
        modal.style.display = 'flex';
        modal.style.flexDirection = 'column';
        modal.style.justifyContent = 'center';
        modal.style.alignItems = 'center';
        
        const messageBox = document.createElement('div');
        messageBox.style.backgroundColor = 'white';
        messageBox.style.padding = '20px';
        messageBox.style.borderRadius = '8px';
        messageBox.style.maxWidth = '400px';
        messageBox.style.textAlign = 'center';
        messageBox.innerHTML = `
            <h3 style="margin-top: 0; color: #2c7be5;">Operation Video Export</h3>
            <p>Please select your preferred view before starting the recording.</p>
            <div style="display: flex; justify-content: space-around; margin-bottom: 15px;">
                <button id="setTopView" class="view-btn">Top View</button>
                <button id="setFrontView" class="view-btn">Front View</button>
                <button id="setSideView" class="view-btn">Side View</button>
                <button id="setIsoView" class="view-btn">3D View</button>
            </div>
            <div style="margin: 15px 0; text-align: left;">
                <p style="margin-bottom: 5px; font-weight: bold;">Video Quality:</p>
                <div style="display: flex; gap: 10px;">
                    <label style="display: flex; align-items: center;">
                        <input type="radio" name="videoQuality" value="standard" checked> 
                        <span style="margin-left: 5px;">Standard</span>
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="radio" name="videoQuality" value="hd"> 
                        <span style="margin-left: 5px;">HD</span>
                    </label>
                    <label style="display: flex; align-items: center;">
                        <input type="radio" name="videoQuality" value="fullhd"> 
                        <span style="margin-left: 5px;">Full HD</span>
                    </label>
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #666;">
                    <span>Note: Higher quality may reduce performance during recording</span>
                </div>
            </div>
            <p>Current status: <span id="recordingStatus">Ready to record</span></p>
            <div style="margin-top: 15px;">
                <button id="startRecordingBtn" style="background-color: #2c7be5; color: white; padding: 10px 15px; border: none; border-radius: 4px; margin-right: 10px;">Start Recording</button>
                <button id="stopRecordingBtn" style="background-color: #e53935; color: white; padding: 10px 15px; border: none; border-radius: 4px; display: none;">Stop Recording</button>
                <button id="cancelRecordingBtn" style="background-color: #777; color: white; padding: 10px 15px; border: none; border-radius: 4px; margin-left: 10px;">Cancel</button>
            </div>
        `;
        
        // Add some styling for view buttons
        const style = document.createElement('style');
        style.textContent = `
            .view-btn {
                background-color: #f0f0f0;
                border: 1px solid #ddd;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
            }
            .view-btn:hover {
                background-color: #e0e0e0;
            }
            .view-btn.active {
                background-color: #2c7be5;
                color: white;
            }
        `;
        document.head.appendChild(style);
        
        modal.appendChild(messageBox);
        document.body.appendChild(modal);
        
        // Variables for recording
        let mediaRecorder;
        let recordedChunks = [];
        let canvasStream;
        let hdCanvas;
        let hdContext;
        let hdStream;
        
        // Update view button states
        function updateViewButtons() {
            document.querySelectorAll('.view-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            const activeViewBtn = document.getElementById(`set${currentView.charAt(0).toUpperCase() + currentView.slice(1)}View`);
            if (activeViewBtn) {
                activeViewBtn.classList.add('active');
            }
        }
        
        // Set up event listeners for view selection
        document.getElementById('setTopView').addEventListener('click', () => {
            currentView = 'top';
            updateView();
            updateViewButtons();
        });
        
        document.getElementById('setFrontView').addEventListener('click', () => {
            currentView = 'front';
            updateView();
            updateViewButtons();
        });
        
        document.getElementById('setSideView').addEventListener('click', () => {
            currentView = 'side';
            updateView();
            updateViewButtons();
        });
        
        document.getElementById('setIsoView').addEventListener('click', () => {
            currentView = 'iso';
            updateView();
            updateViewButtons();
        });
        
        // Initialize active view
        updateViewButtons();
        
        // Cancel button
        document.getElementById('cancelRecordingBtn').addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
            }
            
            if (canvasStream) {
                canvasStream.getTracks().forEach(track => track.stop());
            }
            
            if (hdStream) {
                hdStream.getTracks().forEach(track => track.stop());
            }
            
            // Remove virtual HD canvas if it exists
            if (hdCanvas && hdCanvas.parentNode) {
                hdCanvas.parentNode.removeChild(hdCanvas);
            }
            
            stopOperation();
            document.body.removeChild(modal);
            document.head.removeChild(style);
        });
        
        // Start recording button
        document.getElementById('startRecordingBtn').addEventListener('click', async () => {
            try {
                const canvas = document.querySelector('#canvas');
                const selectedQuality = document.querySelector('input[name="videoQuality"]:checked').value;
                
                // Set up streaming based on selected quality
                if (selectedQuality === 'standard') {
                    // Standard quality - use original canvas
                    canvasStream = canvas.captureStream(30); // 30 FPS
                    
                    // Create media recorder
                    mediaRecorder = new MediaRecorder(canvasStream, { 
                        mimeType: 'video/webm;codecs=vp9',
                        videoBitsPerSecond: 2500000 // 2.5 Mbps
                    });
                } else {
                    // HD or Full HD - create a virtual canvas with higher resolution
                    let width, height;
                    
                    // Get viewport dimensions for aspect ratio
                    const viewportWidth = canvas.clientWidth;
                    const viewportHeight = canvas.clientHeight;
                    const aspectRatio = viewportWidth / viewportHeight;
                    
                    if (selectedQuality === 'hd') {
                        // 720p
                        height = 720;
                        width = Math.round(height * aspectRatio);
                    } else {
                        // 1080p
                        height = 1080;
                        width = Math.round(height * aspectRatio);
                    }
                    
                    // Create virtual HD canvas (hidden)
                    hdCanvas = document.createElement('canvas');
                    hdCanvas.width = width;
                    hdCanvas.height = height;
                    hdCanvas.style.position = 'absolute';
                    hdCanvas.style.top = '-9999px';
                    hdCanvas.style.left = '-9999px';
                    document.body.appendChild(hdCanvas);
                    
                    hdContext = hdCanvas.getContext('2d');
                    hdStream = hdCanvas.captureStream(30); // 30 FPS
                    
                    // Create media recorder for HD stream
                    mediaRecorder = new MediaRecorder(hdStream, { 
                        mimeType: 'video/webm;codecs=vp9',
                        videoBitsPerSecond: selectedQuality === 'hd' ? 5000000 : 8000000 // 5 or 8 Mbps
                    });
                    
                    // Set up frame copying function for HD
                    const updateHDCanvas = () => {
                        if (!hdCanvas) return; // Stop if canvas was removed
                        
                        // Draw the regular canvas content to the HD canvas
                        hdContext.drawImage(canvas, 0, 0, hdCanvas.width, hdCanvas.height);
                        
                        // Request next frame
                        requestAnimationFrame(updateHDCanvas);
                    };
                    
                    // Start HD canvas updates
                    updateHDCanvas();
                }
                
                // Set up recording events
                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        recordedChunks.push(event.data);
                    }
                };
                
                mediaRecorder.onstop = () => {
                    // Create a blob from the recorded chunks
                    const blob = new Blob(recordedChunks, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    
                    // Create a download link
                    const a = document.createElement('a');
                    a.href = url;
                    
                    // Name file according to quality
                    let qualitySuffix = '';
                    if (selectedQuality === 'hd') qualitySuffix = '_HD';
                    if (selectedQuality === 'fullhd') qualitySuffix = '_FullHD';
                    
                    a.download = `elevator_operation${qualitySuffix}.webm`;
                    a.click();
                    
                    // Clean up
                    URL.revokeObjectURL(url);
                    recordedChunks = [];
                    document.getElementById('recordingStatus').textContent = 'Recording complete';
                    
                    // Remove virtual HD canvas if it exists
                    if (hdCanvas && hdCanvas.parentNode) {
                        hdCanvas.parentNode.removeChild(hdCanvas);
                        hdCanvas = null;
                    }
                    
                    // Stop operation
                    stopOperation();
                    
                    // Enable start button
                    document.getElementById('startRecordingBtn').style.display = 'inline-block';
                    document.getElementById('stopRecordingBtn').style.display = 'none';
                };
                
                // Update UI
                document.getElementById('startRecordingBtn').style.display = 'none';
                document.getElementById('stopRecordingBtn').style.display = 'inline-block';
                
                // Update status with quality info
                let qualityText = 'Standard';
                if (selectedQuality === 'hd') qualityText = 'HD (720p)';
                if (selectedQuality === 'fullhd') qualityText = 'Full HD (1080p)';
                document.getElementById('recordingStatus').textContent = `Recording in ${qualityText}...`;
                
                // Start recording with a longer data interval for larger chunks (better for HD)
                mediaRecorder.start(1000); // Collect data every 1 second
                
                // Start elevator operation
                startOperation();
                
            } catch (error) {
                console.error('Recording error:', error);
                alert('Error starting recording: ' + error.message);
                document.getElementById('recordingStatus').textContent = 'Error: ' + error.message;
            }
        });
        
        // Stop recording button
        document.getElementById('stopRecordingBtn').addEventListener('click', () => {
            if (mediaRecorder && mediaRecorder.state === 'recording') {
                mediaRecorder.stop();
                
                if (canvasStream) {
                    canvasStream.getTracks().forEach(track => track.stop());
                }
                
                if (hdStream) {
                    hdStream.getTracks().forEach(track => track.stop());
                }
                
                document.getElementById('recordingStatus').textContent = 'Processing...';
            }
        });
        
    } catch (error) {
        console.error('Video export error:', error);
        alert('Error setting up video export: ' + error.message);
    }
} 