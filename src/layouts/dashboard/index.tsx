import { useScroll } from 'framer-motion';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import styled from 'styled-components';

import { CircleLoading } from '@/components/loading';
import ProgressBar from '@/components/progress-bar';
import addressAPI from '@/redux/api/services/adressAPI';
import { setProvinces, setDistricts, setWards } from '@/redux/slices/adressSlice';
import { useSettings } from '@/store/settingStore';
import { useThemeToken } from '@/theme/hooks';

import Header from './header';
import Main from './main';
import Nav from './nav';
import NavHorizontal from './nav-horizontal';

import { ThemeLayout, ThemeMode } from '#/enum';

function DashboardLayout() {
   const { colorBgElevated, colorTextBase } = useThemeToken();
   const { themeLayout, themeMode } = useSettings();
   const mainEl = useRef(null);
   const { scrollY } = useScroll({ container: mainEl });
   const [offsetTop, setOffsetTop] = useState(false);
   const onOffSetTop = useCallback(() => {
      scrollY.on('change', (scrollHeight) => {
         if (scrollHeight > 0) {
            setOffsetTop(true);
         } else {
            setOffsetTop(false);
         }
      });
   }, [scrollY]);

   const dispatch = useDispatch();
   useEffect(() => {
      addressAPI.getProvinces().then((res) => {
         dispatch(setProvinces(res));
      });
      addressAPI.getDistrictsAll().then((res) => {
         dispatch(setDistricts(res));
      });
      addressAPI.getWardsAll().then((res) => {
         dispatch(setWards(res));
      });
   }, [dispatch]);

   useEffect(() => {
      onOffSetTop();
   }, [onOffSetTop]);

   const navVertical = (
      <div className="z-50 hidden h-full flex-shrink-0 md:block">
         <Nav />
      </div>
   );

   const nav = themeLayout === ThemeLayout.Horizontal ? <NavHorizontal /> : navVertical;

   return (
      <StyleWrapper $themeMode={themeMode}>
         <ProgressBar />
         <div
            className={`flex h-screen overflow-hidden ${themeLayout === ThemeLayout.Horizontal ? 'flex-col' : ''}`}
            style={{
               color: colorTextBase,
               background: colorBgElevated,
               transition:
                  'color 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms, background 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
            }}
         >
            <Suspense fallback={<CircleLoading />}>
               <Header offsetTop={themeLayout === ThemeLayout.Vertical ? offsetTop : undefined} />
               {nav}
               <Main ref={mainEl} offsetTop={offsetTop} />
            </Suspense>
         </div>
      </StyleWrapper>
   );
}
export default DashboardLayout;

const StyleWrapper = styled.div<{ $themeMode?: ThemeMode }>`
   ::-webkit-scrollbar {
      width: 8px;
   }

   ::-webkit-scrollbar-track {
      border-radius: 8px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#2c2c2c' : '#FAFAFA')};
   }

   ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#6b6b6b' : '#C1C1C1')};
   }

   .simplebar-scrollbar::before {
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#6b6b6b' : '#C1C1C1')};
   }

   .simplebar-scrollbar.simplebar-visible:before {
      opacity: 1;
   }

   ::-webkit-scrollbar-thumb:hover {
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#939393' : '##7D7D7D')};
   }
`;
