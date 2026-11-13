<script>
  let {
    onRetry = () => {},
    onOpenSettings = () => {}
  } = $props();
</script>

<div
  class="absolute inset-0 bg-surface/90 backdrop-blur-md rounded-xl flex flex-col items-center justify-center p-6 text-center z-20">
  <div class="relative w-28 h-28 mx-auto mb-2 flex items-center justify-center select-none">
    <div class="absolute inset-0 bg-rose-500/10 rounded-full blur-2xl animate-pulse"></div>
    <svg class="w-24 h-24 text-slate-300 drop-shadow-md" viewBox="0 0 100 100" fill="none"
      xmlns="http://www.w3.org/2000/svg">
      <!-- Monitor Body -->
      <rect x="18" y="22" width="64" height="48" rx="12" fill="#1e293b" stroke="#475569" stroke-width="2.5" />
      <!-- Screen Area -->
      <rect x="24" y="28" width="52" height="36" rx="8" fill="#0f172a" />
      <!-- Little Antenna -->
      <path d="M50 22V12" stroke="#64748b" stroke-width="2.5" stroke-linecap="round" />
      <circle cx="50" cy="10" r="4" fill="#f43f5e" />
      <!-- Monitor Stand -->
      <path d="M42 70L38 78H62L58 70" fill="#334155" stroke="#475569" stroke-width="2" stroke-linejoin="round" />
      <!-- Kawaii Shy Eyes -->
      <circle cx="40" cy="44" r="3" fill="#94a3b8" />
      <circle cx="60" cy="44" r="3" fill="#94a3b8" />
      <circle cx="41" cy="43" r="1.2" fill="#ffffff" />
      <circle cx="61" cy="43" r="1.2" fill="#ffffff" />
      <!-- Cute Pink Blush Cheeks -->
      <ellipse cx="34" cy="50" rx="3.5" ry="2" fill="#f472b6" fill-opacity="0.65" />
      <ellipse cx="66" cy="50" rx="3.5" ry="2" fill="#f472b6" fill-opacity="0.65" />
      <!-- Wavy Sad Mouth -->
      <path d="M46 52Q50 48.5 54 52" stroke="#cbd5e1" stroke-width="2" stroke-linecap="round" fill="none" />
      <!-- Disconnected Signal Dots -->
      <path d="M68 34C70 32 73 32 75 34" stroke="#f43f5e" stroke-width="2" stroke-linecap="round"
        stroke-dasharray="2 2" />
      <circle cx="76" cy="31" r="1.5" fill="#f43f5e" />
    </svg>
  </div>
  <h3 class="text-base sm:text-lg font-bold text-white mb-1.5 tracking-wide">
    sorry, the datasource is unavailable
  </h3>
  <p class="text-xs text-slate-400 max-w-sm mb-5 leading-relaxed">
    The spreadsheet feed couldn't be reached right now. It might be taking a quick nap, experiencing a connection
    hiccup, or offline.
  </p>
  <div class="flex items-center gap-3">
    <button
      type="button"
      onclick={onRetry}
      class="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-brand/20 transition active:scale-95 cursor-pointer">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Retry Connection
    </button>
    <button
      type="button"
      onclick={onOpenSettings}
      class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-panel hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700/80 transition cursor-pointer">
      Check Settings
    </button>
  </div>
</div>
