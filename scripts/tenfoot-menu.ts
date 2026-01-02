// Keyboard navigation for 10-foot interface

interface ServiceSelected {
    service: string;
}

class TenFootMenuNavigator {
    private cards: NodeListOf<HTMLElement>;
    private currentIndex: number;

    constructor(cardContainer: Element) {
        this.cards = cardContainer.querySelectorAll<HTMLElement>('.menu10foot-card');
        this.currentIndex = 0;
        this.init();
    }

    private init(): void {
        this.setupKeyboardNavigation();
        this.setupClickHandlers();
        this.handleLoading();

        // Focus first card on load
        if (this.cards.length > 0) {
            this.focusCard(0);
        }
    }

    private focusCard(index: number): void {
        if (index >= 0 && index < this.cards.length) {
            this.cards[index].focus();
            this.currentIndex = index;
        }
    }

    private setupKeyboardNavigation(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            switch(e.key) {
                case 'ArrowRight':
                    e.preventDefault();
                    this.focusCard((this.currentIndex + 1) % this.cards.length);
                    break;

                case 'ArrowLeft':
                    e.preventDefault();
                    this.focusCard((this.currentIndex - 1 + this.cards.length) % this.cards.length);
                    break;

                case 'Enter':
                    e.preventDefault();
                    this.cards[this.currentIndex].click();
                    break;
            }
        });
    }

    private setupClickHandlers(): void {
        this.cards.forEach((card: HTMLElement, index: number) => {
            card.addEventListener('click', () => {
                const service = card.dataset.service || '';
                const titleElement = card.querySelector('.service-title');
                const title = titleElement?.textContent || '';

                console.log(`Selected: ${title} (${service})`);

                // Dispatch custom event for handling navigation
                const event = new CustomEvent<ServiceSelected>('serviceSelected', {
                    detail: { service }
                });
                document.dispatchEvent(event);

                // Add your navigation logic here
                // Example: window.location.href = `/service/${service}`;
            });

            card.addEventListener('focus', () => {
                this.currentIndex = index;

                card.scrollIntoView({
                    behavior: 'smooth',
                    inline: 'center',
                    block: 'nearest'
                });
            });
        });
    }

    private handleLoading(): void {
        const loadingIndicator = document.getElementById('loading-indicator');

        if (loadingIndicator) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    loadingIndicator.style.display = 'none';
                }, 1500);
            });
        }
    }

    public async LoadPage(path: string) {
        const app = document.getElementsByTagName('section')[0]

        try {
            const response = await fetch(`/${path}.html`);
            const html = await response.text();
            app.innerHTML = html;
        } catch (error) {
            app.innerHTML = '<p>Page not found</p>';
        }
    }
}

const initMenu = () => {
    const menuContainer = document.getElementsByClassName('menu10foot')[0];
    let nav = new TenFootMenuNavigator(menuContainer);
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMenu);
} else {
    initMenu();
}

// nav.LoadPage("links").then(r => console.log(r));
export default TenFootMenuNavigator;