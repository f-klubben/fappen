// ten-foot-navigation.js
// Keyboard navigation for 10-foot interface

class TenFootNavigator {
    constructor() {
        this.cards = document.querySelectorAll('.service-card');
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.setupKeyboardNavigation();
        this.setupClickHandlers();
        this.handleLoading();

        // Focus first card on load
        if (this.cards.length > 0) {
            this.focusCard(0);
        }
    }

    focusCard(index) {
        if (index >= 0 && index < this.cards.length) {
            this.cards[index].focus();
            this.currentIndex = index;
        }
    }

    getColumns() {
        return window.innerWidth > 1200 ? Math.min(3, this.cards.length) : 1;
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            const cols = this.getColumns();

            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    this.focusCard((this.currentIndex + 1) % this.cards.length);
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    this.focusCard((this.currentIndex - 1 + this.cards.length) % this.cards.length);
                    break;

                case 'ArrowDown':
                    e.preventDefault();
                    this.focusCard(Math.min(this.currentIndex + cols, this.cards.length - 1));
                    break;

                case 'ArrowUp':
                    e.preventDefault();
                    this.focusCard(Math.max(this.currentIndex - cols, 0));
                    break;

                case 'Enter':
                    e.preventDefault();
                    this.cards[this.currentIndex].click();
                    break;
            }
        });
    }

    setupClickHandlers() {
        this.cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                const service = card.dataset.service;
                const title = card.querySelector('.service-title').textContent;

                console.log(`Selected: ${title} (${service})`);

                // Dispatch custom event for handling navigation
                const event = new CustomEvent('serviceSelected', {
                    detail: { service, title, index }
                });
                document.dispatchEvent(event);

                // Add your navigation logic here
                // Example: window.location.href = `/service/${service}`;
            });

            // Track focus changes
            card.addEventListener('focus', () => {
                this.currentIndex = index;
            });
        });
    }

    handleLoading() {
        const loadingIndicator = document.getElementById('loading-indicator');

        if (loadingIndicator) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 1500);
            });
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TenFootNavigator();
    });
} else {
    new TenFootNavigator();
}

// Export for use in other modules if needed
export default TenFootNavigator;