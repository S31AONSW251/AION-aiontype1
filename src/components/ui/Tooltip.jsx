import React, { useState, useRef, useEffect } from 'react';

// Small accessible tooltip component.
// Usage: <Tooltip text="hint"><button>...</button></Tooltip>
const Tooltip = ({ children, text, placement = 'top' }) => {
  const [open, setOpen] = useState(false);
  const id = `tooltip-${Math.random().toString(36).slice(2,9)}`;
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const show = () => setOpen(true);
    const hide = () => setOpen(false);
    el.addEventListener('focus', show);
    el.addEventListener('blur', hide);
    el.addEventListener('mouseenter', show);
    el.addEventListener('mouseleave', hide);
    return () => {
      el.removeEventListener('focus', show);
      el.removeEventListener('blur', hide);
      el.removeEventListener('mouseenter', show);
      el.removeEventListener('mouseleave', hide);
    };
  }, []);

  return (
    <span className="tooltip" ref={ref} tabIndex={-1} aria-describedby={open ? id : undefined} style={{position:'relative', display:'inline-block'}}>
      {children}
      <span id={id} role="tooltip" className={`tooltip-content ${open ? 'visible' : ''} tooltip-${placement}`} aria-hidden={!open}>
        {text}
      </span>
    </span>
  );
};

export default Tooltip;
