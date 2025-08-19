// Global variables
let scene, camera, renderer, particles, mouse, windowHalf;
let animationId;
let isThreeJSInitialized = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Add small delay to ensure DOM is fully loaded
    setTimeout(() => {
        initThreeJS();
        initScrollAnimations();
        initNavigation();
        initCounters();
        initSkillBars();
        initContactForm();
        initLoadingScreen();
    }, 100);
    
    // Remove loading screen after everything is loaded
    setTimeout(() => {
        hideLoadingScreen();
    }, 2500);
});

// Three.js initialization
function initThreeJS() {
    try {
        const canvas = document.getElementById('bg-canvas');
        if (!canvas) {
            console.warn('Canvas element not found');
            return;
        }
        
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ 
            canvas: canvas, 
            alpha: true,
            antialias: true 
        });
        
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        
        // Camera position
        camera.position.z = 30;
        
        // Mouse tracking
        mouse = new THREE.Vector2();
        windowHalf = new THREE.Vector2(window.innerWidth / 2, window.innerHeight / 2);
        
        // Create particle system
        createParticleSystem();
        createFloatingGeometry();
        
        // Event listeners
        window.addEventListener('resize', onWindowResize);
        document.addEventListener('mousemove', onMouseMove);
        
        isThreeJSInitialized = true;
        
        // Start animation loop
        animate();
        
        console.log('Three.js initialized successfully');
    } catch (error) {
        console.error('Three.js initialization failed:', error);
    }
}

function createParticleSystem() {
    const particleCount = 800;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    const color1 = new THREE.Color(0x32b8c6); // Primary cyan
    const color2 = new THREE.Color(0x00d4ff); // Secondary blue
    const color3 = new THREE.Color(0x39ff14); // Accent green
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a large sphere
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 100;
        
        // Random colors
        const colorChoice = Math.random();
        let color;
        if (colorChoice < 0.6) {
            color = color1;
        } else if (colorChoice < 0.8) {
            color = color2;
        } else {
            color = color3;
        }
        
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
    }
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 2,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        sizeAttenuation: true
    });
    
    particles = new THREE.Points(geometry, material);
    scene.add(particles);
    
    console.log('Particle system created with', particleCount, 'particles');
}

function createFloatingGeometry() {
    // Create floating geometric shapes
    const shapes = [];
    
    for (let i = 0; i < 12; i++) {
        let geometry, material;
        
        const shapeType = Math.floor(Math.random() * 4);
        switch (shapeType) {
            case 0:
                geometry = new THREE.BoxGeometry(2, 2, 2);
                break;
            case 1:
                geometry = new THREE.SphereGeometry(1.5, 8, 6);
                break;
            case 2:
                geometry = new THREE.ConeGeometry(1, 2, 6);
                break;
            default:
                geometry = new THREE.OctahedronGeometry(1.5);
        }
        
        const colorChoice = Math.random();
        if (colorChoice < 0.4) {
            material = new THREE.MeshBasicMaterial({ 
                color: 0x32b8c6, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.4 
            });
        } else if (colorChoice < 0.7) {
            material = new THREE.MeshBasicMaterial({ 
                color: 0x00d4ff, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.4 
            });
        } else {
            material = new THREE.MeshBasicMaterial({ 
                color: 0x39ff14, 
                wireframe: true, 
                transparent: true, 
                opacity: 0.4 
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        
        mesh.position.x = (Math.random() - 0.5) * 80;
        mesh.position.y = (Math.random() - 0.5) * 80;
        mesh.position.z = (Math.random() - 0.5) * 60;
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        
        // Store initial position and rotation for animation
        mesh.userData = {
            initialX: mesh.position.x,
            initialY: mesh.position.y,
            initialZ: mesh.position.z,
            rotationSpeedX: (Math.random() - 0.5) * 0.01,
            rotationSpeedY: (Math.random() - 0.5) * 0.01,
            rotationSpeedZ: (Math.random() - 0.5) * 0.01,
            floatSpeed: Math.random() * 0.02 + 0.01
        };
        
        scene.add(mesh);
        shapes.push(mesh);
    }
    
    console.log('Created', shapes.length, 'floating geometric shapes');
}

function animate() {
    if (!isThreeJSInitialized) return;
    
    animationId = requestAnimationFrame(animate);
    
    const time = Date.now() * 0.001;
    
    // Animate particles
    if (particles) {
        particles.rotation.y += 0.002;
        particles.rotation.x += 0.001;
        
        // Move particles slightly
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + positions[i] * 0.01) * 0.01;
        }
        particles.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate floating geometry
    scene.children.forEach(child => {
        if (child.userData && child.userData.rotationSpeedX) {
            child.rotation.x += child.userData.rotationSpeedX;
            child.rotation.y += child.userData.rotationSpeedY;
            child.rotation.z += child.userData.rotationSpeedZ;
            
            // Floating animation
            child.position.y = child.userData.initialY + Math.sin(time + child.userData.initialX * 0.01) * 2;
            
            // Mouse interaction
            const mouseInfluence = 0.00005;
            child.position.x = child.userData.initialX + (mouse.x - windowHalf.x) * mouseInfluence;
            child.position.z = child.userData.initialZ + (mouse.y - windowHalf.y) * mouseInfluence * 0.5;
        }
    });
    
    // Camera movement based on mouse
    if (mouse && windowHalf) {
        camera.position.x += (mouse.x * 0.001 - camera.position.x) * 0.05;
        camera.position.y += (-mouse.y * 0.001 - camera.position.y) * 0.05;
    }
    
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function onWindowResize() {
    if (!camera || !renderer) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    windowHalf.set(window.innerWidth / 2, window.innerHeight / 2);
}

function onMouseMove(event) {
    if (!windowHalf) return;
    
    mouse.x = event.clientX - windowHalf.x;
    mouse.y = event.clientY - windowHalf.y;
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger specific animations
                if (entry.target.classList.contains('skills-section')) {
                    setTimeout(() => animateSkillBars(), 500);
                }
                if (entry.target.classList.contains('hero-section')) {
                    setTimeout(() => animateCounters(), 1000);
                }
            }
        });
    }, observerOptions);
    
    // Observe all sections and fade-in elements
    document.querySelectorAll('.section, .fade-in, .section-subtitle').forEach(el => {
        observer.observe(el);
    });
    
    // Parallax effect
    window.addEventListener('scroll', throttle(() => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-content');
        
        parallaxElements.forEach(element => {
            const speed = 0.3;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
        
        // Update navbar on scroll
        const navbar = document.getElementById('navbar');
        if (scrolled > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 16));
}

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const ctaButton = document.querySelector('.cta-button');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            if (targetId && targetId !== '#') {
                scrollToSection(targetId.substring(1));
            }
        });
    });
    
    // CTA button
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToSection('about');
        });
    }
    
    // Mobile menu toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const offsetTop = section.getBoundingClientRect().top + window.pageYOffset - 80;
        
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

// Counter animations
function initCounters() {
    // Will be triggered by intersection observer
}

function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const suffix = target > 10 ? '+' : '';
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            counter.textContent = Math.floor(current) + suffix;
        }, 16);
    });
}

// Skill bar animations
function initSkillBars() {
    // Will be triggered by intersection observer
}

function animateSkillBars() {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach((item, index) => {
        setTimeout(() => {
            const skillLevel = item.getAttribute('data-skill');
            item.style.setProperty('--skill-width', skillLevel + '%');
            item.classList.add('animate');
        }, index * 100);
    });
}

// Contact form
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitButton = form?.querySelector('button[type="submit"]');
    
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();
            
            // Validate form
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all required fields.', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address.', 'error');
                return;
            }
            
            // Show loading state
            if (submitButton) {
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = 'Sending...';
                submitButton.disabled = true;
                
                setTimeout(() => {
                    submitButton.innerHTML = originalText;
                    submitButton.disabled = false;
                }, 2000);
            }
            
            // Create mailto link
            const mailtoSubject = encodeURIComponent(`Portfolio Contact: ${subject}`);
            const mailtoBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\n---\nSent from Portfolio Website`);
            const mailtoLink = `mailto:uttam6201@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;
            
            // Open email client
            try {
                window.location.href = mailtoLink;
                showNotification('Email client opened! Thank you for reaching out.', 'success');
                
                // Reset form after a short delay
                setTimeout(() => {
                    form.reset();
                }, 1000);
            } catch (error) {
                console.error('Error opening email client:', error);
                showNotification('Error opening email client. Please send an email to uttam6201@gmail.com directly.', 'error');
            }
        });
    }
    
    // Fix input field functionality
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.style.borderColor = '#32b8c6';
            this.style.boxShadow = '0 0 0 3px rgba(50, 184, 198, 0.1)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = '';
            this.style.boxShadow = '';
        });
    });
}

// Loading screen
function initLoadingScreen() {
    const loader = document.querySelector('.loader-particles');
    if (loader) {
        let colorIndex = 0;
        const colors = ['#32b8c6', '#00d4ff', '#39ff14'];
        
        const colorInterval = setInterval(() => {
            loader.style.borderTopColor = colors[colorIndex];
            colorIndex = (colorIndex + 1) % colors.length;
        }, 500);
        
        // Clear interval when loading is done
        setTimeout(() => {
            clearInterval(colorInterval);
        }, 3000);
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }
}

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    const bgColor = type === 'success' ? '#32b8c6' : type === 'error' ? '#ff6b6b' : '#00d4ff';
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: bgColor,
        color: 'white',
        padding: '16px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(400px)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        maxWidth: '300px'
    });
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Optimized scroll handler for navigation
window.addEventListener('scroll', throttle(() => {
    const scrolled = window.pageYOffset;
    
    // Update active nav link
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = 'hero';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.clientHeight;
        if (scrolled >= sectionTop && scrolled < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}, 100));

// Export functions for global access
window.scrollToSection = scrollToSection;
window.showNotification = showNotification;