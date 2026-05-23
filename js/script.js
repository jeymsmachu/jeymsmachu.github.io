// lenis smooth scrolling because, again, nevermind

// check if lenis loaded successfully
let lenis = null;

// only initialize if lenis is available
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothTouch: false,
        direction: 'vertical'
    });

    // Animation loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    // Start the loop
    requestAnimationFrame(raf);
    
    console.log('lenis smooth scroll loaded woooooo');
} else {
    console.warn('lenis not loaded, using default scrolling');
}

requestAnimationFrame(raf);

// controller for opening animation
window.addEventListener('load', function() {
    // stop smooth scrolling
    lenis.stop();

    // show loading text first
    document.body.classList.add('is-ready');

    // show opening section (heart + logo)
    this.document.body.classList.add('is-op');

    // start animation after 1 sec
    setTimeout(function() {
        document.body.classList.add('is-load');
    }, 1000);

    // hide opening after
    this.setTimeout(function() {
        document.body.classList.add('is-op-end');

        // start smooth scroll
        lenis.start();
    }, 5500);
});