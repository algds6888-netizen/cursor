document.addEventListener('DOMContentLoaded', function() {
    const liquidButton = document.getElementById('liquidButton');
    const splatContainer = document.getElementById('splatContainer');
    
    // Função para criar partículas de espatifamento
    function createSplatParticles(x, y) {
        const particleCount = 15; // Número de partículas
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'splat-particle';
            
            // Posição inicial (centro do clique)
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            
            // Velocidade e direção aleatória para cada partícula
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const velocity = 50 + Math.random() * 100;
            const vx = Math.cos(angle) * velocity;
            const vy = Math.sin(angle) * velocity;
            
            // Tamanho aleatório
            const size = 4 + Math.random() * 8;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            
            // Cor aleatória para simular gelatina translúcida
            const alpha = 0.6 + Math.random() * 0.4;
            const hue = 200 + Math.random() * 60; // Tons de azul/roxo
            particle.style.background = `radial-gradient(circle at center, 
                hsla(${hue}, 70%, 80%, ${alpha}) 0%, 
                hsla(${hue}, 70%, 60%, ${alpha * 0.6}) 60%, 
                transparent 100%)`;
            
            // Aplicar animação personalizada
            particle.style.animation = 'none';
            particle.style.transition = 'all 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            // Adicionar ao container
            splatContainer.appendChild(particle);
            
            // Animar a partícula
            requestAnimationFrame(() => {
                particle.style.transform = `translate(${vx}px, ${vy}px) scale(0)`;
                particle.style.opacity = '0';
            });
            
            // Remover partícula após animação
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 1500);
        }
    }
    
    // Função para criar efeito de onda de impacto
    function createImpactWave(x, y) {
        const wave = document.createElement('div');
        wave.style.position = 'absolute';
        wave.style.left = (x - 25) + 'px';
        wave.style.top = (y - 25) + 'px';
        wave.style.width = '50px';
        wave.style.height = '50px';
        wave.style.border = '2px solid rgba(255, 255, 255, 0.6)';
        wave.style.borderRadius = '50%';
        wave.style.pointerEvents = 'none';
        wave.style.zIndex = '99';
        wave.style.animation = 'impactWave 0.8s ease-out forwards';
        
        // Adicionar keyframes para a onda
        const style = document.createElement('style');
        style.textContent = `
            @keyframes impactWave {
                0% {
                    transform: scale(0);
                    opacity: 1;
                    border-width: 2px;
                }
                100% {
                    transform: scale(3);
                    opacity: 0;
                    border-width: 1px;
                }
            }
        `;
        document.head.appendChild(style);
        
        splatContainer.appendChild(wave);
        
        // Remover onda após animação
        setTimeout(() => {
            if (wave.parentNode) {
                wave.parentNode.removeChild(wave);
            }
        }, 800);
    }
    
    // Event listener para clique
    liquidButton.addEventListener('click', function(e) {
        // Obter posição do clique
        const rect = liquidButton.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Criar efeitos de espatifamento
        createSplatParticles(x, y);
        createImpactWave(x, y);
        
        // Efeito de vibração no botão
        liquidButton.style.animation = 'none';
        liquidButton.offsetHeight; // Trigger reflow
        liquidButton.style.animation = 'buttonShake 0.6s ease-out';
        
        // Adicionar keyframes para vibração
        if (!document.querySelector('#shakeKeyframes')) {
            const shakeStyle = document.createElement('style');
            shakeStyle.id = 'shakeKeyframes';
            shakeStyle.textContent = `
                @keyframes buttonShake {
                    0%, 100% { transform: translateZ(0) rotateX(0deg) rotateY(0deg); }
                    10%, 30%, 50%, 70%, 90% { transform: translateZ(5px) rotateX(2deg) rotateY(2deg); }
                    20%, 40%, 60%, 80% { transform: translateZ(5px) rotateX(-2deg) rotateY(-2deg); }
                }
            `;
            document.head.appendChild(shakeStyle);
        }
        
        // Reset da animação após conclusão
        setTimeout(() => {
            liquidButton.style.animation = '';
        }, 600);
    });
    
    // Efeito de hover com ondulação
    liquidButton.addEventListener('mouseenter', function() {
        const liquidEffect = this.querySelector('.liquid-effect');
        liquidEffect.style.animation = 'liquidFlow 3s ease-in-out infinite, shimmer 2s ease-in-out infinite';
    });
    
    liquidButton.addEventListener('mouseleave', function() {
        const liquidEffect = this.querySelector('.liquid-effect');
        liquidEffect.style.animation = 'liquidFlow 6s ease-in-out infinite, shimmer 4s ease-in-out infinite';
    });
    
    // Efeito de movimento do mouse para simular profundidade
    document.addEventListener('mousemove', function(e) {
        const rect = liquidButton.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const mouseX = e.clientX - centerX;
        const mouseY = e.clientY - centerY;
        
        const maxTilt = 8; // Máximo de inclinação em graus
        const tiltX = (mouseY / (rect.height / 2)) * maxTilt;
        const tiltY = (mouseX / (rect.width / 2)) * maxTilt;
        
        liquidButton.style.transform = `translateZ(20px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });
    
    // Reset da transformação quando o mouse sair da área
    liquidButton.addEventListener('mouseleave', function() {
        liquidButton.style.transform = 'translateZ(0) rotateX(0deg) rotateY(0deg)';
    });
});