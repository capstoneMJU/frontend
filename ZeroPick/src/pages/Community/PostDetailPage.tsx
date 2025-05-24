import LeftArrow from '@/assets/Left Arrow.svg';
import FavoriteBorderIcon from '@/assets/setting/favorite_border.svg';
import FavoriteFillIcon from '@/assets/setting/favorite_fill.svg';
import { customFetch } from '@/hooks/CustomFetch';
import { useUserStore } from '@/stores/user';
import { Comment, PostDetail } from '@/type/post';
import React, { useRef, useState } from 'react';
import { FaRegComment } from 'react-icons/fa';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { SubText } from '@/components/styles/common';
import logoIcon from '@/assets/Logo.svg';

const PostDetailPage: React.FC = () => {
   const inputRef = useRef<HTMLInputElement>(null);
   const replyInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>(
      {},
   );
   const { postId } = useParams();
   const navigate = useNavigate();
   const { name } = useUserStore();

   const [showMenu, setShowMenu] = useState(false);
   const [liked, setLiked] = useState(false);
   const [likeCount, setLikeCount] = useState(0); // 좋아요 수
   const [comments, setComments] = useState<Comment[]>([]); // 댓글 목록
   const [commentCount, setCommentCount] = useState<number>(0);
   const [postDetail, setPostDetail] = useState<PostDetail | null>(null);
   const [showReplyInputs, setShowReplyInputs] = useState<{
      [key: string]: boolean;
   }>({});

   const fetchPostDetail = async () => {
      try {
         const res = await customFetch(
            `/boards/${postId}/full`,
            {
               method: 'GET',
            },
            navigate,
         );

         if (!res) {
            alert('게시글을 불러오는데 실패하였습니다.');
            throw new Error('게시글을 불러오는데 실패하였습니다.');
         }
         console.log(res);
         setPostDetail(res);
         setComments(res.comments);
         setLiked(res.liked);
         setLikeCount(res.likeCount);
         setCommentCount(res.commentCount);
      } catch (err) {
         navigate(-1);
         console.log(err);
      }
   };

   if (!postDetail) {
      fetchPostDetail();
   }

   const deletePost = async () => {
      const confirmed = window.confirm('정말로 이 게시글을 삭제하시겠습니까?');
      if (!confirmed) return;
      try {
         await customFetch(
            `/boards/${postId}`,
            {
               method: 'DELETE',
            },
            navigate,
         );
         alert('게시글이 삭제되었습니다.');
         navigate(-1); //이전페이지로
      } catch (err) {
         console.log(err);
         alert('삭제에 실패했습니다')
      }
   };

   const handleSubmitComment = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!inputRef.current || !inputRef.current.value) return;

      try {
         await customFetch(
            `/comments/${postId}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  accept: 'application/json',
               },
               body: JSON.stringify({
                  content: inputRef.current.value,
               }),
            },
            navigate,
         );
         inputRef.current.value = '';
         await fetchPostDetail();
         setCommentCount(prev => prev + 1);
      } catch (error) {
         console.log(error);
      }
   };

   const fetchPostLike = () => {
      customFetch(
         `/likes/${postId}`,
         {
            method: 'POST',
         },
         navigate,
      );
   };

   const fetchCancelPostLike = () => {
      fetch(`/api/v1/likes/${postId}`, {
         method: 'DELETE',
      });
   };

   const handleLikeClick = () => {
      if (liked) {
         setLikeCount(prev => prev - 1);
         fetchCancelPostLike();
      } else {
         setLikeCount(prev => prev + 1);
         fetchPostLike();
      }
      setLiked(prev => !prev);
   };

   const handleReplySubmit = async (commentId: string, e: React.FormEvent) => {
      e.preventDefault();
      const replyInput = replyInputRefs.current[commentId];
      if (!replyInput || !replyInput.value) return;

      try {
         await customFetch(
            `/comments/${postId}`,
            {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
                  accept: 'application/json',
               },
               body: JSON.stringify({
                  content: replyInput.value,
                  parentId: commentId,
               }),
            },
            navigate,
         );

         replyInput.value = '';
         await fetchPostDetail();
         setCommentCount(prev => prev + 1);
         setShowReplyInputs(prev => ({ ...prev, [commentId]: false }));
      } catch (error) {
         console.log(error);
      }
   };

   const toggleReplyInput = (commentId: string) => {
      setShowReplyInputs(prev => ({
         ...prev,
         [commentId]: !prev[commentId],
      }));
   };

   if (!postDetail) {
      return <div>게시글 불러오는 중...</div>;
   }

   return (
      <Container>
         {/* 헤더 */}
         <TopBar>
            <BackButton onClick={() => navigate(-1)}>
               <img
                  src={LeftArrow}
                  alt="back"
                  style={{ width: '24px', height: '24px' }}
               />
            </BackButton>
            <TitleText>제로픽</TitleText>
            <MenuWrapper>
               <HiOutlineDotsVertical
                  onClick={() => setShowMenu(prev => !prev)}
                  style={{ cursor: 'pointer' }}
               />
               {showMenu && (
                  <DropdownMenu>
                     {name === postDetail.nickname ? (
                        <>
                           <DropdownItem
                              onClick={() =>
                                 navigate(`/community/edit/${postId}`)
                              }>
                              수정
                           </DropdownItem>
                           <DropdownItem onClick={deletePost}>
                              삭제
                           </DropdownItem>
                        </>
                     ) : (
                        <>
                           <DropdownItem
                              onClick={() => {
                                 handleLikeClick();
                                 setShowMenu(false);
                              }}>
                              좋아요
                           </DropdownItem>
                           <DropdownItem onClick={() => alert('신고 클릭')}>
                              신고
                           </DropdownItem>
                        </>
                     )}
                  </DropdownMenu>
               )}
            </MenuWrapper>
         </TopBar>

         <ContentWrapper>
            {/* 게시글 내용 */}
            <PostContainer>
               <Box>
                  <Icon src={logoIcon} />
                  <div>
                     <Nickname>{postDetail.nickname}</Nickname>
                     <DateText>{postDetail.createdDate}</DateText>
                  </div>
               </Box>
               <PostTitle>{postDetail.title}</PostTitle>
               <Content>{postDetail.content}</Content>
               <img src={postDetail.postImage} />
               <IconRow>
                  <IconWithText
                     onClick={handleLikeClick}
                     style={{ cursor: 'pointer' }}>
                     <img
                        src={liked ? FavoriteFillIcon : FavoriteBorderIcon}
                        alt="like"
                        style={{ width: '16px', height: '16px' }}
                     />
                     {likeCount}
                  </IconWithText>
                  <IconWithText>
                     <FaRegComment
                        style={{
                           color: 'black',
                           width: '16px',
                           height: '16px',
                        }}
                     />
                     {commentCount}
                  </IconWithText>
               </IconRow>
            </PostContainer>

            {/* 댓글 */}
            <CommentList>
               {comments.map(c => (
                  <CommentThread key={c.id}>
                     <CommentItem>
                        <CommentNickname>{c.username}</CommentNickname>
                        <CommentText>{c.content}</CommentText>
                     </CommentItem>

                     {c.replies.length > 0 && (
                        <ReplySection>
                           {c.replies.map(reply => (
                              <ReplyItem key={reply.id}>
                                 <CommentNickname>
                                    {reply.username}
                                 </CommentNickname>
                                 <CommentText>{reply.content}</CommentText>
                              </ReplyItem>
                           ))}
                        </ReplySection>
                     )}

                     <ReplyButton onClick={() => toggleReplyInput(c.id)}>
                        답글 달기
                     </ReplyButton>

                     <ReplyInputWrapper
                        onSubmit={e => handleReplySubmit(c.id, e)}
                        style={{
                           visibility: showReplyInputs[c.id]
                              ? 'visible'
                              : 'hidden',
                           height: showReplyInputs[c.id] ? '40px' : '0',
                           margin: showReplyInputs[c.id] ? '0.5rem 0' : '0',
                           opacity: showReplyInputs[c.id] ? 1 : 0,
                           transition: 'all 0.2s ease-in-out',
                        }}>
                        <ReplyInput
                           ref={(el: HTMLInputElement | null) => {
                              replyInputRefs.current[c.id] = el;
                           }}
                           placeholder="답글을 입력해주세요"
                        />
                        <ReplySubmitButton type="submit">
                           확인
                        </ReplySubmitButton>
                     </ReplyInputWrapper>
                  </CommentThread>
               ))}
            </CommentList>

            {/* 댓글 입력 */}
            <CommentInputArea onSubmit={handleSubmitComment}>
               <InputWrapper>
                  <Input ref={inputRef} placeholder="댓글을 입력해주세요" />
                  <SubmitInlineButton type="submit">확인</SubmitInlineButton>
               </InputWrapper>
            </CommentInputArea>
         </ContentWrapper>
      </Container>
   );
};

export default PostDetailPage;
const Box = styled.div`
   display: flex;
   align-items: center;
   gap: 10px;
`;
const Icon = styled.img`
   width: 38px;
`;
const DateText = styled(SubText)`
   color: gray;
   font-size: 0.8rem;
`;
const Container = styled.div`
   display: flex;
   flex-direction: column;
   min-height: 100vh;
`;

const ContentWrapper = styled.div`
   flex: 1;
   padding: 1rem;
   padding-bottom: calc(
      1rem + 140px
   ); // 하단 네비게이션 바 + 댓글 입력창 높이만큼 여백 추가
   font-family: Arial, sans-serif;
   display: flex;
   flex-direction: column;
   gap: 1rem;
   overflow-y: auto;
`;

const MenuWrapper = styled.div`
   position: relative;
`;

const DropdownMenu = styled.div`
   position: absolute;
   top: 30px;
   right: 0;
   background-color: white;
   border: 1px solid #ddd;
   border-radius: 6px;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
   z-index: 100;
   width: 100px;
`;

const DropdownItem = styled.button`
   display: block;
   width: 100%;
   padding: 0.5rem 1rem;
   background: none;
   border: none;
   text-align: left;
   font-size: 0.9rem;
   cursor: pointer;

   &:hover {
      background-color: #f5f5f5;
   }
`;

const TopBar = styled.div`
   display: flex;
   justify-content: space-between;
   align-items: center;
   padding: 1rem;
   background-color: white;
   border-bottom: 1px solid #eee;
   position: sticky;
   top: 0;
   z-index: 100;
`;

const BackButton = styled.button`
   background: none;
   border: none;
   font-size: 1.2rem;
   cursor: pointer;
`;

const TitleText = styled.h1`
   font-size: 1rem;
`;

const PostContainer = styled.div`
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
`;

const PostTitle = styled.h2`
   font-size: 1.3rem;
   margin: 0;
`;

const Nickname = styled.span`
   font-size: 0.9rem;
   font-weight: bold;
`;

const Content = styled.p`
   font-size: 0.9rem;
   color: #333;
   width: 100%;
   word-wrap: break-word;
   word-break: break-word;
   white-space: pre-wrap;
   margin-top: 0;
`;

// const ImageBox = styled.div`
//   width: 100%;
//   height: 120px;
//   background-color: #e0e0e0;
//   border-radius: 6px;
// `;

const IconRow = styled.div`
   display: flex;
   gap: 1rem;
   margin-top: 0.5rem;
`;

const IconWithText = styled.div`
   display: flex;
   align-items: center;
   gap: 0.3rem;
   font-size: 0.85rem;
`;

const CommentList = styled.div`
   border-top: 1px solid #ddd;
   padding-top: 1rem;
`;

const CommentThread = styled.div`
   margin-bottom: 1.5rem;
   padding: 1rem;
   border: 1px solid #eee;
   border-radius: 8px;
   background-color: #fff;
`;

const CommentItem = styled.div`
   margin-bottom: 0.75rem;
`;

const CommentNickname = styled.div`
   font-weight: bold;
   font-size: 0.9rem;
`;

const CommentText = styled.div`
   font-size: 0.85rem;
   color: #333;
`;

const CommentInputArea = styled.form`
   border-top: 1px solid #ddd;
   padding-top: 1rem;
   position: fixed;
   bottom: 60px; // 네비게이션 바 높이만큼 위로 올림
   left: 0;
   right: 0;
   background-color: white;
   padding: 1rem;
   z-index: 100;
   box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const InputWrapper = styled.div`
   position: relative;
   width: 100%;
`;

const Input = styled.input`
   width: 100%;
   padding: 0.5rem 3.5rem 0.5rem 0.75rem;
   font-size: 0.9rem;
   border: 1px solid #ccc;
   border-radius: 20px;
   box-sizing: border-box;
`;

const SubmitInlineButton = styled.button`
   position: absolute;
   right: 12px;
   top: 50%;
   transform: translateY(-50%);
   background: none;
   border: none;
   font-size: 0.85rem;
   color: #333;
   cursor: pointer;
   line-height: 1;
`;

const ReplySection = styled.div`
   margin: 0.75rem 0;
   padding-left: 1rem;
   border-left: 2px solid #eee;
`;

const ReplyItem = styled.div`
   margin-bottom: 0.5rem;
   padding: 0.5rem;
   background-color: #f9f9f9;
   border-radius: 4px;
`;

const ReplyInputWrapper = styled.form`
   position: relative;
   width: 100%;
   overflow: hidden;
`;

const ReplyInput = styled.input`
   width: 100%;
   padding: 0.5rem 3.5rem 0.5rem 0.75rem;
   font-size: 0.9rem;
   border: 1px solid #ccc;
   border-radius: 20px;
   box-sizing: border-box;
`;

const ReplySubmitButton = styled.button`
   position: absolute;
   right: 12px;
   top: 50%;
   transform: translateY(-50%);
   background: none;
   border: none;
   font-size: 0.85rem;
   color: #333;
   cursor: pointer;
   line-height: 1;
`;

const ReplyButton = styled.button`
   background: none;
   border: none;
   color: #888;
   font-size: 0.85rem;
   padding: 0;
   margin: 0.5rem 0;
   cursor: pointer;
   text-decoration: underline;
   height: 40px;
   display: flex;
   align-items: center;

   &:hover {
      color: #666;
   }
`;
