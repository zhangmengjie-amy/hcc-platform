/**
 * Author: 张梦洁
 * UI: 张梦洁
 * Created Time: 2025/04/10
 * Last Modified: 2026/03/03
 */

import { createStore } from "redux";

const initialState = {
  driver_landscape_filter_conditions: [],
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case "driver_landscape_filter_conditions":
    return { ...state, driver_landscape_filter_conditions: action.payload };
  default:
    return state;
  }
};

const store = createStore(reducer);

export default store;