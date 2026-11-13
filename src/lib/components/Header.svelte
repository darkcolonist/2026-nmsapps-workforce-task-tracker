<script>
  /**
   * Header Component
   */
  let {
    title = 'loading document',
    isUnavailable = false,
    showWeekends = $bindable(true),
    viewMode = $bindable('consolidated'),
    selectedProject = $bindable('All Projects'),
    projects = [],
    isLoading = false,
    onRefresh = () => {},
    onOpenSettings = () => {}
  } = $props();
</script>

<header
  class="fixed top-0 left-0 right-0 h-11 bg-surface/90 backdrop-blur border-b border-slate-800/80 z-30 px-3 sm:px-4 flex items-center justify-between shadow-sm">
  <div class="flex items-center gap-2">
    <div
      class={isUnavailable
        ? "w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50"
        : "w-2.5 h-2.5 rounded-full bg-brand animate-pulse"}></div>
    <h1 class="text-xs sm:text-sm font-semibold tracking-wide text-white truncate max-w-[180px] sm:max-w-none">
      {title}
    </h1>
  </div>

  <!-- Filter & Controls -->
  <div class="flex items-center gap-2">
    <label
      class="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-300 bg-panel border border-slate-700/80 rounded-md px-2 h-7 cursor-pointer select-none hover:bg-slate-700/80 transition-colors">
      <input
        type="checkbox"
        bind:checked={showWeekends}
        class="accent-brand w-3.5 h-3.5 rounded cursor-pointer" />
      <span>Weekends</span>
    </label>

    <div class="relative">
      <select
        bind:value={viewMode}
        class="appearance-none bg-panel hover:bg-slate-700/80 transition-colors border border-slate-700/80 text-slate-200 text-xs rounded-md pl-2.5 pr-7 h-7 outline-none focus:border-brand cursor-pointer">
        <option value="consolidated">Consolidated</option>
        <option value="perProject">By Project</option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <div class="relative">
      <select
        bind:value={selectedProject}
        disabled={viewMode === 'perProject'}
        class={`appearance-none bg-panel hover:bg-slate-700/80 transition-colors border border-slate-700/80 text-slate-200 text-xs rounded-md pl-2.5 pr-7 h-7 outline-none focus:border-brand cursor-pointer ${
          viewMode === 'perProject' ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
        {#each projects as proj}
          <option value={proj}>{proj}</option>
        {/each}
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-400">
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <button
      type="button"
      title="Fetch latest sheet data"
      onclick={onRefresh}
      class="h-7 w-7 flex items-center justify-center rounded-md bg-panel hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer">
      <svg
        class={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>

    <button
      type="button"
      title="History & Settings"
      onclick={onOpenSettings}
      class="h-7 w-7 flex items-center justify-center rounded-md bg-panel hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition cursor-pointer">
      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    </button>
  </div>
</header>
