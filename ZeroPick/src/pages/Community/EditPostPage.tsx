import React, { useRef, useState, ChangeEvent } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { Button as BaseButton } from '@/components/styles/common';
import LeftArrow from '@/assets/Left Arrow.svg';
import { categoryMap } from '@/type/community';
import { customFetch } from '@/hooks/CustomFetch';
import { ErrorModal } from '@/components/ErrorModal';

const EditPostPage: React.FC = () => {
   const { postId } = useParams();
   const navigate = useNavigate();
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [category, setCategory] = useState<string>('');
   const [image, setImage] = useState<File | null>(null);
   const [imagePreview, setImagePreview] = useState<string | null>(null);
   const imageInputRef = useRef<HTMLInputElement>(null);
   const [error, setError] = useState('');

   const fetchPostDetail = async () => {
      try {
         const res = await customFetch(
            `/boards/${postId}/full`,
            {
               method: 'GET',
               headers: { accept: 'application/json' },
            },
            navigate,
         );

         if (!res) {
            alert('게시글을 불러오는데 실패하였습니다.');
            throw new Error('게시글을 불러오는데 실패하였습니다.');
         }

         setTitle(res.title);
         setContent(res.content);
         setImagePreview(res.postImage);
      } catch (err) {
         navigate(-1);
         console.log(err);
      }
   };

   if (!title && !content) {
      fetchPostDetail();
   }

   const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files[0]) {
         const file = files[0];
         setImage(file);
         const reader = new FileReader();
         reader.onloadend = () => {
            setImagePreview(reader.result as string);
         };
         reader.readAsDataURL(file);
      }
   };

   const handleDeleteImage = () => {
      setImage(null);
      setImagePreview(null);
      if (imageInputRef.current) {
         imageInputRef.current.value = '';
      }
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim() || !content.trim() || !category) {
         setError('제목, 내용, 카테고리를 모두 입력/선택해주세요.');
         return;
      }
      setError('');
      const formData = new FormData();
      if (image) {
         formData.append('image', image);
      }
      const request = {
         content,
         categoryName: category,
         title,
      };
      const blob = new Blob([JSON.stringify(request)], {
         type: 'application/json',
      });
      formData.append('request', blob);

      try {
         if (!postId) {
            setError('게시글 ID가 없습니다.');
            return;
         }
         await fetch(`/api/v1/boards/${postId}`, {
            method: 'PUT',
            body: formData,
            headers: {},
         });
         navigate(-2);
      } catch (err) {
         console.log(err);
         setError('게시글 수정에 실패했습니다.');
      }
   };

   return (
      <PageContainer>
         <Header>
            <BackButton onClick={() => navigate(-1)}>
               <img
                  src={LeftArrow}
                  alt="back"
                  style={{ width: '24px', height: '24px' }}
               />
            </BackButton>
            <HeaderTitle>게시글 수정</HeaderTitle>
            <HeaderSpacer />
         </Header>
         <FormContainer onSubmit={handleSubmit}>
            {error && (
               <ErrorModal message={error} onClose={() => setError('')} />
            )}
            <FormGroup>
               <Label>제목</Label>
               <Input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
               />
            </FormGroup>
            <FormGroup>
               <Label>내용</Label>
               <TextArea
                  value={content}
                  onChange={e => setContent(e.target.value)}
               />
            </FormGroup>
            <FormGroup>
               <Label>카테고리</Label>
               <CategoryChipContainer>
                  {Object.entries(categoryMap).map(([key, label]) => (
                     <CategoryChip
                        key={key}
                        selected={category === key}
                        onClick={() => setCategory(key)}
                        type="button">
                        <input
                           type="radio"
                           name="category"
                           value={key}
                           checked={category === key}
                           onChange={() => setCategory(key)}
                           style={{ display: 'none' }}
                        />
                        {label}
                     </CategoryChip>
                  ))}
               </CategoryChipContainer>
            </FormGroup>
            <FormGroup>
               <Label>이미지</Label>
               <ImageUploadRow>
                  <ImageSkeletonButton htmlFor="imageUpload">
                     +
                     <ImageInput
                        ref={imageInputRef}
                        id="imageUpload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                     />
                  </ImageSkeletonButton>
                  {imagePreview && (
                     <ImagePreviewWrapper>
                        <ImagePreview src={imagePreview} alt="uploaded" />
                        <DeleteImageButton onClick={handleDeleteImage}>
                           ×
                        </DeleteImageButton>
                     </ImagePreviewWrapper>
                  )}
               </ImageUploadRow>
            </FormGroup>
            <SubmitButton type="submit">수정 완료</SubmitButton>
         </FormContainer>
      </PageContainer>
   );
};

export default EditPostPage;

const CHIP_PRIMARY_COLOR = '#ff9eb3';
const CHIP_PRIMARY_BG = '#ffe3ec';

const SubmitButton = styled(BaseButton)`
   margin-top: 1rem;
`;

const CategoryChip = styled.button<{ selected: boolean }>`
   padding: 0.5rem 1rem;
   border-radius: 20px;
   border: 1.5px solid
      ${props => (props.selected ? CHIP_PRIMARY_COLOR : '#ccc')};
   background: ${props => (props.selected ? CHIP_PRIMARY_BG : '#f7f7f7')};
   color: ${props => (props.selected ? CHIP_PRIMARY_COLOR : '#333')};
   font-size: 0.95rem;
   cursor: pointer;
   outline: none;
   transition: all 0.2s;
   font-weight: 500;
`;

const PageContainer = styled.div`
   font-family: Arial, sans-serif;
   padding: 1rem;
   background-color: #f9f9f9;
   min-height: 100vh;
   padding-bottom: 100px;
`;

const Header = styled.header`
   display: flex;
   align-items: center;
   justify-content: space-between;
   border-bottom: 1px solid #eee;
   padding-bottom: 1rem;
   margin-bottom: 1rem;
`;

const BackButton = styled.button`
   background: none;
   border: none;
   font-size: 1.5rem;
   cursor: pointer;
`;

const HeaderTitle = styled.h1`
   font-size: 1.5rem;
   margin: 0;
   text-align: center;
   flex: 1;
`;

const HeaderSpacer = styled.div`
   width: 1.5rem;
`;

const FormContainer = styled.form`
   display: flex;
   flex-direction: column;
   gap: 1.5rem;
`;

const FormGroup = styled.div`
   display: flex;
   flex-direction: column;
   gap: 0.5rem;
`;

const Label = styled.label`
   font-size: 1rem;
   font-weight: bold;
`;

const Input = styled.input`
   padding: 0.75rem;
   border: 1px solid #ccc;
   border-radius: 8px;
   font-size: 1rem;
`;

const TextArea = styled.textarea`
   padding: 0.75rem;
   border: 1px solid #ccc;
   border-radius: 8px;
   font-size: 1rem;
   height: 150px;
   resize: none;
   font-family: Regular;
`;

const CategoryChipContainer = styled.div`
   display: flex;
   gap: 0.5rem;
   flex-wrap: wrap;
   margin-bottom: 0.5rem;
`;

const ImageInput = styled.input`
   display: none;
`;

const ImageUploadRow = styled.div`
   display: flex;
   align-items: center;
   gap: 1rem;
`;

const ImageSkeletonButton = styled(BaseButton).attrs({ as: 'label' })`
   width: 80px;
   height: 80px;
   background: #f0f0f0;
   border: 1px dashed #ccc;
   display: flex;
   align-items: center;
   justify-content: center;
   font-size: 2rem;
   color: #bbb;
   cursor: pointer;
   padding: 0;
`;

const ImagePreviewWrapper = styled.div`
   position: relative;
   width: 80px;
   display: inline-block;
`;

const ImagePreview = styled.img`
   width: 80px;
   height: 80px;
   object-fit: cover;
   border-radius: 8px;
`;

const DeleteImageButton = styled.button`
   position: absolute;
   top: -5px;
   right: -5px;
   background: rgba(0, 0, 0, 0.7);
   color: #fff;
   border: none;
   border-radius: 50%;
   width: 20px;
   height: 20px;
   font-size: 0.8rem;
   cursor: pointer;
`;
