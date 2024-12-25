import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { Provider } from 'react-redux';
// eslint-disable-next-line import/no-unresolved
import 'virtual:svg-icons-register';

import App from '@/App';

import './locales/i18n';
import { store } from './redux/stores/store';
import './theme/index.css';

const queryClient = new QueryClient({
   defaultOptions: {
      queries: {
         retry: 3,
         gcTime: 300_000,
         staleTime: 10_1000,
         refetchOnWindowFocus: false,
         refetchOnReconnect: false,
         refetchOnMount: false,
      },
   },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
   <HelmetProvider>
      <Provider store={store}>
         <QueryClientProvider client={queryClient}>
            <Suspense>
               <App />
            </Suspense>
         </QueryClientProvider>
      </Provider>
   </HelmetProvider>,
);
