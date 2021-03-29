import React, { createContext, useReducer } from "react";

const initialState = {
  tags: [],
  countries: [],
  profile: {},
  organisations: [],
};
const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case "STORE PROFILE":
        return { ...state, profile: action.data };
      case "STORE COUNTRIES":
        return { ...state, countries: action.data };
      case "STORE TAGS":
        return { ...state, tags: { ...state.tags, ...action.data } };
      case "STORE ORGANISATIONS":
        return {
          ...state,
          organisations: action.data,
        };
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
