import '@/font.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import SignUpPage from '@/pages/SignUpPage';
import SplashPage from '@/pages/SplashPage';
import RootLayout from '@/layout/RootLayout';
import HomePage from '@/pages/Home/HomePage';
import RecipePage from './pages/RecipePage';
import SearchPage from './pages/Search/SearchPage';
import CommunityPage from './pages/CommunityPage';
import SettingPage from './pages/Setting/SettingPage';
import CameraPage from './pages/Home/CameraPage';
import ProductDetailPage from './pages/Search/ProductDetailPage';
import AnalysisPage from './pages/Home/AnalysisPage';
import LikedProduct from './pages/Setting/LikedProductsPage';
const router = createBrowserRouter([
   {
      path: '/login',
      element: <LoginPage />,
   },
   {
      path: '/signup',
      element: <SignUpPage />,
   },
   {
      path: '/camera',
      element: <CameraPage />,
   },

   {
      path: '/', // 루트 경로
      element: <RootLayout />,
      children: [
         { index: true, element: <SplashPage /> }, // 기본 경로
         { path: 'home', element: <HomePage /> }, // /home 경로 추가
         { path: 'recipe', element: <RecipePage /> },
         { path: 'search', element: <SearchPage /> },
         { path: '/:id', element: <ProductDetailPage /> },
         { path: 'community', element: <CommunityPage /> },
         { path: 'setting', element: <SettingPage /> },
         { path: 'home/result', element: <AnalysisPage /> },
         { path: 'setting/likedProducts', element: <LikedProduct /> },
      ],
   },
]);

function App() {
   return (
      <>
         <RouterProvider router={router} />
      </>
   );
}

export default App;
