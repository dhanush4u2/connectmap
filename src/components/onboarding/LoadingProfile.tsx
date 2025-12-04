export function LoadingProfile() {
  return (
    <div className="min-h-screen bg-bg-elevated flex flex-col items-center justify-center p-4">
      <div className="card-premium p-12 max-w-md w-full text-center">
        {/* Animated Icon */}
        <div className="mb-8 flex items-center justify-center">
          <div className="relative">
            {/* Pulsing circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-warm opacity-20 animate-ping" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-gradient-warm opacity-40 animate-pulse" />
            </div>
            
            {/* Center icon */}
            <div className="relative z-10 text-6xl animate-bounce">
              🗺️
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gradient mb-4">
          Mixing your vibe...
        </h2>

        {/* Progress Line */}
        <div className="w-full h-1 bg-bg-warm rounded-full overflow-hidden mb-6">
          <div className="h-full bg-gradient-warm animate-progress" />
        </div>

        {/* Status Bullets */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-3 animate-fade-in">
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-slate-300">Building your Taste Vector</span>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-xs">✓</span>
            </div>
            <span className="text-sm text-slate-300">Matching personality tiles</span>
          </div>
          
          <div className="flex items-center gap-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="w-5 h-5 rounded-full bg-primary animate-pulse flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-sm text-slate-300">Finalizing Taste World</span>
          </div>
        </div>

        {/* Pro Tip */}
        <div className="mt-8 p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-xs text-slate-400">
            <span className="font-semibold text-accent-yellow">Pro tip:</span> Your taste profile
            helps us match places your friends will actually go to
          </p>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-progress {
          animation: progress 2s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
