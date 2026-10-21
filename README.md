# 제로픽 (ZeroPick)

**식품의 원재료와 대체당 정보를 확인하고, 재료 기반 레시피와 사용자 경험을 함께 탐색하는 모바일 중심 웹 애플리케이션**

제로픽은 원재료 이미지 분석, 식품 검색, 레시피 추천·저장, 커뮤니티를 하나의 서비스로 연결합니다. 프런트엔드는 이미지 전처리, API 요청 흐름, 결과 시각화, 탐색 상태와 사용자 인터랙션을 구현합니다. OCR 인식과 감미료 매칭, 레시피 추천·생성은 별도 백엔드 API를 통해 제공받습니다.

https://github.com/user-attachments/assets/0050635e-f7a9-4a8f-9a94-6f8c55bb1e23

## 기술 스택과 적용 영역

| 기술 | 실제 적용 |
| --- | --- |
| React 19 · TypeScript 5.7 | 기능별 페이지와 공통 컴포넌트 구성, 식품·영양성분·게시글 데이터 타입 정의 |
| Vite 6 · SWC | React 애플리케이션 빌드와 `@/` 경로 별칭 설정 |
| React Router 7 | 중첩 라우트, 공통 하단 내비게이션, 분석·레시피 화면 간 데이터 전달 |
| TanStack Query 5 | 검색어별 식품 목록 캐시와 페이지 단위 데이터 조회 |
| Intersection Observer | 식품 검색·저장 목록과 커뮤니티의 스크롤 기반 추가 조회 |
| Zustand 5 | 레이아웃·설정·게시글 상세에서 사용하는 사용자 이름과 이메일 공유 |
| React Hook Form · Yup | 로그인·회원가입 입력 검증과 필드별 오류 표시 |
| react-cropper | OCR 요청 전 사용자가 분석할 이미지 영역 선택 |
| TanStack Table 8 | 영양성분 행·열 모델 구성과 셀 렌더링 |
| styled-components 6 | 공통 레이아웃·카드·폼·모달 스타일과 상태별 UI 표현 |
| Framer Motion · React Transition Group | 감미료 정보 펼침, 모달 진입·종료, 라우트 전환 애니메이션 |
| Vercel | API 경로 프록시와 SPA 경로 rewrite 설정 |

## 주요 기술 구현

### 1. 이미지 크롭부터 분석 실패 복구까지 연결한 OCR 흐름

이미지를 업로드하는 화면에서 끝나지 않고, **영역 선택 → 식품 확인 → 영양성분·감미료 조회**를 단계별로 연결했습니다.

1. 홈에서 선택한 파일을 `URL.createObjectURL()`로 변환하고, Router state로 크롭 화면에 전달합니다.
2. `react-cropper`의 `viewMode={1}`로 크롭 영역을 이미지 내부로 제한합니다.
3. `getCroppedCanvas().toDataURL()`로 선택 영역을 추출하고, Blob으로 변환해 `FormData`의 `file` 필드로 전송합니다.
4. `/ocr/scan` 응답의 상품명과 제조사를 확인 모달에 표시하고, 사용자가 확인하면 분석 결과 화면으로 이동합니다.
5. 분석 화면은 식품 ID가 있으면 `/foods/{id}`, 없으면 품목제조보고번호 기반 상세 조회를 사용합니다. 감미료 매칭은 `/ocr/confirm`으로 별도 요청합니다.

**OCR 실패 시 수동 조회로 이어지는 경로**도 구현했습니다. 오류 응답의 `detail`을 `useRef`에 보관하고 품목제조보고번호 입력창을 표시합니다. 사용자가 번호를 입력하면 상품명을 다시 조회하고, 보관한 오류 상세를 `ocrText`로 전달해 후속 확인 요청에 사용합니다.

이 흐름은 이미지 처리, 서버 응답, 사용자 확인, 실패 후 대체 입력을 하나의 분석 과정으로 구성한 부분입니다.

구현: [HomePage](ZeroPick/src/pages/Home/HomePage.tsx) · [CameraPage](ZeroPick/src/pages/Home/CameraPage.tsx) · [식품 확인 모달](ZeroPick/src/components/Modal/Modal.tsx) · [AnalysisPage](ZeroPick/src/pages/Home/AnalysisPage.tsx)

### 2. 검색어별 캐시와 스크롤 감지를 결합한 식품 검색

식품 검색은 `useInfiniteQuery`와 `react-intersection-observer`를 조합해 구현했습니다.

- `queryKey: ['ProductList', keyword]`로 검색어마다 조회 데이터를 구분합니다.
- `initialPageParam: 0`에서 시작하고, 마지막 응답 배열이 10개 이상이면 다음 페이지 번호를 반환합니다. 10개 미만이면 추가 조회를 종료합니다.
- 목록 하단의 감지 요소가 화면에 들어오고 `hasNextPage`가 참이면 `fetchNextPage()`를 호출합니다.
- `data.pages`에 누적된 페이지를 렌더링하고, 조회 중에는 공통 `LoadingIndicator`를 표시합니다.
- 검색어는 `sessionStorage`에 보관해 검색 화면에 다시 진입할 때 입력값을 복원합니다. 빈 검색어의 API 요청에는 기본값 `제로`를 사용합니다.

입력값 변경은 Query key 변경으로 이어지며, 별도 검색 버튼 없이 검색 결과를 갱신합니다. 저장 식품·레시피 화면에도 `useInfiniteQuery`와 하단 감지 요소를 사용하는 조회 코드가 있습니다.

커뮤니티 목록은 별도로 브라우저의 `IntersectionObserver`와 `page`, `hasMore`, `loading` 상태를 사용합니다. 카테고리가 바뀌면 목록과 페이지 상태를 초기화하고, 서버 응답의 `content`를 누적하며 `last`로 종료 여부를 판단합니다.

구현: [SearchPage](ZeroPick/src/pages/Search/SearchPage.tsx) · [LoadingIndicator](ZeroPick/src/components/LoadingIndicator.tsx) · [CommunityPage](ZeroPick/src/pages/Community/CommunityPage.tsx)

### 3. 영양성분 데이터 변환과 분석·검색 화면의 표시 로직 재사용

OCR 분석 결과와 검색한 식품 상세는 서로 다른 진입 경로를 사용하지만, 영양성분과 감미료를 표시하는 컴포넌트를 공유합니다.

| 계층 | 역할 |
| --- | --- |
| `NutrientData` · `ExtendedNutrientData` | 영양성분 수치, 기준치 비율, 선택적 당 성분과 식품 식별 정보 정의 |
| `createNutrientTableData()` | API 데이터에 단위와 비율 문자열, 하위 항목 들여쓰기 정보를 붙여 표시용 행 배열로 변환 |
| `NutrientTable` | TanStack Table의 열 정의와 행 모델로 영양성분명·함량·기준치 비율 렌더링 |
| `SugarComponents` · `SugarBox` | 감미료 개수와 종류를 표시하고 상세 설명을 펼치는 UI 구성 |
| `FoodImg` · `Scrapped` | 식품 이미지 표시와 저장 여부 조회·저장 인터랙션 재사용 |

영양성분표는 당류·지방 등 항목군에 따라 배경색을 달리하고, 포화지방·트랜스지방·세부 당 성분에는 들여쓰기를 적용합니다. 선택적 당 성분이 없는 경우에는 변환된 값이 `undefined g`인 행을 제외합니다. 이 필터는 **0인 영양성분을 숨기는 처리와는 다릅니다**.

감미료 카드는 이름·분류·열량을 우선 표시하고, 펼치면 GI 지수·설명·부작용을 보여줍니다. 설명과 부작용 문자열은 마침표 기준으로 나누어 항목화하며, Framer Motion으로 높이와 투명도를 전환합니다.

구현: [영양성분 타입·변환 함수](ZeroPick/src/type/nutritientData.ts) · [NutrientTable](ZeroPick/src/components/NutrientTable.tsx) · [SugarBox](ZeroPick/src/components/SugarBox.tsx) · [ProductDetailPage](ZeroPick/src/pages/Search/ProductDetailPage.tsx)

### 4. 추천과 상세 생성을 나눈 레시피 요청 흐름

레시피는 **재료 입력 → 추천 목록 → 선택한 레시피 상세 생성 → 저장**의 두 단계 생성 흐름으로 구성했습니다.

| 단계 | 요청과 처리 |
| --- | --- |
| 추천 목록 | 입력한 재료를 `/recipes/suggest`로 보내 제목과 재료 목록을 조회 |
| 새 레시피 상세 | 선택한 제목과 재료를 `/recipes/createRecipe`로 보내 조리 단계 생성 요청 |
| 저장 레시피 상세 | 식별자 `id`가 있는 항목은 `/recipes/{id}`에서 조회 |
| 저장 | 제목·재료·조리 단계를 `/recipes`로 전송 |
| 재탐색 | 최근 저장 목록을 `/recipes/recent`로 조회하고 공통 카드로 표시 |

추천에 사용한 재료와 응답을 `recipeKeyword`, `recipeData`로 `sessionStorage`에 보관합니다. 같은 재료로 목록에 재진입하면 저장된 추천 결과를 사용합니다. 새로 생성한 상세도 제목을 키로 보관해 같은 제목으로 재진입했을 때 재사용합니다.

`RecipeBox`는 추천 응답의 `string[]`와 상세 응답의 `{ name: string }[]`를 구분해 재료명을 표시합니다. 상세 화면에서는 줄바꿈과 `. ` 구분자로 조리 단계 문자열을 나누어 번호와 내용을 렌더링합니다.

구현: [RecipeListPage](ZeroPick/src/pages/Recipe/RecipeListPage.tsx) · [RecipeDetailPage](ZeroPick/src/pages/Recipe/RecipeDetailPage.tsx) · [RecipeBox](ZeroPick/src/components/Recipe/RecipeBox.tsx)

### 5. 이미지와 JSON을 함께 보내는 커뮤니티 작성·수정

게시글은 제로 상품 리뷰·레시피·자유 게시판으로 구분하며, 텍스트와 이미지가 결합된 등록·수정 요청을 처리합니다.

- 제목·내용·카테고리를 검사하고, 누락된 항목은 공통 오류 모달로 안내합니다.
- `FileReader.readAsDataURL()`로 선택한 이미지의 미리보기를 표시하고, 첨부 취소 시 파일과 미리보기 상태를 비웁니다.
- 제목·내용·카테고리를 `application/json` 타입 Blob으로 만들어 `FormData`의 `request` 필드에 추가합니다. 이미지 파일은 `image` 필드로 함께 전송합니다.
- 카테고리 코드는 공통 `categoryMap`으로 관리해 목록 탭과 작성·수정 화면에서 같은 한글 이름을 사용합니다.

게시글 상세는 댓글별 답글 입력창·수정 모드·수정 내용·메뉴 상태를 **댓글 ID를 키로 하는 객체**로 관리합니다. 대댓글 작성 시 `parentId`를 보내고, 작성·수정 후 상세 정보를 다시 조회합니다. 삭제 성공 시에는 로컬 댓글 배열과 개수를 갱신하며, 부모 댓글 삭제는 포함된 답글 수도 반영합니다.

목록 카드의 좋아요 버튼에는 `stopPropagation()`을 적용해 좋아요 클릭이 게시글 상세 이동으로 이어지지 않도록 처리했습니다.

구현: [WritePostPage](ZeroPick/src/pages/Community/WritePostPage.tsx) · [EditPostPage](ZeroPick/src/pages/Community/EditPostPage.tsx) · [PostDetailPage](ZeroPick/src/pages/Community/PostDetailPage.tsx) · [CommunityItem](ZeroPick/src/components/CommunityItem.tsx)

### 6. 쿠키 인증과 응답 해석을 모은 공통 요청 함수

`customFetch()`는 `/api/v1` 기준 경로와 `credentials: 'include'`를 적용하는 공통 요청 함수입니다.

- `401` 응답이면 로그인 화면으로 이동하고 세션에 저장한 선택 내비게이션을 초기화합니다.
- 응답 본문을 텍스트로 읽은 뒤 JSON 파싱을 시도합니다. JSON이 아니면 문자열을 반환하므로 텍스트·빈 본문 응답도 처리합니다.
- 그 외 실패 응답은 `Error`에 `status`, `statusText`, `detail`, `errorCode`, `raw`를 추가해 호출부로 전달합니다. OCR 화면은 이 중 `detail`을 후속 수동 조회에 사용합니다.
- 호출부가 헤더와 본문을 지정하므로 JSON 요청과 multipart 요청을 같은 함수로 처리합니다.

공통 함수는 여러 기능에서 사용하며, 커뮤니티 목록과 상세의 일부 요청은 직접 `fetch`를 사용합니다.

로그인·회원가입은 React Hook Form과 Yup resolver를 연결합니다. 회원가입에서는 이메일 형식, 비밀번호 8~16자, 비밀번호 확인 일치를 검사하고, 전송 시 확인용 `passwordCheck`를 제외합니다.

구현: [customFetch](ZeroPick/src/hooks/CustomFetch.tsx) · [LoginPage](ZeroPick/src/pages/LoginPage.tsx) · [SignUpPage](ZeroPick/src/pages/SignUpPage.tsx)

### 7. 데이터의 사용 범위에 따른 상태 관리

| 상태 | 저장 위치 | 적용 사례 |
| --- | --- | --- |
| 페이지 단위 서버 목록 | TanStack Query | 검색어별 식품 목록, 저장 목록 조회 |
| 여러 화면이 공유하는 사용자 정보 | Zustand | 이름·이메일을 레이아웃, 설정, 게시글 상세에서 사용 |
| 탭 세션 내 탐색 정보 | `sessionStorage` | 검색어, 선택 내비게이션, 레시피 추천·상세 결과와 저장 표시 |
| 화면 이동 시 전달 데이터 | Router state | 크롭할 이미지 URL, 분석 식별 정보, 추천 재료와 선택 레시피 |
| 화면 내부 인터랙션 | `useState` · `useRef` | 모달 표시, 크롭 인스턴스, 댓글 입력창, 감미료 카드 펼침 |

`RootLayout`은 이름이나 이메일이 없으면 `/user`를 조회해 Zustand에 저장합니다. 이 저장소에는 이름·이메일 설정과 초기화 함수가 있으며, 영속화 미들웨어는 적용하지 않았습니다.

구현: [사용자 store](ZeroPick/src/stores/user.ts) · [RootLayout](ZeroPick/src/layout/RootLayout.tsx) · [App](ZeroPick/src/App.tsx)

### 8. 모바일 화면 구성과 상태 전환 표현

`RootLayout`의 중첩 라우트와 `Outlet`으로 홈·검색·레시피·커뮤니티·설정 화면에 공통 하단 내비게이션을 제공합니다. 크롭과 분석 결과는 별도 라우트로 구성합니다. 공통 콘텐츠 영역은 `100dvh`에서 내비게이션 높이 70px을 뺀 높이와 내부 세로 스크롤을 사용합니다.

화면 이동은 `location.pathname`을 키로 한 `CSSTransition`과 300ms 투명도 전환을 적용합니다. 경로별 DOM ref는 Map에 보관해 `nodeRef`로 전달합니다. 공통 모달은 `AnimatePresence`로 투명도와 크기를 전환하고, 감미료 상세 카드는 높이 전환으로 정보의 펼침·접힘을 표현합니다.

식품과 레시피 이미지는 `FoodImg`를 공유합니다. 상품명으로 이미지 검색 API를 호출한 뒤, 반환된 외부 URL을 백엔드 `/proxy` 경로로 요청해 표시할 이미지 주소를 얻습니다.

구현: [공통 스타일](ZeroPick/src/components/styles/common.ts) · [라우트 전환](ZeroPick/src/App.tsx) · [전환 CSS](ZeroPick/src/styles.css) · [AnimatedModalWrapper](ZeroPick/src/components/Modal/AnimatedModalWrapper.tsx) · [이미지 조회](ZeroPick/src/hooks/FetchImg.tsx)

## 코드 구성

```text
ZeroPick/src/
├── pages/
│   ├── Home/          # 이미지 선택·크롭·OCR 분석 결과
│   ├── Search/        # 식품 무한 스크롤 검색·상세
│   ├── Recipe/        # 재료 입력·추천 목록·레시피 상세
│   ├── Community/     # 게시글 작성·수정·상세·댓글
│   └── Setting/       # 프로필·저장 목록·개인 게시글
├── components/
│   ├── Modal/         # 식품 확인·오류·삭제·로그아웃 모달
│   ├── Recipe/        # 추천·저장 목록 공용 레시피 카드
│   └── styles/        # 폼·컨테이너·카드·모달 공통 스타일
├── hooks/             # 공통 요청·이미지 검색·뉴스 조회
├── stores/            # 사용자 전역 상태
├── type/              # 영양정보 변환·게시글 타입·카테고리 매핑
├── layout/            # 중첩 라우트 공통 레이아웃
└── App.tsx            # QueryClient Provider·라우팅·화면 전환
```

## 팀

| 김규리 | 임용진 |
| :---: | :---: |
| Frontend | Frontend |
