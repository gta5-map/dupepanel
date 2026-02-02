import { useState } from 'react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export function InstallPrompt() {
  const { shouldShowBanner, isIOS, showPrompt, dismissPrompt } = useInstallPrompt();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!shouldShowBanner) return null;

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
    } else {
      const accepted = await showPrompt();
      if (!accepted) {
        dismissPrompt();
      }
    }
  };

  return (
    <>
      {/* Install Banner */}
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom duration-300 md:left-auto md:right-4 md:max-w-sm">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
              <svg
                className="w-7 h-7 text-indigo-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-sm">Install Dupepanel</h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Add to home screen for quick access & offline support
              </p>
            </div>
            <button
              onClick={dismissPrompt}
              className="flex-shrink-0 text-slate-500 hover:text-slate-300 p-1"
              aria-label="Dismiss"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={dismissPrompt}
              className="flex-1 px-3 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Not now
            </button>
            <button
              onClick={handleInstall}
              className="flex-1 px-3 py-2 text-sm bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors"
            >
              Install
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm animate-in slide-in-from-bottom duration-300">
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold text-lg">Install Dupepanel</h3>
                <button
                  onClick={() => {
                    setShowIOSInstructions(false);
                    dismissPrompt();
                  }}
                  className="text-slate-500 hover:text-slate-300 p-1"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-slate-400 text-sm mb-5">
                To install this app on your iPhone/iPad:
              </p>

              <ol className="space-y-4">
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                    1
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Tap the{' '}
                      <span className="inline-flex items-center">
                        <svg className="w-5 h-5 text-indigo-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                      </span>{' '}
                      <span className="text-indigo-400 font-medium">Share</span> button
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                    2
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Scroll down and tap{' '}
                      <span className="inline-flex items-center">
                        <svg className="w-5 h-5 text-indigo-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </span>{' '}
                      <span className="text-indigo-400 font-medium">Add to Home Screen</span>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-indigo-500/20 rounded-full flex items-center justify-center text-indigo-400 text-xs font-bold">
                    3
                  </span>
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      Tap <span className="text-indigo-400 font-medium">Add</span> in the top right
                    </p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="border-t border-slate-700 p-4">
              <button
                onClick={() => {
                  setShowIOSInstructions(false);
                  dismissPrompt();
                }}
                className="w-full px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
