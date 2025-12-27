"use client";

import { StaticPage } from "../lib/data";

interface StaticPageContentProps {
  page: StaticPage;
}

export default function StaticPageContent({ page }: StaticPageContentProps) {
  return (
    <div className="w-full">
      <article className="prose prose-lg max-w-none">
        <div
          dangerouslySetInnerHTML={{ __html: page.content }}
          className="static-page-content"
        />
      </article>

      <style jsx global>{`
        .static-page-content h1 {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #1a1a1a;
        }
        .static-page-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #2d2d2d;
        }
        .static-page-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          color: #3d3d3d;
        }
        .static-page-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #4a4a4a;
        }
        .static-page-content ul {
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .static-page-content li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
          color: #4a4a4a;
        }
        .static-page-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .static-page-content a:hover {
          color: #1d4ed8;
        }
        .static-page-content address {
          font-style: normal;
          margin-top: 2rem;
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
}
