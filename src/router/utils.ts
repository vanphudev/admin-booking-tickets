import { ascend } from 'ramda';

import { AppRouteObject, RouteMeta } from '#/router';

export const menuFilter = (items: AppRouteObject[]) => {
   return items
      .filter((item) => {
         const show = item.meta?.key;
         if (show && item.children) {
            item.children = menuFilter(item.children);
         }
         return show;
      })
      .sort(ascend((item) => item.order || Infinity));
};

export function getRoutesFromModules() {
   const menuModules: AppRouteObject[] = [];
   const modules = import.meta.glob('./routes/modules/**/*.tsx', { eager: true });
   Object.keys(modules).forEach((key) => {
      const mod = (modules as any)[key].default || {};
      const modList = Array.isArray(mod) ? [...mod] : [mod];
      menuModules.push(...modList);
   });
   return menuModules;
}

export function getMenuRoutes(appRouteObjects: AppRouteObject[]) {
   return menuFilter(appRouteObjects);
}

export function flattenMenuRoutes(routes: AppRouteObject[]) {
   return routes.reduce<RouteMeta[]>((prev, item) => {
      const { meta, children } = item;
      if (meta) prev.push(meta);
      if (children) prev.push(...flattenMenuRoutes(children));
      return prev;
   }, []);
}
