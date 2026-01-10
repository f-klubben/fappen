// Keyboard navigation for 10-foot interface
interface ServiceSelected {
    service: string;
}

export interface GotoPage {
    navigateTo(page: string): Promise<void>;
}

export class TenFootMenu {
    private cards: NodeListOf<HTMLElement>;
    private nav: GotoPage;
    private currentIndex: number;

    constructor(navigator: GotoPage, cardContainer: Element) {
        this.nav = navigator;
        this.cards = cardContainer.querySelectorAll<HTMLElement>('.menu10foot-card');
        this.currentIndex = 0;
        this.init();
    }

    private init(): void {
        console.log("Initialized Tenfoot Menu");
        this.setupKeyboardNavigation();
        this.setupClickHandlers();

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
            card.addEventListener('click', async () => {
                const link = card.dataset.link || '';
                const titleElement = card.querySelector('.service-title');
                const title = titleElement?.textContent || '';

                console.log(`Selected: ${title} (${link})`);

                await this.nav.navigateTo(link);
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
}
