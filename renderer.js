/**
 * Advanced Rendering System for Ultra-Realistic 3D Button
 * Integrates physics, materials, and shaders for photorealistic rendering
 */

class AdvancedRenderer {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Rendering configuration
        this.config = {
            enableAntiAliasing: true,
            enableDepthOfField: true,
            enableMotionBlur: true,
            enableBloom: true,
            enableSSAO: false, // Screen Space Ambient Occlusion
            enableReflections: true,
            enableShadows: true,
            enableCaustics: true,
            enableFresnel: true,
            enableSubsurface: true,
            renderQuality: 'high', // low, medium, high, ultra
            ...options
        };
        
        // Rendering systems
        this.shaderSystem = null;
        this.physicsSystem = null;
        this.materialSystem = null;
        
        // Rendering state
        this.backgroundImage = null;
        this.environmentMap = null;
        this.lightSources = [];
        this.renderLayers = [];
        this.postProcessEffects = [];
        
        // Performance tracking
        this.frameCount = 0;
        this.lastRenderTime = 0;
        this.averageRenderTime = 0;
        
        // Initialize rendering
        this.initialize();
    }

    initialize() {
        this.createBackground();
        this.setupLighting();
        this.setupRenderLayers();
        this.setupPostProcessing();
    }

    createBackground() {
        // Create a high-resolution procedural background
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width;
        bgCanvas.height = this.height;
        const bgCtx = bgCanvas.getContext('2d');
        
        // Create gradient background
        const gradient = bgCtx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0a0a0f');
        gradient.addColorStop(0.3, '#1a1a2e');
        gradient.addColorStop(0.6, '#16213e');
        gradient.addColorStop(1, '#0f3460');
        
        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, this.width, this.height);
        
        // Add procedural elements
        this.addProceduralElements(bgCtx);
        
        // Convert to image
        this.backgroundImage = new Image();
        this.backgroundImage.src = bgCanvas.toDataURL();
    }

    addProceduralElements(ctx) {
        // Add stars
        for (let i = 0; i < 300; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = Math.random() * 3;
            const alpha = Math.random() * 0.8 + 0.2;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        
        // Add geometric shapes
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 150 + 50;
            const alpha = Math.random() * 0.2 + 0.1;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#4facfe';
            ctx.lineWidth = 1;
            
            if (Math.random() > 0.5) {
                ctx.strokeRect(x - size/2, y - size/2, size, size);
            } else {
                ctx.beginPath();
                ctx.arc(x, y, size/2, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        }
        
        // Add nebula-like effects
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = Math.random() * 200 + 100;
            
            const radialGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            radialGradient.addColorStop(0, 'rgba(79, 172, 254, 0.1)');
            radialGradient.addColorStop(0.5, 'rgba(79, 172, 254, 0.05)');
            radialGradient.addColorStop(1, 'rgba(79, 172, 254, 0)');
            
            ctx.fillStyle = radialGradient;
            ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
        }
    }

    setupLighting() {
        // Main light source (sun-like)
        this.lightSources.push({
            type: 'directional',
            position: { x: 0, y: -1, z: 1 },
            color: { r: 1.0, g: 0.95, b: 0.8 },
            intensity: 1.0,
            castShadows: true
        });
        
        // Fill light
        this.lightSources.push({
            type: 'ambient',
            color: { r: 0.1, g: 0.15, b: 0.2 },
            intensity: 0.3
        });
        
        // Rim light
        this.lightSources.push({
            type: 'directional',
            position: { x: 1, y: 0, z: 0.5 },
            color: { r: 0.8, g: 0.9, b: 1.0 },
            intensity: 0.4,
            castShadows: false
        });
    }

    setupRenderLayers() {
        this.renderLayers = [
            { name: 'background', zIndex: 0, enabled: true },
            { name: 'shadows', zIndex: 1, enabled: true },
            { name: 'button', zIndex: 2, enabled: true },
            { name: 'highlights', zIndex: 3, enabled: true },
            { name: 'reflections', zIndex: 4, enabled: true },
            { name: 'caustics', zIndex: 5, enabled: true },
            { name: 'postProcess', zIndex: 6, enabled: true }
        ];
    }

    setupPostProcessing() {
        this.postProcessEffects = [
            { name: 'bloom', enabled: this.config.enableBloom },
            { name: 'motionBlur', enabled: this.config.enableMotionBlur },
            { name: 'depthOfField', enabled: this.config.enableDepthOfField },
            { name: 'antiAliasing', enabled: this.config.enableAntiAliasing }
        ];
    }

    // Set rendering systems
    setSystems(shaderSystem, physicsSystem, materialSystem) {
        this.shaderSystem = shaderSystem;
        this.physicsSystem = physicsSystem;
        this.materialSystem = materialSystem;
    }

    // Main render loop
    render() {
        const startTime = performance.now();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Render each layer
        for (const layer of this.renderLayers) {
            if (layer.enabled) {
                this.renderLayer(layer);
            }
        }
        
        // Apply post-processing effects
        this.applyPostProcessing();
        
        // Update performance metrics
        this.updatePerformance(startTime);
    }

    renderLayer(layer) {
        switch (layer.name) {
            case 'background':
                this.renderBackground();
                break;
            case 'shadows':
                this.renderShadows();
                break;
            case 'button':
                this.renderButton();
                break;
            case 'highlights':
                this.renderHighlights();
                break;
            case 'reflections':
                this.renderReflections();
                break;
            case 'caustics':
                this.renderCaustics();
                break;
        }
    }

    renderBackground() {
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        }
    }

    renderShadows() {
        if (!this.config.enableShadows || !this.physicsSystem) return;
        
        const particles = this.physicsSystem.getParticles();
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Create shadow based on particle positions
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        const shadowGradient = this.ctx.createRadialGradient(
            centerX + 30, centerY + 30, 0,
            centerX + 30, centerY + 30, 200
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.fillStyle = shadowGradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX + 30, centerY + 30, 200, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderButton() {
        if (!this.physicsSystem || !this.materialSystem || !this.shaderSystem) return;
        
        const particles = this.physicsSystem.getParticles();
        const pressure = this.physicsSystem.getPressure();
        const material = this.materialSystem.getActiveMaterial();
        
        if (!particles.length) return;
        
        // Get material properties
        const materialProps = this.materialSystem.getRenderingProperties();
        if (!materialProps) return;
        
        // Create clipping path for button shape
        this.ctx.save();
        this.ctx.beginPath();
        
        // Create smooth path from particles
        this.createSmoothPath(particles);
        this.ctx.clip();
        
        // Apply refraction effect
        this.applyRefractionEffect(materialProps);
        
        // Render button surface
        this.renderButtonSurface(particles, pressure, materialProps);
        
        this.ctx.restore();
    }

    createSmoothPath(particles) {
        if (particles.length < 3) return;
        
        // Create a smooth path using particle positions
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Sort particles by angle from center
        const sortedParticles = [...particles].sort((a, b) => {
            const angleA = Math.atan2(a.y - centerY, a.x - centerX);
            const angleB = Math.atan2(b.y - centerY, b.x - centerX);
            return angleA - angleB;
        });
        
        // Create smooth curve
        this.ctx.moveTo(sortedParticles[0].x, sortedParticles[0].y);
        
        for (let i = 1; i < sortedParticles.length; i++) {
            const prev = sortedParticles[i - 1];
            const curr = sortedParticles[i];
            const next = sortedParticles[(i + 1) % sortedParticles.length];
            
            // Calculate control points for smooth curve
            const cp1x = prev.x + (curr.x - prev.x) * 0.5;
            const cp1y = prev.y + (curr.y - prev.y) * 0.5;
            const cp2x = curr.x + (next.x - curr.x) * 0.5;
            const cp2y = curr.y + (next.y - curr.y) * 0.5;
            
            this.ctx.quadraticCurveTo(cp1x, cp1y, curr.x, curr.y);
        }
        
        // Close the path
        this.ctx.closePath();
    }

    applyRefractionEffect(materialProps) {
        if (!this.backgroundImage) return;
        
        const { refractionIndex, transparency } = materialProps;
        const refractionStrength = (refractionIndex - 1.0) * 0.5;
        
        // Sample background with refraction distortion
        for (let y = 0; y < this.height; y += 2) {
            for (let x = 0; x < this.width; x += 2) {
                const dx = x - this.width / 2;
                const dy = y - this.height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDistance = 150;
                
                if (distance < maxDistance) {
                    const normalizedDistance = distance / maxDistance;
                    const distortion = Math.sin(normalizedDistance * Math.PI) * refractionStrength * 15;
                    
                    const sourceX = x + dx * distortion * 0.01;
                    const sourceY = y + dy * distortion * 0.01;
                    
                    if (sourceX >= 0 && sourceX < this.width && sourceY >= 0 && sourceY < this.height) {
                        const pixel = this.ctx.getImageData(sourceX, sourceY, 1, 1).data;
                        this.ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] * transparency})`;
                        this.ctx.fillRect(x, y, 2, 2);
                    }
                }
            }
        }
    }

    renderButtonSurface(particles, pressure, materialProps) {
        const { transparency, roughness, fresnel, caustics, subsurface } = materialProps;
        
        // Render particle connections for surface mesh
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const nextIndex = (i + 1) % particles.length;
            const nextParticle = particles[nextIndex];
            
            // Calculate surface properties
            const pressureFactor = pressure[i] || 0;
            const alpha = transparency * (1 - pressureFactor * 0.3);
            
            if (alpha > 0.01) {
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(nextParticle.x, nextParticle.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }

    renderHighlights() {
        if (!this.physicsSystem) return;
        
        const particles = this.physicsSystem.getParticles();
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Create highlights based on light sources
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        for (const light of this.lightSources) {
            if (light.type === 'directional') {
                const highlightGradient = this.ctx.createRadialGradient(
                    centerX - 40, centerY - 40, 0,
                    centerX - 40, centerY - 40, 100
                );
                highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${light.intensity * 0.6})`);
                highlightGradient.addColorStop(0.6, `rgba(255, 255, 255, ${light.intensity * 0.3})`);
                highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                
                this.ctx.fillStyle = highlightGradient;
                this.ctx.beginPath();
                this.ctx.arc(centerX - 40, centerY - 40, 100, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        this.ctx.restore();
    }

    renderReflections() {
        if (!this.config.enableReflections) return;
        
        // Create environment map reflections
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        
        const reflectionGradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, 150
        );
        reflectionGradient.addColorStop(0, 'rgba(100, 150, 200, 0.2)');
        reflectionGradient.addColorStop(0.7, 'rgba(100, 150, 200, 0.1)');
        reflectionGradient.addColorStop(1, 'rgba(100, 150, 200, 0)');
        
        this.ctx.fillStyle = reflectionGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, 150, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }

    renderCaustics() {
        if (!this.config.enableCaustics || !this.shaderSystem) return;
        
        const time = Date.now() * 0.001;
        const causticsShader = this.shaderSystem.getShader('caustics');
        
        if (causticsShader) {
            this.ctx.save();
            this.ctx.globalCompositeOperation = 'screen';
            
            // Render caustics effect
            for (let y = 0; y < this.height; y += 4) {
                for (let x = 0; x < this.width; x += 4) {
                    const color = causticsShader.render(this.ctx, x, y, causticsShader.parameters, time);
                    if (color.a > 0) {
                        this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a * 0.1})`;
                        this.ctx.fillRect(x, y, 4, 4);
                    }
                }
            }
            
            this.ctx.restore();
        }
    }

    applyPostProcessing() {
        for (const effect of this.postProcessEffects) {
            if (effect.enabled) {
                this.applyEffect(effect.name);
            }
        }
    }

    applyEffect(effectName) {
        switch (effectName) {
            case 'bloom':
                this.applyBloom();
                break;
            case 'motionBlur':
                this.applyMotionBlur();
                break;
            case 'depthOfField':
                this.applyDepthOfField();
                break;
            case 'antiAliasing':
                this.applyAntiAliasing();
                break;
        }
    }

    applyBloom() {
        // Simple bloom effect
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.globalAlpha = 0.3;
        
        // Create bloom by scaling and blurring
        const bloomCanvas = document.createElement('canvas');
        bloomCanvas.width = this.width / 4;
        bloomCanvas.height = this.height / 4;
        const bloomCtx = bloomCanvas.getContext('2d');
        
        bloomCtx.drawImage(this.canvas, 0, 0, bloomCanvas.width, bloomCanvas.height);
        
        this.ctx.drawImage(bloomCanvas, 0, 0, this.width, this.height);
        this.ctx.restore();
    }

    applyMotionBlur() {
        // Simple motion blur effect
        if (this.physicsSystem) {
            const particles = this.physicsSystem.getParticles();
            let totalVelocity = 0;
            
            for (const particle of particles) {
                // Calculate average velocity for blur amount
                totalVelocity += Math.sqrt(particle.x * particle.x + particle.y * particle.y);
            }
            
            const avgVelocity = totalVelocity / particles.length;
            if (avgVelocity > 1) {
                this.ctx.save();
                this.ctx.globalAlpha = 0.1;
                this.ctx.globalCompositeOperation = 'source-over';
                
                // Draw slightly offset copy for motion blur
                this.ctx.drawImage(this.canvas, avgVelocity * 0.1, 0, this.width, this.height);
                this.ctx.restore();
            }
        }
    }

    applyDepthOfField() {
        // Simple depth of field effect
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        
        const dofGradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, 300
        );
        dofGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        dofGradient.addColorStop(0.7, 'rgba(255, 255, 255, 1)');
        dofGradient.addColorStop(1, 'rgba(200, 200, 200, 0.8)');
        
        this.ctx.fillStyle = dofGradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.restore();
    }

    applyAntiAliasing() {
        // Simple anti-aliasing by smoothing
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }

    updatePerformance(startTime) {
        const renderTime = performance.now() - startTime;
        this.frameCount++;
        
        // Update average render time
        this.averageRenderTime = (this.averageRenderTime * (this.frameCount - 1) + renderTime) / this.frameCount;
        
        if (this.frameCount % 60 === 0) {
            this.lastRenderTime = renderTime;
        }
    }

    // Get performance metrics
    getPerformanceMetrics() {
        return {
            frameCount: this.frameCount,
            lastRenderTime: this.lastRenderTime,
            averageRenderTime: this.averageRenderTime,
            fps: this.physicsSystem ? this.physicsSystem.getFPS() : 60
        };
    }

    // Update configuration
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        this.setupPostProcessing();
    }

    // Resize canvas
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.canvas.width = width;
        this.canvas.height = height;
        
        // Recreate background for new size
        this.createBackground();
    }
}

// Export for use in other modules
window.AdvancedRenderer = AdvancedRenderer;