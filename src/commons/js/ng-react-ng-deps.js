//inject angularjs dependencies so that it can be used in react code.

export const ngDeps = {};

export function injectNgDeps(deps) {
    Object.assign(ngDeps, deps);
};

export default ngDeps;
