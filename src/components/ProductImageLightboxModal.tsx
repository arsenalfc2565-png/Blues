import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ProductImageLightboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc?: string;
  title?: string;
}

export const ProductImageLightboxModal: React.FC<ProductImageLightboxModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  title,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageSrc) return null;

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 p-2 rounded-full bg-neutral-900/80 text-white hover:bg-neutral-800 transition-colors z-10"
      >
        <X className="w-6 h-6" />
      </button>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full flex flex-col items-center animate-in zoom-in-95 duration-200"
      >
        <img
          src={imageSrc}
          alt={title || 'Product photo'}
          className="w-full h-auto max-h-[85vh] object-contain rounded-2xl shadow-2xl"
        />
        {title && (
          <p className="mt-4 text-white text-sm font-semibold text-center px-4">{title}</p>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
