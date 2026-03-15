import masterCategoryStore from '../store/masterCategoryStore';

// Food option color constant — single source of truth
export const FOOD_THEME_COLOR = '#fe6b35';

const MASTER_CATEGORY_VALUES = ['Grocery', 'Food'];

const PillSlider = ({ options, value, onChange, themeColor = 'hsl(var(--primary))', inactiveColor = 'hsl(var(--muted-foreground))', size = 'normal' }) => {
    // options should now be an array of objects: { value, label, icon?, activeColor? }
    // Backwards compatibility for string arrays
    const normalizedOptions = options.map(opt => typeof opt === 'string' ? { value: opt, label: opt } : opt);

    // Auto-detect if this PillSlider is acting as a masterCategory selector
    const isMasterCategorySider = normalizedOptions.every(opt => MASTER_CATEGORY_VALUES.includes(opt.value));

    const activeIndex = normalizedOptions.findIndex(opt => opt.value === value);
    const activeOption = normalizedOptions[activeIndex] || normalizedOptions[0];

    // Auto-fix Food activeColor: always use the orange theme color
    const resolvedOptions = normalizedOptions.map(opt =>
        opt.value === 'Food' ? { ...opt, activeColor: FOOD_THEME_COLOR } : opt
    );
    const resolvedActiveOption = resolvedOptions[activeIndex] || resolvedOptions[0];
    const currentThemeColor = resolvedActiveOption?.activeColor || themeColor;

    const safeActiveIndex = Math.max(0, activeIndex);
    const splitRatio = 100 / normalizedOptions.length;
    const leftPosition = safeActiveIndex * splitRatio;

    const handleChange = (val) => {
        // Auto-sync to global theme if this is a masterCategory slider
        if (isMasterCategorySider) {
            masterCategoryStore.setMasterCategory(val);
        }
        onChange(val);
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${normalizedOptions.length}, 1fr)`,
            background: 'hsl(var(--secondary) / 0.3)',
            borderRadius: '999px',
            padding: size === 'compact' ? '4px' : '6px',
            position: 'relative',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.08)',
        }}>
            {/* Animated Background Pill */}
            <div style={{
                position: 'absolute',
                top: size === 'compact' ? '4px' : '6px',
                bottom: size === 'compact' ? '4px' : '6px',
                left: `calc(${leftPosition}% + ${size === 'compact' ? '4px' : '6px'})`,
                width: `calc(${splitRatio}% - ${size === 'compact' ? '8px' : '12px'})`,
                background: currentThemeColor,
                borderRadius: '999px',
                transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                zIndex: 1
            }} />

            {/* Buttons */}
            {resolvedOptions.map((option) => {
                const isActive = value === option.value;
                return (
                    <button
                        type="button"
                        key={option.value}
                        onClick={(e) => {
                            e.preventDefault();
                            handleChange(option.value);
                        }}
                        style={{
                            position: 'relative',
                            zIndex: 2,
                            padding: size === 'compact' ? '0.5rem 1rem' : '0.8rem 1.8rem',
                            minWidth: 'auto',
                            border: 'none',
                            background: 'transparent',
                            color: isActive ? '#ffffff' : inactiveColor,
                            fontWeight: isActive ? '800' : '600',
                            fontSize: size === 'compact' ? '0.75rem' : '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            borderRadius: '999px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                            transform: isActive ? 'scale(1.02)' : 'scale(1)',
                            opacity: isActive ? 1 : 0.8
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive) e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive) e.currentTarget.style.opacity = '0.8';
                        }}
                    >
                        {option.icon && (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                transition: 'transform 0.3s ease',
                                transform: isActive ? 'rotate(-5deg) scale(1.1)' : 'rotate(0) scale(1)'
                            }}>
                                {option.icon}
                            </span>
                        )}
                        {option.label}
                    </button>
                );
            })}
        </div>
    );
};

export default PillSlider;
