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
        padding: 30px 15px;
        background: #f5f6fa;
        border: 2px dashed #e5e5e5;
        border-radius: 10px;
        text-align: center;
        transition: border-color 0.3s;
        min-height: 150px;
        word-wrap: break-word;
        overflow: hidden;
    }
    .sherah-wc__form-upload-content:hover {
        border-color: #6176FE;
    }
    .sherah-wc__form-upload-content svg {
        color: #878f9a;
        margin-bottom: 10px;
        flex-shrink: 0;
    }
    .sherah-wc__form-upload-content p {
        color: #878f9a;
        font-size: 13px;
        margin: 0;
        word-wrap: break-word;
        overflow-wrap: break-word;
    }
    /* Right column sticky positioning */
    .sherah-wc__form .col-lg-4 > .sherah-wc__form-inner {
        position: sticky;
        top: 20px;
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

    /* Fix overlapping sections */
    .sherah-body-area .row {
        position: relative !important;
        display: flex !important;
        flex-wrap: wrap !important;
        clear: both !important;
    }
    .sherah-body-area .row::after {
        content: "";
        display: table;
        clear: both;
    }
    .sherah-wc {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: unset !important;
        max-height: none !important;
        overflow: visible !important;
        float: none !important;
        margin-bottom: 30px !important;
    }
    .sherah-wc::after {
        content: "";
        display: table;
        clear: both;
    }
    .sherah-wc__full {
        width: 100% !important;
        height: auto !important;
    }
    /* Override Sherah login page styles for dashboard forms */
    .sherah-wc__form {
        display: block !important;
        width: 100% !important;
        height: auto !important;
        min-height: unset !important;
        max-height: none !important;
        overflow: visible !important;
        flex-direction: unset !important;
        align-items: unset !important;
        justify-content: unset !important;
    }
    .sherah-wc__form::after {
        content: "";
        display: table;
        clear: both;
    }
    .sherah-wc__form-inner {
        display: block !important;
        width: 100% !important;
        min-width: unset !important;
        max-width: none !important;
        height: auto !important;
        padding: 20px 0 !important;
        overflow: visible !important;
        margin: 0 !important;
        flex-direction: unset !important;
        justify-content: unset !important;
    }
    /* Form v2 specific fixes */
    .sherah-wc__form-v2 {
        display: block !important;
        height: auto !important;
        overflow: visible !important;
    }
    .sherah-wc__form-v2 .row {
        margin-bottom: 0 !important;
    }
    .sherah-wc__form-v2 > .row {
        min-height: auto !important;
    }
    /* Bootstrap columns inside forms */
    .sherah-wc__form .col-lg-8,
    .sherah-wc__form .col-lg-4,
    .sherah-wc__form .col-12,
    .sherah-wc__form .col-md-6,
    .sherah-wc__form .col-md-4,
    .sherah-wc__form .col-md-5,
    .sherah-wc__form .col-md-2 {
        position: relative !important;
        float: none !important;
        height: auto !important;
    }
    /* Ensure dsinner container doesn't cause issues */
    .sherah-dsinner {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        overflow: visible !important;
    }
    .sherah-dsinner > .row {
        position: relative !important;
        margin-bottom: 0 !important;
    }
    .sherah-dsinner > .row + .row {
        clear: both !important;
    }

    /* Table styles */
    .sherah-table {
        background: #fff;
        border-radius: 10px;
        padding: 25px 30px;
        margin-bottom: 30px;
        position: relative !important;
        display: block !important;
        width: 100% !important;
        overflow: visible !important;
    }
    .sherah-table__title {
        font-size: 20px;
        font-weight: 600;
        color: #1a1a1a;
        margin-bottom: 20px;
    }
    .sherah-table__main {
        width: 100%;
        border-collapse: collapse;
    }
    .sherah-table__head {
        background: #f5f6fa;
    }
    .sherah-table__head th {
        padding: 15px 12px;
        font-size: 14px;
        font-weight: 500;
        color: #1a1a1a;
        text-align: left;
        border-bottom: 1px solid #e5e5e5;
    }
    .sherah-table__body tr {
        border-bottom: 1px solid #e5e5e5;
    }
    .sherah-table__body tr:last-child {
        border-bottom: none;
    }
    .sherah-table__body td {
        padding: 15px 12px;
        font-size: 14px;
        color: #1a1a1a;
        vertical-align: middle;
    }
    .sherah-table__id {
        font-family: monospace;
        font-size: 12px;
        color: #878f9a;
    }
    .sherah-table__product-name {
        font-weight: 500;
        margin: 0;
    }
    .sherah-table__product-desc {
        color: #878f9a;
        margin: 0;
        max-width: 250px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .sherah-table__product-action {
        display: flex;
        align-items: center;
        gap: 8px;
    }
    .sherah-table__product-action .sherah-btn {
        padding: 8px 12px;
    }

    /* Page inner container */
    .sherah-page-inner {
        margin-bottom: 30px !important;
    }
    .sherah-border {
        border: 1px solid #e5e5e5;
    }
    .sherah-default-bg {
        background: #fff !important;
    }

    /* Alert styles */
    .sherah-alert {
        padding: 15px 20px;
        border-radius: 8px;
        font-size: 14px;
    }
    .sherah-alert__danger {
        background: #fff2f0;
        border: 1px solid #ffccc7;
        color: #ff4d4f;
    }
    .sherah-alert__success {
        background: #f6ffed;
        border: 1px solid #b7eb8f;
        color: #52c41a;
    }
    .sherah-alert__warning {
        background: #fffbe6;
        border: 1px solid #ffe58f;
        color: #faad14;
    }

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
