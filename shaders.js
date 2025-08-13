/**
 * Advanced Shader System for Ultra-Realistic 3D Button
 * Implements WebGL-like effects using Canvas 2D with custom shaders
 */

class ShaderSystem {
    constructor() {
        this.shaders = new Map();
        this.effects = new Map();
        this.initializeShaders();
    }

    initializeShaders() {
        // Fragment shader for glass material
        this.shaders.set('glass', {
            name: 'Glass Material Shader',
            parameters: {
                refractionIndex: 1.33,
                transparency: 0.8,
                roughness: 0.1,
                fresnel: 0.8,
                caustics: 1.0,
                subsurface: 0.3
            },
            render: (ctx, x, y, params, backgroundData) => {
                return this.renderGlassShader(ctx, x, y, params, backgroundData);
            }
        });

        // Fragment shader for caustics effect
        this.shaders.set('caustics', {
            name: 'Caustics Effect Shader',
            parameters: {
                intensity: 1.0,
                scale: 0.02,
                speed: 0.001
            },
            render: (ctx, x, y, params, time) => {
                return this.renderCausticsShader(ctx, x, y, params, time);
            }
        });

        // Fragment shader for fresnel effect
        this.shaders.set('fresnel', {
            name: 'Fresnel Effect Shader',
            parameters: {
                power: 5.0,
                scale: 1.0,
                bias: 0.0
            },
            render: (ctx, x, y, params, viewAngle) => {
                return this.renderFresnelShader(ctx, x, y, params, viewAngle);
            }
        });

        // Fragment shader for subsurface scattering
        this.shaders.set('subsurface', {
            name: 'Subsurface Scattering Shader',
            parameters: {
                strength: 0.3,
                radius: 10.0,
                falloff: 0.8
            },
            render: (ctx, x, y, params, depth) => {
                return this.renderSubsurfaceShader(ctx, x, y, params, depth);
            }
        });
    }

    renderGlassShader(ctx, x, y, params, backgroundData) {
        const { refractionIndex, transparency, roughness, fresnel, caustics, subsurface } = params;
        
        // Calculate refraction offset
        const refractionOffset = (refractionIndex - 1.0) * 2.0;
        const sourceX = x + Math.sin(x * 0.01) * refractionOffset;
        const sourceY = y + Math.cos(y * 0.01) * refractionOffset;
        
        // Sample background with refraction
        let color = { r: 0, g: 0, b: 0, a: 0 };
        
        if (backgroundData && sourceX >= 0 && sourceX < backgroundData.width && 
            sourceY >= 0 && sourceY < backgroundData.height) {
            const index = (Math.floor(sourceY) * backgroundData.width + Math.floor(sourceX)) * 4;
            color.r = backgroundData.data[index];
            color.g = backgroundData.data[index + 1];
            color.b = backgroundData.data[index + 2];
            color.a = backgroundData.data[index + 3];
        }
        
        // Apply roughness (blur effect)
        if (roughness > 0.1) {
            const blurRadius = roughness * 5;
            color = this.applyGaussianBlur(color, blurRadius);
        }
        
        // Apply fresnel effect
        const fresnelFactor = this.calculateFresnel(x, y, fresnel);
        color = this.blendColors(color, { r: 255, g: 255, b: 255, a: 255 }, fresnelFactor * 0.3);
        
        // Apply caustics
        if (caustics > 0) {
            const causticsFactor = this.calculateCaustics(x, y, caustics);
            color = this.blendColors(color, { r: 255, g: 255, b: 200, a: 255 }, causticsFactor * 0.2);
        }
        
        // Apply subsurface scattering
        if (subsurface > 0) {
            const subsurfaceFactor = this.calculateSubsurface(x, y, subsurface);
            color = this.blendColors(color, { r: 255, g: 200, b: 200, a: 255 }, subsurfaceFactor * 0.15);
        }
        
        // Apply transparency
        color.a = Math.floor(color.a * transparency);
        
        return color;
    }

    renderCausticsShader(ctx, x, y, params, time) {
        const { intensity, scale, speed } = params;
        
        // Generate caustics pattern using noise
        const noise1 = this.simplexNoise(x * scale + time * speed, y * scale);
        const noise2 = this.simplexNoise(x * scale * 2 + time * speed * 1.5, y * scale * 2);
        const noise3 = this.simplexNoise(x * scale * 4 + time * speed * 2, y * scale * 4);
        
        const causticsValue = (noise1 + noise2 * 0.5 + noise3 * 0.25) * intensity;
        
        return {
            r: Math.floor(255 * (1 + causticsValue * 0.3)),
            g: Math.floor(255 * (1 + causticsValue * 0.2)),
            b: Math.floor(255 * (1 + causticsValue * 0.1)),
            a: Math.floor(255 * Math.max(0, causticsValue))
        };
    }

    renderFresnelShader(ctx, x, y, params, viewAngle) {
        const { power, scale, bias } = params;
        
        // Calculate fresnel based on view angle
        const fresnel = Math.pow(Math.max(0, 1 - Math.abs(viewAngle)), power) * scale + bias;
        
        return {
            r: Math.floor(255 * fresnel),
            g: Math.floor(255 * fresnel),
            b: Math.floor(255 * fresnel),
            a: Math.floor(255 * fresnel)
        };
    }

    renderSubsurfaceShader(ctx, x, y, params, depth) {
        const { strength, radius, falloff } = params;
        
        // Calculate subsurface scattering based on depth
        const subsurface = Math.exp(-depth / radius) * strength * falloff;
        
        return {
            r: Math.floor(255 * subsurface),
            g: Math.floor(200 * subsurface),
            b: Math.floor(200 * subsurface),
            a: Math.floor(255 * subsurface)
        };
    }

    // Utility functions
    calculateFresnel(x, y, strength) {
        const centerX = 600; // Canvas center
        const centerY = 400;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;
        
        return Math.max(0, 1 - distance / maxDistance) * strength;
    }

    calculateCaustics(x, y, intensity) {
        const time = Date.now() * 0.001;
        const noise1 = this.simplexNoise(x * 0.02 + time, y * 0.02);
        const noise2 = this.simplexNoise(x * 0.04 + time * 1.5, y * 0.04);
        
        return (noise1 + noise2 * 0.5) * intensity;
    }

    calculateSubsurface(x, y, strength) {
        const centerX = 600;
        const centerY = 400;
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;
        
        return Math.max(0, 1 - distance / maxDistance) * strength;
    }

    applyGaussianBlur(color, radius) {
        // Simplified gaussian blur simulation
        const blurFactor = Math.min(1, radius / 10);
        const blurColor = { r: 128, g: 128, b: 128, a: 255 };
        
        return this.blendColors(color, blurColor, blurFactor * 0.3);
    }

    blendColors(color1, color2, factor) {
        return {
            r: Math.floor(color1.r * (1 - factor) + color2.r * factor),
            g: Math.floor(color1.g * (1 - factor) + color2.g * factor),
            b: Math.floor(color1.b * (1 - factor) + color2.b * factor),
            a: Math.floor(color1.a * (1 - factor) + color2.a * factor)
        };
    }

    // Simplex noise implementation for procedural effects
    simplexNoise(x, y) {
        // Simplified noise function for performance
        const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        return (n - Math.floor(n)) * 2 - 1;
    }

    // Advanced material blending
    blendMaterials(material1, material2, blendFactor, blendMode = 'normal') {
        switch (blendMode) {
            case 'multiply':
                return {
                    r: Math.floor(material1.r * material2.r / 255),
                    g: Math.floor(material1.g * material2.g / 255),
                    b: Math.floor(material1.b * material2.b / 255),
                    a: Math.floor(material1.a * material2.a / 255)
                };
            case 'screen':
                return {
                    r: Math.floor(255 - (255 - material1.r) * (255 - material2.r) / 255),
                    g: Math.floor(255 - (255 - material1.g) * (255 - material2.g) / 255),
                    b: Math.floor(255 - (255 - material1.b) * (255 - material2.b) / 255),
                    a: Math.floor(255 - (255 - material1.a) * (255 - material2.a) / 255)
                };
            case 'overlay':
                return {
                    r: material1.r < 128 ? 
                        Math.floor(2 * material1.r * material2.r / 255) :
                        Math.floor(255 - 2 * (255 - material1.r) * (255 - material2.r) / 255),
                    g: material1.g < 128 ? 
                        Math.floor(2 * material1.g * material2.g / 255) :
                        Math.floor(255 - 2 * (255 - material1.g) * (255 - material2.g) / 255),
                    b: material1.b < 128 ? 
                        Math.floor(2 * material1.b * material2.b / 255) :
                        Math.floor(255 - 2 * (255 - material1.b) * (255 - material2.b) / 255),
                    a: material1.a < 128 ? 
                        Math.floor(2 * material1.a * material2.a / 255) :
                        Math.floor(255 - 2 * (255 - material1.a) * (255 - material2.a) / 255)
                };
            default:
                return this.blendColors(material1, material2, blendFactor);
        }
    }

    // Environment mapping for reflections
    createEnvironmentMap(ctx, width, height) {
        const envMap = ctx.createImageData(width, height);
        const data = envMap.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const x = (i / 4) % width;
            const y = Math.floor((i / 4) / width);
            
            // Create a simple environment map
            const u = x / width;
            const v = y / height;
            
            data[i] = Math.floor(100 + 50 * Math.sin(u * Math.PI * 4));     // R
            data[i + 1] = Math.floor(150 + 50 * Math.cos(v * Math.PI * 4)); // G
            data[i + 2] = Math.floor(200 + 50 * Math.sin(u * Math.PI * 2)); // B
            data[i + 3] = 255; // A
        }
        
        return envMap;
    }

    // Normal mapping for surface detail
    calculateNormal(x, y, heightMap) {
        const center = this.sampleHeightMap(heightMap, x, y);
        const right = this.sampleHeightMap(heightMap, x + 1, y);
        const up = this.sampleHeightMap(heightMap, x, y - 1);
        
        const dx = (right - center) * 2;
        const dy = (up - center) * 2;
        
        return {
            x: dx,
            y: dy,
            z: 1.0
        };
    }

    sampleHeightMap(heightMap, x, y) {
        if (x < 0 || x >= heightMap.width || y < 0 || y >= heightMap.height) {
            return 0;
        }
        
        const index = (y * heightMap.width + x) * 4;
        return heightMap.data[index] / 255; // Normalize to 0-1
    }

    // Get shader by name
    getShader(name) {
        return this.shaders.get(name);
    }

    // Get all available shaders
    getAvailableShaders() {
        return Array.from(this.shaders.keys());
    }

    // Update shader parameters
    updateShaderParameters(shaderName, parameters) {
        const shader = this.shaders.get(shaderName);
        if (shader) {
            Object.assign(shader.parameters, parameters);
        }
    }
}

// Export for use in other modules
window.ShaderSystem = ShaderSystem;