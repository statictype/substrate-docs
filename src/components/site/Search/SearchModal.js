import React, { useEffect, useState } from 'react';

import useLunrIndex from '../../../hooks/use-lunr-index';
import SearchInput from './SearchInput';
import SearchResultsContainer from './SearchResultsContainer';
import SearchSectionLabel from './SearchSectionLabel';
// import {
//   SearchSectionLabel,
//   SearchResultsContainer,
//   SearchInput,
// } from '../search-ui'

function SearchModal({ id, closeModal }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [displayedResults, setDisplayedResults] = useState([]);
  const types = ['Docs', 'Tutorials', 'Reference'];
  const { store, index } = useLunrIndex();

  const [section, setSection] = useState({
    docs: false,
    tuts: false,
    ref: false,
  });

  //console.log(id, closeModal, setQuery, displayedResults, types, setSection);
  // console.log(displayedResults);

  const sectionNames = {
    docs: 'main-docs',
    tuts: 'tutorials',
    ref: 'reference',
  };

  const processQuery = query => {
    if (
      query.length === 0 || // query is empty string
      query.split(/\s/).length < 2 || // query is a single word
      query.match(/[\^~+\-*:]/) !== null // query contains the special character in lunrjs search
    ) {
      return query;
    }
    const result = query
      .split(/\s/)
      .filter(t => t.length > 0)
      .map(t => `+${t}`)
      .join(' ');
    return result;
  };

  const searchForQuery = (index, store, query) => {
    try {
      return index.search(query).map(result => {
        return { slug: result.ref, ...store[result.ref] };
      });
    } catch (error) {
      // console.error(error)
      return [];
    }
  };

  useEffect(() => {
    let results = searchForQuery(index, store, processQuery(query));
    if (results.length == 0) {
      results = searchForQuery(index, store, `${query}*`);
    }
    setSearchResults(results);
  }, [query]);

  useEffect(() => {
    const selectedSections = Object.entries(section)
      .filter(([, val]) => val)
      .map(([key]) => key);

    if (selectedSections.length === 0) {
      return setDisplayedResults(searchResults);
    }

    const selectedSectionNames = Object.entries(sectionNames)
      .filter(([key]) => selectedSections.indexOf(key) >= 0)
      .map(([, val]) => val);
    //console.log(selectedSectionNames);
    //console.log(searchResults);
    //console.log(selectedSectionNames.includes(searchResults[0].slug));
    // console.log(
    //   Object.keys(searchResults).map(function (key) {
    //     return searchResults[key];
    //   })
    // );
    //console.log(searchResults.filter(result => selectedSectionNames.includes(result.section)));
    function filterResult(i) {
      // selectedSectionNames.map(name => {
      //   console.log(name);
      //i.filter(item => item.slug.includes(name));
      // });
      if (i.slug.includes(selectedSectionNames[0])) {
        return true;
      }
      if (i.slug.includes(selectedSectionNames[1])) {
        return true;
      }
      if (i.slug.includes(selectedSectionNames[2])) {
        return true;
      } else {
        return false;
      }
    }
    const filteredResults = searchResults.filter(result => filterResult(result));
    console.log(filteredResults);
    setDisplayedResults(filteredResults);
  }, [searchResults, section]);

  return (
    <>
      <div
        id="content-container"
        className="flex justify-center items-center lg:items-start lg:mt-24 fixed inset-0 z-50 px-4 animate-fade-in"
      >
        <div
          ref={id}
          className="bg-white dark:bg-gray-900 w-full max-w-screen-sm h-auto py-10 px-8 rounded-lg border-2 border-substrateDark shadow-xl"
        >
          <SearchInput query={query} setQuery={setQuery} closeModal={closeModal} />
          <div className="flex flex-col sm:flex-row mb-6">
            {types.map((type, index) => (
              <div key={index}>
                <SearchSectionLabel index={index} section={section} setSection={setSection}>
                  {type}
                </SearchSectionLabel>
              </div>
            ))}
          </div>
          <SearchResultsContainer results={displayedResults} query={query} setQuery={setQuery} />
        </div>
      </div>
      <div id="modal-background" className="opacity-25 dark:opacity-90 fixed inset-0 z-40 bg-substrateDark"></div>
    </>
  );
}

export default SearchModal;
