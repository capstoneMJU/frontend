import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styled from 'styled-components';
import home from '@/assets/navbar/homeG.svg';
import recipe from '@/assets/navbar/forkG.svg';
import community from '@/assets/navbar/HeartG.svg';
import setting from '@/assets/navbar/SettingG.svg';
import search from '@/assets/navbar/SearchG.svg';
import homeActive from '@/assets/navbar/homeB.svg';
import recipeActive from '@/assets/navbar/forkB.svg';
import communityActive from '@/assets/navbar/HeartB.svg';
import settingActive from '@/assets/navbar/SettingB.svg';
import searchActive from '@/assets/navbar/SearchB.svg';
import { customFetch } from '@/hooks/CustomFetch';
import { useUserStore } from '@/stores/user';

const categories = [
   {
      title: '홈',
      link: '/home',
      icon: home,
      activeIcon: homeActive,
   },
   {
      title: '검색',
      link: '/search',
      icon: search,
      activeIcon: searchActive,
   },
   {
      title: '레시피',
      link: '/recipe',
      icon: recipe,
      activeIcon: recipeActive,
   },
   {
      title: '커뮤니티',
      link: '/community',
      icon: community,
      activeIcon: communityActive,
   },
   {
      title: '설정',
      link: '/setting',
      icon: setting,
      activeIcon: settingActive,
   },
];

const RootLayout = () => {
   const navigate = useNavigate();
   const { name, email, setName, setEmail } = useUserStore();
   const [selected, setSelected] = useState<string>(
      sessionStorage.getItem('selectedCategory') || '홈',
   );

   const handleClick = (title: string) => {
      setSelected(title);
      sessionStorage.setItem('selectedCategory', title);
   };

   const fetchUser = async () => {
      try {
         const result = await customFetch(
            '/user',
            { method: 'GET', headers: { accept: 'application/json' } },
            navigate,
         );
         setName(result.data.name);
         setEmail(result.data.email);
      } catch {
         // 에러
      }
   };

   useEffect(() => {
      if (!name || !email) fetchUser();
   }, []);

   return (
      <RootContainer>
         <Outlet />

         <Nav>
            {categories.map((category, index) => (
               <Item
                  key={index}
                  to={category.link}
                  onClick={() => handleClick(category.title)}>
                  <Img
                     src={
                        selected === category.title
                           ? category.activeIcon
                           : category.icon
                     }
                  />
                  <NavText isActive={selected === category.title}>
                     {category.title}
                  </NavText>
               </Item>
            ))}
         </Nav>
      </RootContainer>
   );
};
export default RootLayout;

// Styled Components
const RootContainer = styled.div`
   display: flex;
   flex-direction: column;
   height: 100dvh;
   width: 100%;
   overflow-y: hidden;
   position: relative;
`;

const Nav = styled.div`
   width: 100%;
   height: 70px;
   border-top: 1px solid #f1f1f1;
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 0 20px;
   box-sizing: border-box;
   position: fixed;
   bottom: 0;
   z-index: 10;
   background-color: white;
   border-radius: 15px;
`;

const Img = styled.img`
   width: 23px;
`;

const Item = styled(Link)`
   display: flex;
   flex-direction: column;
   justify-content: space-between;
   width: 49px;
   height: 44px;
   align-items: center;
   cursor: pointer;
   text-decoration: none;
`;

const NavText = styled.p<{ isActive: boolean }>`
   margin: 0;
   font-size: 12px;
   font-family: SemiBold;
   color: ${({ isActive }) => (isActive ? 'black' : '#808080')};
`;
