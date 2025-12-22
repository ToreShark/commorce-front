//app/dashboard/layout.tsx
"use client";

import { useEffect } from 'react';

const sherahStyles = [
    '/sherah/css/bootstrap.min.css',
    '/sherah/css/reset.css',
    '/sherah/css/style.css',
];

// CSS to reset Tailwind conflicts and fix layout
const dashboardResetCSS = `
    /* Reset Tailwind conflicts */
    .sherah-body-area,
    .sherah-body-area * {
        border-color: inherit !important;
        box-sizing: border-box;
    }
    .sherah-body-area {
        font-family: 'Product Sans', sans-serif !important;
        background-color: #f5f6fa !important;
        min-height: 100vh;
    }

    /* Sidebar fixed positioning */
    .sherah-smenu {
        position: fixed !important;
        left: 0 !important;
        top: 0 !important;
        width: 290px !important;
        height: 100% !important;
        z-index: 6000 !important;
        background: #fff;
        overflow-y: auto;
        transition: all 0.3s ease;
    }

    /* Header positioning */
    .sherah-header {
        padding-left: 290px !important;
        background: #fff;
        position: relative;
        z-index: 100;
    }
    .sherah-header__middle {
        padding-left: 80px !important;
    }

    /* Main content offset for sidebar */
    .sherah-adashboard {
        margin-left: 290px !important;
        padding: 0 25px 50px 25px !important;
    }

    /* Bootstrap grid fix */
    .sherah-body-area .row {
        display: flex;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
    }
    .sherah-body-area [class*="col-"] {
        padding-right: 15px;
        padding-left: 15px;
    }

    /* Progress card icon fix */
    .sherah-progress-card {
        position: relative;
        padding: 25px 30px;
        border-radius: 10px;
    }
    .sherah-progress-card__icon {
        width: 66px;
        height: 66px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 100%;
        position: absolute;
        top: -33px;
        right: 30px;
        background: #fff;
        border: 1px solid #e5e5e5;
    }
    .sherah-progress-card__icon svg {
        width: 28px;
        height: 28px;
        stroke: currentColor;
    }
    .sherah-color1__bg .sherah-progress-card__icon svg { color: #6176FE; }
    .sherah-color2__bg .sherah-progress-card__icon svg { color: #27AE60; }
    .sherah-color3__bg .sherah-progress-card__icon svg { color: #9B51E0; }
    .sherah-color4__bg .sherah-progress-card__icon svg { color: #F2994A; }

    /* Mobile responsive */
    @media (max-width: 1278px) {
        .sherah-smenu {
            transform: translateX(-100%) !important;
        }
        .sherah-header,
        .sherah-adashboard {
            margin-left: 0 !important;
            padding-left: 15px !important;
        }
    }
`;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Add Sherah CSS dynamically
        const links: HTMLLinkElement[] = [];

        sherahStyles.forEach((href) => {
            const existingLink = document.querySelector(`link[href="${href}"]`);
            if (!existingLink) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = href;
                document.head.appendChild(link);
                links.push(link);
            }
        });

        // Add reset CSS
        const styleId = 'sherah-reset-css';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = dashboardResetCSS;
            document.head.appendChild(style);
        }

        // Hide root layout elements (NavBar, FixedBottomMenu)
        const navBar = document.querySelector('nav');
        const fixedMenu = document.querySelector('[class*="fixed-bottom"]');
        if (navBar) (navBar as HTMLElement).style.display = 'none';
        if (fixedMenu) (fixedMenu as HTMLElement).style.display = 'none';

        // Add class to body to scope styles
        document.body.classList.add('sherah-dashboard-active');

        return () => {
            // Cleanup: remove added styles
            links.forEach(link => link.remove());
            const resetStyle = document.getElementById(styleId);
            if (resetStyle) resetStyle.remove();
            // Restore hidden elements
            if (navBar) (navBar as HTMLElement).style.display = '';
            if (fixedMenu) (fixedMenu as HTMLElement).style.display = '';
            document.body.classList.remove('sherah-dashboard-active');
        };
    }, []);

    return (
        <div id="sherah-dark-light" className="sherah-body-area">
            {children}
        </div>
    );
}
