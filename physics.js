/**
 * Advanced Physics System for Ultra-Realistic 3D Button
 * Implements realistic jelly deformation, particle dynamics, and fluid simulation
 */

class PhysicsSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Physics configuration
        this.config = {
            particleCount: options.particleCount || 3000,
            particleSize: options.particleSize || 2,
            gravity: options.gravity || 0.1,
            damping: options.damping || 0.95,
            elasticity: options.elasticity || 1.0,
            tension: options.tension || 1.0,
            viscosity: options.viscosity || 0.1,
            surfaceTension: options.surfaceTension || 0.5,
            maxDeformation: options.maxDeformation || 50,
            ...options
        };
        
        // Physics state
        this.particles = [];
        this.constraints = [];
        this.forces = [];
        this.pressure = [];
        this.velocity = [];
        this.acceleration = [];
        this.mass = [];
        this.fixed = [];
        
        // Interaction state
        this.interactions = [];
        this.mouseForce = { x: 0, y: 0, strength: 0 };
        this.touchPoints = [];
        
        // Performance monitoring
        this.frameCount = 0;
        this.lastTime = 0;
        this.fps = 60;
        
        this.initialize();
    }

    initialize() {
        this.createParticleGrid();
        this.createConstraints();
        this.setupEventListeners();
        this.startSimulation();
    }

    createParticleGrid() {
        const { particleCount, particleSize } = this.config;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.15;
        
        // Create particles in a circular grid pattern
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const r = radius * (0.7 + Math.random() * 0.6);
            const x = centerX + Math.cos(angle) * r;
            const y = centerY + Math.sin(angle) * r;
            
            this.particles.push({ x, y });
            this.velocity.push({ x: 0, y: 0 });
            this.acceleration.push({ x: 0, y: 0 });
            this.mass.push(1.0 + Math.random() * 0.5);
            this.fixed.push(false);
            this.pressure.push(0);
        }
        
        // Mark edge particles as fixed for stability
        for (let i = 0; i < particleCount; i++) {
            const particle = this.particles[i];
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > radius * 0.9) {
                this.fixed[i] = true;
            }
        }
    }

    createConstraints() {
        const { particleCount } = this.config;
        
        // Create spring constraints between nearby particles
        for (let i = 0; i < particleCount; i++) {
            const particle1 = this.particles[i];
            
            for (let j = i + 1; j < particleCount; j++) {
                const particle2 = this.particles[j];
                const dx = particle2.x - particle1.x;
                const dy = particle2.y - particle1.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Connect particles within a certain distance
                if (distance < this.config.particleSize * 3) {
                    this.constraints.push({
                        particle1: i,
                        particle2: j,
                        restLength: distance,
                        stiffness: this.config.tension * 0.1,
                        damping: this.config.damping
                    });
                }
            }
        }
        
        // Create radial constraints for circular shape
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.width, this.height) * 0.15;
        
        for (let i = 0; i < particleCount; i++) {
            if (!this.fixed[i]) {
                this.constraints.push({
                    particle1: i,
                    center: { x: centerX, y: centerY },
                    restLength: radius,
                    stiffness: this.config.tension * 0.05,
                    damping: this.config.damping,
                    type: 'radial'
                });
            }
        }
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseUp(e));
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // Wheel events for zoom/force
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.mouseForce.x = x;
        this.mouseForce.y = y;
        this.mouseForce.strength = 0;
        this.mouseForce.active = true;
    }

    handleMouseMove(e) {
        if (this.mouseForce.active) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.mouseForce.x = x;
            this.mouseForce.y = y;
            this.mouseForce.strength = Math.min(1.0, this.mouseForce.strength + 0.1);
        }
    }

    handleMouseUp(e) {
        this.mouseForce.active = false;
        this.mouseForce.strength = 0;
    }

    handleTouchStart(e) {
        e.preventDefault();
        this.touchPoints = [];
        
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.touchPoints.push({
                id: touch.identifier,
                x, y,
                strength: 0,
                active: true
            });
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        
        for (let i = 0; i < e.touches.length; i++) {
            const touch = e.touches[i];
            const rect = this.canvas.getBoundingClientRect();
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            const touchPoint = this.touchPoints.find(tp => tp.id === touch.identifier);
            if (touchPoint) {
                touchPoint.x = x;
                touchPoint.y = y;
                touchPoint.strength = Math.min(1.0, touchPoint.strength + 0.1);
            }
        }
    }

    handleTouchEnd(e) {
        e.preventDefault();
        this.touchPoints = [];
    }

    handleWheel(e) {
        e.preventDefault();
        
        // Use wheel to adjust force strength
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        this.mouseForce.strength = Math.max(0, Math.min(2.0, this.mouseForce.strength + delta));
    }

    updatePhysics(deltaTime) {
        this.applyForces();
        this.updateParticles(deltaTime);
        this.solveConstraints();
        this.updatePressure();
        this.applySurfaceTension();
    }

    applyForces() {
        const { gravity, elasticity } = this.config;
        
        // Apply gravity
        for (let i = 0; i < this.particles.length; i++) {
            if (!this.fixed[i]) {
                this.acceleration[i].y += gravity;
            }
        }
        
        // Apply mouse/touch forces
        if (this.mouseForce.active && this.mouseForce.strength > 0) {
            this.applyPointForce(this.mouseForce.x, this.mouseForce.y, this.mouseForce.strength);
        }
        
        // Apply touch forces
        for (const touchPoint of this.touchPoints) {
            if (touchPoint.active && touchPoint.strength > 0) {
                this.applyPointForce(touchPoint.x, touchPoint.y, touchPoint.strength);
            }
        }
        
        // Apply elastic forces
        for (const constraint of this.constraints) {
            this.applyConstraintForce(constraint);
        }
    }

    applyPointForce(x, y, strength) {
        const maxForce = this.config.maxDeformation * strength;
        const forceRadius = 100;
        
        for (let i = 0; i < this.particles.length; i++) {
            if (this.fixed[i]) continue;
            
            const particle = this.particles[i];
            const dx = x - particle.x;
            const dy = y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < forceRadius) {
                const force = (1 - distance / forceRadius) * maxForce;
                const angle = Math.atan2(dy, dx);
                
                this.acceleration[i].x += Math.cos(angle) * force * 0.01;
                this.acceleration[i].y += Math.sin(angle) * force * 0.01;
                
                // Add pressure
                this.pressure[i] += force * 0.1;
            }
        }
    }

    applyConstraintForce(constraint) {
        if (constraint.type === 'radial') {
            this.applyRadialConstraint(constraint);
        } else {
            this.applySpringConstraint(constraint);
        }
    }

    applySpringConstraint(constraint) {
        const { particle1, particle2, restLength, stiffness, damping } = constraint;
        const p1 = this.particles[particle1];
        const p2 = this.particles[particle2];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const displacement = distance - restLength;
        const force = displacement * stiffness;
        
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        if (!this.fixed[particle1]) {
            this.acceleration[particle1].x += fx;
            this.acceleration[particle1].y += fy;
        }
        
        if (!this.fixed[particle2]) {
            this.acceleration[particle2].x -= fx;
            this.acceleration[particle2].y -= fy;
        }
    }

    applyRadialConstraint(constraint) {
        const { particle1, center, restLength, stiffness } = constraint;
        const particle = this.particles[particle1];
        
        const dx = particle.x - center.x;
        const dy = particle.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const displacement = distance - restLength;
        const force = displacement * stiffness;
        
        const fx = (dx / distance) * force;
        const fy = (dy / distance) * force;
        
        this.acceleration[particle1].x -= fx;
        this.acceleration[particle1].y -= fy;
    }

    updateParticles(deltaTime) {
        const { damping } = this.config;
        const dt = Math.min(deltaTime, 1/30); // Cap delta time for stability
        
        for (let i = 0; i < this.particles.length; i++) {
            if (this.fixed[i]) continue;
            
            // Update velocity
            this.velocity[i].x += this.acceleration[i].x * dt;
            this.velocity[i].y += this.acceleration[i].y * dt;
            
            // Apply damping
            this.velocity[i].x *= damping;
            this.velocity[i].y *= damping;
            
            // Update position
            this.particles[i].x += this.velocity[i].x * dt;
            this.particles[i].y += this.velocity[i].y * dt;
            
            // Reset acceleration
            this.acceleration[i].x = 0;
            this.acceleration[i].y = 0;
        }
    }

    solveConstraints() {
        // Multiple constraint solving iterations for stability
        const iterations = 3;
        
        for (let iter = 0; iter < iterations; iter++) {
            for (const constraint of this.constraints) {
                if (constraint.type === 'radial') {
                    this.solveRadialConstraint(constraint);
                } else {
                    this.solveSpringConstraint(constraint);
                }
            }
        }
    }

    solveSpringConstraint(constraint) {
        const { particle1, particle2, restLength } = constraint;
        const p1 = this.particles[particle1];
        const p2 = this.particles[particle2];
        
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const correction = (restLength - distance) / distance;
        const correctionX = dx * correction * 0.5;
        const correctionY = dy * correction * 0.5;
        
        if (!this.fixed[particle1]) {
            p1.x -= correctionX;
            p1.y -= correctionY;
        }
        
        if (!this.fixed[particle2]) {
            p2.x += correctionX;
            p2.y += correctionY;
        }
    }

    solveRadialConstraint(constraint) {
        const { particle1, center, restLength } = constraint;
        const particle = this.particles[particle1];
        
        const dx = particle.x - center.x;
        const dy = particle.y - center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance === 0) return;
        
        const correction = (restLength - distance) / distance;
        const correctionX = dx * correction;
        const correctionY = dy * correction;
        
        particle.x += correctionX;
        particle.y += correctionY;
    }

    updatePressure() {
        // Calculate pressure based on particle density
        for (let i = 0; i < this.particles.length; i++) {
            let density = 0;
            const particle = this.particles[i];
            
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                
                const other = this.particles[j];
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.particleSize * 2) {
                    density += 1 - distance / (this.config.particleSize * 2);
                }
            }
            
            this.pressure[i] = Math.max(0, density * 0.1);
        }
    }

    applySurfaceTension() {
        const { surfaceTension } = this.config;
        
        for (let i = 0; i < this.particles.length; i++) {
            if (this.fixed[i]) continue;
            
            const particle = this.particles[i];
            let tensionX = 0;
            let tensionY = 0;
            
            // Calculate surface tension based on neighboring particles
            for (let j = 0; j < this.particles.length; j++) {
                if (i === j) continue;
                
                const other = this.particles[j];
                const dx = other.x - particle.x;
                const dy = other.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.config.particleSize * 3) {
                    const tension = (1 - distance / (this.config.particleSize * 3)) * surfaceTension;
                    tensionX += dx * tension * 0.001;
                    tensionY += dy * tension * 0.001;
                }
            }
            
            this.acceleration[i].x += tensionX;
            this.acceleration[i].y += tensionY;
        }
    }

    startSimulation() {
        let lastTime = performance.now();
        
        const animate = (currentTime) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;
            
            this.updatePhysics(deltaTime);
            this.updatePerformance(currentTime);
            
            requestAnimationFrame(animate);
        };
        
        requestAnimationFrame(animate);
    }

    updatePerformance(currentTime) {
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    // Getter methods for external access
    getParticles() {
        return this.particles;
    }

    getPressure() {
        return this.pressure;
    }

    getFPS() {
        return this.fps;
    }

    getParticleCount() {
        return this.particles.length;
    }

    // Update configuration
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);
        
        // Update constraint properties
        for (const constraint of this.constraints) {
            if (constraint.type === 'radial') {
                constraint.stiffness = this.config.tension * 0.05;
            } else {
                constraint.stiffness = this.config.tension * 0.1;
            }
            constraint.damping = this.config.damping;
        }
    }

    // Reset simulation
    reset() {
        this.particles = [];
        this.constraints = [];
        this.velocity = [];
        this.acceleration = [];
        this.pressure = [];
        this.mass = [];
        this.fixed = [];
        
        this.initialize();
    }
}

// Export for use in other modules
window.PhysicsSystem = PhysicsSystem;