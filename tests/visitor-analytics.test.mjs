import assert from 'node:assert/strict';

import {
  addPageView,
  aggregateVisitorCsv,
  mergeVisitorData,
} from '../visitor-analytics.mjs';

const baseline = '2026-08-28T12:00:00.000Z';
const csv = `Timestamp,Country,CountryCode,SessionID,UserAgent
2026-08-28T11:59:59.000Z,South Korea,KR,legacy-session,"Browser, Legacy"
2026-08-28T12:00:01.000Z,South Korea,KR,session-a,"Browser, A"
2026-08-28T12:00:02.000Z,South Korea,KR,session-a,"Browser, A"
2026-08-28T12:00:03.000Z,United States,US,session-b,"Browser, B"`;

const aggregate = aggregateVisitorCsv(csv, baseline);
assert.equal(aggregate.totalVisits, 3, 'each post-baseline page view is counted');
assert.equal(aggregate.uniqueVisitors, 2, 'repeated page views share one browser session');
assert.deepEqual(aggregate.countries, {
  KR: { name: 'South Korea', count: 1 },
  US: { name: 'United States', count: 1 },
});

const repeatView = addPageView(aggregate, {
  country: 'South Korea',
  countryCode: 'KR',
  isNewSession: false,
});
assert.equal(repeatView.totalVisits, 4);
assert.equal(repeatView.uniqueVisitors, 2);
assert.equal(repeatView.countries.KR.count, 1);

const newSession = addPageView(repeatView, {
  country: 'South Korea',
  countryCode: 'KR',
  isNewSession: true,
});
assert.equal(newSession.totalVisits, 5);
assert.equal(newSession.uniqueVisitors, 3);
assert.equal(newSession.countries.KR.count, 2);

const merged = mergeVisitorData(
  { totalVisits: 9, uniqueVisitors: 5, countries: { KR: { name: 'South Korea', count: 4 } } },
  { totalVisits: 8, uniqueVisitors: 6, countries: { KR: { name: 'South Korea', count: 3 }, US: { name: 'United States', count: 2 } } },
);
assert.deepEqual(merged, {
  totalVisits: 9,
  uniqueVisitors: 6,
  countries: {
    KR: { name: 'South Korea', count: 4 },
    US: { name: 'United States', count: 2 },
  },
});

console.log('PASS visitor analytics contract');
