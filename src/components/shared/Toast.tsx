import { useEffect, useState } from 'react';
import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

// define toast where a pop out noti shows a message then fade out
const Toast = ({ 
  message, 
  type = 'success', 
  onClose,
  duration = 3000
 }: ToastProps) => {
  const [visible, setVisible] = useState(true);

// hide success message after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // will fade away, 300 is changeable if needed
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // background colour for toast
  const colours: Record<string, string> = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div
      className={`
        fixed top-6 right-6 z-50 flex items-center gap-3 
        px-5 py-3 rounded-lg text-white shadow-lg transition-all duration-300 
        ${colours[type]} 
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
      role="alert"
    > 
    {/* show different icon for different toast type */}
      {type === 'success' && <span className="text-lg">✓</span>}
      {type === 'error' && <span className="text-lg">✕</span>}
      {type === 'info' && <span className="text-lg">ℹ</span>}
      <span className="text-sm font-medium">{message}</span>
      <button
       // a "x" button to manually close the toast 
        onClick={() => { 
          setVisible(false); 
          setTimeout(onClose, 300); 
        }}
        className="ml-2 text-white/80 hover:text-white text-lg leading-none"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;