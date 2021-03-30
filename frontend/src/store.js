import { languages } from "countries-list";
import { Store } from "pullstate";
import React, { createContext, useReducer } from "react";

const initialState = {
  tags: {},
  countries: [],
  profile: {},
  organisations: [],
};

const UIStore = new Store({
  tags: {},
  countries: [],
  profile: {},
  organisations: [],
  languages: languages,
});

const update = (store, key, data) => {
  store.update((s) => ({
    ...s,
    [key]: data,
  }));
};

export { UIStore, update };
