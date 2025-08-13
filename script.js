// Configurações do botão
const button = document.getElementById('liquidButton');
let isPressed = false;
let pressStartTime = 0;

// Efeito de partículas flutuantes
class FloatingParticle {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.element = this.createParticle();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${this.size}px;
            height: ${this.size}px;
            background: rgba(138, 43, 226, ${this.opacity});
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            left: ${this.x}px;
            top: ${this.y}px;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(particle);
        return particle;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > window.innerWidth || this.x < 0) this.speedX *= -1;
        if (this.y > window.innerHeight || this.y < 0) this.speedY *= -1;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
    }
}

// Criar partículas flutuantes
const particles = [];
for (let i = 0; i < 15; i++) {
    particles.push(new FloatingParticle());
}

// Animar partículas
function animateParticles() {
    particles.forEach(particle => particle.update());
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Efeito de ondulação ao clicar
function createRipple(event) {
    const ripple = document.createElement('div');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
        border-radius: 50%;
        transform: scale(0);
        animation: rippleEffect 0.8s ease-out;
        pointer-events: none;
        z-index: 10;
    `;

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 800);
}

// Efeito de pressão com profundidade
function handlePressStart(event) {
    isPressed = true;
    pressStartTime = Date.now();
    
    // Adicionar classe para efeito de pressão
    button.classList.add('pressed');
    
    // Criar ondulação
    createRipple(event);
    
    // Efeito de sombra mais profunda
    const buttonBackground = button.querySelector('.button-background');
    buttonBackground.style.boxShadow = `
        0 10px 20px rgba(0, 0, 0, 0.4),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 2px 0 rgba(255, 255, 255, 0.3)
    `;
    
    // Efeito de gelatina mais intenso
    button.style.transform = 'translateY(3px) rotateX(-8deg) rotateY(-3deg) scale(0.97)';
}

function handlePressEnd() {
    if (!isPressed) return;
    
    isPressed = false;
    const pressDuration = Date.now() - pressStartTime;
    
    // Remover classe de pressão
    button.classList.remove('pressed');
    
    // Restaurar sombra
    const buttonBackground = button.querySelector('.button-background');
    buttonBackground.style.boxShadow = `
        0 20px 40px rgba(0, 0, 0, 0.3),
        0 0 0 1px rgba(255, 255, 255, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.2)
    `;
    
    // Restaurar transformação
    button.style.transform = '';
    
    // Efeito de rebote baseado na duração da pressão
    if (pressDuration > 200) {
        button.style.animation = 'bounceBack 0.4s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 400);
    }
}

// Efeito de movimento do mouse para profundidade 3D
function handleMouseMove(event) {
    if (isPressed) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const mouseX = event.clientX - centerX;
    const mouseY = event.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -5;
    const rotateY = (mouseX / (rect.width / 2)) * 5;
    
    button.style.transform = `translateY(-2px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
}

// Reset da transformação quando o mouse sai
function handleMouseLeave() {
    if (!isPressed) {
        button.style.transform = '';
    }
}

// Efeito de foco com teclado
function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
    }
}

// Adicionar estilos CSS dinâmicos para animações
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    @keyframes bounceBack {
        0% {
            transform: scale(0.97);
        }
        50% {
            transform: scale(1.02);
        }
        100% {
            transform: scale(1);
        }
    }
    
    .button-3d.pressed .liquid-overlay {
        animation: liquidPress 0.3s ease-out;
    }
    
    @keyframes liquidPress {
        0% {
            transform: translateZ(5px) scale(1);
        }
        50% {
            transform: translateZ(8px) scale(1.05);
        }
        100% {
            transform: translateZ(5px) scale(1);
        }
    }
    
    .button-3d.pressed .glass-reflection {
        animation: glassPress 0.3s ease-out;
    }
    
    @keyframes glassPress {
        0% {
            transform: translateZ(10px) rotate(0deg);
        }
        50% {
            transform: translateZ(12px) rotate(2deg);
        }
        100% {
            transform: translateZ(10px) rotate(0deg);
        }
    }
`;
document.head.appendChild(style);

// Event listeners
button.addEventListener('mousedown', handlePressStart);
button.addEventListener('mouseup', handlePressEnd);
button.addEventListener('mouseleave', handlePressEnd);
button.addEventListener('mousemove', handleMouseMove);
button.addEventListener('mouseleave', handleMouseLeave);
button.addEventListener('keydown', handleKeyDown);

// Efeito de entrada da página
window.addEventListener('load', () => {
    button.style.opacity = '0';
    button.style.transform = 'translateY(50px) rotateX(20deg)';
    
    setTimeout(() => {
        button.style.transition = 'all 1s cubic-bezier(0.23, 1, 0.32, 1)';
        button.style.opacity = '1';
        button.style.transform = 'translateY(0) rotateX(0deg)';
    }, 300);
});

// Efeito de parallax no fundo
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const parallax = document.querySelector('body::before');
    if (parallax) {
        parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Efeito de ressonância ao clicar
button.addEventListener('click', () => {
    // Criar múltiplas ondas de ressonância
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const resonance = document.createElement('div');
            resonance.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 2px solid rgba(138, 43, 226, ${0.3 - i * 0.1});
                border-radius: 20px;
                animation: resonance ${0.8 + i * 0.2}s ease-out;
                pointer-events: none;
                z-index: ${5 - i};
            `;
            
            button.appendChild(resonance);
            
            setTimeout(() => {
                resonance.remove();
            }, (0.8 + i * 0.2) * 1000);
        }, i * 100);
    }
});

// Adicionar animação de ressonância
const resonanceStyle = document.createElement('style');
resonanceStyle.textContent = `
    @keyframes resonance {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(resonanceStyle);

// Efeito de hover com partículas
button.addEventListener('mouseenter', () => {
    // Criar partículas de brilho ao redor do botão
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            const angle = (i / 8) * Math.PI * 2;
            const distance = 60;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            
            sparkle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.8);
                border-radius: 50%;
                left: calc(50% + ${x}px);
                top: calc(50% + ${y}px);
                transform: translate(-50%, -50%);
                animation: sparkleEffect 1s ease-out;
                pointer-events: none;
                z-index: 15;
            `;
            
            button.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 100);
    }
});

// Adicionar animação de brilho
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleEffect {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);

console.log('🎨 Botão 3D Liquid Glass carregado com sucesso!');
console.log('✨ Tecnologias utilizadas: CSS 3D Transforms, Backdrop Filter, CSS Animations, JavaScript ES6+');