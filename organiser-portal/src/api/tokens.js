let _token = null;
let _refreshFn = null;

export const setToken = (token) => { _token = token; };
export const getToken = () => _token;
export const clearToken = () => { _token = null; };

export const setRefreshFn = (fn) => { _refreshFn = fn; };
export const getRefreshFn = () => _refreshFn;
