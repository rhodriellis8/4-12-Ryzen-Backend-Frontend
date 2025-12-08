import React from 'react';

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({ text, className = '', children, ...props }) => {
  return (
    <div className={`inline-block bg-transparent ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500&display=swap'); 
        @property --gradient-angle { syntax: "<angle>"; initial-value: 0deg; inherits: false; } 
        @property --gradient-angle-offset { syntax: "<angle>"; initial-value: 0deg; inherits: false; } 
        @property --gradient-percent { syntax: "<percentage>"; initial-value: 20%; inherits: false; } 
        @property --gradient-shine { syntax: "<color>"; initial-value: #8484ff; inherits: false; } 
        
        .shiny-cta { 
          --gradient-angle: 0deg; 
          --gradient-angle-offset: 0deg; 
          --gradient-percent: 20%; 
          --gradient-shine: #8484ff; 
          --shadow-size: 2px; 
          position: relative; 
          overflow: hidden; 
          border-radius: 9999px; 
          padding: 1.25rem 2.5rem; 
          font-size: 1.125rem; 
          line-height: 1.2; 
          font-weight: 500; 
          color: #ffffff; 
          background: linear-gradient(#000000, #000000) padding-box, conic-gradient( from calc(var(--gradient-angle) - var(--gradient-angle-offset)), transparent 0%, #1d4ed8 5%, var(--gradient-shine) 15%, #1d4ed8 30%, transparent 40%, transparent 100% ) border-box; 
          border: 2px solid transparent; 
          box-shadow: inset 0 0 0 1px #1a1818; 
          outline: none; 
          transition: --gradient-angle-offset 800ms cubic-bezier(0.25, 1, 0.5, 1), --gradient-percent 800ms cubic-bezier(0.25, 1, 0.5, 1), --gradient-shine 800ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.3s; 
          cursor: pointer; 
          isolation: isolate; 
          outline-offset: 4px; 
          font-family: 'Inter', 'Helvetica Neue', sans-serif; 
          z-index: 0; 
          animation: border-spin 2.5s linear infinite; 
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        } 
        
        @keyframes border-spin { to { --gradient-angle: 360deg; } } 
        
        .shiny-cta:active { transform: translateY(1px); } 
        
        .shiny-cta::before { content: ''; pointer-events: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 0; --size: calc(100% - 6px); --position: 2px; --space: 4px; width: var(--size); height: var(--size); background: radial-gradient(circle at var(--position) var(--position), white 0.5px, transparent 0) padding-box; background-size: var(--space) var(--space); background-repeat: space; mask-image: conic-gradient( from calc(var(--gradient-angle) + 45deg), black, transparent 10% 90%, black ); border-radius: inherit; opacity: 0.4; pointer-events: none; } 
        
        .shiny-cta::after { content: ''; pointer-events: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 1; width: 100%; aspect-ratio: 1; background: linear-gradient(-50deg, transparent, #1d4ed8, transparent); mask-image: radial-gradient(circle at bottom, transparent 40%, black); opacity: 0.6; animation: shimmer 4s linear infinite; animation-play-state: running; } 
        
        .shiny-cta span { position: relative; z-index: 2; display: inline-block; } 
        
        .shiny-cta span::before { content: ''; pointer-events: none; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: -1; --size: calc(100% + 1rem); width: var(--size); height: var(--size); box-shadow: inset 0 -1ex 2rem 4px #1d4ed8; opacity: 0; border-radius: inherit; transition: opacity 800ms cubic-bezier(0.25, 1, 0.5, 1); animation: breathe 4.5s linear infinite; } 
        
        @keyframes shimmer { to { transform: translate(-50%, -50%) rotate(360deg);} } 
        @keyframes breathe { 0%, 100% { transform: translate(-50%, -50%) scale(1);} 50% { transform: translate(-50%, -50%) scale(1.20);} }
      `}} />

      <button className="shiny-cta focus:outline-none" {...props}>
        <span>{text || children}</span>
      </button>
    </div>
  );
};

export default ShinyButton;
