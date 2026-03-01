import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, title, subtitle, actions }) => {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-64 overflow-y-auto transition-all duration-300">
        {(title || actions) && (
          <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
                {subtitle && <p className="text-slate-400 text-sm mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </div>
        )}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};

export default PageLayout;
