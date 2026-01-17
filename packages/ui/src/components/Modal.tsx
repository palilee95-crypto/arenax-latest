"use client";

import React, { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEsc);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </header>
        <div className="modal-body">
          {children}
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .modal-content {
          background: rgba(20, 20, 22, 0.95);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          
          /* Mobile Sizing & Positioning */
          width: 100%;
          max-width: 600px;
          margin: 16px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          
          /* Mobile Animation: Spring Slide Up */
          animation: slideUpSpring 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        /* Desktop Adjustments */
        @media (min-width: 768px) {
          .modal-content {
            width: 90%;
            margin: auto;
            /* Desktop Animation: Smooth Scale In */
            animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
        }
        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.01em;
        }
        .close-button {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.2s;
          padding-bottom: 2px;
        }
        .close-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          transform: rotate(90deg);
        }
        .modal-body {
          padding: 1.5rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; backdrop-filter: blur(0px); }
          to { opacity: 1; backdrop-filter: blur(8px); }
        }
        
        @keyframes slideUpSpring {
          from { 
            transform: translateY(100px) scale(0.95); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0) scale(1); 
            opacity: 1; 
          }
        }

        @keyframes scaleIn {
          from { 
            transform: scale(0.95) translateY(10px); 
            opacity: 0; 
          }
          to { 
            transform: scale(1) translateY(0); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
};
