import { CSV_URL } from './config.js';
import { formatShortDate, toIsoDateString } from './dateUtils.js';

export function toggleModal(show) {
  const modal = document.getElementById('settingsModal');
  if (!modal) return;
  if (show) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  } else {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

export function copyCsvUrl() {
  navigator.clipboard.writeText(CSV_URL);
  alert('CSV URL copied to clipboard');
}

export function setFailoverState(isUnavailable, hasData = false) {
  const failoverEl = document.getElementById('failoverState');
  const chartContainer = document.getElementById('chartContainer');
  const statusDot = document.getElementById('statusDot');
  const footerStatusDot = document.getElementById('footerStatusDot');
  const headerTitle = document.getElementById('headerTitle');
  const lastUpdatedLabel = document.getElementById('lastUpdatedLabel');

  if (isUnavailable) {
    if (failoverEl) {
      failoverEl.classList.remove('hidden');
      failoverEl.classList.add('flex');
    }
    if (chartContainer) chartContainer.classList.add('opacity-10', 'pointer-events-none');
    if (statusDot) statusDot.className = "w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50";
    if (footerStatusDot) footerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-rose-500";
    if (headerTitle) headerTitle.textContent = "sorry, the datasource is unavailable";
    document.title = "sorry, the datasource is unavailable";
    if (lastUpdatedLabel) lastUpdatedLabel.textContent = "Unavailable";

    const tbody = document.getElementById('snapshotTableBody');
    if (tbody && !hasData) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-4 py-8 text-center text-slate-400 font-sans">
            <div class="flex flex-col items-center justify-center gap-1">
              <span class="text-rose-400 font-medium">sorry, the datasource is unavailable</span>
              <span class="text-[11px] text-slate-500">Please check internet connection or Google Sheet publication settings.</span>
            </div>
          </td>
        </tr>
      `;
    }
  } else {
    if (failoverEl) {
      failoverEl.classList.add('hidden');
      failoverEl.classList.remove('flex');
    }
    if (chartContainer) chartContainer.classList.remove('opacity-10', 'pointer-events-none');
    if (statusDot) statusDot.className = "w-2.5 h-2.5 rounded-full bg-brand animate-pulse";
    if (footerStatusDot) footerStatusDot.className = "w-1.5 h-1.5 rounded-full bg-emerald-500";
  }
}

export function populateDropdownAndTable(rawSnapshots) {
  const dropdown = document.getElementById('projectFilter');
  const uniqueProjects = Array.from(new Set(rawSnapshots.map(s => s.project))).filter(Boolean);

  const currentSelected = dropdown.value;
  dropdown.innerHTML = uniqueProjects.map(proj => `<option value="${proj}">${proj}</option>`).join('');

  if (uniqueProjects.includes('All Projects')) {
    dropdown.value = currentSelected && uniqueProjects.includes(currentSelected) ? currentSelected : 'All Projects';
  }

  const tbody = document.getElementById('snapshotTableBody');
  tbody.innerHTML = rawSnapshots.slice().reverse().map(row => `
    <tr class="hover:bg-slate-800/40 transition-colors">
      <td class="px-4 py-2 font-medium text-slate-200">${row.date}</td>
      <td class="px-4 py-2 font-sans font-medium text-white">${row.project}</td>
      <td class="px-4 py-2 font-bold text-blue-400">${row.remaining}</td>
      <td class="px-4 py-2 text-emerald-400">${row.completed}</td>
      <td class="px-4 py-2 text-slate-300">${row.total}</td>
      <td class="px-4 py-2 text-slate-400">${row.velocity}</td>
      <td class="px-4 py-2 text-slate-500">${row.lastUpdated || '--'}</td>
    </tr>
  `).join('');

  document.getElementById('recordCountLabel').innerText = `${rawSnapshots.length} snapshot rows parsed`;
}

export function updateKPIs(filteredSnapshots) {
  if (!filteredSnapshots || filteredSnapshots.length === 0) {
    document.getElementById('kpiRemaining').innerText = "0";
    document.getElementById('kpiCompleted').innerText = "0";
    document.getElementById('kpiTotal').innerText = "0";
    document.getElementById('kpiVelocity').innerText = "0";
    document.getElementById('kpiDelta').innerText = "No data";
    document.getElementById('lastUpdatedLabel').innerText = "Empty";
    return;
  }

  const latest = filteredSnapshots[filteredSnapshots.length - 1];
  const previous = filteredSnapshots.length > 1 ? filteredSnapshots[filteredSnapshots.length - 2] : null;

  document.getElementById('kpiRemaining').innerText = latest.remaining;
  document.getElementById('kpiCompleted').innerText = latest.completed;
  document.getElementById('kpiTotal').innerText = latest.total;
  document.getElementById('kpiVelocity').innerText = latest.velocity;

  const deltaEl = document.getElementById('kpiDelta');
  if (previous) {
    const diff = latest.remaining - previous.remaining;
    if (diff < 0) {
      deltaEl.innerText = `${diff} vs previous`;
      deltaEl.className = 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/80';
    } else if (diff > 0) {
      deltaEl.innerText = `+${diff} scope added`;
      deltaEl.className = 'text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-800/80';
    } else {
      deltaEl.innerText = '0 vs previous';
      deltaEl.className = 'text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60';
    }
  } else {
    deltaEl.innerText = 'Day 1';
    deltaEl.className = 'text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/60';
  }

  document.getElementById('lastUpdatedLabel').innerText = latest.lastUpdated
    ? (latest.lastUpdated.split(' ')[1] || latest.lastUpdated)
    : latest.date;
}

export function updateDateRangeLabel(dates, startIdx, endIdx, activePreset = null) {
  const label = document.getElementById('dateRangeLabel');
  const minLabel = document.getElementById('sliderMinLabel');
  const maxLabel = document.getElementById('sliderMaxLabel');
  const trackFill = document.getElementById('sliderTrackFill');
  const startSlider = document.getElementById('dateStartSlider');
  const endSlider = document.getElementById('dateEndSlider');
  const customStart = document.getElementById('customStartDate');
  const customEnd = document.getElementById('customEndDate');

  if (!dates.length) {
    if (label) label.innerText = 'No dates';
    if (minLabel) minLabel.innerText = '--';
    if (maxLabel) maxLabel.innerText = '--';
    if (trackFill) {
      trackFill.style.left = '0%';
      trackFill.style.width = '0%';
    }
    return;
  }

  const start = formatShortDate(dates[startIdx]);
  const end = formatShortDate(dates[endIdx]);
  const count = endIdx - startIdx + 1;
  if (label) label.innerText = `${start} – ${end} (${count}d)`;

  if (minLabel) minLabel.innerText = formatShortDate(dates[0]);
  if (maxLabel) maxLabel.innerText = formatShortDate(dates[dates.length - 1]);

  const maxIdx = Math.max(1, dates.length - 1);
  const startPct = (startIdx / maxIdx) * 100;
  const endPct = (endIdx / maxIdx) * 100;

  if (trackFill) {
    trackFill.style.left = `${startPct}%`;
    trackFill.style.width = `${Math.max(0, endPct - startPct)}%`;
  }

  // Ensure start thumb is reachable if both thumbs are pushed to the right end
  if (startSlider && endSlider) {
    startSlider.style.zIndex = startIdx > maxIdx - 2 ? '25' : '10';
  }

  // Sync calendar datepicker inputs
  const minIso = toIsoDateString(dates[0]);
  const maxIso = toIsoDateString(dates[dates.length - 1]);
  if (customStart) {
    customStart.min = minIso;
    customStart.max = maxIso;
    customStart.value = toIsoDateString(dates[startIdx]);
  }
  if (customEnd) {
    customEnd.min = minIso;
    customEnd.max = maxIso;
    customEnd.value = toIsoDateString(dates[endIdx]);
  }

  // Highlight active preset or custom button
  document.querySelectorAll('.preset-btn').forEach(btn => {
    const isMatch = activePreset && btn.dataset.preset === String(activePreset);
    btn.className = isMatch
      ? 'preset-btn px-2 py-0.5 rounded text-[10px] font-semibold bg-brand text-white shadow-sm transition'
      : 'preset-btn px-2 py-0.5 rounded text-[10px] font-semibold text-slate-400 hover:text-white transition';
  });

  const customBtn = document.getElementById('customDateBtn');
  if (customBtn) {
    const isCustom = activePreset === 'custom';
    customBtn.className = isCustom
      ? 'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/20 text-brand border border-brand/60 text-[10px] font-semibold transition cursor-pointer'
      : 'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-surface/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[10px] font-semibold transition cursor-pointer';
  }
}

export function updateLegendVisibility(isPerProject) {
  const legend = document.getElementById('consolidatedLegend');
  if (!legend) return;
  legend.classList.toggle('hidden', isPerProject);
}

