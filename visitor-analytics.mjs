function parseCsv(csvText) {
    const rows = [];
    let row = [];
    let field = '';
    let quoted = false;

    for (let index = 0; index < csvText.length; index += 1) {
        const character = csvText[index];

        if (character === '"') {
            if (quoted && csvText[index + 1] === '"') {
                field += '"';
                index += 1;
            } else {
                quoted = !quoted;
            }
        } else if (character === ',' && !quoted) {
            row.push(field);
            field = '';
        } else if ((character === '\n' || character === '\r') && !quoted) {
            if (character === '\r' && csvText[index + 1] === '\n') index += 1;
            row.push(field);
            if (row.some((cell) => cell.trim())) rows.push(row);
            row = [];
            field = '';
        } else {
            field += character;
        }
    }

    if (field || row.length) {
        row.push(field);
        if (row.some((cell) => cell.trim())) rows.push(row);
    }

    return rows;
}

export function aggregateVisitorCsv(csvText, baselineIso) {
    const rows = parseCsv(csvText);
    if (rows.length < 2) return { totalVisits: 0, uniqueVisitors: 0, countries: {} };

    const headers = rows[0];
    const baseline = Date.parse(baselineIso);
    const visits = rows.slice(1).map((cells) => Object.fromEntries(
        headers.map((header, index) => [header, cells[index] ?? '']),
    )).filter((visit) => {
        const timestamp = Date.parse(visit.Timestamp);
        return Number.isFinite(timestamp) && timestamp >= baseline;
    });

    const sessions = new Set();
    const countrySessions = new Map();
    const countryNames = new Map();

    visits.forEach((visit) => {
        const sessionId = visit.SessionID.trim();
        const countryCode = visit.CountryCode.trim().toUpperCase();
        if (!sessionId) return;

        sessions.add(sessionId);
        if (!countryCode || countryCode === 'XX') return;

        if (!countrySessions.has(countryCode)) countrySessions.set(countryCode, new Set());
        countrySessions.get(countryCode).add(sessionId);
        countryNames.set(countryCode, visit.Country.trim() || countryCode);
    });

    const countries = Object.fromEntries(
        [...countrySessions.entries()].map(([code, ids]) => [
            code,
            { name: countryNames.get(code), count: ids.size },
        ]),
    );

    return {
        totalVisits: visits.length,
        uniqueVisitors: sessions.size,
        countries,
    };
}

export function addPageView(data, { country, countryCode, isNewSession }) {
    const countries = Object.fromEntries(
        Object.entries(data.countries ?? {}).map(([code, value]) => [code, { ...value }]),
    );

    if (isNewSession && countryCode && countryCode !== 'XX') {
        const current = countries[countryCode] ?? { name: country || countryCode, count: 0 };
        countries[countryCode] = { name: current.name, count: current.count + 1 };
    }

    return {
        totalVisits: (data.totalVisits ?? 0) + 1,
        uniqueVisitors: (data.uniqueVisitors ?? 0) + (isNewSession ? 1 : 0),
        countries,
    };
}

export function mergeVisitorData(left, right) {
    const countries = {};
    const codes = new Set([
        ...Object.keys(left.countries ?? {}),
        ...Object.keys(right.countries ?? {}),
    ]);

    codes.forEach((code) => {
        const leftCountry = left.countries?.[code];
        const rightCountry = right.countries?.[code];
        countries[code] = {
            name: rightCountry?.name || leftCountry?.name || code,
            count: Math.max(leftCountry?.count ?? 0, rightCountry?.count ?? 0),
        };
    });

    return {
        totalVisits: Math.max(left.totalVisits ?? 0, right.totalVisits ?? 0),
        uniqueVisitors: Math.max(left.uniqueVisitors ?? 0, right.uniqueVisitors ?? 0),
        countries,
    };
}
