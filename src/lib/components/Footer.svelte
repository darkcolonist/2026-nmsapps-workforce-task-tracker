<script>
  let {
    kpiRemaining = '--',
    kpiCompleted = '--',
    kpiTotal = '--',
    kpiVelocity = '--',
    deltaText = '--',
    deltaClass = 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400',
    lastUpdated = '--',
    isUnavailable = false
  } = $props();
</script>

<footer
  class="fixed bottom-0 left-0 right-0 h-11 bg-surface/95 backdrop-blur border-t border-slate-800/80 z-30 px-3 sm:px-4 flex items-center justify-between text-xs">
  <div class="flex items-center gap-3 sm:gap-6 overflow-x-auto py-1 no-scrollbar text-slate-300">
    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-slate-400 font-medium">Remaining:</span>
      <span class="font-bold text-white text-sm">{kpiRemaining}</span>
      <span class={deltaClass}>{deltaText}</span>
    </div>

    <div class="hidden sm:inline-block w-px h-3 bg-slate-700/60 shrink-0"></div>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-slate-400 font-medium">Done:</span>
      <span class="font-bold text-emerald-400 text-sm">{kpiCompleted}</span>
    </div>

    <div class="hidden sm:inline-block w-px h-3 bg-slate-700/60 shrink-0"></div>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-slate-400 font-medium">Scope:</span>
      <span class="font-bold text-slate-200 text-sm">{kpiTotal}</span>
    </div>

    <div class="hidden sm:inline-block w-px h-3 bg-slate-700/60 shrink-0"></div>

    <div class="flex items-center gap-1.5 shrink-0">
      <span class="text-slate-400 font-medium">Velocity Today:</span>
      <span class="font-bold text-blue-400 text-sm">{kpiVelocity}</span>
    </div>
  </div>

  <div class="shrink-0 pl-3 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
    <span class={`w-1.5 h-1.5 rounded-full ${isUnavailable ? 'bg-rose-500' : 'bg-emerald-500'}`}></span>
    <span>{lastUpdated}</span>
  </div>
</footer>
