import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

const Tooltip = ({ content, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState(position);
    const tooltipRef = useRef(null);
    const triggerRef = useRef(null);

    useEffect(() => {
        if (isVisible && tooltipRef.current && triggerRef.current) {
            const tooltip = tooltipRef.current;
            const trigger = triggerRef.current;
            const rect = trigger.getBoundingClientRect();
            const tooltipRect = tooltip.getBoundingClientRect();

            // Auto-flip if tooltip would go off screen
            if (position === 'top' && rect.top - tooltipRect.height < 10) {
                setTooltipPosition('bottom');
            } else if (position === 'bottom' && rect.bottom + tooltipRect.height > window.innerHeight - 10) {
                setTooltipPosition('top');
            }
        }
    }, [isVisible, position]);

    return (
        <div className="tooltip-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
            <style jsx>{`
        .tooltip-wrapper {
          position: relative;
          display: inline-block;
        }

        .tooltip-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: help;
          transition: all 0.2s ease;
        }

        .tooltip-trigger:hover,
        .tooltip-trigger:focus {
          transform: scale(1.1);
        }

        .tooltip-trigger:focus {
          outline: 2px solid #0ea5e9;
          outline-offset: 2px;
          border-radius: 50%;
        }

        .tooltip-content {
          position: absolute;
          z-index: 10000;
          padding: 12px 16px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;
          white-space: nowrap;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.4);
          pointer-events: none;
          opacity: 0;
          transform: translateY(0) scale(0.95);
          transition: opacity 0.2s ease, transform 0.2s ease;
          max-width: 280px;
          white-space: normal;
        }

        .tooltip-content.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .tooltip-content.position-top {
          bottom: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(4px) scale(0.95);
        }

        .tooltip-content.position-top.visible {
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .tooltip-content.position-bottom {
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%) translateY(-4px) scale(0.95);
        }

        .tooltip-content.position-bottom.visible {
          transform: translateX(-50%) translateY(0) scale(1);
        }

        .tooltip-content.position-right {
          left: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(-4px) scale(0.95);
        }

        .tooltip-content.position-right.visible {
          transform: translateY(-50%) translateX(0) scale(1);
        }

        .tooltip-content.position-left {
          right: calc(100% + 8px);
          top: 50%;
          transform: translateY(-50%) translateX(4px) scale(0.95);
        }

        .tooltip-content.position-left.visible {
          transform: translateY(-50%) translateX(0) scale(1);
        }

        .tooltip-arrow {
          position: absolute;
          width: 0;
          height: 0;
          border-style: solid;
        }

        .tooltip-content.position-top .tooltip-arrow {
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 6px 6px 0 6px;
          border-color: #0f172a transparent transparent transparent;
        }

        .tooltip-content.position-bottom .tooltip-arrow {
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          border-width: 0 6px 6px 6px;
          border-color: transparent transparent #0f172a transparent;
        }

        .tooltip-content.position-right .tooltip-arrow {
          left: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 6px 6px 0;
          border-color: transparent #0f172a transparent transparent;
        }

        .tooltip-content.position-left .tooltip-arrow {
          right: -6px;
          top: 50%;
          transform: translateY(-50%);
          border-width: 6px 0 6px 6px;
          border-color: transparent transparent transparent #0f172a;
        }

        @media (max-width: 768px) {
          .tooltip-content {
            max-width: 220px;
            font-size: 12px;
            padding: 10px 14px;
          }
        }
      `}</style>

            <div
                ref={triggerRef}
                className="tooltip-trigger"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onFocus={() => setIsVisible(true)}
                onBlur={() => setIsVisible(false)}
                tabIndex={0}
                role="button"
                aria-label="Help information"
            >
                {children || <HelpCircle size={16} style={{ color: '#0ea5e9' }} />}
            </div>

            <div
                ref={tooltipRef}
                className={`tooltip-content position-${tooltipPosition} ${isVisible ? 'visible' : ''}`}
                role="tooltip"
            >
                {content}
                <div className="tooltip-arrow" />
            </div>
        </div>
    );
};

export default Tooltip;
