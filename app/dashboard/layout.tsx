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

    /* Form styles */
    .sherah-wc {
        background: #fff;
        border-radius: 10px;
        padding: 30px;
        margin-bottom: 30px;
    }
    .sherah-wc__heading {
        margin-bottom: 25px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e5e5e5;
    }
    .sherah-wc__title {
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
        margin: 0;
    }
    .sherah-wc__form-inner {
        padding: 20px 0;
    }
    .sherah-wc__form-group {
        margin-bottom: 20px;
    }
    .sherah-wc__form-label {
        display: block;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
        margin-bottom: 8px;
    }
    .sherah-wc__form-input {
        width: 100%;
        height: 48px;
        padding: 0 15px;
        font-size: 14px;
        color: #1a1a1a;
        background: #f5f6fa;
        border: 1px solid #e5e5e5;
        border-radius: 8px;
        outline: none;
        transition: border-color 0.3s;
    }
    .sherah-wc__form-input:focus {
        border-color: #6176FE;
    }
    .sherah-wc__form-input--textarea {
        height: auto;
        padding: 15px;
        resize: vertical;
        min-height: 100px;
    }
    .sherah-wc__form-subtitle {
        font-size: 16px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 20px;
    }
    .sherah-wc__divider {
        height: 1px;
        background: #e5e5e5;
    }
    .sherah-wc__form-upload {
        margin-bottom: 20px;
    }
    .sherah-wc__form-upload-label {
        display: block;
        cursor: pointer;
    }
    .sherah-wc__form-upload-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        background: #f5f6fa;
        border: 2px dashed #e5e5e5;
        border-radius: 10px;
        text-align: center;
        transition: border-color 0.3s;
    }
    .sherah-wc__form-upload-content:hover {
        border-color: #6176FE;
    }
    .sherah-wc__form-upload-content svg {
        color: #878f9a;
        margin-bottom: 10px;
    }
    .sherah-wc__form-upload-content p {
        color: #878f9a;
        font-size: 14px;
        margin: 0;
    }
    .sherah-wc__form-images {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 15px;
    }
    .sherah-wc__form-image-item {
        position: relative;
        aspect-ratio: 1;
        border-radius: 8px;
        overflow: hidden;
    }
    .sherah-wc__form-image-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .sherah-wc__form-image-delete {
        position: absolute;
        top: 5px;
        right: 5px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ff4d4f;
        color: #fff;
        border: none;
        border-radius: 50%;
        cursor: pointer;
    }
    .sherah-wc__properties {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }
    .sherah-wc__property-tag {
        display: inline-flex;
        padding: 6px 12px;
        background: #6176FE;
        color: #fff;
        font-size: 13px;
        border-radius: 20px;
    }

    /* Button styles */
    .sherah-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 500;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
    }
    .sherah-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    .sherah-btn__primary {
        background: #6176FE;
        color: #fff;
    }
    .sherah-btn__primary:hover:not(:disabled) {
        background: #4a5fd9;
    }
    .sherah-btn__secondary {
        background: #f5f6fa;
        color: #1a1a1a;
        border: 1px solid #e5e5e5;
    }
    .sherah-btn__secondary:hover:not(:disabled) {
        background: #e5e5e5;
    }
    .sherah-btn__danger {
        background: #ff4d4f;
        color: #fff;
    }
    .sherah-btn__danger:hover:not(:disabled) {
        background: #d9363e;
    }

    /* Margin utilities */
    .mg-top-20 { margin-top: 20px !important; }
    .mg-top-25 { margin-top: 25px !important; }
    .mg-top-30 { margin-top: 30px !important; }
    .mg-btm-20 { margin-bottom: 20px !important; }
    .mg-btm-25 { margin-bottom: 25px !important; }
    .mg-btm-30 { margin-bottom: 30px !important; }

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
