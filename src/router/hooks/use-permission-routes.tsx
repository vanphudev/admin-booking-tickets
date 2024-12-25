import { isEmpty } from 'ramda';
import { Suspense, lazy, useMemo } from 'react';
import { Navigate, Outlet } from 'react-router-dom';

import { Iconify } from '@/components/icon';
import { CircleLoading } from '@/components/loading';
import ProTag from '@/theme/antd/components/tag';
import { flattenTrees } from '@/utils/tree';

import { PERMISSION_LIST } from '../../_mock/assets';

import { Permission } from '#/entity';
import { BasicStatus, PermissionType } from '#/enum';
import { AppRouteObject } from '#/router';

const entryPath = '/src/pages';
const pages = import.meta.glob('/src/pages/**/*.tsx');

export const pagesSelect = Object.entries(pages).map(([path]) => {
   const pagePath = path.replace(entryPath, '');
   return {
      label: pagePath,
      value: pagePath,
   };
});
function resolveComponent(path: string) {
   return pages[`${entryPath}${path}`];
}

export function usePermissionRoutes() {
   const permissions = PERMISSION_LIST as Permission[];
   return useMemo(() => {
      const flattenedPermissions = flattenTrees(permissions!);
      const permissionRoutes = transformPermissionToMenuRoutes(permissions || [], flattenedPermissions);
      return [...permissionRoutes];
   }, [permissions]);
}

function transformPermissionToMenuRoutes(permissions: Permission[], flattenedPermissions: Permission[]) {
   return permissions.map((permission) => {
      const {
         route,
         type,
         label,
         icon,
         order,
         hide,
         hideTab,
         status,
         frameSrc,
         newFeature,
         component,
         parentId,
         iconNewFeature,
         children = [],
      } = permission;

      const appRoute: AppRouteObject = {
         path: route,
         meta: {
            label,
            key: getCompleteRoute(permission, flattenedPermissions),
            hideMenu: !!hide,
            hideTab,
            disabled: status === BasicStatus.DISABLE,
         },
      };

      if (order) appRoute.order = order;
      if (icon) appRoute.meta!.icon = icon;
      if (frameSrc) appRoute.meta!.frameSrc = frameSrc;

      if (newFeature && iconNewFeature) {
         appRoute.meta!.suffix = (
            <ProTag
               color="transparent"
               icon={<Iconify style={{ color: '#db1f1f' }} icon={iconNewFeature} size={25} />}
            />
         );
      }

      if (type === PermissionType.CATALOGUE) {
         appRoute.meta!.hideTab = true;
         if (!parentId) {
            appRoute.element = (
               <Suspense fallback={<CircleLoading />}>
                  <Outlet />
               </Suspense>
            );
         }
         appRoute.children = transformPermissionToMenuRoutes(children, flattenedPermissions);

         if (!isEmpty(children)) {
            appRoute.children.unshift({
               index: true,
               element: <Navigate to={children[0].route} replace />,
            });
         }
      } else if (type === PermissionType.MENU) {
         const Element = lazy(resolveComponent(component!) as any);
         if (frameSrc) {
            appRoute.element = <Element src={frameSrc} />;
         } else {
            appRoute.element = (
               <Suspense fallback={<CircleLoading />}>
                  <Element />
               </Suspense>
            );
         }
      }

      return appRoute;
   });
}

function getCompleteRoute(permission: Permission, flattenedPermissions: Permission[], route = '') {
   const currentRoute = route ? `/${permission.route}${route}` : `/${permission.route}`;

   if (permission.parentId) {
      const parentPermission = flattenedPermissions.find((p) => p.id === permission.parentId)!;
      return getCompleteRoute(parentPermission, flattenedPermissions, currentRoute);
   }

   return currentRoute;
}
