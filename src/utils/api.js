
// --- API Cache ---
export const apiCache = {
    planets: {},
    species: {},
    films: {},
    people: {}
};

// --- API Helper Functions ---
export const fetchAllPages = async (baseUrl) => {
    let results = [];
    let nextUrl = baseUrl;
    while (nextUrl) {
        const httpsUrl = nextUrl.replace('http:', 'https:');
        const res = await fetch(httpsUrl);
        const data = await res.json();
        results = [...results, ...data.results];
        nextUrl = data.next;
    }
    return results;
};
