/**
 * Main Application for Ultra-Realistic 3D Button
 * Integrates all systems and provides user interface controls
 */

class UltraRealistic3DButtonApp {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.loadingScreen = document.getElementById('loadingScreen');
        
        // Initialize systems
        this.shaderSystem = null;
        this.physicsSystem = null;
        this.materialSystem = null;
        this.renderer = null;
        
        // Application state
        this.isInitialized = false;
        this.isRunning = false;
        this.currentPreset = 'glass';
        
        // Performance monitoring
        this.performanceMonitor = {
            fps: 0,
            particleCount: 0,
            renderTime: 0
        };
        
        // Initialize application
        this.initialize();
    }

    async initialize() {
        try {
            // Show loading screen
            this.showLoadingScreen();
            
            // Initialize systems
            await this.initializeSystems();
            
            // Setup user interface
            this.setupUserInterface();
            
            // Start rendering
            this.startRendering();
            
            // Hide loading screen
            this.hideLoadingScreen();
            
            this.isInitialized = true;
            console.log('Ultra-Realistic 3D Button initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showErrorScreen(error);
        }
    }

    async initializeSystems() {
        // Initialize shader system
        this.shaderSystem = new ShaderSystem();
        
        // Initialize physics system
        this.physicsSystem = new PhysicsSystem(this.canvas, {
            particleCount: 3000,
            elasticity: 1.0,
            damping: 0.95,
            tension: 1.0,
            maxDeformation: 50
        });
        
        // Initialize material system
        this.materialSystem = new MaterialSystem();
        
        // Initialize renderer
        this.renderer = new AdvancedRenderer(this.canvas, {
            enableAntiAliasing: true,
            enableDepthOfField: true,
            enableMotionBlur: true,
            enableBloom: true,
            enableReflections: true,
            enableShadows: true,
            enableCaustics: true,
            renderQuality: 'high'
        });
        
        // Connect systems
        this.renderer.setSystems(this.shaderSystem, this.physicsSystem, this.materialSystem);
        
        // Wait for physics system to be ready
        await this.waitForPhysicsReady();
    }

    waitForPhysicsReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (this.physicsSystem && this.physicsSystem.getParticles().length > 0) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    setupUserInterface() {
        // Setup control sliders
        this.setupControlSliders();
        
        // Setup preset buttons
        this.setupPresetButtons();
        
        // Setup performance monitoring
        this.setupPerformanceMonitoring();
        
        // Setup window resize handling
        this.setupResizeHandling();
    }

    setupControlSliders() {
        // Material properties
        this.setupSlider('refractionSlider', 'refractionValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { refractionIndex: value });
        });
        
        this.setupSlider('transparencySlider', 'transparencyValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { transparency: value });
        });
        
        this.setupSlider('roughnessSlider', 'roughnessValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { roughness: value });
        });
        
        // Physics properties
        this.setupSlider('elasticitySlider', 'elasticityValue', (value) => {
            this.physicsSystem.updateConfig({ elasticity: value });
        });
        
        this.setupSlider('dampingSlider', 'dampingValue', (value) => {
            this.physicsSystem.updateConfig({ damping: value });
        });
        
        this.setupSlider('tensionSlider', 'tensionValue', (value) => {
            this.physicsSystem.updateConfig({ tension: value });
        });
        
        // Visual effects
        this.setupSlider('causticsSlider', 'causticsValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { caustics: value });
        });
        
        this.setupSlider('fresnelSlider', 'fresnelValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { fresnel: value });
        });
        
        this.setupSlider('subsurfaceSlider', 'subsurfaceValue', (value) => {
            this.shaderSystem.updateShaderParameters('glass', { subsurface: value });
        });
    }

    setupSlider(sliderId, valueId, callback) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                valueDisplay.textContent = value.toFixed(2);
                if (callback) callback(value);
            });
        }
    }

    setupPresetButtons() {
        const presetButtons = document.querySelectorAll('.preset-btn');
        
        presetButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const preset = e.target.dataset.preset;
                this.applyPreset(preset);
                
                // Update active state
                presetButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
            });
        });
        
        // Set default active preset
        const defaultButton = document.querySelector('[data-preset="glass"]');
        if (defaultButton) {
            defaultButton.classList.add('active');
        }
    }

    applyPreset(presetName) {
        if (this.materialSystem.applyPreset(presetName, this.physicsSystem, this.shaderSystem)) {
            this.currentPreset = presetName;
            console.log(`Applied preset: ${presetName}`);
            
            // Update UI to reflect preset values
            this.updateUIFromPreset(presetName);
        }
    }

    updateUIFromPreset(presetName) {
        const preset = this.materialSystem.getPreset(presetName);
        if (!preset) return;
        
        // Update slider values and displays
        this.updateSliderValue('refractionSlider', 'refractionValue', preset.refractionIndex);
        this.updateSliderValue('transparencySlider', 'transparencyValue', preset.transparency);
        this.updateSliderValue('roughnessSlider', 'roughnessValue', preset.roughness);
        this.updateSliderValue('elasticitySlider', 'elasticityValue', preset.elasticity);
        this.updateSliderValue('dampingSlider', 'dampingValue', preset.damping);
        this.updateSliderValue('tensionSlider', 'tensionValue', preset.tension);
        this.updateSliderValue('causticsSlider', 'causticsValue', preset.caustics);
        this.updateSliderValue('fresnelSlider', 'fresnelValue', preset.fresnel);
        this.updateSliderValue('subsurfaceSlider', 'subsurfaceValue', preset.subsurface);
    }

    updateSliderValue(sliderId, valueId, value) {
        const slider = document.getElementById(sliderId);
        const valueDisplay = document.getElementById(valueId);
        
        if (slider && valueDisplay) {
            slider.value = value;
            valueDisplay.textContent = value.toFixed(2);
        }
    }

    setupPerformanceMonitoring() {
        // Update performance metrics every second
        setInterval(() => {
            this.updatePerformanceDisplay();
        }, 1000);
    }

    updatePerformanceDisplay() {
        if (this.physicsSystem && this.renderer) {
            const physicsMetrics = {
                fps: this.physicsSystem.getFPS(),
                particleCount: this.physicsSystem.getParticleCount()
            };
            
            const renderMetrics = this.renderer.getPerformanceMetrics();
            
            // Update display
            this.updateDisplayValue('fpsValue', physicsMetrics.fps);
            this.updateDisplayValue('particleCount', physicsMetrics.particleCount);
            this.updateDisplayValue('renderTime', `${renderMetrics.lastRenderTime.toFixed(1)}ms`);
        }
    }

    updateDisplayValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = value;
        }
    }

    setupResizeHandling() {
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    handleResize() {
        const container = this.canvas.parentElement;
        const containerRect = container.getBoundingClientRect();
        
        // Maintain aspect ratio
        const aspectRatio = 1200 / 800;
        let newWidth = containerRect.width;
        let newHeight = newWidth / aspectRatio;
        
        if (newHeight > containerRect.height) {
            newHeight = containerRect.height;
            newWidth = newHeight * aspectRatio;
        }
        
        // Update canvas size
        this.canvas.style.width = `${newWidth}px`;
        this.canvas.style.height = `${newHeight}px`;
        
        // Update renderer
        if (this.renderer) {
            this.renderer.resize(newWidth, newHeight);
        }
    }

    startRendering() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.renderLoop();
    }

    renderLoop() {
        if (!this.isRunning) return;
        
        // Render frame
        if (this.renderer) {
            this.renderer.render();
        }
        
        // Request next frame
        requestAnimationFrame(() => this.renderLoop());
    }

    stopRendering() {
        this.isRunning = false;
    }

    showLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.remove('hidden');
        }
    }

    hideLoadingScreen() {
        if (this.loadingScreen) {
            this.loadingScreen.classList.add('hidden');
        }
    }

    showErrorScreen(error) {
        if (this.loadingScreen) {
            const content = this.loadingScreen.querySelector('.loading-content');
            if (content) {
                content.innerHTML = `
                    <div class="error-icon">❌</div>
                    <h2>Erro na Inicialização</h2>
                    <p>Falha ao carregar o botão 3D: ${error.message}</p>
                    <button onclick="location.reload()" class="retry-btn">Tentar Novamente</button>
                `;
            }
        }
    }

    // Public methods for external access
    getPhysicsSystem() {
        return this.physicsSystem;
    }

    getMaterialSystem() {
        return this.materialSystem;
    }

    getShaderSystem() {
        return this.shaderSystem;
    }

    getRenderer() {
        return this.renderer;
    }

    // Reset application
    reset() {
        this.stopRendering();
        
        if (this.physicsSystem) {
            this.physicsSystem.reset();
        }
        
        this.startRendering();
    }

    // Get application status
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            isRunning: this.isRunning,
            currentPreset: this.currentPreset,
            performance: this.performanceMonitor
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global app instance
    window.app = new UltraRealistic3DButtonApp();
    
    // Add some utility functions to global scope
    window.resetApp = () => window.app.reset();
    window.getAppStatus = () => window.app.getStatus();
    window.applyPreset = (preset) => window.app.applyPreset(preset);
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    window.app.reset();
                }
                break;
            case '1':
                window.app.applyPreset('crystal');
                break;
            case '2':
                window.app.applyPreset('jelly');
                break;
            case '3':
                window.app.applyPreset('glass');
                break;
            case '4':
                window.app.applyPreset('water');
                break;
            case '5':
                window.app.applyPreset('diamond');
                break;
        }
    });
    
    // Add touch gesture support for mobile
    let touchStartY = 0;
    let touchStartX = 0;
    
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        }
    });
    
    document.addEventListener('touchend', (e) => {
        if (e.changedTouches.length === 1) {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = touchStartX - touchEndX;
            
            // Swipe up/down to change presets
            if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
                const presets = ['crystal', 'jelly', 'glass', 'water', 'diamond'];
                const currentIndex = presets.indexOf(window.app.currentPreset);
                let newIndex;
                
                if (deltaY > 0) { // Swipe up
                    newIndex = (currentIndex + 1) % presets.length;
                } else { // Swipe down
                    newIndex = (currentIndex - 1 + presets.length) % presets.length;
                }
                
                window.app.applyPreset(presets[newIndex]);
                
                // Update UI
                const presetButtons = document.querySelectorAll('.preset-btn');
                presetButtons.forEach(btn => btn.classList.remove('active'));
                const activeButton = document.querySelector(`[data-preset="${presets[newIndex]}"]`);
                if (activeButton) {
                    activeButton.classList.add('active');
                }
            }
        }
    });
    
    console.log('Ultra-Realistic 3D Button application ready!');
    console.log('Keyboard shortcuts: Ctrl+R (reset), 1-5 (presets)');
    console.log('Touch gestures: Swipe up/down to change presets');
});

// Export for use in other modules
window.UltraRealistic3DButtonApp = UltraRealistic3DButtonApp;