<script>
  import { CSV_URL } from '$lib/config.js';

  let {
    isOpen = false,
    snapshots = [],
    isUnavailable = false,
    onClose = () => {}
  } = $props();

  let copySuccess = $state(false);

  function copyCsvUrl() {
    navigator.clipboard.writeText(CSV_URL);
    copySuccess = true;
    setTimeout(() => {
      copySuccess = false;
    }, 2000);
  }

  let displayRows = $derived(snapshots.slice().reverse());
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    class="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 md:p-8"
    onclick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
    <div
      class="bg-surface border border-slate-700/90 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">

      <!-- Modal Header -->
      <div class="h-12 px-4 sm:px-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-panel/40">
        <div class="flex items-center gap-2">
          <svg class="w-4 h-4 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 class="text-sm font-semibold text-white">Daily Snapshots History & Data Log</h2>
        </div>
        <button
          type="button"
          aria-label="Close history modal"
          onclick={onClose}
          class="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Modal Body -->
      <div class="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
        <div>
          <label for="csvUrlInputModal" class="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            CSV Data Endpoint
          </label>
          <div class="flex items-center gap-2">
            <input
              id="csvUrlInputModal"
              type="text"
              value={CSV_URL}
              class="w-full text-xs font-mono bg-panel border border-slate-700 rounded-lg px-3 py-1.5 text-slate-300 outline-none focus:border-brand"
              readonly />
            <button
              type="button"
              onclick={copyCsvUrl}
              class="px-3 py-1.5 text-xs font-medium rounded-lg bg-panel hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0 cursor-pointer">
              {copySuccess ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div
          class="flex flex-col flex-1 min-h-[160px] max-h-[52vh] rounded-lg border border-slate-800 overflow-hidden bg-background/50">
          <div class="overflow-auto flex-1">
            <table class="w-full text-left text-xs text-slate-300 min-w-[540px]">
              <thead
                class="text-[11px] uppercase bg-slate-900/90 text-slate-400 sticky top-0 border-b border-slate-800 z-10 backdrop-blur">
                <tr>
                  <th class="px-4 py-2.5">Date</th>
                  <th class="px-4 py-2.5">Project</th>
                  <th class="px-4 py-2.5">Remaining</th>
                  <th class="px-4 py-2.5">Completed</th>
                  <th class="px-4 py-2.5">Total Scope</th>
                  <th class="px-4 py-2.5">Velocity</th>
                  <th class="px-4 py-2.5">Last Updated</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/70 font-mono text-[11px]">
                {#if isUnavailable && snapshots.length === 0}
                  <tr>
                    <td colspan="7" class="px-4 py-8 text-center text-slate-400 font-sans">
                      <div class="flex flex-col items-center justify-center gap-1">
                        <span class="text-rose-400 font-medium">sorry, the datasource is unavailable</span>
                        <span class="text-[11px] text-slate-500">Please check internet connection or Google Sheet publication settings.</span>
                      </div>
                    </td>
                  </tr>
                {:else if snapshots.length === 0}
                  <tr>
                    <td colspan="7" class="px-4 py-6 text-center text-slate-500 font-sans">
                      Connecting to data source...
                    </td>
                  </tr>
                {:else}
                  {#each displayRows as row}
                    <tr class="hover:bg-slate-800/40 transition-colors">
                      <td class="px-4 py-2 font-medium text-slate-200">{row.date}</td>
                      <td class="px-4 py-2 font-sans font-medium text-white">{row.project}</td>
                      <td class="px-4 py-2 font-bold text-blue-400">{row.remaining}</td>
                      <td class="px-4 py-2 text-emerald-400">{row.completed}</td>
                      <td class="px-4 py-2 text-slate-300">{row.total}</td>
                      <td class="px-4 py-2 text-slate-400">{row.velocity}</td>
                      <td class="px-4 py-2 text-slate-500">{row.lastUpdated || '--'}</td>
                    </tr>
                  {/each}
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Modal Footer -->
      <div
        class="h-11 px-4 sm:px-6 border-t border-slate-800 flex items-center justify-between shrink-0 bg-panel/30 text-xs text-slate-400">
        <span>{snapshots.length} snapshot rows parsed</span>
        <button
          type="button"
          onclick={onClose}
          class="px-3 py-1 rounded-md bg-panel hover:bg-slate-700 text-slate-200 border border-slate-700 transition cursor-pointer">
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
