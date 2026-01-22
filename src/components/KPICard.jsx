'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ 
  title, 
  value, 
  unit = '', 
  change = null, 
  isPositive = true, 
  icon: Icon = null, 
  status = 'normal', 
  insight = null,
  onClick = null 
}) => {
  const statusColors = {
    normal: { bg: 'rgba(16, 185, 129, 0.1)', border: '#10B981', text: '#10B981' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', border: '#F59E0B', text: '#F59E0B' },
    critical: { bg: 'rgba(239, 68, 68, 0.1)', border: '#EF4444', text: '#EF4444' },
  };

  const color = statusColors[status] || statusColors.normal;

  return (
    <>
      <style jsx>{`
        .kpi-card {
          background: linear-gradient(135deg, var(--color-bg-secondary) 0%, var(--color-bg-tertiary) 100%);
          border: 1px solid ${color.border}40;
          border-left: 3px solid ${color.border};
          border-radius: var(--radius-lg);
          padding: var(--spacing-xl);
          cursor: ${onClick ? 'pointer' : 'default'};
          transition: all var(--transition-normal);
          position: relative;
          overflow: hidden;
        }

        .kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 120px;
          height: 120px;
          background: ${color.text}15;
          border-radius: 50%;
          transform: translate(40%, -40%);
          transition: transform var(--transition-normal);
        }

        .kpi-card:hover {
          border-color: ${color.border};
          transform: ${onClick ? 'translateY(-4px)' : 'none'};
          box-shadow: var(--shadow-lg);
        }

        .kpi-card:hover::before {
          transform: translate(40%, -40%) scale(1.2);
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-lg);
          position: relative;
          z-index: 1;
        }

        .kpi-title {
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-text-secondary);
        }

        .kpi-icon {
          width: 40px;
          height: 40px;
          background: ${color.text}20;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${color.text};
        }

        .kpi-body {
          position: relative;
          z-index: 1;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--color-text);
          font-family: var(--font-secondary);
          line-height: 1.1;
          margin-bottom: var(--spacing-sm);
        }

        .kpi-unit {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          font-weight: 500;
        }

        .kpi-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: var(--spacing-md);
          padding-top: var(--spacing-md);
          border-top: 1px solid var(--color-border);
          position: relative;
          z-index: 1;
        }

        .kpi-change {
          display: flex;
          align-items: center;
          gap: var(--spacing-sm);
          font-size: 12px;
          font-weight: 600;
        }

        .kpi-change.positive {
          color: var(--color-success);
        }

        .kpi-change.negative {
          color: var(--color-warning);
        }

        .kpi-insight {
          font-size: 11px;
          color: var(--color-text-tertiary);
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .kpi-card {
            padding: var(--spacing-lg);
          }

          .kpi-value {
            font-size: 1.5rem;
          }
        }
      `}</style>
      <div className="kpi-card" onClick={onClick}>
        <div className="kpi-header">
          <div className="kpi-title">{title}</div>
          {Icon && <div className="kpi-icon"><Icon size={20} /></div>}
        </div>
        
        <div className="kpi-body">
          <div className="kpi-value">
            {typeof value === 'number' ? value.toLocaleString() : value}
            {unit && <span className="kpi-unit"> {unit}</span>}
          </div>
        </div>

        <div className="kpi-footer">
          {change !== null ? (
            <div className={`kpi-change ${isPositive ? 'positive' : 'negative'}`}>
              {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              <span>{Math.abs(change)}% {isPositive ? 'increase' : 'decrease'}</span>
            </div>
          ) : null}
          {insight && <div className="kpi-insight">{insight}</div>}
        </div>
      </div>
    </>
  );
};

export default KPICard;
