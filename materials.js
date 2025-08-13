/**
 * Advanced Material System for Ultra-Realistic 3D Button
 * Implements PBR materials, realistic glass properties, and dynamic material blending
 */

class MaterialSystem {
    constructor() {
        this.materials = new Map();
        this.activeMaterial = null;
        this.materialPresets = new Map();
        this.initializeMaterials();
        this.initializePresets();
    }

    initializeMaterials() {
        // Glass Material
        this.materials.set('glass', {
            name: 'Glass',
            type: 'dielectric',
            properties: {
                refractionIndex: 1.33,
                transparency: 0.8,
                roughness: 0.1,
                metallic: 0.0,
                fresnel: 0.8,
                caustics: 1.0,
                subsurface: 0.3,
                ior: 1.33,
                transmission: 0.9,
                thickness: 1.0,
                attenuationDistance: 1.0,
                attenuationColor: { r: 1.0, g: 1.0, b: 1.0 }
            },
            shaders: ['glass', 'fresnel', 'caustics'],
            blendMode: 'alpha'
        });

        // Crystal Material
        this.materials.set('crystal', {
            name: 'Crystal',
            type: 'dielectric',
            properties: {
                refractionIndex: 1.5,
                transparency: 0.95,
                roughness: 0.05,
                metallic: 0.0,
                fresnel: 0.9,
                caustics: 1.2,
                subsurface: 0.1,
                ior: 1.5,
                transmission: 0.95,
                thickness: 0.5,
                attenuationDistance: 0.5,
                attenuationColor: { r: 1.0, g: 1.0, b: 1.0 }
            },
            shaders: ['glass', 'fresnel', 'caustics'],
            blendMode: 'additive'
        });

        // Jelly Material
        this.materials.set('jelly', {
            name: 'Jelly',
            type: 'subsurface',
            properties: {
                refractionIndex: 1.4,
                transparency: 0.6,
                roughness: 0.3,
                metallic: 0.0,
                fresnel: 0.6,
                caustics: 0.8,
                subsurface: 0.8,
                ior: 1.4,
                transmission: 0.7,
                thickness: 2.0,
                attenuationDistance: 2.0,
                attenuationColor: { r: 1.0, g: 0.8, b: 0.8 }
            },
            shaders: ['glass', 'subsurface', 'caustics'],
            blendMode: 'multiply'
        });

        // Water Material
        this.materials.set('water', {
            name: 'Water',
            type: 'fluid',
            properties: {
                refractionIndex: 1.33,
                transparency: 0.9,
                roughness: 0.0,
                metallic: 0.0,
                fresnel: 0.7,
                caustics: 1.5,
                subsurface: 0.2,
                ior: 1.33,
                transmission: 0.95,
                thickness: 0.1,
                attenuationDistance: 0.1,
                attenuationColor: { r: 0.8, g: 0.9, b: 1.0 }
            },
            shaders: ['glass', 'fresnel', 'caustics'],
            blendMode: 'screen'
        });

        // Diamond Material
        this.materials.set('diamond', {
            name: 'Diamond',
            type: 'crystal',
            properties: {
                refractionIndex: 2.42,
                transparency: 0.98,
                roughness: 0.01,
                metallic: 0.0,
                fresnel: 1.0,
                caustics: 2.0,
                subsurface: 0.05,
                ior: 2.42,
                transmission: 0.98,
                thickness: 0.2,
                attenuationDistance: 0.2,
                attenuationColor: { r: 1.0, g: 1.0, b: 1.0 }
            },
            shaders: ['glass', 'fresnel', 'caustics'],
            blendMode: 'overlay'
        });

        // Set default material
        this.activeMaterial = this.materials.get('glass');
    }

    initializePresets() {
        // Crystal preset
        this.materialPresets.set('crystal', {
            refractionIndex: 1.5,
            transparency: 0.95,
            roughness: 0.05,
            elasticity: 1.2,
            damping: 0.98,
            tension: 1.5,
            caustics: 1.2,
            fresnel: 0.9,
            subsurface: 0.1
        });

        // Jelly preset
        this.materialPresets.set('jelly', {
            refractionIndex: 1.4,
            transparency: 0.6,
            roughness: 0.3,
            elasticity: 1.8,
            damping: 0.92,
            tension: 0.8,
            caustics: 0.8,
            fresnel: 0.6,
            subsurface: 0.8
        });

        // Glass preset
        this.materialPresets.set('glass', {
            refractionIndex: 1.33,
            transparency: 0.8,
            roughness: 0.1,
            elasticity: 1.0,
            damping: 0.95,
            tension: 1.0,
            caustics: 1.0,
            fresnel: 0.8,
            subsurface: 0.3
        });

        // Water preset
        this.materialPresets.set('water', {
            refractionIndex: 1.33,
            transparency: 0.9,
            roughness: 0.0,
            elasticity: 0.7,
            damping: 0.97,
            tension: 1.2,
            caustics: 1.5,
            fresnel: 0.7,
            subsurface: 0.2
        });

        // Diamond preset
        this.materialPresets.set('diamond', {
            refractionIndex: 2.42,
            transparency: 0.98,
            roughness: 0.01,
            elasticity: 0.5,
            damping: 0.99,
            tension: 2.0,
            caustics: 2.0,
            fresnel: 1.0,
            subsurface: 0.05
        });
    }

    // Get material by name
    getMaterial(name) {
        return this.materials.get(name);
    }

    // Get active material
    getActiveMaterial() {
        return this.activeMaterial;
    }

    // Set active material
    setActiveMaterial(name) {
        const material = this.materials.get(name);
        if (material) {
            this.activeMaterial = material;
            return true;
        }
        return false;
    }

    // Get material preset
    getPreset(name) {
        return this.materialPresets.get(name);
    }

    // Apply material preset
    applyPreset(name, physicsSystem, shaderSystem) {
        const preset = this.materialPresets.get(name);
        if (!preset) return false;

        // Update physics system
        if (physicsSystem) {
            physicsSystem.updateConfig({
                elasticity: preset.elasticity,
                damping: preset.damping,
                tension: preset.tension
            });
        }

        // Update shader system
        if (shaderSystem) {
            shaderSystem.updateShaderParameters('glass', {
                refractionIndex: preset.refractionIndex,
                transparency: preset.transparency,
                roughness: preset.roughness,
                fresnel: preset.fresnel,
                caustics: preset.caustics,
                subsurface: preset.subsurface
            });
        }

        return true;
    }

    // Calculate material properties based on physics state
    calculateDynamicProperties(particles, pressure, velocity) {
        const dynamicMaterial = { ...this.activeMaterial };
        
        // Adjust transparency based on pressure
        const avgPressure = pressure.reduce((sum, p) => sum + p, 0) / pressure.length;
        dynamicMaterial.properties.transparency = Math.max(0.1, 
            this.activeMaterial.properties.transparency - avgPressure * 0.1);

        // Adjust roughness based on velocity
        const avgVelocity = velocity.reduce((sum, v) => sum + Math.sqrt(v.x * v.x + v.y * v.y), 0) / velocity.length;
        dynamicMaterial.properties.roughness = Math.min(1.0, 
            this.activeMaterial.properties.roughness + avgVelocity * 0.01);

        // Adjust fresnel based on deformation
        const centerX = 600; // Canvas center
        const centerY = 400;
        let maxDeformation = 0;
        
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            const dx = particle.x - centerX;
            const dy = particle.y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const originalDistance = 120; // Button radius
            const deformation = Math.abs(distance - originalDistance);
            maxDeformation = Math.max(maxDeformation, deformation);
        }
        
        dynamicMaterial.properties.fresnel = Math.min(1.0, 
            this.activeMaterial.properties.fresnel + maxDeformation * 0.001);

        return dynamicMaterial;
    }

    // Blend two materials
    blendMaterials(material1, material2, blendFactor, blendMode = 'normal') {
        const blendedMaterial = {
            name: `${material1.name} + ${material2.name}`,
            type: material1.type,
            properties: {},
            shaders: [...new Set([...material1.shaders, ...material2.shaders])],
            blendMode: blendMode
        };

        // Blend each property
        for (const [key, value1] of Object.entries(material1.properties)) {
            const value2 = material2.properties[key];
            
            if (typeof value1 === 'number') {
                blendedMaterial.properties[key] = value1 * (1 - blendFactor) + value2 * blendFactor;
            } else if (typeof value1 === 'object' && value1.r !== undefined) {
                // Color blending
                blendedMaterial.properties[key] = {
                    r: value1.r * (1 - blendFactor) + value2.r * blendFactor,
                    g: value1.g * (1 - blendFactor) + value2.g * blendFactor,
                    b: value1.b * (1 - blendFactor) + value2.b * blendFactor
                };
            } else {
                blendedMaterial.properties[key] = value1;
            }
        }

        return blendedMaterial;
    }

    // Create custom material
    createCustomMaterial(name, properties) {
        const customMaterial = {
            name: name,
            type: 'custom',
            properties: { ...properties },
            shaders: ['glass', 'fresnel'],
            blendMode: 'normal'
        };

        this.materials.set(name, customMaterial);
        return customMaterial;
    }

    // Update material properties
    updateMaterialProperties(materialName, properties) {
        const material = this.materials.get(materialName);
        if (material) {
            Object.assign(material.properties, properties);
            return true;
        }
        return false;
    }

    // Get material list
    getMaterialList() {
        return Array.from(this.materials.keys());
    }

    // Get preset list
    getPresetList() {
        return Array.from(this.materialPresets.keys());
    }

    // Export material to JSON
    exportMaterial(name) {
        const material = this.materials.get(name);
        if (material) {
            return JSON.stringify(material, null, 2);
        }
        return null;
    }

    // Import material from JSON
    importMaterial(jsonString) {
        try {
            const material = JSON.parse(jsonString);
            if (material.name && material.properties) {
                this.materials.set(material.name, material);
                return true;
            }
        } catch (e) {
            console.error('Failed to import material:', e);
        }
        return false;
    }

    // Calculate material response to light
    calculateLightResponse(material, lightDirection, viewDirection, normal) {
        const { properties } = material;
        
        // Calculate reflection
        const reflection = this.calculateReflection(lightDirection, normal);
        
        // Calculate refraction
        const refraction = this.calculateRefraction(lightDirection, normal, properties.ior);
        
        // Calculate fresnel
        const fresnel = this.calculateFresnel(lightDirection, normal, properties.ior);
        
        // Calculate transmission
        const transmission = properties.transmission * (1 - fresnel);
        
        return {
            reflection: reflection * (1 - properties.transparency),
            refraction: refraction * properties.transparency,
            transmission: transmission,
            fresnel: fresnel,
            roughness: properties.roughness,
            metallic: properties.metallic
        };
    }

    // Calculate reflection vector
    calculateReflection(incident, normal) {
        const dot = incident.x * normal.x + incident.y * normal.y;
        return {
            x: incident.x - 2 * dot * normal.x,
            y: incident.y - 2 * dot * normal.y
        };
    }

    // Calculate refraction vector
    calculateRefraction(incident, normal, ior) {
        const dot = incident.x * normal.x + incident.y * normal.y;
        const k = 1 - ior * ior * (1 - dot * dot);
        
        if (k < 0) {
            return this.calculateReflection(incident, normal);
        }
        
        return {
            x: ior * incident.x - (ior * dot + Math.sqrt(k)) * normal.x,
            y: ior * incident.y - (ior * dot + Math.sqrt(k)) * normal.y
        };
    }

    // Calculate fresnel coefficient
    calculateFresnel(incident, normal, ior) {
        const dot = Math.abs(incident.x * normal.x + incident.y * normal.y);
        const f0 = Math.pow((ior - 1) / (ior + 1), 2);
        return f0 + (1 - f0) * Math.pow(1 - dot, 5);
    }

    // Get material properties for rendering
    getRenderingProperties(materialName = null) {
        const material = materialName ? this.materials.get(materialName) : this.activeMaterial;
        if (!material) return null;

        return {
            ...material.properties,
            shaders: material.shaders,
            blendMode: material.blendMode
        };
    }

    // Validate material properties
    validateMaterial(material) {
        const required = ['name', 'properties', 'shaders'];
        const validProperties = ['refractionIndex', 'transparency', 'roughness', 'metallic', 'fresnel'];
        
        for (const field of required) {
            if (!material[field]) return false;
        }
        
        for (const prop of validProperties) {
            if (material.properties[prop] === undefined) return false;
        }
        
        return true;
    }
}

// Export for use in other modules
window.MaterialSystem = MaterialSystem;