// Configurações do botão 3D extremo
const button = document.getElementById('liquidButton');
let isPressed = false;
let pressStartTime = 0;
let mouseX = 0;
let mouseY = 0;

// Efeito de partículas flutuantes 3D
class FloatingParticle3D {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = Math.random() * window.innerHeight;
        this.z = Math.random() * 100 - 50; // Profundidade 3D
        this.size = Math.random() * 4 + 2;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.speedZ = Math.random() * 2 - 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.element = this.createParticle();
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            width: ${this.size}px;
            height: ${this.size}px;
            background: radial-gradient(circle, 
                rgba(138, 43, 226, ${this.opacity}) 0%, 
                rgba(75, 0, 130, ${this.opacity * 0.5}) 100%);
            border-radius: 50%;
            pointer-events: none;
            z-index: 1;
            left: ${this.x}px;
            top: ${this.y}px;
            transform: translateZ(${this.z}px);
            transition: all 0.4s ease;
            box-shadow: 0 0 20px rgba(138, 43, 226, ${this.opacity * 0.5});
        `;
        document.body.appendChild(particle);
        return particle;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.z += this.speedZ;

        if (this.x > window.innerWidth || this.x < 0) this.speedX *= -1;
        if (this.y > window.innerHeight || this.y < 0) this.speedY *= -1;
        if (this.z > 50 || this.z < -50) this.speedZ *= -1;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.transform = `translateZ(${this.z}px)`;
        
        // Efeito de profundidade na opacidade
        const depthOpacity = Math.max(0.1, 1 - Math.abs(this.z) / 50);
        this.element.style.opacity = depthOpacity;
    }
}

// Criar partículas flutuantes 3D
const particles = [];
for (let i = 0; i < 20; i++) {
    particles.push(new FloatingParticle3D());
}

// Animar partículas com profundidade
function animateParticles() {
    particles.forEach(particle => particle.update());
    requestAnimationFrame(animateParticles);
}
animateParticles();

// Efeito de ondulação 3D ao clicar
function createRipple3D(event) {
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
        background: radial-gradient(circle, 
            rgba(255, 255, 255, 0.4) 0%, 
            rgba(138, 43, 226, 0.2) 50%, 
            transparent 70%);
        border-radius: 50%;
        transform: translateZ(80px) scale(0);
        animation: rippleEffect3D 1s ease-out;
        pointer-events: none;
        z-index: 20;
        box-shadow: 0 0 30px rgba(255, 255, 255, 0.3);
    `;

    button.appendChild(ripple);

    setTimeout(() => {
        ripple.remove();
    }, 1000);
}

// Efeito de pressão com profundidade extrema
function handlePressStart(event) {
    isPressed = true;
    pressStartTime = Date.now();
    
    // Adicionar classe para efeito de pressão
    button.classList.add('pressed');
    
    // Criar ondulação 3D
    createRipple3D(event);
    
    // Efeito de sombra mais profunda
    const buttonBackground = button.querySelector('.button-background');
    buttonBackground.style.boxShadow = `
        0 20px 40px rgba(0, 0, 0, 0.6),
        0 0 0 3px rgba(255, 255, 255, 0.3),
        inset 0 3px 0 rgba(255, 255, 255, 0.4),
        inset 0 -3px 0 rgba(0, 0, 0, 0.3)
    `;
    
    // Efeito de gelatina mais intenso com profundidade
    button.style.transform = 'translateY(8px) translateZ(-40px) rotateX(-15deg) rotateY(-8deg) scale(0.92)';
    
    // Animar camadas de extrusão
    animateExtrusions('press');
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
        0 40px 80px rgba(0, 0, 0, 0.5),
        0 0 0 2px rgba(255, 255, 255, 0.2),
        inset 0 2px 0 rgba(255, 255, 255, 0.3),
        inset 0 -2px 0 rgba(0, 0, 0, 0.2)
    `;
    
    // Restaurar transformação
    button.style.transform = '';
    
    // Efeito de rebote baseado na duração da pressão
    if (pressDuration > 200) {
        button.style.animation = 'bounceBack3D 0.6s ease-out';
        setTimeout(() => {
            button.style.animation = '';
        }, 600);
    }
    
    // Animar camadas de extrusão de volta
    animateExtrusions('release');
}

// Animar camadas de extrusão
function animateExtrusions(action) {
    const extrusions = [
        '.button-extrusion-left',
        '.button-extrusion-right', 
        '.button-extrusion-top',
        '.button-extrusion-bottom'
    ];
    
    extrusions.forEach((selector, index) => {
        const element = button.querySelector(selector);
        if (element) {
            if (action === 'press') {
                element.style.animation = `extrusionPress${index} 0.8s ease-out`;
            } else {
                element.style.animation = `extrusionRelease${index} 0.6s ease-out`;
            }
        }
    });
}

// Efeito de movimento do mouse para profundidade 3D extrema
function handleMouseMove(event) {
    if (isPressed) return;
    
    const rect = button.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    mouseX = event.clientX - centerX;
    mouseY = event.clientY - centerY;
    
    const rotateX = (mouseY / (rect.height / 2)) * -8;
    const rotateY = (mouseX / (rect.width / 2)) * 8;
    const translateZ = Math.min(80, Math.sqrt(mouseX * mouseX + mouseY * mouseY) / 3);
    
    button.style.transform = `translateY(-8px) translateZ(${translateZ}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    
    // Animar camadas de extrusão com movimento
    animateExtrusionsWithMouse(rotateX, rotateY, translateZ);
}

// Animar extrusões com movimento do mouse
function animateExtrusionsWithMouse(rotateX, rotateY, translateZ) {
    const extrusions = {
        left: button.querySelector('.button-extrusion-left'),
        right: button.querySelector('.button-extrusion-right'),
        top: button.querySelector('.button-extrusion-top'),
        bottom: button.querySelector('.button-extrusion-bottom')
    };
    
    if (extrusions.left) {
        extrusions.left.style.transform = `translateZ(${-40 - translateZ * 0.3}px) rotateY(90deg) translateX(${-5 - rotateY * 0.5}px)`;
    }
    if (extrusions.right) {
        extrusions.right.style.transform = `translateZ(${-40 - translateZ * 0.3}px) rotateY(-90deg) translateX(${5 + rotateY * 0.5}px)`;
    }
    if (extrusions.top) {
        extrusions.top.style.transform = `translateZ(${-40 - translateZ * 0.3}px) rotateX(-90deg) translateY(${-5 - rotateX * 0.5}px)`;
    }
    if (extrusions.bottom) {
        extrusions.bottom.style.transform = `translateZ(${-40 - translateZ * 0.3}px) rotateX(90deg) translateY(${5 + rotateX * 0.5}px)`;
    }
}

// Reset da transformação quando o mouse sai
function handleMouseLeave() {
    if (!isPressed) {
        button.style.transform = '';
        resetExtrusions();
    }
}

// Reset das extrusões
function resetExtrusions() {
    const extrusions = {
        left: button.querySelector('.button-extrusion-left'),
        right: button.querySelector('.button-extrusion-right'),
        top: button.querySelector('.button-extrusion-top'),
        bottom: button.querySelector('.button-extrusion-bottom')
    };
    
    if (extrusions.left) extrusions.left.style.transform = 'translateZ(-40px) rotateY(90deg)';
    if (extrusions.right) extrusions.right.style.transform = 'translateZ(-40px) rotateY(-90deg)';
    if (extrusions.top) extrusions.top.style.transform = 'translateZ(-40px) rotateX(-90deg)';
    if (extrusions.bottom) extrusions.bottom.style.transform = 'translateZ(-40px) rotateX(90deg)';
}

// Efeito de foco com teclado
function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
    }
}

// Adicionar estilos CSS dinâmicos para animações 3D extremas
const style = document.createElement('style');
style.textContent = `
    @keyframes rippleEffect3D {
        0% {
            transform: translateZ(80px) scale(0);
            opacity: 1;
        }
        100% {
            transform: translateZ(80px) scale(3);
            opacity: 0;
        }
    }
    
    @keyframes bounceBack3D {
        0% {
            transform: translateZ(-40px) scale(0.92);
        }
        50% {
            transform: translateZ(20px) scale(1.08);
        }
        100% {
            transform: translateZ(0px) scale(1);
        }
    }
    
    .button-3d.pressed .liquid-overlay {
        animation: liquidPress3D 0.8s ease-out;
    }
    
    @keyframes liquidPress3D {
        0% {
            transform: translateZ(30px) scale(1);
        }
        50% {
            transform: translateZ(60px) scale(1.1);
        }
        100% {
            transform: translateZ(30px) scale(1);
        }
    }
    
    .button-3d.pressed .glass-reflection {
        animation: glassPress3D 0.8s ease-out;
    }
    
    @keyframes glassPress3D {
        0% {
            transform: translateZ(50px) rotate(0deg);
        }
        50% {
            transform: translateZ(70px) rotate(3deg);
        }
        100% {
            transform: translateZ(50px) rotate(0deg);
        }
    }
    
    /* Animações de extrusão */
    @keyframes extrusionPress0 {
        0% { transform: translateZ(-40px) rotateY(90deg); }
        50% { transform: translateZ(-60px) rotateY(90deg) translateX(-8px); }
        100% { transform: translateZ(-40px) rotateY(90deg); }
    }
    
    @keyframes extrusionPress1 {
        0% { transform: translateZ(-40px) rotateY(-90deg); }
        50% { transform: translateZ(-60px) rotateY(-90deg) translateX(8px); }
        100% { transform: translateZ(-40px) rotateY(-90deg); }
    }
    
    @keyframes extrusionPress2 {
        0% { transform: translateZ(-40px) rotateX(-90deg); }
        50% { transform: translateZ(-60px) rotateX(-90deg) translateY(-8px); }
        100% { transform: translateZ(-40px) rotateX(-90deg); }
    }
    
    @keyframes extrusionPress3 {
        0% { transform: translateZ(-40px) rotateX(90deg); }
        50% { transform: translateZ(-60px) rotateX(90deg) translateY(8px); }
        100% { transform: translateZ(-40px) rotateX(90deg); }
    }
    
    @keyframes extrusionRelease0 {
        0% { transform: translateZ(-60px) rotateY(90deg) translateX(-8px); }
        100% { transform: translateZ(-40px) rotateY(90deg); }
    }
    
    @keyframes extrusionRelease1 {
        0% { transform: translateZ(-60px) rotateY(-90deg) translateX(8px); }
        100% { transform: translateZ(-40px) rotateY(-90deg); }
    }
    
    @keyframes extrusionRelease2 {
        0% { transform: translateZ(-60px) rotateX(-90deg) translateY(-8px); }
        100% { transform: translateZ(-40px) rotateX(-90deg); }
    }
    
    @keyframes extrusionRelease3 {
        0% { transform: translateZ(-60px) rotateX(90deg) translateY(8px); }
        100% { transform: translateZ(-40px) rotateX(90deg); }
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

// Efeito de entrada da página com profundidade extrema
window.addEventListener('load', () => {
    button.style.opacity = '0';
    button.style.transform = 'translateY(100px) translateZ(-200px) rotateX(45deg) rotateY(30deg) scale(0.5)';
    
    setTimeout(() => {
        button.style.transition = 'all 1.5s cubic-bezier(0.23, 1, 0.32, 1)';
        button.style.opacity = '1';
        button.style.transform = 'translateY(0) translateZ(0) rotateX(0deg) rotateY(0deg) scale(1)';
    }, 500);
});

// Efeito de ressonância 3D ao clicar
button.addEventListener('click', () => {
    // Criar múltiplas ondas de ressonância 3D
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const resonance = document.createElement('div');
            resonance.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: 3px solid rgba(138, 43, 226, ${0.4 - i * 0.08});
                border-radius: 25px;
                animation: resonance3D ${1 + i * 0.3}s ease-out;
                pointer-events: none;
                z-index: ${10 - i};
                transform: translateZ(${20 - i * 5}px);
            `;
            
            button.appendChild(resonance);
            
            setTimeout(() => {
                resonance.remove();
            }, (1 + i * 0.3) * 1000);
        }, i * 150);
    }
});

// Adicionar animação de ressonância 3D
const resonanceStyle = document.createElement('style');
resonanceStyle.textContent = `
    @keyframes resonance3D {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(resonanceStyle);

// Efeito de hover com partículas 3D
button.addEventListener('mouseenter', () => {
    // Criar partículas de brilho 3D ao redor do botão
    for (let i = 0; i < 12; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            const angle = (i / 12) * Math.PI * 2;
            const distance = 80;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            const z = Math.random() * 100 - 50;
            
            sparkle.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: radial-gradient(circle, 
                    rgba(255, 255, 255, 1) 0%, 
                    rgba(138, 43, 226, 0.8) 100%);
                border-radius: 50%;
                left: calc(50% + ${x}px);
                top: calc(50% + ${y}px);
                transform: translate(-50%, -50%) translateZ(${z}px);
                animation: sparkleEffect3D 1.5s ease-out;
                pointer-events: none;
                z-index: 25;
                box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
            `;
            
            button.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1500);
        }, i * 120);
    }
});

// Adicionar animação de brilho 3D
const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
    @keyframes sparkleEffect3D {
        0% {
            transform: translate(-50%, -50%) translateZ(0px) scale(0);
            opacity: 1;
        }
        50% {
            transform: translate(-50%, -50%) translateZ(50px) scale(1.5);
            opacity: 1;
        }
        100% {
            transform: translate(-50%, -50%) translateZ(100px) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(sparkleStyle);

console.log('🎨 Botão 3D Liquid Glass HIPER 3D carregado com sucesso!');
console.log('✨ Tecnologias utilizadas: CSS 3D Transforms Extremos, Extrusão Real, Backdrop Filter, CSS Animations Avançadas, JavaScript ES6+');
console.log('🚀 Profundidade máxima: 200px, Extrusão: 80px, Camadas: 7+');