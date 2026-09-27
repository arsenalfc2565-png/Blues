import React from 'react';
import { createPortal } from 'react-dom';
import { X, Globe, Check, Sparkles, MapPin } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageCode, useLanguage } from '../utils/i18n';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, setLanguage } = useLanguage();

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[99999] overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white text-neutral-900 rounded-3xl max-w-lg w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col my-auto animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 bg-neutral-950 text-white border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-extrabold text-base text-white">
                Select Regional Language / Lugha
              </h3>
              <p className="text-[11px] text-neutral-400">
                Choose your preferred Kenyan wholesale language
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 space-y-3 bg-neutral-50 text-xs">
          {SUPPORTED_LANGUAGES.map((opt) => {
            const isSelected = language === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => {
                  setLanguage(opt.code);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-600 shadow-md ring-2 ring-blue-600/20'
                    : 'bg-white hover:bg-neutral-100 border-neutral-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl">{opt.flag}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-900 text-sm">
                        {opt.nativeLabel}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-mono">
                        ({opt.label})
                      </span>
                    </div>
                    <span className="text-[11px] text-neutral-500 block mt-0.5">
                      {opt.region}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-neutral-100 border-t border-neutral-200 text-center text-[11px] text-neutral-500">
          Translations dynamically update menus, checkout instructions, and bus parcel terms.
        </div>
      </div>
    </div>,
    document.body
  );
};
