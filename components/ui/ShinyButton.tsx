import React from 'react';

interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text?: string;
  className?: string;
  icon?: React.ReactNode;
}

const ShinyButton: React.FC<ShinyButtonProps> = ({ text, className = '', icon, children, ...props }) => {
  const content = text || children;
  // Ensure content is a string for splitting, if it's not, we won't animate letters
  const textContent = typeof content === 'string' ? content : '';
  const letters = textContent.split('');

  return (
    <div className={`btn-wrapper ${className}`}>
      <style dangerouslySetInnerHTML={{ __html: `
    .btn-wrapper {
      position: relative;
      display: inline-block;
    }

    .btn {
      --border-radius: 24px;
      --padding: 4px;
      --transition: 0.4s;
      --button-color: #000000;
      --highlight-color-hue: 210deg;
      /* Change this hue to recolor the glow */

      user-select: none;
      display: flex;
      justify-content: center;

      background-color: var(--button-color);

      /* Complex layered shadows */
      box-shadow:
        inset 0px 1px 1px rgba(255, 255, 255, 0.2),
        inset 0px 2px 2px rgba(255, 255, 255, 0.15),
        inset 0px 4px 4px rgba(255, 255, 255, 0.1),
        inset 0px 8px 8px rgba(255, 255, 255, 0.05),
        inset 0px 16px 16px rgba(255, 255, 255, 0.05),
        0px -1px 1px rgba(0, 0, 0, 0.02),
        0px -2px 2px rgba(0, 0, 0, 0.03),
        0px -4px 4px rgba(0, 0, 0, 0.05),
        0px -8px 8px rgba(0, 0, 0, 0.06),
        0px -16px 16px rgba(0, 0, 0, 0.08);

      border: solid 1px #ffffff22;
      border-radius: var(--border-radius);
      cursor: pointer;

      transition:
        box-shadow var(--transition),
        border var(--transition),
        background-color var(--transition);
    }

    .btn::before {
      content: "";
      position: absolute;
      top: calc(0px - var(--padding));
      left: calc(0px - var(--padding));
      width: calc(100% + var(--padding) * 2);
      height: calc(100% + var(--padding) * 2);
      border-radius: calc(var(--border-radius) + var(--padding));
      pointer-events: none;
      background-image: linear-gradient(0deg, #0004, #000a);
      z-index: -1;
      transition:
        box-shadow var(--transition),
        filter var(--transition);
      box-shadow:
        0 -8px 8px -6px #0000 inset,
        0 -16px 16px -8px #00000000 inset,
        1px 1px 1px #fff2,
        2px 2px 2px #fff1,
        -1px -1px 1px #0002,
        -2px -2px 2px #0001;
    }

    .btn::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      background-image: linear-gradient(0deg,
          #fff,
          hsl(var(--highlight-color-hue), 100%, 70%),
          hsla(var(--highlight-color-hue), 100%, 70%, 50%),
          8%,
          transparent);
      background-position: 0 0;
      opacity: 0;
      transition: opacity var(--transition), filter var(--transition);
    }

    .btn-letter {
      position: relative;
      display: inline-block;
      color: #ffffff55;
      animation: letter-anim 2s ease-in-out infinite;
      transition: color var(--transition), text-shadow var(--transition), opacity var(--transition);
    }

    @keyframes letter-anim {
      50% {
        text-shadow: 0 0 3px #ffffff88;
        color: #fff;
      }
    }

    .btn-svg {
      flex-grow: 1;
      height: 24px;
      margin-right: 0.5rem;
      fill: #e8e8e8;
      animation: flicker 2s linear infinite;
      animation-delay: 0.5s;
      filter: drop-shadow(0 0 2px #ffffff99);
      transition: fill var(--transition), filter var(--transition), opacity var(--transition);
    }

    @keyframes flicker {
      50% {
        opacity: 0.3;
      }
    }

    .txt-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      min-width: 6.4em;
    }

    .txt-1,
    .txt-2 {
      position: absolute;
      word-spacing: -1em;
    }

    .txt-1 {
      animation: appear-anim 1s ease-in-out forwards;
    }

    .txt-2 {
      opacity: 0;
    }

    @keyframes appear-anim {
      0% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    .btn:focus .txt-1,
    .btn:focus-visible .txt-1 {
      animation: opacity-anim 0.3s ease-in-out forwards;
      animation-delay: 1s;
    }

    .btn:focus .txt-2,
    .btn:focus-visible .txt-2 {
      animation: opacity-anim 0.3s ease-in-out reverse forwards;
      animation-delay: 1s;
    }

    @keyframes opacity-anim {
      0% {
        opacity: 1;
      }

      100% {
        opacity: 0;
      }
    }

    .btn:focus .btn-letter,
    .btn:focus-visible .btn-letter {
      animation:
        focused-letter-anim 1s ease-in-out forwards,
        letter-anim 1.2s ease-in-out infinite;
      animation-delay: 0s, 1s;
    }

    @keyframes focused-letter-anim {

      0%,
      100% {
        filter: blur(0px);
      }

      50% {
        transform: scale(2);
        filter: blur(10px) brightness(150%) drop-shadow(-36px 12px 12px hsl(var(--highlight-color-hue), 100%, 70%));
      }
    }

    .btn:focus .btn-svg,
    .btn:focus-visible .btn-svg {
      animation-duration: 1.2s;
      animation-delay: 0.2s;
    }

    .btn:focus::before,
    .btn:focus-visible::before {
      box-shadow:
        0 -8px 12px -6px #fff3 inset,
        0 -16px 16px -8px hsla(var(--highlight-color-hue), 100%, 70%, 20%) inset,
        1px 1px 1px #fff3,
        2px 2px 2px #fff1,
        -1px -1px 1px #0002,
        -2px -2px 2px #0001;
    }

    .btn:focus::after,
    .btn:focus-visible::after {
      opacity: 0.6;
      -webkit-mask-image: linear-gradient(0deg, #fff, transparent);
      mask-image: linear-gradient(0deg, #fff, transparent);
      filter: brightness(100%);
    }

    /* Staggered delays for each letter */
    ${Array.from({ length: 20 }).map((_, i) => `
      .btn-letter:nth-child(${i + 1}),
      .btn:focus .btn-letter:nth-child(${i + 1}),
      .btn:focus-visible .btn-letter:nth-child(${i + 1}) {
        animation-delay: ${i * 0.08}s;
      }
    `).join('')}

    /* Active state */
    .btn:active {
      border: solid 1px hsla(var(--highlight-color-hue), 100%, 80%, 0.7);
      background-color: hsla(var(--highlight-color-hue), 50%, 20%, 0.5);
    }

    .btn:active::before {
      box-shadow:
        0 -8px 12px -6px #fffa inset,
        0 -16px 16px -8px hsla(var(--highlight-color-hue), 100%, 70%, 0.8) inset,
        1px 1px 1px #fff4,
        2px 2px 2px #fff2,
        -1px -1px 1px #0002,
        -2px -2px 2px #0001;
    }

    .btn:active::after {
      opacity: 1;
      -webkit-mask-image: linear-gradient(0deg, #fff, transparent);
      mask-image: linear-gradient(0deg, #fff, transparent);
      filter: brightness(200%);
    }

    .btn:active .btn-letter {
      text-shadow: 0 0 1px hsla(var(--highlight-color-hue), 100%, 90%, 0.9);
      animation: none;
    }

    /* Hover state */
    .btn:hover {
      border: solid 1px hsla(var(--highlight-color-hue), 100%, 80%, 0.4);
    }

    .btn:hover::before {
      box-shadow:
        0 -8px 8px -6px #fffa inset,
        0 -16px 16px -8px hsla(var(--highlight-color-hue), 100%, 70%, 0.3) inset,
        1px 1px 1px #fff2,
        2px 2px 2px #fff1,
        -1px -1px 1px #0002,
        -2px -2px 2px #0001;
    }

    .btn:hover::after {
      opacity: 1;
      -webkit-mask-image: linear-gradient(0deg, #fff, transparent);
      mask-image: linear-gradient(0deg, #fff, transparent);
    }

    .btn:hover .btn-svg {
      fill: #fff;
      filter:
        drop-shadow(0 0 3px hsl(var(--highlight-color-hue), 100%, 70%)) drop-shadow(0 -4px 6px #0009);
      animation: none;
    }
      `}} />

      <button className="btn px-3 py-2 md:px-4 md:py-2 focus:outline-none" {...props}>
        {icon && <span className="btn-svg flex items-center justify-center mr-2">{icon}</span>}
        
        <div className="txt-wrapper">
          <div className="txt-1">
            {letters.length > 0 ? (
              letters.map((char, i) => (
                <span key={`1-${i}`} className="btn-letter font-medium text-xs uppercase tracking-wider">{char === ' ' ? '\u00A0' : char}</span>
              ))
            ) : (
               <span className="btn-letter font-medium text-xs uppercase tracking-wider">{textContent}</span>
            )}
          </div>
          <div className="txt-2">
            {letters.length > 0 ? (
              letters.map((char, i) => (
                <span key={`2-${i}`} className="btn-letter font-medium text-xs uppercase tracking-wider">{char === ' ' ? '\u00A0' : char}</span>
              ))
            ) : (
               <span className="btn-letter font-medium text-xs uppercase tracking-wider">{textContent}</span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
};

export default ShinyButton;
