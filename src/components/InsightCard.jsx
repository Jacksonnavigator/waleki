'use client';

import React from 'react';
import { AlertCircle, TrendingUp, Zap, Lightbulb } from 'lucide-react';

const InsightCard = ({ 
  title, 
  message, 
  type = 'info', // 'info', 'warning', 'alert', 'success'
  action = null,
  icon: CustomIcon = null
}) => {
  const typeStyles = {
    info: {
      bg: 'rgba(59, 130, 246, 0.1)',
      border: '#3B82F6',
      icon: <Lightbulb size={20} />,
      label: 'Insight'
    },
    warning: {
      bg: 'rgba(245, 158, 11, 0.1)',
      border: '#F59E0B',
      icon: <AlertCircle size={20} />,
      label: 'Warning'
    },
    alert: {
      bg: 'rgba(239, 68, 68, 0.1)',
      border: '#EF4444',
      icon: <AlertCircle size={20} />,
      label: 'Alert'
    },
    success: {
      bg: 'rgba(16, 185, 129, 0.1)',
      border: '#10B981',
      icon: <TrendingUp size={20} />,
      label: 'Success'
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div className="insight-card" style={{ background: style.bg, border: `1px solid ${style.border}40`, borderLeft: `3px solid ${style.border}`, borderRadius: 'var(--radius-lg)', padding: 'var(--spacing-lg)', display: 'flex', gap: 'var(--spacing-lg)' }}>
      <div className="insight-icon" style={{ width: '44px', height: '44px', background: `${style.border}20`, borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: style.border, flexShrink: 0 }}>
        {CustomIcon || style.icon}
      </div>
      <div className="insight-content">
        <div className="insight-header" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-sm)' }}>
          <div className="insight-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--color-text)' }}>{title}</div>
          <div className="insight-badge" style={{ display: 'inline-block', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '3px 8px', background: `${style.border}30`, color: style.border, borderRadius: 'var(--radius-sm)' }}>{style.label}</div>
        </div>
        <div className="insight-message" style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>{message}</div>
        {action && (
          <button className="insight-action" style={{ display: 'inline-block', marginTop: 'var(--spacing-md)', padding: '8px 16px', background: `${style.border}30`, color: style.border, border: 'none', borderRadius: 'var(--radius-md)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all var(--transition-fast)' }} onClick={action.onClick}>
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
};

export default InsightCard;
