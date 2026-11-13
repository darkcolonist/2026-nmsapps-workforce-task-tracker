<script>
  import { onMount } from 'svelte';
  import { fetchSnapshots } from '$lib/data.js';
  import { isWeekend } from '$lib/dateUtils.js';
  import { MAX_DEFAULT_DAYS } from '$lib/config.js';

  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import DateRangeControls from '$lib/components/DateRangeControls.svelte';
  import BurndownChart from '$lib/components/BurndownChart.svelte';
  import FailoverState from '$lib/components/FailoverState.svelte';
  import SettingsModal from '$lib/components/SettingsModal.svelte';

  // Core reactive states (Svelte 5 Runes)
  let docTitle = $state('loading document');
  let rawSnapshots = $state([]);
  let showWeekends = $state(true);
  let viewMode = $state('consolidated'); // 'consolidated' | 'perProject'
  let selectedProject = $state('All Projects');
  let activePreset = $state(String(MAX_DEFAULT_DAYS));
  let rangeStartIdx = $state(0);
  let rangeEndIdx = $state(0);

  let isUnavailable = $state(false);
  let isLoading = $state(false);
  let isSettingsOpen = $state(false);

  // Derived unique projects
  let projectOptions = $derived.by(() => {
    const list = Array.from(new Set(rawSnapshots.map(s => s.project))).filter(Boolean);
    if (!list.includes('All Projects') && list.length > 0) {
      list.unshift('All Projects');
    }
    return list;
  });

  // Derived available dates based on weekend toggle
  let availableDates = $derived.by(() => {
    const allDates = Array.from(new Set(rawSnapshots.map(s => s.date)));
    return showWeekends ? allDates : allDates.filter(d => !isWeekend(d));
  });

  // Slices of visible dates
  let visibleDates = $derived.by(() => {
    if (!availableDates.length) return [];
    const start = Math.max(0, Math.min(rangeStartIdx, availableDates.length - 1));
    const end = Math.max(start, Math.min(rangeEndIdx, availableDates.length - 1));
    return availableDates.slice(start, end + 1);
  });

  // Visible snapshots for the selected project
  let selectedSnapshots = $derived.by(() => {
    if (!visibleDates.length) return [];
    const dateSet = new Set(visibleDates);
    return rawSnapshots.filter(
      s => s.project === selectedProject && dateSet.has(s.date)
    );
  });

  // KPI Calculations
  let kpiData = $derived.by(() => {
    if (!selectedSnapshots || selectedSnapshots.length === 0) {
      return {
        remaining: '0',
        completed: '0',
        total: '0',
        velocity: '0',
        deltaText: 'No data',
        deltaClass: 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400',
        lastUpdated: isUnavailable ? 'Unavailable' : 'Empty'
      };
    }

    const latest = selectedSnapshots[selectedSnapshots.length - 1];
    const previous = selectedSnapshots.length > 1 ? selectedSnapshots[selectedSnapshots.length - 2] : null;

    let deltaText = 'Day 1';
    let deltaClass = 'text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60';

    if (previous) {
      const diff = latest.remaining - previous.remaining;
      if (diff < 0) {
        deltaText = `${diff} vs previous`;
        deltaClass = 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80';
      } else if (diff > 0) {
        deltaText = `+${diff} scope added`;
        deltaClass = 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80';
      } else {
        deltaText = '0 vs previous';
        deltaClass = 'text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60';
      }
    }

    const lastUpdated = isUnavailable
      ? 'Unavailable'
      : (latest.lastUpdated ? (latest.lastUpdated.split(' ')[1] || latest.lastUpdated) : latest.date);

    return {
      remaining: String(latest.remaining),
      completed: String(latest.completed),
      total: String(latest.total),
      velocity: String(latest.velocity),
      deltaText,
      deltaClass,
      lastUpdated
    };
  });

  function resetDateIndices(dates) {
    if (!dates.length) {
      rangeStartIdx = 0;
      rangeEndIdx = 0;
      return;
    }
    const maxIdx = dates.length - 1;
    activePreset = String(MAX_DEFAULT_DAYS);
    rangeStartIdx = Math.max(0, dates.length - MAX_DEFAULT_DAYS);
    rangeEndIdx = maxIdx;
  }

  async function loadData() {
    isLoading = true;
    try {
      const { snapshots, title } = await fetchSnapshots();
      rawSnapshots = snapshots;
      isUnavailable = false;

      if (title) {
        docTitle = title;
      }

      // Recompute date bounds on fresh load
      const allDates = Array.from(new Set(snapshots.map(s => s.date)));
      const filtered = showWeekends ? allDates : allDates.filter(d => !isWeekend(d));
      resetDateIndices(filtered);
    } catch (err) {
      console.error("CSV loading error:", err);
      isUnavailable = true;
      docTitle = "sorry, the datasource is unavailable";
    } finally {
      isLoading = false;
    }
  }

  // Handle weekend toggle change inside effect
  let prevShowWeekends = $state(true);
  $effect(() => {
    const currentVal = showWeekends;
    if (currentVal !== prevShowWeekends) {
      prevShowWeekends = currentVal;
      resetDateIndices(availableDates);
    }
  });

  onMount(() => {
    loadData();
  });
</script>

<svelte:head>
  <title>{docTitle}</title>
</svelte:head>

<div class="bg-background text-slate-100 min-h-screen flex flex-col font-sans antialiased overflow-x-hidden selection:bg-brand/30">
  <!-- Slim Fixed Header Bar -->
  <Header
    title={docTitle}
    {isUnavailable}
    bind:showWeekends
    bind:viewMode
    bind:selectedProject
    projects={projectOptions}
    {isLoading}
    onRefresh={loadData}
    onOpenSettings={() => isSettingsOpen = true} />

  <!-- Main Burndown Visualizer Area -->
  <main class="flex-1 w-full pt-11 pb-11 px-3 sm:px-6 flex flex-col justify-center items-center">
    <div
      class="w-full max-w-7xl h-[calc(100vh-5.5rem)] min-h-[380px] bg-surface/50 border border-slate-800/80 rounded-xl p-3 sm:p-5 flex flex-col relative my-auto shadow-inner">

      <!-- Graph Header & Project Tag -->
      <div class="flex items-center justify-between pb-2 mb-1 border-b border-slate-800/60">
        <div class="flex items-center gap-2">
          <span class="text-xs uppercase tracking-wider font-semibold text-slate-400">Trajectory Graph</span>
          <span class="text-xs px-2 py-0.5 rounded bg-brand/10 text-brand font-medium">
            {viewMode === 'perProject' ? 'All Projects (Breakdown)' : selectedProject}
          </span>
        </div>

        {#if viewMode === 'consolidated'}
          <div class="flex items-center gap-4 text-[11px] text-slate-400">
            <span class="inline-flex items-center gap-1.5">
              <span class="w-2.5 h-1 rounded-full bg-blue-500"></span>Remaining Tasks
            </span>
            <span class="inline-flex items-center gap-1.5">
              <span class="w-2.5 h-1 rounded-full bg-emerald-500"></span>Cumulative Done
            </span>
          </div>
        {/if}
      </div>

      <!-- Date Range Slider & Presets Bar -->
      <DateRangeControls
        {availableDates}
        bind:rangeStartIdx
        bind:rangeEndIdx
        bind:activePreset />

      <!-- Burndown Chart Canvas -->
      <div class={isUnavailable ? "opacity-10 pointer-events-none flex-1 flex flex-col" : "flex-1 flex flex-col"}>
        <BurndownChart
          {visibleDates}
          {viewMode}
          {selectedSnapshots}
          allSnapshots={rawSnapshots} />
      </div>

      <!-- Failover State Overlay -->
      {#if isUnavailable}
        <FailoverState
          onRetry={loadData}
          onOpenSettings={() => isSettingsOpen = true} />
      {/if}
    </div>
  </main>

  <!-- Slim Fixed Footer Ribbon -->
  <Footer
    kpiRemaining={kpiData.remaining}
    kpiCompleted={kpiData.completed}
    kpiTotal={kpiData.total}
    kpiVelocity={kpiData.velocity}
    deltaText={kpiData.deltaText}
    deltaClass={kpiData.deltaClass}
    lastUpdated={kpiData.lastUpdated}
    {isUnavailable} />

  <!-- Gear Settings & History Log Modal -->
  <SettingsModal
    isOpen={isSettingsOpen}
    snapshots={rawSnapshots}
    {isUnavailable}
    onClose={() => isSettingsOpen = false} />
</div>
