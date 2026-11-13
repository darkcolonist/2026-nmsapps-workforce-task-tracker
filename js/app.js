import { CSV_URL, MAX_DEFAULT_DAYS } from './config.js';
import { isWeekend } from './dateUtils.js';
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
      rangeStartIdx = Math.max(0, availableDates.length - MAX_DEFAULT_DAYS);
      rangeEndIdx = maxIdx;
    } else {
      rangeStartIdx = Math.min(rangeStartIdx, maxIdx);
      rangeEndIdx = Math.min(Math.max(rangeEndIdx, rangeStartIdx), maxIdx);
    }

    startSlider.value = rangeStartIdx;
    endSlider.value = rangeEndIdx;
  }
}

function renderView() {
  const selectedProject = document.getElementById('projectFilter').value;
  const activeLabel = document.getElementById('activeProjectLabel');
  if (activeLabel) {
    activeLabel.innerText = viewMode === 'perProject' ? 'All Projects (Breakdown)' : selectedProject;
  }

  updateLegendVisibility(viewMode === 'perProject');
  updateDateRangeLabel(availableDates, rangeStartIdx, rangeEndIdx);

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
    renderView();
  });

  endSlider.addEventListener('input', (e) => {
    const val = Number(e.target.value);
    rangeEndIdx = Math.max(val, rangeStartIdx);
    endSlider.value = rangeEndIdx;
    renderView();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  initChart();
  bindEvents();
  loadData();
});

