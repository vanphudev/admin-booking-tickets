import { App as AntdApp } from 'antd';
import { Helmet } from 'react-helmet-async';

import Router from '@/router/index';
import AntdConfig from '@/theme/antd';
import GlobalScrollbarStyle from '@/theme/antd/globalScrollbarStyle';

import { MotionLazy } from './components/animate/motion-lazy';

function App() {
   return (
      <AntdConfig>
         <AntdApp>
            <GlobalScrollbarStyle />
            <MotionLazy>
               <Helmet />
               <Router />
            </MotionLazy>
         </AntdApp>
      </AntdConfig>
   );
}

export default App;
