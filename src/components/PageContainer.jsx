'use client';

import React from 'react';

const PageContainer = ({ 
  children, 
  title = null, 
  subtitle = null,
  icon: Icon = null,
  actions = null,
  className = ''
}) => {
  return (
    <style jsx>{`
      .page-container {
        width: 100%;
        max-width: 100%;
      }

      .page-header {
        margin-bottom: var(--spacing-2xl);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--spacing-lg);
      }

      .header-left {
        display: flex;
        align-items: center;
        gap: var(--spacing-lg);
      }

      .header-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--color-accent) 0%, var(--color-accent-light) 100%);
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-primary);
        flex-shrink: 0;
        box-shadow: var(--shadow-md);
      }

      .header-text {
        flex: 1;
      }

      .page-title {
        font-size: 1.875rem;
        font-weight: 700;
        color: var(--color-text);
        margin: 0;
        letter-spacing: -0.02em;
      }

      .page-subtitle {
        font-size: 0.875rem;
        color: var(--color-text-secondary);
        margin-top: var(--spacing-sm);
        font-weight: 500;
      }

      .header-actions {
        display: flex;
        gap: var(--spacing-md);
        flex-wrap: wrap;
      }

      .page-content {
        width: 100%;
      }

      @media (max-width: 768px) {
        .page-header {
          flex-direction: column;
          align-items: flex-start;
        }

        .page-title {
          font-size: 1.5rem;
        }

        .header-actions {
          width: 100%;
        }
      }
    `}</style>
    <div className={`page-container ${className}`}>
      {(title || Icon || actions) && (
        <div className="page-header">
          <div className="header-left">
            {Icon && <div className="header-icon"><Icon size={24} /></div>}
            {title && (
              <div className="header-text">
                <h1 className="page-title">{title}</h1>
                {subtitle && <p className="page-subtitle">{subtitle}</p>}
              </div>
            )}
          </div>
          {actions && <div className="header-actions">{actions}</div>}
        </div>
      )}
      
      <div className="page-content">
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
