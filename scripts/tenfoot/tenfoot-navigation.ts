// Keyboard navigation for 10-foot interface

import {TenFootMenu, GotoPage} from "./menu";

class TenFootNavigator implements GotoPage {
    private currentPage: string;

    constructor() {
        this.init();
    }

    private init(): void {
        console.log("Loaded Tenfoot-navigation");

        this.inputOverride();
        this.handleLoading();
        this.TryInstantiateMenu();
    }

    private inputOverride(): void {
        document.addEventListener('keydown', (e: KeyboardEvent) => {
            switch(e.key) {
                case 'Enter':
                    break;
                case 'Escape':
                case 'BrowserBack':
                    e.preventDefault();
                    break;
                case 'MediaPlayPause':
                    break;
                case 'MediaPlay':
                    break;
                case 'MediaPause':
                    break;
                case 'MediaStop':
                    break;
                case 'MediaTrackNext':
                    break;
                case 'MediaTrackPrevious':
                    break;
            }
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

    async navigateTo(page: string): Promise<void> {
        await this.LoadPage(page);
    }

    async LoadPage(tenfoot_page: string) {
        // Special case of navigation
        if (tenfoot_page == "//"){
            window.location.href = "/";
        }else if (tenfoot_page == "/"){
            tenfoot_page = "index";
        }

        const app = document.getElementsByTagName('section')[0]

        try {
            await fetch(`/${tenfoot_page}.html`)
                .then(response => response.text())
                .then(html => {
                    // Parse the HTML string into a document
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(html, 'text/html');

                    // Extract the <main> element
                    const mainContent = doc.querySelector('main');
                    console.log(mainContent);

                    if (mainContent) {
                        // Inject only the inner content of <main>
                        app.innerHTML = mainContent.innerHTML;
                    }
                }
            );

            this.TryInstantiateMenu();
        } catch (error) {
            app.innerHTML = '<p>Page not found</p>';
        }
    }

    TryInstantiateMenu(){
        // Try load 10foot-menu handler
        const initMenu = () => {
            const menuContainer = document.getElementsByClassName('menu10foot')[0];
            let nav = new TenFootMenu(this, menuContainer);
        };

        // TODO: mby doesn't work for loading subpages
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initMenu);
        } else {
            initMenu();
        }
    }
}

const initNavigation = () => {
    let nav = new TenFootNavigator();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

export default TenFootNavigator;