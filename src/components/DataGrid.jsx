'use client';

import React from 'react';

const DataGrid = ({ 
  children, 
  columns = 4,
  gap = 'var(--spacing-lg)',
  className = ''
}) => {
  return (
    <style jsx>{`
      .data-grid {
        display: grid;
        grid-template-columns: repeat(${columns}, 1fr);
        gap: ${gap};
        width: 100%;
      }

      @media (max-width: 1200px) {
        .data-grid {
          grid-template-columns: repeat(${Math.max(2, Math.ceil(columns / 2))}, 1fr);
        }
      }

      @media (max-width: 768px) {
        .data-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 480px) {
        .data-grid {
          grid-template-columns: 1fr;
        }
      }
    `}</style>
    <div className={`data-grid ${className}`}>
      {children}
    </div>
  );
};

export default DataGrid;
