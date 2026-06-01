document.addEventListener('DOMContentLoaded', () => {
    // 1. SISTEMA DE PARTÍCULAS (Canvas)
    initParticleSystem();

    // 2. ANIMACIONES AL HACER SCROLL (IntersectionObserver)
    initScrollAnimations();

    // 3. EFECTO INCLINACIÓN 3D (Tilt Effect)
    initTiltEffect();

    // 4. CONTROL DE MODALES (Inventos)
    initModals();
});

/* -------------------------------------------------------------
   1. SISTEMA DE PARTÍCULAS (Polvo de Oro Flotante)
   ------------------------------------------------------------- */
function initParticleSystem() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 60;

    // Redimensionar Canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Clase Partícula
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2.5 + 0.5;
            this.speedX = Math.random() * 0.4 - 0.2;
            this.speedY = Math.random() * -0.5 - 0.1; // Flotar hacia arriba
            this.opacity = Math.random() * 0.5 + 0.1;
            this.fadeSpeed = Math.random() * 0.005 + 0.002;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Reiniciar partícula si sale de la pantalla o se desvanece
            if (this.y < 0 || this.x < 0 || this.x > canvas.width) {
                this.y = canvas.height + 10;
                this.x = Math.random() * canvas.width;
                this.opacity = Math.random() * 0.5 + 0.1;
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            // Color oro con opacidad variable
            ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
            ctx.shadowBlur = this.size * 2;
            ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
            ctx.fill();
        }
    }

    // Inicializar partículas
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Bucle de Animación
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar y actualizar partículas
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animate);
    }
    animate();
}

/* -------------------------------------------------------------
   2. ANIMACIONES AL HACER SCROLL
   ------------------------------------------------------------- */
function initScrollAnimations() {
    const animElements = document.querySelectorAll('.scroll-animate');
    
    const observerOptions = {
        root: null,
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animElements.forEach(el => {
        observer.observe(el);
    });
}

/* -------------------------------------------------------------
   3. EFECTO INCLINACIÓN 3D (Tilt Effect)
   ------------------------------------------------------------- */
function initTiltEffect() {
    const cards = document.querySelectorAll('.project-card, .invention-card');
    
    if (window.innerWidth < 768) return;

    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            
            const maxRotate = 10;
            const rotateX = -y * maxRotate;
            const rotateY = x * maxRotate;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });
}

/* -------------------------------------------------------------
   4. CONTROL DE MODALES (Datos de Inventos y Apertura con SVGs)
   ------------------------------------------------------------- */
const inventionDetails = {
    tornillo: {
        title: "El Tornillo de Arquímedes",
        formula: "V = π × r² × h / (paso de rosca)",
        desc: "El tornillo de Arquímedes es una máquina gravimétrica helicoidal utilizada para la elevación de agua, harina o cereales. Fue inventado por Arquímedes en el siglo III a.C. durante su estancia en Egipto. Consiste en un tornillo que gira dentro de un cilindro hueco inclinado. Al girar el eje, el agua asciende por la hélice desafiando la gravedad. Hoy en día, este diseño sigue utilizándose en plantas de tratamiento de aguas residuales y turbinas de generación de energía microhidráulica por su alta eficiencia y resistencia a los residuos.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1.5rem; background:rgba(0, 229, 255, 0.02);">
                <rect x="15" y="18" width="70" height="24" rx="2" transform="rotate(-15 50 30)" stroke="#d4af37" stroke-width="1.5" fill="rgba(212, 175, 55, 0.05)"/>
                <line x1="12" y1="36" x2="88" y2="16" stroke="#c5a880" stroke-width="2"/>
                <path class="screw-helix" d="M16,35 L26,32 M26,32 Q32,24 38,30 L48,27 Q54,19 60,25 L70,22 Q76,14 82,20 L84,19" stroke="#00e5ff" stroke-width="2" fill="none" stroke-linecap="round" style="animation: screw-pump 1.5s linear infinite;"/>
                <path d="M5,50 Q20,46 35,50 L35,60 L5,60 Z" fill="rgba(0, 229, 255, 0.2)" stroke="#00b4d8" stroke-width="1"/>
                <path d="M78,10 Q84,12 88,17" stroke="#00e5ff" stroke-width="1.5" stroke-dasharray="2 2"/>
                <path d="M12,36 L5,38 L5,28" stroke="#d4af37" stroke-width="1.5" fill="none"/>
            </svg>
        `
    },
    garra: {
        title: "La Garra de Siracusa",
        formula: "Momento = Fuerza × Distancia",
        desc: "También conocida como 'el agitador de barcos', fue un arma de defensa de Syracuse diseñada por Arquímedes para combatir los asedios marítimos romanos. Consistía en un brazo articulado similar a una grúa con un gran gancho de metal. Cuando un barco romano se aproximaba a las murallas, el gancho se soltaba, atrapaba la proa del barco, y mediante un contrapeso de poleas compuestas, lo elevaba en el aire y lo dejaba caer abruptamente al mar, hundiéndolo o volcándolo al instante.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1rem; background:rgba(212, 175, 55, 0.02);">
                <rect x="0" y="45" width="25" height="15" fill="#303540" stroke="#c5a880" stroke-width="1"/>
                <g style="transform: rotate(-10deg); transform-origin: 15px 45px;">
                    <line x1="15" y1="45" x2="15" y2="15" stroke="#d4af37" stroke-width="3.5"/>
                    <line x1="15" y1="20" x2="60" y2="5" stroke="#d4af37" stroke-width="2.5"/>
                    <line x1="60" y1="5" x2="60" y2="25" stroke="#a0a5b5" stroke-width="1" stroke-dasharray="2 2"/>
                    <path d="M57,25 Q60,30 63,25" stroke="#00e5ff" stroke-width="2" fill="none"/>
                </g>
                <path d="M25,50 Q45,47 65,50 Q85,53 100,50 L100,60 L25,60 Z" fill="rgba(0, 180, 216, 0.15)" stroke="rgba(0, 229, 255, 0.3)" stroke-width="1"/>
                <g style="transform: translate(5px, -15px) rotate(15deg); transform-origin: 60px 45px;">
                    <path d="M45,45 L75,45 L80,35 L40,37 Z" fill="#604030" stroke="#d4af37" stroke-width="1"/>
                    <line x1="60" y1="45" x2="60" y2="20" stroke="#604030" stroke-width="1.5"/>
                    <path d="M60,22 Q70,27 60,32" fill="#fff" opacity="0.6"/>
                </g>
            </svg>
        `
    },
    rayo: {
        title: "El Rayo de Calor",
        formula: "Foco = R / 2 (Espejos Cóncavos)",
        desc: "El rayo de calor de Arquímedes es uno de sus inventos más legendarios y debatidos. Durante el asedio de Siracusa, se narra que Arquímedes alineó a cientos de soldados provistos de escudos de bronce altamente pulidos (actuando como reflectores cóncavos parabólicos). Concentrando la luz solar en un único punto focal sobre las velas de las galeras romanas, logró que estas ardieran a gran distancia. Experimentos modernos han demostrado que, aunque complejo, es físicamente viable prender madera utilizando reflectores parabólicos de bronce de gran precisión.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1rem; background:rgba(0, 229, 255, 0.02);">
                <circle cx="10" cy="15" r="8" fill="#d4af37" filter="drop-shadow(0 0 4px #d4af37)"/>
                <line x1="16" y1="20" x2="28" y2="38" stroke="rgba(212, 175, 55, 0.4)" stroke-width="1" stroke-dasharray="2 2"/>
                <path d="M25,30 Q32,40 25,50" stroke="#d4af37" stroke-width="3" fill="none"/>
                <line class="ray-beam" x1="28" y1="40" x2="75" y2="35" stroke="#00e5ff" stroke-width="2.5" style="animation: ray-pulse 1s linear infinite;"/>
                <path d="M0,52 Q25,49 50,52 Q75,54 100,52 L100,60 L0,60 Z" fill="rgba(0, 180, 216, 0.15)" stroke="rgba(0, 229, 255, 0.2)" stroke-width="1"/>
                <path d="M65,45 L85,45 L90,37 L60,39 Z" fill="#604030" stroke="#c5a880" stroke-width="1"/>
                <g>
                    <path d="M73,30 Q75,18 77,30 Q79,22 81,32 Z" fill="#ff5722"/>
                    <path d="M75,30 Q76,22 77,30" fill="#ffeb3b"/>
                </g>
            </svg>
        `
    },
    corona: {
        title: "El Principio de la Corona",
        formula: "E = ρ_fluido × g × V_desplazado",
        desc: "La famosa historia de 'Eureka'. El rey Hierón II de Siracusa pidió a Arquímedes determinar si su nueva corona era de oro puro o si el orfebre había añadido plata. Arquímedes resolvió el misterio al notar que el nivel de agua subía en su bañera al introducirse en ella. Dándose cuenta de que un volumen de oro desplazaría menos agua que un volumen equivalente de plata (al ser el oro más denso), midió el volumen de agua desplazado por la corona y un lingote de oro del mismo peso, revelando el fraude del orfebre.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1.5rem; background:rgba(212, 175, 55, 0.02);">
                <rect x="25" y="25" width="50" height="25" rx="2" stroke="#c5a880" stroke-width="2" fill="rgba(255,255,255,0.02)"/>
                <path d="M25,40 Q50,38 75,40 L75,50 L25,50 Z" fill="rgba(0, 229, 255, 0.3)" stroke="#00e5ff" stroke-width="1.5"/>
                <g style="transform: translateY(3px);">
                    <path d="M40,30 L45,22 L50,30 L55,22 L60,30 Z" fill="none" stroke="#d4af37" stroke-width="1.5"/>
                    <rect x="40" y="30" width="20" height="3" fill="none" stroke="#d4af37" stroke-width="1.5"/>
                </g>
                <path d="M20,40 Q15,35 10,40 M80,40 Q85,35 90,40" stroke="#00e5ff" stroke-width="1" opacity="0.6"/>
            </svg>
        `
    },
    polea: {
        title: "La Polea Compuesta",
        formula: "F_esfuerzo = F_resistencia / 2^n",
        desc: "Arquímedes demostró la fuerza de la ventaja mecánica multiplicada mediante poleas compuestas (polipastos). Cuenta la leyenda que le dijo al rey Hierón: 'Dadme un punto de apoyo y moveré el mundo'. Para demostrarlo, preparó un sistema de poleas compuestas conectado a un barco mercante de la armada real completamente cargado y tripulado. Sentado cómodamente a distancia, Arquímedes tiró de una sola cuerda sin esfuerzo físico aparente, arrastrando el barco suavemente por la arena como si flotara en el agua.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1.5rem; background:rgba(0, 229, 255, 0.02);">
                <line x1="10" y1="10" x2="90" y2="10" stroke="#c5a880" stroke-width="3"/>
                <circle cx="50" cy="22" r="8" stroke="#d4af37" stroke-width="2" fill="rgba(8,9,13,0.8)"/>
                <circle cx="50" cy="22" r="2" fill="#d4af37"/>
                <g style="transform: translateY(-8px);">
                    <circle cx="50" cy="45" r="6" stroke="#00e5ff" stroke-width="1.5" fill="rgba(8,9,13,0.8)"/>
                    <circle cx="50" cy="45" r="2" fill="#00e5ff"/>
                    <path d="M50,51 L50,54 M46,54 L54,54 L50,60 Z" fill="#c5a880" stroke="#d4af37" stroke-width="1"/>
                </g>
                <path d="M35,50 L35,22 Q35,14 44,14 Q52,14 52,22 L52,37 Q52,43 58,37 L58,22" stroke="#a0a5b5" stroke-width="1.5" fill="none" stroke-dasharray="4 2"/>
            </svg>
        `
    },
    planetario: {
        title: "El Planetario Mecánico",
        formula: "Relación de Engranajes = N_dientes_1 / N_dientes_2",
        desc: "Arquímedes construyó un complejo dispositivo astronómico mecánico (antecesor del mecanismo de Anticitera). Este planetario estaba hecho de engranajes de bronce de precisión y reproducía el movimiento del Sol, la Luna y los cinco planetas conocidos alrededor de la Tierra, así como las fases lunares y los eclipses. El historiador romano Cicerón escribió sobre haber visto el dispositivo, maravillado de cómo Arquímedes había logrado replicar los movimientos del cosmos en una sola esfera mecánica móvil.",
        svg: `
            <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; max-height:280px; display:block; padding:1rem; background:rgba(212, 175, 55, 0.02);">
                <circle cx="50" cy="30" r="25" stroke="rgba(255,255,255,0.04)" stroke-width="1" stroke-dasharray="3 3"/>
                <g class="planetarium-gear-large" stroke="#c5a880" stroke-width="1.5" style="transform-origin: 45px 35px; animation: spin-gear-reverse 25s linear infinite;">
                    <circle cx="45" cy="35" r="18" fill="none"/>
                    <circle cx="45" cy="35" r="4" fill="#c5a880"/>
                    <path d="M45,12 L45,17 M45,58 L45,53 M22,35 L27,35 M68,35 L63,35" stroke-width="3" stroke-linecap="round"/>
                </g>
                <g class="planetarium-gear-small" stroke="#d4af37" stroke-width="1.2" style="transform-origin: 62px 20px; animation: spin-gear 15s linear infinite;">
                    <circle cx="62" cy="20" r="10" fill="none"/>
                    <circle cx="62" cy="20" r="2" fill="#d4af37"/>
                    <path d="M62,7 L62,11 M62,33 L62,29 M49,20 L53,20 M75,20 L71,20" stroke-width="2.5" stroke-linecap="round"/>
                </g>
                <circle cx="25" cy="18" r="2" fill="#00e5ff" filter="drop-shadow(0 0 3px #00e5ff)"/>
                <circle cx="70" cy="48" r="3" fill="#d4af37"/>
            </svg>
        `
    }
};

function initModals() {
    const modal = document.getElementById('invention-modal');
    if (!modal) return;

    const modalTitle = modal.querySelector('.modal-title');
    const modalFormula = modal.querySelector('.modal-formula');
    const modalText = modal.querySelector('.modal-text');
    const modalSvgContainer = modal.querySelector('#modal-svg-container');
    const closeBtn = modal.querySelector('.modal-close');

    const cards = document.querySelectorAll('.invention-card');

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const invId = card.getAttribute('data-invention');
            const data = inventionDetails[invId];

            if (data) {
                // Rellenar datos
                modalTitle.textContent = data.title;
                modalFormula.textContent = data.formula;
                modalText.textContent = data.desc;
                modalSvgContainer.innerHTML = data.svg;

                // Abrir modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; // Evitar scroll de fondo
            }
        });
    });

    // Cerrar Modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeBtn.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}
