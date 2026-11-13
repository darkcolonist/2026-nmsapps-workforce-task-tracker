<script>
  import {
    formatShortDate,
    toIsoDateString,
    parseLocalDate
  } from '$lib/dateUtils.js';

  let {
    availableDates = [],
    rangeStartIdx = $bindable(0),
    rangeEndIdx = $bindable(0),
    activePreset = $bindable('30'),
    onRangeChange = () => {}
  } = $props();

  let showCalendarPopover = $state(false);
  let customStartDate = $state('');
  let customEndDate = $state('');

  let sliderContainerEl = $state(null);
  let trackFillEl = $state(null);
  let dragState = $state(null);

  let dateRangeLabel = $derived.by(() => {
    if (!availableDates.length) return '--';
    const start = formatShortDate(availableDates[rangeStartIdx]);
    const end = formatShortDate(availableDates[rangeEndIdx]);
    const count = rangeEndIdx - rangeStartIdx + 1;
    return `${start} – ${end} (${count}d)`;
  });

  let minLabel = $derived.by(() => {
    return availableDates.length ? formatShortDate(availableDates[0]) : '--';
  });

  let maxLabel = $derived.by(() => {
    return availableDates.length ? formatShortDate(availableDates[availableDates.length - 1]) : '--';
  });

  let maxIdx = $derived(Math.max(0, availableDates.length - 1));

  let startPct = $derived.by(() => {
    if (maxIdx <= 0) return 0;
    return (rangeStartIdx / maxIdx) * 100;
  });

  let endPct = $derived.by(() => {
    if (maxIdx <= 0) return 100;
    return (rangeEndIdx / maxIdx) * 100;
  });

  let fillWidthPct = $derived(Math.max(0, endPct - startPct));

  // Sync calendar dates when range changes
  $effect(() => {
    if (availableDates.length && availableDates[rangeStartIdx] && availableDates[rangeEndIdx]) {
      customStartDate = toIsoDateString(availableDates[rangeStartIdx]);
      customEndDate = toIsoDateString(availableDates[rangeEndIdx]);
    }
  });

  function applyPreset(preset) {
    if (!availableDates.length) return;
    showCalendarPopover = false;
    activePreset = String(preset);

    if (preset === 'all') {
      rangeStartIdx = 0;
      rangeEndIdx = maxIdx;
    } else {
      const days = Number(preset) || 30;
      rangeStartIdx = Math.max(0, availableDates.length - days);
      rangeEndIdx = maxIdx;
    }
    onRangeChange();
  }

  function handleStartSlider(e) {
    const val = Number(e.currentTarget.value);
    rangeStartIdx = Math.min(val, rangeEndIdx);
    activePreset = 'custom';
    onRangeChange();
  }

  function handleEndSlider(e) {
    const val = Number(e.currentTarget.value);
    rangeEndIdx = Math.max(val, rangeStartIdx);
    activePreset = 'custom';
    onRangeChange();
  }

  function applyCustomDates() {
    if (!availableDates.length) return;
    const startVal = parseLocalDate(customStartDate);
    const endVal = parseLocalDate(customEndDate);

    if (startVal && endVal) {
      const minTime = Math.min(startVal.getTime(), endVal.getTime());
      const maxTime = Math.max(startVal.getTime(), endVal.getTime());

      let newStart = 0;
      let newEnd = availableDates.length - 1;

      for (let i = 0; i < availableDates.length; i++) {
        const t = parseLocalDate(availableDates[i])?.getTime() || 0;
        if (t >= minTime) {
          newStart = i;
          break;
        }
      }

      for (let i = availableDates.length - 1; i >= 0; i--) {
        const t = parseLocalDate(availableDates[i])?.getTime() || 0;
        if (t <= maxTime) {
          newEnd = i;
          break;
        }
      }

      rangeStartIdx = Math.min(newStart, newEnd);
      rangeEndIdx = Math.max(newStart, newEnd);
      activePreset = 'custom';
      onRangeChange();
    }
    showCalendarPopover = false;
  }

  function onPointerDownTrack(e) {
    if (!availableDates.length) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState = {
      startX: e.clientX,
      initialStart: rangeStartIdx,
      initialEnd: rangeEndIdx,
      span: rangeEndIdx - rangeStartIdx
    };
  }

  function onPointerMoveTrack(e) {
    if (!dragState || !sliderContainerEl) return;
    const rect = sliderContainerEl.getBoundingClientRect();
    const curMaxIdx = Math.max(1, availableDates.length - 1);
    const deltaRatio = (e.clientX - dragState.startX) / Math.max(1, rect.width);
    const indexShift = Math.round(deltaRatio * curMaxIdx);

    let nextStart = dragState.initialStart + indexShift;
    let nextEnd = nextStart + dragState.span;

    if (nextStart < 0) {
      nextStart = 0;
      nextEnd = dragState.span;
    }
    if (nextEnd > curMaxIdx) {
      nextEnd = curMaxIdx;
      nextStart = Math.max(0, curMaxIdx - dragState.span);
    }

    if (nextStart !== rangeStartIdx || nextEnd !== rangeEndIdx) {
      rangeStartIdx = nextStart;
      rangeEndIdx = nextEnd;
      activePreset = 'custom';
      onRangeChange();
    }
  }

  function onPointerUpTrack() {
    dragState = null;
  }
</script>

<div
  class="flex flex-wrap items-center justify-between gap-3 py-1.5 px-2.5 mb-1 rounded-lg bg-panel/40 border border-slate-800/70 text-[11px] text-slate-400 relative z-20">
  <!-- Left: Range Label + Quick Presets + Custom Calendar Button -->
  <div class="flex flex-wrap items-center gap-2">
    <div class="flex items-center gap-1.5 pr-1">
      <span class="font-medium text-slate-400">Window:</span>
      <span class="font-mono text-brand font-semibold">{dateRangeLabel}</span>
    </div>

    <div class="flex items-center gap-1 bg-surface/80 p-0.5 rounded-md border border-slate-800">
      {#each ['7', '14', '30', 'all'] as preset}
        <button
          type="button"
          onclick={() => applyPreset(preset)}
          class={activePreset === preset
            ? "px-2 py-0.5 rounded text-[10px] font-semibold bg-brand text-white shadow-sm transition cursor-pointer"
            : "px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 hover:text-white transition cursor-pointer"}>
          {preset === 'all' ? 'All' : `${preset}D`}
        </button>
      {/each}
    </div>

    <!-- Custom Calendar Datepicker Button & Popover -->
    <div class="relative">
      <button
        type="button"
        onclick={(e) => {
          e.stopPropagation();
          showCalendarPopover = !showCalendarPopover;
        }}
        class={activePreset === 'custom'
          ? "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/20 text-brand border border-brand/60 text-[10px] font-semibold transition cursor-pointer"
          : "inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] font-semibold transition cursor-pointer"}>
        <svg class="w-3 h-3 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>Custom</span>
      </button>

      {#if showCalendarPopover}
        <div
          class="absolute left-0 mt-1.5 w-64 p-3 rounded-xl bg-surface border border-slate-700 shadow-2xl z-40 space-y-2.5">
          <div class="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span class="text-[11px] font-semibold text-white">Select Date Range</span>
            <button
              type="button"
              aria-label="Close custom date range picker"
              onclick={() => showCalendarPopover = false}
              class="text-slate-400 hover:text-white cursor-pointer">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="space-y-2">
            <div>
              <label for="customStartDate" class="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">Start Date</label>
              <input
                id="customStartDate"
                type="date"
                bind:value={customStartDate}
                min={availableDates.length ? toIsoDateString(availableDates[0]) : undefined}
                max={availableDates.length ? toIsoDateString(availableDates[availableDates.length - 1]) : undefined}
                class="w-full bg-panel border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 outline-none focus:border-brand" />
            </div>
            <div>
              <label for="customEndDate" class="block text-[10px] uppercase tracking-wider text-slate-400 mb-0.5">End Date</label>
              <input
                id="customEndDate"
                type="date"
                bind:value={customEndDate}
                min={availableDates.length ? toIsoDateString(availableDates[0]) : undefined}
                max={availableDates.length ? toIsoDateString(availableDates[availableDates.length - 1]) : undefined}
                class="w-full bg-panel border border-slate-700 rounded-md px-2 py-1 text-xs text-slate-200 outline-none focus:border-brand" />
            </div>
          </div>
          <div class="pt-1 flex justify-end">
            <button
              type="button"
              onclick={applyCustomDates}
              class="px-3 py-1 rounded-md bg-brand hover:bg-blue-600 text-white text-[11px] font-semibold transition cursor-pointer">
              Apply Range
            </button>
          </div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Right: Single-Track Dual-Thumb Range Slider -->
  <div class="flex items-center gap-2.5 flex-1 min-w-[180px] max-w-md ml-auto">
    <span class="text-[10px] font-mono text-slate-500 shrink-0">{minLabel}</span>
    <div
      bind:this={sliderContainerEl}
      class="relative flex-1 h-5 flex items-center select-none">
      <!-- Full Track Background -->
      <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50"></div>
      <!-- Active Range Fill (draggable to pan window) -->
      <!-- svelte-ignore a11y_interactive_supports_focus -->
      <div
        bind:this={trackFillEl}
        role="slider"
        aria-valuenow={rangeStartIdx}
        title="Drag to pan date window"
        onpointerdown={onPointerDownTrack}
        onpointermove={onPointerMoveTrack}
        onpointerup={onPointerUpTrack}
        onpointercancel={onPointerUpTrack}
        class="absolute h-1.5 bg-brand/80 hover:bg-brand rounded-full cursor-grab active:cursor-grabbing transition-colors"
        style={`left: ${startPct}%; width: ${fillWidthPct}%;`}></div>
      <!-- Overlapping Range Inputs -->
      <input
        type="range"
        aria-label="Start date slider"
        min="0"
        max={maxIdx}
        value={rangeStartIdx}
        oninput={handleStartSlider}
        class="dual-range-input absolute inset-0 w-full h-full m-0"
        style={`z-index: ${rangeStartIdx > maxIdx - 2 ? 25 : 10};`} />
      <input
        type="range"
        aria-label="End date slider"
        min="0"
        max={maxIdx}
        value={rangeEndIdx}
        oninput={handleEndSlider}
        class="dual-range-input absolute inset-0 w-full h-full m-0 z-20" />
    </div>
    <span class="text-[10px] font-mono text-slate-500 shrink-0">{maxLabel}</span>
  </div>
</div>
