<script>
  import { onMount, onDestroy } from 'svelte';
  import { Chart, registerables } from 'chart.js';
  import { PROJECT_COLORS } from '$lib/config.js';
  import { formatWeekday, formatFullDate } from '$lib/dateUtils.js';

  Chart.register(...registerables);

  let {
    visibleDates = [],
    viewMode = 'consolidated',
    selectedSnapshots = [],
    allSnapshots = []
  } = $props();

  let canvasEl = $state(null);
  let chartInstance = null;
  let currentRawDates = [];

  function buildDatasets() {
    if (!chartInstance) return;

    currentRawDates = visibleDates;
    chartInstance.data.labels = visibleDates.map(formatWeekday);

    if (viewMode === 'perProject') {
      chartInstance.options.plugins.legend.display = true;

      const allProjects = Array.from(new Set(allSnapshots.map(s => s.project))).filter(Boolean);
      const individualProjects = allProjects.filter(p => p !== 'All Projects');
      const projectsToPlot = individualProjects.length > 0 ? individualProjects : allProjects;

      const byProjectAndDate = new Map();
      for (const s of allSnapshots) {
        if (!byProjectAndDate.has(s.project)) {
          byProjectAndDate.set(s.project, new Map());
        }
        byProjectAndDate.get(s.project).set(s.date, s);
      }

      const datasets = [];
      projectsToPlot.forEach((proj, idx) => {
        const color = PROJECT_COLORS[idx % PROJECT_COLORS.length];
        const dateMap = byProjectAndDate.get(proj) || new Map();

        datasets.push({
          label: `${proj} (Remaining)`,
          data: visibleDates.map(d => (dateMap.has(d) ? dateMap.get(d).remaining : null)),
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 2.2,
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 5,
          spanGaps: true,
          yAxisID: 'y'
        });

        datasets.push({
          label: `${proj} (Done)`,
          data: visibleDates.map(d => (dateMap.has(d) ? dateMap.get(d).completed : null)),
          borderColor: color,
          backgroundColor: 'transparent',
          borderWidth: 1.8,
          borderDash: [4, 4],
          tension: 0.25,
          pointRadius: 2.5,
          pointHoverRadius: 4.5,
          spanGaps: true,
          yAxisID: 'y'
        });
      });

      chartInstance.data.datasets = datasets;
    } else {
      chartInstance.options.plugins.legend.display = false;
      chartInstance.data.datasets = [
        {
          label: 'Remaining Tasks',
          data: selectedSnapshots.map(s => s.remaining),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.12)',
          borderWidth: 2.5,
          fill: true,
          tension: 0.25,
          pointRadius: 4,
          pointBackgroundColor: '#60a5fa',
          pointHoverRadius: 6,
          yAxisID: 'y'
        },
        {
          label: 'Completed Tasks',
          data: selectedSnapshots.map(s => s.completed),
          borderColor: '#10b981',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [4, 4],
          pointRadius: 3,
          pointBackgroundColor: '#34d399',
          pointHoverRadius: 5,
          yAxisID: 'y'
        }
      ];
    }

    chartInstance.update();
  }

  onMount(() => {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext('2d');
    chartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: []
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: false,
            labels: {
              color: '#cbd5e1',
              font: { size: 11 },
              boxWidth: 18,
              usePointStyle: true,
              pointStyle: 'line'
            }
          },
          tooltip: {
            backgroundColor: '#111827',
            borderColor: '#374151',
            borderWidth: 1,
            padding: 10,
            titleColor: '#f9fafb',
            bodyColor: '#e5e7eb',
            boxPadding: 4,
            callbacks: {
              title(items) {
                if (!items.length) return '';
                const idx = items[0].dataIndex;
                const rawDate = currentRawDates[idx];
                return rawDate ? formatFullDate(rawDate) : items[0].label;
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#64748b', font: { size: 11 }, precision: 0 }
          }
        }
      }
    });

    buildDatasets();
  });

  onDestroy(() => {
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
  });

  // Re-run whenever inputs change
  $effect(() => {
    // track reactive props
    const _dates = visibleDates;
    const _mode = viewMode;
    const _selected = selectedSnapshots;
    const _all = allSnapshots;

    if (chartInstance) {
      buildDatasets();
    }
  });
</script>

<div class="relative flex-1 w-full mt-2 transition-opacity duration-200">
  <canvas bind:this={canvasEl}></canvas>
</div>
