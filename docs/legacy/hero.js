// Hero Component Loader
async function loadHero() {
    try {
        // Load the hero HTML
        const response = await fetch('hero.html');
        const html = await response.text();
        
        // Find the hero container or create it
        let heroContainer = document.getElementById('hero-container');
        if (!heroContainer) {
            heroContainer = document.createElement('div');
            heroContainer.id = 'hero-container';
            document.body.insertBefore(heroContainer, document.body.firstChild);
        }
        
        // Inject the HTML
        heroContainer.innerHTML = html;
    } catch (error) {
        console.error('Error loading hero component:', error);
    }
}

// Load hero when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHero);
} else {
    loadHero();
}

