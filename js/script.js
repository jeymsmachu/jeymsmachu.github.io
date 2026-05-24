// lenis smooth scrolling
let lenis = null;

// only initialize if lenis is available
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        direction: 'vertical'
    });

    // animation loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    // start the loop
    requestAnimationFrame(raf);
    
    console.log('lenis smooth scroll loaded woooooo');
} else {
    console.warn('lenis not loaded, using default scrolling');
}

// controller for opening animation (only on homepage)
window.addEventListener('load', function() {
    const hasOpening = document.querySelector('.opening');
    
    // always add is-ready to show loading text
    document.body.classList.add('is-ready');
    
    if (hasOpening && lenis) {
        // homepage with opening animation
        lenis.stop();
        document.body.classList.add('is-op');

        setTimeout(function() {
            document.body.classList.add('is-load');
        }, 1000);

        setTimeout(function() {
            document.body.classList.add('is-op-end');
            lenis.start();
        }, 5500);
    } else {
        // other pages without opening animation - quick load
        setTimeout(function() {
            document.body.classList.add('is-load');
            if (lenis) {
                lenis.start();
            }
        }, 500);  // short delay to show loading
    }
});

// menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('.js-menu-btn');
    const menuPanel = document.querySelector('.menu-panel');
    const menuContainer = document.querySelector('.menu');
    
    if (menuButton && menuPanel) {
        menuButton.addEventListener('click', function() {
            // toggle menu open state
            menuPanel.classList.toggle('is-open');
            menuContainer.classList.toggle('is-open');
            
            // stop/start scrolling when menu opens/closes
            if (lenis) {
                if (menuPanel.classList.contains('is-open')) {
                    lenis.stop();
                } else {
                    lenis.start();
                }
            }
        });
        
        // close menu when clicking on a link
        const menuLinks = menuPanel.querySelectorAll('a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuPanel.classList.remove('is-open');
                menuContainer.classList.remove('is-open');
                if (lenis) {
                    lenis.start();
                }
            });
        });
    }
});
