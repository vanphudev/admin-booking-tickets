import { createGlobalStyle } from 'styled-components';

import { ThemeMode } from '#/enum';

const GlobalScrollbarStyle = createGlobalStyle<{ $themeMode?: ThemeMode }>`
   ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
   }

   ::-webkit-scrollbar-track {
      border-radius: 8px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#2c2c2c' : '#FAFAFA')};
   }

   ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#6b6b6b' : '#C1C1C1')};
   }

   ::-webkit-scrollbar-thumb:hover {
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#939393' : '#7D7D7D')};
   }

   ::-webkit-scrollbar-corner {
      background: transparent;
   }
   .ant-table-wrapper {
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
   }

   .ant-table-wrapper .ant-spin-nested-loading {
      display: flex;
      flex-direction: column;
      flex: 1;
   }

   .ant-table-wrapper .ant-spin-nested-loading .ant-spin-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      flex: 1;
   }

   .ant-table-wrapper .ant-spin-nested-loading .ant-spin-container .ant-table {
      overflow: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
   }
   .ant-table-wrapper .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-container {
      overflow: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
   }
   .ant-table-wrapper .ant-spin-nested-loading .ant-spin-container .ant-table .ant-table-container .ant-table-body {
      overflow: auto;
      flex: 1;
   }
}
`;
export default GlobalScrollbarStyle;
