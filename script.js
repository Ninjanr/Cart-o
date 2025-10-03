 document.addEventListener('DOMContentLoaded', () => {
            // Música de fundo
            const musicOverlay = document.getElementById("musicOverlay");
            const musicaFundo = document.getElementById("musicaFundo");
            musicaFundo.volume = 0.7;

            musicOverlay.addEventListener("click", () => {
                musicaFundo.play().catch(err => console.log("Interação necessária para tocar música.", err));
                musicOverlay.style.display = 'none';
            }, { once: true });

            tsParticles.load("tsparticles", {
                background: { color: { value: "var(--bg-color)" } }, fpsLimit: 60, particles: { number: { value: 100, density: { enable: true, value_area: 800 } }, color: { value: "#ffffff" }, shape: { type: "circle" }, opacity: { value: 0.5, random: true, anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false } }, size: { value: 3, random: true }, move: { enable: true, speed: 0.5, direction: "none", random: true, straight: false, out_mode: "out" } }, interactivity: { detect_on: "canvas", events: { onhover: { enable: true, mode: "bubble" }, onclick: { enable: false }, resize: true }, modes: { bubble: { distance: 100, size: 4, duration: 2, opacity: 0.8 } } }, detectRetina: true
            });
            const envelope = document.getElementById('envelope');
            const secretButton = document.getElementById('secret-button');

            envelope.addEventListener('click', () => {
                envelope.classList.toggle('open');
            });

            const canvas = document.getElementById('fireworksCanvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let fireworks = [];
            let particles = [];
            let launchInterval;
            let animationFrameId;

            function getRandomColor() {
                const hue = Math.floor(Math.random() * 360);
                return `hsl(${hue}, 100%, 50%)`;
            }

            class Firework {
                constructor(x, y, targetX, targetY) {
                    this.x = x; this.y = y; this.targetX = targetX; this.targetY = targetY;
                    this.speed = 2.5;
                    this.angle = Math.atan2(targetY - y, targetX - x);
                    this.distanceToTarget = Math.sqrt((targetX - x)**2 + (targetY - y)**2);
                    this.traveled = 0;
                    this.trail = [];
                    this.color = getRandomColor();
                }
                update() {
                    this.traveled += this.speed;
                    const prevX = this.x; const prevY = this.y;
                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;
                    this.trail.push({ x: prevX, y: prevY });
                    if (this.trail.length > 5) { this.trail.shift(); }
                    if (this.traveled >= this.distanceToTarget) {
                        createParticles(this.targetX, this.targetY, this.color);
                        return true; 
                    }
                    return false;
                }
                draw() {
                    ctx.beginPath();
                    ctx.moveTo(this.trail[0]?.x || this.x, this.trail[0]?.y || this.y);
                    ctx.lineTo(this.x, this.y);
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            }

            class Particle {
                constructor(x, y, color) {
                    this.x = x; this.y = y; this.color = color;
                    this.angle = Math.random() * Math.PI * 2;
                    this.speed = Math.random() * 5 + 1;
                    this.friction = 0.97;
                    this.gravity = 0.05;
                    this.alpha = 1;
                    this.decay = Math.random() * 0.02 + 0.01;
                }
                update() {
                    this.speed *= this.friction;
                    this.y += this.gravity;
                    this.x += Math.cos(this.angle) * this.speed;
                    this.y += Math.sin(this.angle) * this.speed;
                    this.alpha -= this.decay;
                    return this.alpha <= this.decay;
                }
                draw() {
                    ctx.save();
                    ctx.globalAlpha = this.alpha;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2, false);
                    ctx.fillStyle = this.color;
                    ctx.fill();
                    ctx.restore();
                }
            }

            function createParticles(x, y, color) {
                const particleCount = 100;
                for (let i = 0; i < particleCount; i++) {
                    particles.push(new Particle(x, y, color));
                }
            }

            function animate() {
                animationFrameId = requestAnimationFrame(animate);
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                fireworks = fireworks.filter(firework => !firework.update());
                fireworks.forEach(firework => firework.draw());
                particles = particles.filter(particle => !particle.update());
                particles.forEach(particle => particle.draw());
            }

            function launchRandomFirework() {
                const startX = canvas.width / 2;
                const startY = canvas.height;
                const targetX = Math.random() * canvas.width;
                const targetY = Math.random() * canvas.height / 2;
                fireworks.push(new Firework(startX, startY, targetX, targetY));
            }
            
            function startFireworks() {
                if (launchInterval) clearInterval(launchInterval);
                launchInterval = setInterval(launchRandomFirework, 800);
                animate();
            }

            function stopFireworks() {
                clearInterval(launchInterval);
                cancelAnimationFrame(animationFrameId);
                setTimeout(() => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    fireworks = [];
                    particles = [];
                }, 1000);
            }

            window.addEventListener('resize', () => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            });

            secretButton.addEventListener('click', (event) => {
                event.preventDefault();
                const isMagicModeActive = document.body.classList.contains('magic-mode-active');
                if (isMagicModeActive) {
                    document.body.classList.remove('magic-mode-active');
                    stopFireworks();
                } else {
                    document.body.classList.add('magic-mode-active');
                    startFireworks();
                }
            });
        });