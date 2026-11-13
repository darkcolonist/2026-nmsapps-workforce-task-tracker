import { CSV_URL } from './config.js';
import { parseLocalDate } from './dateUtils.js';
import Papa from 'papaparse';

/**
 * Extract document title from Content-Disposition header if available
 */
function extractTitleFromDisposition(disposition) {
  if (!disposition) return null;
  let filename = null;
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;\r\n]+)/i);
  if (utf8Match && utf8Match[1]) {
    try {
      filename = decodeURIComponent(utf8Match[1].trim().replace(/^["']|["']$/g, ''));
    } catch (e) {
      console.warn("Could not decode UTF-8 filename:", e);
    }
  }
  if (!filename) {
    const stdMatch = disposition.match(/filename=["']?([^"';\r\n]+)["']?/i);
    if (stdMatch && stdMatch[1]) {
      filename = stdMatch[1].trim();
    }
  }
  if (!filename) return null;

  const rawName = filename.replace(/\.csv$/i, '').trim();
  const lastDash = rawName.lastIndexOf(' - ');
  return (lastDash !== -1 ? rawName.substring(0, lastDash).trim() : rawName) || rawName;
}

/**
 * Fetch and parse snapshots from Google Sheets CSV
 */
export async function fetchSnapshots() {
  const fetchUrl = `${CSV_URL}&_ts=${Date.now()}`;
  const response = await fetch(fetchUrl);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  const extractedTitle = extractTitleFromDisposition(response.headers.get('content-disposition'));
  const csvText = await response.text();

  const results = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true
  });

  if (!results.data || results.data.length === 0) {
    throw new Error("No data returned from datasource");
  }

  const snapshots = results.data.map(row => {
    const findKey = (candidates) => {
      const lowerMap = {};
      Object.keys(row).forEach(k => {
        lowerMap[k.trim().toLowerCase()] = row[k];
      });
      for (const c of candidates) {
        if (lowerMap[c.toLowerCase()] !== undefined) return lowerMap[c.toLowerCase()];
      }
      return "";
    };

    return {
      date: String(findKey(['Date'])).trim(),
      project: String(findKey(['Project'])).trim(),
      total: Number(findKey(['Total Tasks', 'Total'])) || 0,
      completed: Number(findKey(['Completed Tasks', 'Completed'])) || 0,
      remaining: Number(findKey(['Remaining Tasks', 'Remaining'])) || 0,
      velocity: Number(findKey(['Velocity (Today)', 'Velocity'])) || 0,
      lastUpdated: String(findKey(['Last Updated', 'Updated At', 'Timestamp'])).trim()
    };
  }).filter(s => s.date && s.project);

  if (snapshots.length === 0) {
    throw new Error("No valid snapshot records parsed from datasource");
  }

  snapshots.sort((a, b) => (parseLocalDate(a.date) || 0) - (parseLocalDate(b.date) || 0));

  return { snapshots, title: extractedTitle };
}
