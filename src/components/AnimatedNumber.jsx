import React, { useEffect, useState } from 'react';

const AnimatedNumber = ({ value, duration = 1000, decimals = 1, suffix = '' }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const target = parseFloat(value) || 0;
        const startValue = 0;
        const startTime = Date.now();
        const endTime = startTime + duration;

        const updateValue = () => {
            const now = Date.now();

            if (now >= endTime) {
                setDisplayValue(target);
                return;
            }

            const progress = (now - startTime) / duration;
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = startValue + (target - startValue) * easeOutQuart;

            setDisplayValue(currentValue);
            requestAnimationFrame(updateValue);
        };

        requestAnimationFrame(updateValue);
    }, [value, duration]);

    return (
        <span style={{ fontFeatureSettings: '"tnum"', fontVariantNumeric: 'tabular-nums' }}>
            {displayValue.toFixed(decimals)}{suffix}
        </span>
    );
};

export default AnimatedNumber;
