import { categoryMap } from '@/type/community';
import { Post } from '@/type/post';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pencilIcon from '@/assets/setting/PostButtonIcon.svg';
import styled from 'styled-components';
import CommunityItem from '@/components/CommunityItem';

const CommunityPage: React.FC = () => {
   const [categories] = useState<string[]>([
      'ZERO_PRODUCT_REVIEW',
      'RECIPE',
      'FREE_BOARD',
   ]);
   const [activeCategory, setActiveCategory] = useState<string>(categories[0]);
   const navigate = useNavigate();
   const observerRef = useRef<IntersectionObserver | null>(null);
   const [posts, setPosts] = useState<Post[]>([]);
   const [page, setPage] = useState(0);
   const [hasMore, setHasMore] = useState(true);
   const [loading, setLoading] = useState(false);

   // fetch로 대체된 게시글 API 호출
   const fetchPosts = useCallback(async () => {
      if (loading || !hasMore) return;
      setLoading(true);
      try {
         const query = new URLSearchParams({
            category: activeCategory,
            page: page.toString(),
            size: '10',
         });

         const res = await fetch(`/api/v1/boards/scroll?${query.toString()}`, {
            method: 'GET',
            credentials: 'include',
         });

         if (!res.ok) throw new Error('API 실패');

         const data = await res.json(); // { items: Post[], hasNext: boolean }
         console.log('API 응답:', data);
         setPosts(prev => [...prev, ...data.content]);
         setHasMore(!data.last);
         setPage(prev => prev + 1);
      } catch (err) {
         console.error('게시글 조회 실패', err);
      } finally {
         setLoading(false);
      }
   }, [activeCategory, page, hasMore, loading]);

   useEffect(() => {
      setPosts([]);
      setPage(0);
      setHasMore(true);
   }, [activeCategory]);

   useEffect(() => {
      const handlePageShow = () => {
      setPosts([]);
      setPage(0);
      setHasMore(true);
   };

   window.addEventListener('pageshow', handlePageShow);
      return () => window.removeEventListener('pageshow', handlePageShow);
   }, []);
   useEffect(() => {
      if (page === 0) {
      fetchPosts();
   }
   }, [page, fetchPosts]);


   const lastPostRef = useCallback(
      (node: HTMLDivElement) => {
         if (observerRef.current) observerRef.current.disconnect();
         observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) fetchPosts();
         });
         if (node) observerRef.current.observe(node);
      },
      [fetchPosts, hasMore],
   );

   const handleCategorySelect = (category: string) => {
      setActiveCategory(category);
   };

   const handleFloatingButtonClick = () => {
      navigate('/community/write');
   };

   return (
      <PageContainer>
         <Header>키워드별 잡다한 이야기</Header>

         <CategoryTabsContainer>
            {categories.map(category => (
               <CategoryButton
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  $isActive={activeCategory === category}>
                  {categoryMap[category]}
               </CategoryButton>
            ))}
         </CategoryTabsContainer>

         <PostsContainer>
            {posts.map((post, id) => (
               <CommunityItem key={id} post={post} />
            ))}
            <ObserverDiv ref={hasMore ? lastPostRef : null} />
            {loading && <LoadingMessage>로딩 중...</LoadingMessage>}
            {!hasMore && <EndMessage>마지막 게시글입니다.</EndMessage>}
         </PostsContainer>

         <FloatingButton src={pencilIcon} onClick={handleFloatingButtonClick} />
      </PageContainer>
   );
};

export default CommunityPage;

const ObserverDiv = styled.div`
   width: 100%;
   height: 0px;
`;

const PageContainer = styled.div`
   font-family: Arial, sans-serif;
   min-height: 100vh;
   overflow-y: auto;
   flex: 1;
   display: flex;
   flex-direction: column;
`;

const Header = styled.header`
   padding: 1rem;
   text-align: left;
   font-size: 1.2rem;
   font-weight: bold;
   border-bottom: 1px solid #eee;
`;

const CategoryTabsContainer = styled.div`
   display: flex;
   width: 100%;
   background-color: white;
   border-bottom: 1px solid #eee;
   position: sticky;
   top: 0;
   z-index: 10;
   position: relative;
`;

const CategoryButton = styled.button<{ $isActive: boolean }>`
   flex: 1;
   background: white;
   color: ${props => (props.$isActive ? '#FF9EB3' : '#666')};
   border: none;
   border-bottom: 2px solid
      ${props => (props.$isActive ? '#FF9EB3' : 'transparent')};
   padding: 1rem 0;
   font-size: 0.9rem;
   cursor: pointer;
   transition: all 0.2s ease-in-out;
   font-weight: ${props => (props.$isActive ? '600' : '400')};
   position: relative;
   font-family: Regular;

   &:hover {
      color: #ff9eb3;
   }

   &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #ff9eb3;
      transform: scaleX(${props => (props.$isActive ? 1 : 0)});
      transition: transform 0.2s ease-in-out;
   }
`;

const PostsContainer = styled.div`
   padding: 1rem;
`;

const LoadingMessage = styled.p`
   text-align: center;
   color: #888;
`;

const EndMessage = styled.p`
   text-align: center;
   color: #888;
   margin-bottom: 80px;
`;

const FloatingButton = styled.img`
   position: fixed;
   right: 1rem;
   bottom: 80px;
   width: 60px;
   cursor: pointer;
   z-index: 1000;
`;
