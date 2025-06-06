import styled from 'styled-components';
import { Container, WhiteBox } from '@/components/styles/common';
import { useState } from 'react';
import { useUserStore } from '@/stores/user';
import { useNavigate } from 'react-router-dom';
import pencil from '@/assets/setting/Pencil.svg';
import postIcon from '@/assets/setting/게시글.svg';
import communityIcon from '@/assets/setting/thumb_up.svg';
import likeIcon from '@/assets/setting/favorite_border.svg';
import scrapIcon from '@/assets/setting/스크랩.svg';
import { customFetch } from '@/hooks/CustomFetch';
import LogoutModal from '@/components/Modal/LogoutModal';

const SettingPage = () => {
   const navigate = useNavigate();
   const [isOpen, setIsOpen] = useState(false);
   const { name, email } = useUserStore();
   const [isEditing, setIsEditing] = useState(false);
   const [newName, setNewName] = useState('');

   // 사용자 이름 수정
   const fetchEditName = async (name: string) => {
      try {
         const result = await customFetch(
            '/user/name',
            {
               method: 'PUT',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ newName: name }),
            },
            navigate,
         );
         console.log('이름 수정 성공', result);
         window.location.reload();
      } catch (error) {
         console.error('이름 수정 실패', error);
         alert('닉네임 수정에 실패했어요.');
      }
   };
   if (!name || !email) return <Skeleton />;
   return (
      <Container>
         <WhiteBox style={{ gap: '0', position: 'relative' }}>
            <TitleText>프로필</TitleText>
            <EditIcon
               src={pencil}
               onClick={() => {
                  setIsEditing(true);
                  setNewName(name);
               }}
            />
            <ProfileBox>
               <InfoText>닉네임</InfoText>
               {isEditing ? (
                  <>
                     <Input
                        value={newName}
                        onChange={e => setNewName(e.target.value)}
                     />
                     <Button
                        onClick={() => {
                           if (newName !== name) {
                              fetchEditName(newName);
                           }
                           setIsEditing(false);
                        }}>
                        확인
                     </Button>
                  </>
               ) : (
                  <DetailText>{name}</DetailText>
               )}
            </ProfileBox>
            <ProfileBox>
               <InfoText>이메일</InfoText>
               <DetailText>{email}</DetailText>
            </ProfileBox>
            <Br />

            <InfoBox onClick={() => navigate('/setting/mypost')}>
               <MenuIcon src={postIcon} />
               <InfoText>내 게시글</InfoText>
            </InfoBox>
            <InfoBox onClick={() => navigate('/setting/likes')}>
               <MenuIcon src={communityIcon} />
               <InfoText>커뮤니티 좋아요 목록</InfoText>
            </InfoBox>
            <InfoBox onClick={() => navigate('/setting/ocr')}>
               <MenuIcon src={likeIcon} />
               <InfoText>상품 저장 목록</InfoText>
            </InfoBox>
            <InfoBox onClick={() => navigate('/setting/recipes')}>
               <MenuIcon src={scrapIcon} />
               <InfoText>레시피 북마크</InfoText>
            </InfoBox>
            <LogoutText onClick={() => setIsOpen(true)}>로그아웃</LogoutText>
            {isOpen && <LogoutModal onClose={() => setIsOpen(false)} />}
         </WhiteBox>
      </Container>
   );
};
export default SettingPage;
const Skeleton = styled.div`
   width: 90%;
   height: 490px; /* 필요에 따라 높이 지정 */
   align-self: center;
   background: linear-gradient(90deg, #e0e0e0 25%, #f5f5f5 50%, #e0e0e0 75%);
   border-radius: 20px;
   background-size: 200% 100%;
   animation: shimmer 1.5s infinite linear;
   margin-top: 15px;
   @keyframes shimmer {
      0% {
         background-position: -100%;
      }
      100% {
         background-position: 100%;
      }
   }
`;

const InfoText = styled.p`
   margin: 0;
   font-family: Medium;
`;
const LogoutText = styled.p`
   margin: 0;
   font-family: Medium;
   text-align: center;
   color: red;
   margin-top: 20px;
   margin-bottom: 10px;
   cursor: pointer;
`;
const TitleText = styled.p`
   margin: 0;
   font-family: SemiBold;
   font-size: 1.3rem;
   margin-left: 10px;
   margin-bottom: 20px;
   margin-top: 12px;
`;
const ProfileBox = styled.div`
   display: flex;
   gap: 20px;
   padding: 8px 10px;
   align-items: center;
`;
const InfoBox = styled.div`
   display: flex;
   gap: 20px;
   padding: 15px 10px;
   align-items: center;
   cursor: pointer;
`;
const DetailText = styled.p`
   margin: 0;
   font-family: Regular;
   opacity: 0.8;
`;
const EditIcon = styled.img`
   width: 24px;
   position: absolute;
   right: 25px;
   top: 27px;
   cursor: pointer;
`;
const MenuIcon = styled.img`
   width: 24px;
`;
const Br = styled.div`
   height: 0.5px;
   background-color: #ff9eb3;
   width: 100%;
   margin: 30px 0;
`;
const Input = styled.input`
   padding: 4px;
   margin-right: 8px;
   width: 50%;
   outline: none;
`;

const Button = styled.button`
   border: none;
   border-radius: 10px;
   color: white;
   background-color: #ff9eb3;
   font-family: SemiBold;
   cursor: pointer;
   padding: 8px 10px;
`;
