
import React, { useState, useEffect, useRef } from 'react';
import { apiCache, fetchAllPages } from '../utils/api';
import CharacterModal from '../components/CharacterModal';
import SearchableDropdown from '../components/SearchableDropdown';
import ControlsSkeleton from '../components/ControlsSkeleton';
import CharacterGridSkeleton from '../components/CharacterGridSkeleton';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Main Component ---
const Home = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // State
  const [people, setPeople] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [planetOptions, setPlanetOptions] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [filmOptions, setFilmOptions] = useState([]);
  const [resolvedPlanets, setResolvedPlanets] = useState({});
  const [selectedPerson, setSelectedPerson] = useState(null);
  console.log("selectedPerson", selectedPerson);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterHomeworld, setFilterHomeworld] = useState('');
  const [filterSpecies, setFilterSpecies] = useState('');
  const [filterFilm, setFilterFilm] = useState('');
  const [page, setPage] = useState(1);

  const debounceTimer = useRef(null);

  useEffect(() => {
    const filterOptionsData = async () => {
      try {
        const [planets, species, films] = await Promise.all([
          fetchAllPages('https://swapi.dev/api/planets/'),
          fetchAllPages('https://swapi.dev/api/species/'),
          fetchAllPages('https://swapi.dev/api/films/')
        ]);
        // Sort
        planets.sort((planetA, planetB) => planetA.name.localeCompare(planetB.name));
        species.sort((speciesA, speciesB) => speciesA.name.localeCompare(speciesB.name));
        films.sort((filmA, filmB) => filmA.title.localeCompare(filmB.title));

        // Create Dropdown Options
        setPlanetOptions(planets.map(planet => ({ value: planet.url, label: planet.name })));
        setSpeciesOptions(species.map(species => ({ value: species.url, label: species.name })));
        setFilmOptions(films.map(film => ({ value: film.url, label: film.title })));

        // Populate Cache
        planets.forEach(planet => apiCache.planets[planet.url] = planet);
        species.forEach(species => apiCache.species[species.url] = species);
        films.forEach(film => apiCache.films[film.url] = film);

        setInitializing(false);
      } catch (e) {
        console.error("Init Error", e);
        setError("Failed to initialize galactic charts.");
        setInitializing(false);
      }
    };
    filterOptionsData();
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);


  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filterHomeworld, filterSpecies, filterFilm]);

  useEffect(() => {
    if (initializing) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const isFilterApplied = filterHomeworld || filterSpecies || filterFilm;

        if (!isFilterApplied) {
          await fetchPeopleData(page, debouncedSearch);
        } else {
          await fetchFilterData(page, debouncedSearch, filterHomeworld, filterSpecies, filterFilm);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to fetch data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, debouncedSearch, filterHomeworld, filterSpecies, filterFilm, initializing]);

  //API Call
  const fetchPeopleData = async (p, search) => {
    let url = `https://swapi.dev/api/people/?page=${p}`;
    if (search) url += `&search=${search}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("API Error");
    const data = await res.json();

    setPeople(data.results);
    setTotalCount(data.count);
    resolveHomeworldsForView(data.results);
  };

  // Filter API Call
  const fetchFilterData = async (page, search, hwUrl, spUrl, filmUrl) => {
    let candidates = null;

    const addToCandidates = (list) => {
      const cleanList = new Set(list); // Ensure uniqueness
      if (candidates === null) candidates = cleanList;
      else {
        // Intersect
        candidates = new Set([...candidates].filter(x => cleanList.has(x)));
      }
    };

    if (hwUrl && apiCache.planets[hwUrl]) {
      addToCandidates(apiCache.planets[hwUrl].residents);
    }
    if (spUrl && apiCache.species[spUrl]) {
      addToCandidates(apiCache.species[spUrl].people);
    }
    if (filmUrl && apiCache.films[filmUrl]) {
      addToCandidates(apiCache.films[filmUrl].characters);
    }

    if (candidates === null) candidates = new Set();
    let resultUrls = [...candidates];

    if (resultUrls.length === 0) {
      setPeople([]);
      setTotalCount(0);
      return;
    }

    if (search) {
      const fullDetails = await fetchPeopleDetailsInParallel(resultUrls);
      const filtered = fullDetails.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
      setTotalCount(filtered.length);

      const start = (page - 1) * 10;
      const pageData = filtered.slice(start, start + 10);
      setPeople(pageData);
      resolveHomeworldsForView(pageData);
    } else {
      setTotalCount(resultUrls.length);
      const start = (page - 1) * 10;
      const pageUrls = resultUrls.slice(start, start + 10);

      const pageData = await fetchPeopleDetailsInParallel(pageUrls);
      setPeople(pageData);
      resolveHomeworldsForView(pageData);
    }
  };

  const fetchPeopleDetailsInParallel = async (urls) => {
    const promises = urls.map(async url => {
      if (apiCache.people[url]) return apiCache.people[url];
      try {
        const res = await fetch(url.replace('http:', 'https:'));
        const data = await res.json();
        apiCache.people[url] = data;
        return data;
      } catch (e) { return null; }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean);
  };

  const resolveHomeworldsForView = async (items) => {
    const uniquePlanets = [...new Set(items.map(i => i.homeworld))];
    const newMap = {};

    await Promise.all(uniquePlanets.map(async url => {
      if (!url) return;
      if (apiCache.planets[url]) {
        newMap[url] = apiCache.planets[url].name;
      } else {
        try {
          const res = await fetch(url.replace('http:', 'https:'));
          const d = await res.json();
          apiCache.planets[url] = d;
          newMap[url] = d.name;
        } catch (e) { }
      }
    }));
    setResolvedPlanets(prev => ({ ...prev, ...newMap }));
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterHomeworld('');
    setFilterSpecies('');
    setFilterFilm('');
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="container py-5 bg-light min-vh-100">
      <header className="mb-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: '45px', height: '45px' }}>
            <span className="fw-bold fs-5">{user?.email?.[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-muted mb-0 small text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>Welcome Back</p>
            <h5 className="fw-bold text-dark mb-0 text-capitalize">{user?.email?.split('@')[0].toUpperCase()}</h5>
          </div>
        </div>
        <button className="btn btn-outline-dark btn-sm" onClick={handleLogout}>Logout</button>
      </header>

      {/* Page Title */}
      <div className="mb-5 text-center">
        <h2 className="display-5 fw-bold text-dark mb-2">Star Wars Characters</h2>
        <p className="text-muted lead">Explore the galaxy's most iconic inhabitants</p>
      </div>
      {/* Controls Container */}
      <div className="card shadow-sm border-0 mb-4 p-4 bg-white rounded-3">
        {initializing ? (
          <ControlsSkeleton />
        ) : (
          <div className="row g-3">
            {/* Search */}
            <div className="col-12 col-md-3">
              <label className="form-label text-secondary fw-bold small">Search by Name</label>
              <input
                type="text" className="form-control bg-light border-0"
                placeholder="e.g. Luke"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {/* Filters using Custom Searchable Dropdown */}
            <div className="col-12 col-md-3">
              <label className="form-label text-secondary fw-bold small">Filter by Homeworld</label>
              <SearchableDropdown
                options={planetOptions}
                value={filterHomeworld}
                onChange={setFilterHomeworld}
                placeholder="All Homeworld"
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label text-secondary fw-bold small">Filter by Film</label>
              <SearchableDropdown
                options={filmOptions}
                value={filterFilm}
                onChange={setFilterFilm}
                placeholder="All Films"
              />
            </div>
            <div className="col-6 col-md-2">
              <label className="form-label text-secondary fw-bold small">Filter by Species</label>
              <SearchableDropdown
                options={speciesOptions}
                value={filterSpecies}
                onChange={setFilterSpecies}
                placeholder="All Species"
              />
            </div>
            {/* Reset Button */}
            <div className="col-12 col-md-2 d-flex align-items-end">
              <button
                className="btn btn-danger w-100 fw-bold"
                onClick={handleResetFilters}
                disabled={!searchTerm && !filterHomeworld && !filterSpecies && !filterFilm}
                style={{ transition: 'all 0.3s' }}
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <CharacterGridSkeleton />
      ) : error ? (
        <div className="alert alert-danger text-center shadow-sm border-0">Error: {error || "Something went wrong!"}</div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {people.map((person) => {
              const imgUrl = `https://picsum.photos/seed/${person.name.replace(/\s/g, '')}/400/300`;
              return (
                <div key={person.url || person.name} className="col">
                  <div
                    className="card h-100 border-0 shadow-sm character-card-hover bg-white overflow-hidden"
                    style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
                    onClick={() => setSelectedPerson(person)}
                  >
                    <div className="position-relative w-100 h-100">
                      <img
                        src={imgUrl} className="card-img-top w-100 h-100 object-fit-cover"
                        alt={person.name} loading="lazy"
                        style={{ height: '300px', transition: 'transform 0.5s' }}
                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
                      />
                      <div className="character-overlay position-absolute bottom-0 start-0 w-100 h-50 d-flex flex-column justify-content-end p-3 text-white">
                        <h5 className="fw-bold mb-1 text-shadow">{person.name}</h5>
                        <span className="small text-white-50 text-shadow character-info">
                          {resolvedPlanets[person.homeworld] || 'Unknown Planet'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {people.length === 0 && (
            <div className="text-center py-5 text-muted">
              <h4 className="fw-light">No data found.</h4>
            </div>
          )}

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-5 pb-5">
              <button
                className="btn btn-outline-dark px-4"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                &larr; Previous
              </button>
              <span className="fw-bold text-secondary">Page {page} of {totalPages || 1}</span>
              <button
                className="btn btn-outline-dark px-4"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}

      {selectedPerson && (
        <CharacterModal
          character={selectedPerson}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </div>
  );
};

export default Home;
