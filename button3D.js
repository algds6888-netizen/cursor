class UltraRealistic3DButton {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Button properties
        this.buttonRadius = 120;
        this.buttonHeight = 80;
        this.centerX = this.width / 2;
        this.centerY = this.height / 2;
        
        // Material properties
        this.refractionIndex = 1.33;
        this.transparency = 0.8;
        this.elasticity = 1.0;
        
        // Physics simulation
        this.particles = [];
        this.deformation = [];
        this.velocity = [];
        this.acceleration = [];
        this.pressure = [];
        
        // Interaction state
        this.isPressed = false;
        this.pressPoint = { x: 0, y: 0 };
        this.pressForce = 0;
        this.mousePos = { x: 0, y: 0 };
        
        // Background image
        this.backgroundImage = null;
        this.loadBackgroundImage();
        
        // Initialize particle system
        this.initializeParticles();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Setup controls
        this.setupControls();
        
        // Start animation loop
        this.animate();
    }
    
    loadBackgroundImage() {
        this.backgroundImage = new Image();
        this.backgroundImage.onload = () => {
            this.drawBackground();
        };
        // Create a high-resolution landscape background programmatically
        this.createProceduralBackground();
    }
    
    createProceduralBackground() {
        // Create a procedural high-resolution background
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = this.width;
        bgCanvas.height = this.height;
        const bgCtx = bgCanvas.getContext('2d');
        
        // Create gradient background
        const gradient = bgCtx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#2c3e50');
        gradient.addColorStop(0.3, '#3498db');
        gradient.addColorStop(0.6, '#2980b9');
        gradient.addColorStop(1, '#1f4e79');
        
        bgCtx.fillStyle = gradient;
        bgCtx.fillRect(0, 0, this.width, this.height);
        
        // Add procedural elements
        this.addProceduralElements(bgCtx);
        
        // Convert to image
        this.backgroundImage.src = bgCanvas.toDataURL();
    }
    
    addProceduralElements(ctx) {
        // Add stars
        for (let i = 0; i < 200; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = Math.random() * 2;
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
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const size = Math.random() * 100 + 50;
            const alpha = Math.random() * 0.3 + 0.1;
            
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = '#ffffff';
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
    }
    
    initializeParticles() {
        const particleCount = 2000;
        const spacing = 2;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const radius = this.buttonRadius * (0.8 + Math.random() * 0.4);
            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;
            
            this.particles.push({ x, y, originalX: x, originalY: y });
            this.deformation.push(0);
            this.velocity.push(0);
            this.acceleration.push(0);
            this.pressure.push(0);
        }
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }
    
    setupControls() {
        const refractionSlider = document.getElementById('refractionSlider');
        const transparencySlider = document.getElementById('transparencySlider');
        const elasticitySlider = document.getElementById('elasticitySlider');
        
        const refractionValue = document.getElementById('refractionValue');
        const transparencyValue = document.getElementById('transparencyValue');
        const elasticityValue = document.getElementById('elasticityValue');
        
        refractionSlider.addEventListener('input', (e) => {
            this.refractionIndex = parseFloat(e.target.value);
            refractionValue.textContent = this.refractionIndex.toFixed(2);
        });
        
        transparencySlider.addEventListener('input', (e) => {
            this.transparency = parseFloat(e.target.value);
            transparencyValue.textContent = this.transparency.toFixed(2);
        });
        
        elasticitySlider.addEventListener('input', (e) => {
            this.elasticity = parseFloat(e.target.value);
            elasticityValue.textContent = this.elasticity.toFixed(2);
        });
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.pressPoint.x = e.clientX - rect.left;
        this.pressPoint.y = e.clientY - rect.top;
        this.isPressed = true;
        this.pressForce = 0;
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
        
        if (this.isPressed) {
            this.pressForce = Math.min(1.0, this.pressForce + 0.1);
            this.applyPressure(this.pressPoint.x, this.pressPoint.y, this.pressForce);
        }
    }
    
    handleMouseUp(e) {
        this.isPressed = false;
        this.pressForce = 0;
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.pressPoint.x = touch.clientX - rect.left;
        this.pressPoint.y = touch.clientY - rect.top;
        this.isPressed = true;
        this.pressForce = 0;
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        this.mousePos.x = touch.clientX - rect.left;
        this.mousePos.y = touch.clientY - rect.top;
        
        if (this.isPressed) {
            this.pressForce = Math.min(1.0, this.pressForce + 0.1);
            this.applyPressure(this.pressPoint.x, this.pressPoint.y, this.pressForce);
        }
    }
    
    handleTouchEnd(e) {
        e.preventDefault();
        this.isPressed = false;
        this.pressForce = 0;
    }
    
    applyPressure(x, y, force) {
        const maxDeformation = 30 * this.elasticity;
        
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const distance = Math.sqrt((particle.x - x) ** 2 + (particle.y - y) ** 2);
            const influence = Math.max(0, 1 - distance / 100);
            
            if (influence > 0) {
                const deformation = influence * force * maxDeformation;
                this.deformation[i] = Math.max(this.deformation[i], deformation);
                this.acceleration[i] = influence * force * 2;
            }
        }
    }
    
    updatePhysics() {
        const damping = 0.95;
        const springForce = 0.1;
        
        for (let i = 0; i < this.particles.length; i++) {
            // Apply spring force to restore original position
            const dx = this.particles[i].originalX - this.particles[i].x;
            const dy = this.particles[i].originalY - this.particles[i].y;
            
            this.acceleration[i] += dx * springForce;
            this.acceleration[i] += dy * springForce;
            
            // Apply deformation
            const deformation = this.deformation[i];
            if (deformation > 0) {
                const angle = Math.atan2(dy, dx);
                this.particles[i].x += Math.cos(angle) * deformation * 0.1;
                this.particles[i].y += Math.sin(angle) * deformation * 0.1;
                this.deformation[i] *= 0.95;
            }
            
            // Update velocity and position
            this.velocity[i] += this.acceleration[i];
            this.velocity[i] *= damping;
            
            this.particles[i].x += this.velocity[i];
            this.particles[i].y += this.velocity[i];
            
            // Reset acceleration
            this.acceleration[i] = 0;
        }
    }
    
    drawBackground() {
        if (this.backgroundImage) {
            this.ctx.drawImage(this.backgroundImage, 0, 0, this.width, this.height);
        }
    }
    
    renderButton() {
        // Create gradient for button base
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, this.buttonRadius
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.1 * this.transparency})`);
        gradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.05 * this.transparency})`);
        gradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.02 * this.transparency})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        // Draw button base with refraction effect
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Create clipping path for button shape
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.buttonRadius, 0, Math.PI * 2);
        this.ctx.clip();
        
        // Apply refraction distortion to background
        this.applyRefractionEffect();
        
        // Draw button surface
        this.drawButtonSurface();
        
        // Draw highlights and reflections
        this.drawHighlights();
        
        // Draw shadows
        this.drawShadows();
        
        this.ctx.restore();
    }
    
    applyRefractionEffect() {
        const refractionStrength = (this.refractionIndex - 1) * 0.5;
        
        for (let y = 0; y < this.height; y += 2) {
            for (let x = 0; x < this.width; x += 2) {
                const dx = x - this.centerX;
                const dy = y - this.centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.buttonRadius) {
                    const normalizedDistance = distance / this.buttonRadius;
                    const distortion = Math.sin(normalizedDistance * Math.PI) * refractionStrength * 10;
                    
                    const sourceX = x + dx * distortion * 0.01;
                    const sourceY = y + dy * distortion * 0.01;
                    
                    if (sourceX >= 0 && sourceX < this.width && sourceY >= 0 && sourceY < this.height) {
                        const pixel = this.ctx.getImageData(sourceX, sourceY, 1, 1).data;
                        this.ctx.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] * 0.8})`;
                        this.ctx.fillRect(x, y, 2, 2);
                    }
                }
            }
        }
    }
    
    drawButtonSurface() {
        // Create mesh-like surface using particles
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Draw particle connections for surface mesh
        for (let i = 0; i < this.particles.length; i++) {
            const particle = this.particles[i];
            const nextIndex = (i + 1) % this.particles.length;
            const nextParticle = this.particles[nextIndex];
            
            // Calculate surface normal for lighting
            const midX = (particle.x + nextParticle.x) / 2;
            const midY = (particle.y + nextParticle.y) / 2;
            const distanceFromCenter = Math.sqrt((midX - this.centerX) ** 2 + (midY - this.centerY) ** 2);
            
            if (distanceFromCenter < this.buttonRadius) {
                const alpha = this.transparency * (1 - distanceFromCenter / this.buttonRadius);
                this.ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.x, particle.y);
                this.ctx.lineTo(nextParticle.x, nextParticle.y);
                this.ctx.stroke();
            }
        }
        
        this.ctx.restore();
    }
    
    drawHighlights() {
        // Create realistic highlights
        const highlightGradient = this.ctx.createRadialGradient(
            this.centerX - 30, this.centerY - 30, 0,
            this.centerX - 30, this.centerY - 30, 80
        );
        highlightGradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 * this.transparency})`);
        highlightGradient.addColorStop(0.5, `rgba(255, 255, 255, ${0.2 * this.transparency})`);
        highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'screen';
        this.ctx.fillStyle = highlightGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX - 30, this.centerY - 30, 80, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    drawShadows() {
        // Create realistic shadows
        const shadowGradient = this.ctx.createRadialGradient(
            this.centerX + 20, this.centerY + 20, 0,
            this.centerX + 20, this.centerY + 20, 150
        );
        shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.3)');
        shadowGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.1)');
        shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.save();
        this.ctx.globalCompositeOperation = 'multiply';
        this.ctx.fillStyle = shadowGradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX + 20, this.centerY + 20, 150, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    animate() {
        // Update physics
        this.updatePhysics();
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw background
        this.drawBackground();
        
        // Render button
        this.renderButton();
        
        // Request next frame
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('buttonCanvas');
    if (canvas) {
        new UltraRealistic3DButton(canvas);
    }
});