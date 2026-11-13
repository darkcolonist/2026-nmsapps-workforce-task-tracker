import { CSV_URL, MAX_DEFAULT_DAYS } from './config.js';
import { isWeekend, parseLocalDate } from './dateUtils.js';
import { fetchSnapshots } from './data.js';
import { initChart, clearChart, updateConsolidatedChart, updatePerProjectChart } from './chart.js';
import {
  toggleModal,
  copyCsvUrl,
  setFailoverState,
  populateDropdownAndTable,
  updateKPIs,
  updateDateRangeLabel,
  updateLegendVisibility
} from './ui.js';

let rawSnapshots = [];
let availableDates = [];
let rangeStartIdx = 0;
let rangeEndIdx = 0;
let showWeekends = true;
let viewMode = 'consolidated'; // 'consolidated' | 'perProject'
let activePreset = String(MAX_DEFAULT_DAYS);

function syncSliders() {
  const startSlider = document.getElementById('dateStartSlider');
  const endSlider = document.getElementById('dateEndSlider');
  if (startSlider) startSlider.value = rangeStartIdx;
  if (endSlider) endSlider.value = rangeEndIdx;
}

function applyPresetWindow(preset) {
  if (!availableDates.length) return;
  const maxIdx = Math.max(0, availableDates.length - 1);
  activePreset = String(preset);

  if (preset === 'all') {
    rangeStartIdx = 0;
    rangeEndIdx = maxIdx;
  } else {
    const days = Number(preset) || MAX_DEFAULT_DAYS;
    rangeStartIdx = Math.max(0, availableDates.length - days);
    rangeEndIdx = maxIdx;
  }

  syncSliders();
  renderView();
}

function computeAvailableDates(resetToDefaultWindow = false) {
  const allDates = Array.from(new Set(rawSnapshots.map(s => s.date)));
  availableDates = showWeekends ? allDates : allDates.filter(d => !isWeekend(d));

  const startSlider = document.getElementById('dateStartSlider');
  const endSlider = document.getElementById('dateEndSlider');
  const maxIdx = Math.max(0, availableDates.length - 1);

  if (startSlider && endSlider) {
    startSlider.min = 0;
    startSlider.max = maxIdx;
    endSlider.min = 0;
    endSlider.max = maxIdx;

    if (resetToDefaultWindow) {
      activePreset = String(MAX_DEFAULT_DAYS);
      rangeStartIdx = Math.max(0, availableDates.length - MAX_DEFAULT_DAYS);
      rangeEndIdx = maxIdx;
    } else {
      rangeStartIdx = Math.min(rangeStartIdx, maxIdx);
      rangeEndIdx = Math.min(Math.max(rangeEndIdx, rangeStartIdx), maxIdx);
    }

    syncSliders();
  }
}

function renderView() {
  const selectedProject = document.getElementById('projectFilter').value;
  const activeLabel = document.getElementById('activeProjectLabel');
  if (activeLabel) {
    activeLabel.innerText = viewMode === 'perProject' ? 'All Projects (Breakdown)' : selectedProject;
  }

  updateLegendVisibility(viewMode === 'perProject');
  updateDateRangeLabel(availableDates, rangeStartIdx, rangeEndIdx, activePreset);

  if (availableDates.length === 0) {
    updateKPIs([]);
    clearChart();
    return;
  }

  const visibleDates = availableDates.slice(rangeStartIdx, rangeEndIdx + 1);
  const visibleDateSet = new Set(visibleDates);

  const kpiSnapshots = rawSnapshots.filter(
    s => s.project === selectedProject && visibleDateSet.has(s.date)
  );
  updateKPIs(kpiSnapshots);

  if (viewMode === 'perProject') {
    const allProjects = Array.from(new Set(rawSnapshots.map(s => s.project))).filter(Boolean);
    const individualProjects = allProjects.filter(p => p !== 'All Projects');
    const projectsToPlot = individualProjects.length > 0 ? individualProjects : allProjects;
    updatePerProjectChart(visibleDates, rawSnapshots, projectsToPlot);
  } else {
    updateConsolidatedChart(kpiSnapshots);
  }
}

async function loadData(animate = false) {
  const refreshIcon = document.getElementById('refreshIcon');
  if (animate && refreshIcon) refreshIcon.classList.add('animate-spin');

  try {
    const { snapshots, title } = await fetchSnapshots();
    rawSnapshots = snapshots;

    setFailoverState(false, true);

    if (title) {
      document.title = title;
      const headerEl = document.getElementById('headerTitle');
      if (headerEl) headerEl.textContent = title;
    }

    populateDropdownAndTable(rawSnapshots);
    computeAvailableDates(true);
    renderView();
  } catch (err) {
    console.error("CSV loading error:", err);
    setFailoverState(true, rawSnapshots.length > 0);
  } finally {
    if (refreshIcon) refreshIcon.classList.remove('animate-spin');
  }
}

function bindEvents() {
  document.getElementById('csvUrlInput').value = CSV_URL;

  document.getElementById('projectFilter').addEventListener('change', renderView);
  document.getElementById('refreshBtn').addEventListener('click', () => loadData(true));
  document.getElementById('retryBtn').addEventListener('click', () => loadData(true));
  document.getElementById('openSettingsBtn').addEventListener('click', () => toggleModal(true));
  document.getElementById('failoverSettingsBtn').addEventListener('click', () => toggleModal(true));
  document.getElementById('closeModalBtn').addEventListener('click', () => toggleModal(false));
  document.getElementById('closeModalFooterBtn').addEventListener('click', () => toggleModal(false));
  document.getElementById('copyCsvBtn').addEventListener('click', copyCsvUrl);

  const weekendToggle = document.getElementById('weekendToggle');
  weekendToggle.addEventListener('change', (e) => {
    showWeekends = e.target.checked;
    computeAvailableDates(true);
    renderView();
  });

  const viewModeSelect = document.getElementById('viewModeSelect');
  viewModeSelect.addEventListener('change', (e) => {
    viewMode = e.target.value;
    document.getElementById('projectFilter').disabled = viewMode === 'perProject';
    document.getElementById('projectFilter').classList.toggle('opacity-50', viewMode === 'perProject');
    renderView();
  });

  const startSlider = document.getElementById('dateStartSlider');
  const endSlider = document.getElementById('dateEndSlider');

  startSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    rangeStartIdx = Math.min(val, rangeEndIdx);
    startSlider.value = rangeStartIdx;
    activePreset = 'custom';
    renderView();
  });

  endSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    rangeEndIdx = Math.max(val, rangeStartIdx);
    endSlider.value = rangeEndIdx;
    activePreset = 'custom';
    renderView();
  });

  // Preset buttons (7D, 14D, 30D, All)
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('customDatePopover')?.classList.add('hidden');
      applyPresetWindow(btn.dataset.preset);
    });
  });

  // Custom calendar datepicker popover
  const customDateBtn = document.getElementById('customDateBtn');
  const customDatePopover = document.getElementById('customDatePopover');
  const closeCustomDateBtn = document.getElementById('closeCustomDateBtn');
  const applyCustomDateBtn = document.getElementById('applyCustomDateBtn');

  customDateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    customDatePopover.classList.toggle('hidden');
  });

  closeCustomDateBtn.addEventListener('click', () => {
    customDatePopover.classList.add('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!customDatePopover.classList.contains('hidden') &&
        !customDatePopover.contains(e.target) &&
        !customDateBtn.contains(e.target)) {
      customDatePopover.classList.add('hidden');
    }
  });

  applyCustomDateBtn.addEventListener('click', () => {
    if (!availableDates.length) return;
    const startVal = parseLocalDate(document.getElementById('customStartDate').value);
    const endVal = parseLocalDate(document.getElementById('customEndDate').value);

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
      syncSliders();
      renderView();
    }
    customDatePopover.classList.add('hidden');
  });

  // Draggable highlight bar to pan the active window along the single track
  const trackFill = document.getElementById('sliderTrackFill');
  const sliderContainer = document.getElementById('dualSliderContainer');
  let dragState = null;

  trackFill.addEventListener('pointerdown', (e) => {
    if (!availableDates.length) return;
    e.preventDefault();
    trackFill.setPointerCapture(e.pointerId);
    dragState = {
      startX: e.clientX,
      initialStart: rangeStartIdx,
      initialEnd: rangeEndIdx,
      span: rangeEndIdx - rangeStartIdx
    };
  });

  trackFill.addEventListener('pointermove', (e) => {
    if (!dragState || !sliderContainer) return;
    const rect = sliderContainer.getBoundingClientRect();
    const maxIdx = Math.max(1, availableDates.length - 1);
    const deltaRatio = (e.clientX - dragState.startX) / Math.max(1, rect.width);
    const indexShift = Math.round(deltaRatio * maxIdx);

    let nextStart = dragState.initialStart + indexShift;
    let nextEnd = nextStart + dragState.span;

    if (nextStart < 0) {
      nextStart = 0;
      nextEnd = dragState.span;
    }
    if (nextEnd > maxIdx) {
      nextEnd = maxIdx;
      nextStart = Math.max(0, maxIdx - dragState.span);
    }

    if (nextStart !== rangeStartIdx || nextEnd !== rangeEndIdx) {
      rangeStartIdx = nextStart;
      rangeEndIdx = nextEnd;
      activePreset = 'custom';
      syncSliders();
      renderView();
    }
  });

  const endDrag = () => { dragState = null; };
  trackFill.addEventListener('pointerup', endDrag);
  trackFill.addEventListener('pointercancel', endDrag);
}

window.addEventListener('DOMContentLoaded', () => {
  initChart();
  bindEvents();
  loadData();
});

