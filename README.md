# 제로픽 (ZeroPick) Frontend

제로 제품의 원재료를 확인하고, 식품 영양정보와 감미료 정보를 살펴보며, 재료 기반 레시피와 사용자 후기를 공유하는 React 웹 애플리케이션입니다. 모바일 화면을 중심으로 구성하며 홈·검색·레시피·커뮤니티·설정의 하단 내비게이션을 제공합니다.

이 문서는 저장소의 프런트엔드 구현과 설정을 기준으로 작성했습니다. OCR 인식, 식품 데이터 조회, 레시피 추천·생성은 별도 백엔드 API에 요청하며, 이 저장소에는 백엔드 구현이 포함되어 있지 않습니다.

## 목차

- [주요 기능](#주요-기능)
- [기술 구성](#기술-구성)
- [로컬 실행](#로컬-실행)
- [명령어](#명령어)
- [폴더 구조](#폴더-구조)
- [화면과 라우팅](#화면과-라우팅)
- [주요 동작 흐름](#주요-동작-흐름)
- [API 연동](#api-연동)
- [상태 관리와 데이터 모델](#상태-관리와-데이터-모델)
- [배포](#배포)
- [개발 시 확인 사항](#개발-시-확인-사항)
- [협업 규칙](#협업-규칙)

## 주요 기능

| 영역 | 구현 내용 |
| --- | --- |
| 회원 | 이메일·비밀번호 로그인, 회원가입, 이름 변경, 로그아웃 |
| 홈 | 원재료 이미지 선택, 뉴스 목록 표시 |
| OCR 분석 | 이미지 영역 자르기, OCR 업로드, 인식 실패 시 품목제조보고번호 직접 입력, 식품 확인 모달 |
| 식품 정보 | 상품명 검색, 무한 스크롤, 식품 상세 영양성분표, 감미료 정보, 식품 스크랩 |
| 레시피 | 재료 입력으로 추천 요청, 재료·조리 단계 생성 요청, 최근 저장 레시피, 스크랩·삭제 |
| 커뮤니티 | 카테고리별 목록, 이미지 첨부 게시글 작성·수정·삭제, 좋아요, 댓글·대댓글 작성 및 수정·삭제 |
| 설정 | 사용자 이름 편집, 내가 쓴 글, 좋아요한 글, 저장한 식품 및 레시피 조회 |

커뮤니티 카테고리는 `ZERO_PRODUCT_REVIEW`(제로 상품 리뷰), `RECIPE`(레시피), `FREE_BOARD`(자유)입니다.

## 기술 구성

버전은 `ZeroPick/package.json`의 선언 범위입니다.

| 용도 | 라이브러리·설정 |
| --- | --- |
| UI | React `^19.0.0`, React DOM `^19.0.0`, TypeScript `~5.7.2` |
| 개발·번들 | Vite `^6.2.0`, React SWC 플러그인, ES Modules |
| 라우팅 | React Router DOM `^7.4.0`, `BrowserRouter` |
| 서버 데이터 | TanStack React Query `^5.75.4`; 일부 화면은 직접 `fetch`와 컴포넌트 상태 사용 |
| 사용자 상태 | Zustand `^5.0.4` |
| 폼 검증 | React Hook Form `^7.54.2`, Yup `^1.6.1`, `@hookform/resolvers` |
| 스타일 | styled-components `^6.1.16`, CSS, 로컬 Pretendard 폰트 |
| 이미지 | react-cropper `^2.3.3`, Cropper.js 스타일 |
| 애니메이션·로딩 | react-transition-group, framer-motion, react-spinners |
| 목록 추가 로딩 | Intersection Observer, react-intersection-observer |
| 품질 도구 | ESLint 9, typescript-eslint, Prettier 3 |
| 배포 관련 | Vercel rewrites, Vercel Analytics, GitHub Actions 저장소 동기화 |

네트워크 공통 처리는 Axios가 아닌 `src/hooks/CustomFetch.tsx`의 Fetch API 래퍼를 사용합니다. Axios와 테이블 관련 패키지도 의존성에 선언되어 있습니다.

## 로컬 실행

### 1. 준비

- Node.js와 패키지 매니저가 필요합니다. 저장소에 `engines`, `.nvmrc`, `packageManager` 고정 설정은 없습니다.
- `yarn.lock`은 Yarn Classic(v1) 형식입니다. 기존 README의 패키지 매니저 규칙도 Yarn입니다.
- 실제 앱 디렉터리는 저장소 루트가 아닌 **`ZeroPick/`**입니다.
- API 기능을 사용하려면 백엔드 접근과 아래 프록시 설정이 필요합니다.

```sh
git clone https://github.com/capstoneMJU/frontend.git
cd frontend/ZeroPick
yarn install --frozen-lockfile
yarn dev
```

개발 서버가 출력한 주소로 접속합니다. Vite 기본 개발 포트는 `5173`이며 사용 중이면 다른 포트가 선택될 수 있습니다.

`package-lock.json`도 존재하지만 현재 `package.json`의 `@vercel/analytics`, `framer-motion` 선언이 npm 잠금 파일에 반영되지 않아 `npm ci`를 그대로 사용하는 것은 적절하지 않습니다. npm으로 전환할 때는 잠금 파일을 먼저 동기화하고 팀의 패키지 매니저 기준을 정하세요. 설치 과정에서 잠금 파일을 임의로 혼용하지 않습니다.

### 2. 개발 API 프록시 설정

앱은 `/api/v1` 상대 경로로 요청합니다. **현재 `vite.config.ts`의 `server` 블록은 주석 처리되어 있어 `yarn dev`만으로는 API가 백엔드에 전달되지 않습니다.** Vercel의 `vercel.json` rewrites도 일반 Vite 개발 서버에서는 적용되지 않습니다.

로컬에서 API까지 사용하려면 `ZeroPick/vite.config.ts`의 `defineConfig` 안에 다음 설정을 추가하거나 기존 주석 설정을 참고해 활성화합니다. 기존 `plugins`, `resolve` 설정은 유지합니다.

```ts
server: {
   proxy: {
      '/api': {
         target: 'https://zeropick.p-e.kr',
         changeOrigin: true,
      },
   },
},
```

위 주소는 저장소의 배포 설정에 기록된 백엔드 주소이며, 현재 서버 가용성은 별도 확인이 필요합니다. 다른 백엔드를 사용한다면 `target`을 해당 주소로 변경하세요. 로그인 응답의 쿠키 속성과 로컬 접속 프로토콜에 따라 세션 유지가 달라질 수 있으므로 개발자 도구에서 `Set-Cookie`와 이후 요청의 쿠키를 확인합니다.

### 3. 환경 변수

현재 소스에는 `import.meta.env`를 이용한 API 주소 설정이 없습니다. `.env`에 `VITE_API_URL`만 추가해도 요청 주소는 바뀌지 않습니다.

| 설정 | 위치 |
| --- | --- |
| API 공통 접두사 `/api/v1` | `src/hooks/CustomFetch.tsx`, `src/hooks/FetchImg.tsx` |
| 일부 직접 API 요청 | 커뮤니티 화면의 `/api/v1/...` 요청 |
| 개발 프록시 | `vite.config.ts`의 `server.proxy` |
| 배포 프록시 | `vercel.json`의 `/api/:path*` rewrite |
| `@/` 경로 별칭 | `vite.config.ts`, `tsconfig.app.json` |

API 주소 체계를 변경할 때는 공통 래퍼뿐 아니라 직접 `fetch`하는 코드도 함께 확인해야 합니다.

## 명령어

아래 명령은 모두 `ZeroPick/`에서 실행합니다.

| 명령 | 동작 |
| --- | --- |
| `yarn dev` | Vite 개발 서버와 HMR 실행 |
| `yarn build` | `tsc -b` 타입 검사 후 Vite 프로덕션 번들 생성 |
| `yarn lint` | `eslint .` 실행 |
| `yarn preview` | 빌드된 결과 로컬 미리보기 |

빌드 산출물은 `ZeroPick/dist/`입니다. `preview`도 API 연동을 위해 별도 프록시 구성이 필요합니다. `test`, `format`, `typecheck` 전용 npm 스크립트는 등록되어 있지 않습니다. 타입 검사만 하려면 `yarn tsc -b`를 사용할 수 있습니다.

## 폴더 구조

```text
frontend/
├── README.md                     # 프로젝트 전체 안내
├── build.sh                      # 저장소명 자리표시자가 남아 있는 복사 스크립트
├── .github/
│   ├── workflows/deploy.yml       # main → 포크 저장소 동기화
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
└── ZeroPick/
    ├── package.json
    ├── yarn.lock
    ├── package-lock.json
    ├── index.html
    ├── vite.config.ts            # SWC, 경로 별칭, 개발 서버 설정
    ├── vercel.json               # API 프록시 및 SPA fallback
    ├── eslint.config.js
    ├── .prettierrc
    ├── tsconfig*.json
    ├── public/                   # 정적 공개 파일
    └── src/
        ├── main.tsx              # React 루트 마운트
        ├── App.tsx               # QueryClient, 라우트, 전환 효과, Analytics
        ├── layout/RootLayout.tsx  # 사용자 조회와 하단 내비게이션
        ├── pages/
        │   ├── SplashPage.tsx
        │   ├── LoginPage.tsx
        │   ├── SignUpPage.tsx
        │   ├── Home/             # 홈, 이미지 크롭, OCR 분석 결과
        │   ├── Search/           # 식품 검색·상세
        │   ├── Recipe/           # 레시피 입력·목록·상세
        │   ├── Community/        # 게시글 목록·작성·상세·편집
        │   └── Setting/          # 프로필과 저장·활동 목록
        ├── components/
        │   ├── Modal/            # 확인·삭제·로그아웃·오류 모달
        │   ├── Recipe/
        │   ├── styles/           # 공통 styled-components
        │   └── ...               # 영양 표, 감미료, 식품, 로더 등
        ├── hooks/                # customFetch, 이미지 검색·프록시, 뉴스
        ├── stores/user.ts        # 이름·이메일 Zustand 상태
        ├── type/                 # 식품 영양정보, 게시글, 카테고리 타입
        ├── data/mockdata.ts      # 샘플 데이터; 전체 API 대체 서버는 아님
        ├── assets/               # SVG 아이콘·일러스트
        ├── fonts/                # Pretendard TTF
        └── *.css                 # 전역 스타일·폰트·화면 전환
```

## 화면과 라우팅

라우트 정의의 기준은 `src/App.tsx`입니다.

| 경로 | 화면 | 비고 |
| --- | --- | --- |
| `/` | 스플래시 | 일정 시간 후 로그인 이동 |
| `/login` | 로그인 | 이메일·비밀번호 입력 |
| `/signup` | 회원가입 | 이름·이메일·비밀번호·비밀번호 확인 |
| `/camera` | 이미지 크롭·OCR | 이동 state의 `imageUrl` 사용 |
| `/home/result` | 분석 결과 | 이동 state의 `id`, `itemReportNo`, `ocrText` 사용 |
| `/home` | 홈 | 이미지 선택, 뉴스 |
| `/search` | 식품 검색 | 검색어 저장, 무한 스크롤 |
| `/:id` | 식품 상세 | 실제 조회는 URL 파라미터 대신 이동 state 사용 |
| `/recipe` | 레시피 시작 | 재료 입력, 최근 저장 목록 |
| `/recipe/list` | 추천 목록 | 이동 state의 `keyword`, 세션 캐시 사용 |
| `/recipe/:title` | 레시피 상세 | 이동 state의 `item` 사용 |
| `/community` | 게시글 목록 | 카테고리 필터, 추가 로딩 |
| `/community/write` | 게시글 작성 | 이미지 첨부 가능 |
| `/community/post/:postId` | 게시글 상세 | 좋아요, 댓글, 대댓글 |
| `/community/edit/:postId` | 게시글 수정 | 기존 글 조회 및 수정 |
| `/setting` | 설정 | 이름 변경, 활동 메뉴, 로그아웃 |
| `/setting/recipes` | 저장 레시피 | 무한 스크롤 |
| `/setting/ocr` | 저장 식품 | 무한 스크롤 |
| `/setting/mypost` | 내가 쓴 글 | 추가 로딩 |
| `/setting/likes` | 좋아요한 글 | 페이지를 반복 조회하여 목록 구성 |

`/home`부터 설정 하위 화면까지는 `RootLayout`을 공유합니다. 스플래시·로그인·회원가입·카메라·분석 결과는 이 레이아웃 밖에 있습니다. 화면 전환은 경로를 키로 하는 `CSSTransition`으로 처리합니다.

## 주요 동작 흐름

### 이미지에서 식품 분석까지

1. 홈의 파일 입력에서 이미지를 선택하고 Object URL을 `/camera`로 전달합니다.
2. Cropper에서 원재료명과 품목번호가 보이는 영역을 자릅니다.
3. 잘라낸 이미지를 Blob으로 변환하고 multipart `file` 필드로 `POST /ocr/scan`에 전달합니다.
4. OCR이 실패하면 오류의 `detail`을 보관하고 사용자가 품목제조보고번호를 입력하도록 안내합니다. 입력값으로 `/foods/search-item-name`을 조회합니다.
5. 확인 모달에서 식품을 선택하면 `/home/result`로 식품 ID·품목번호·OCR 텍스트를 전달합니다.
6. ID 또는 품목번호로 영양정보를 조회하고 `/ocr/confirm`으로 감미료 일치 정보를 요청합니다.
7. 영양성분표와 감미료 정보를 표시하고 식품 스크랩을 제공합니다.

### 레시피 추천과 저장

1. `/recipe`에서 재료를 입력합니다.
2. `/recipes/suggest`에 `{ ingredients: keyword }`를 보내 추천 목록을 받습니다.
3. 추천 항목을 선택하면 `/recipes/createRecipe`에 제목과 재료 문자열을 보내 상세 조리법을 요청합니다.
4. 생성된 상세 데이터와 추천 목록은 `sessionStorage`에 캐시합니다.
5. 스크랩 시 `/recipes`에 제목·재료·조리 단계를 저장합니다. 이미 저장된 항목은 ID로 상세 조회·삭제합니다.

### 커뮤니티 게시글

게시글 작성은 multipart 요청으로 전송합니다. `request` 필드는 `{ content, categoryName, title }` JSON Blob이고, `image` 필드는 선택한 이미지 파일입니다. 댓글은 JSON 요청이며 대댓글은 `parentId`를 함께 보냅니다. UI는 사용자 이름을 참조해 작성자 메뉴를 표시하므로 최종 수정·삭제 권한 검증은 백엔드가 수행해야 합니다.

## API 연동

아래는 프런트엔드 호출 코드에서 확인한 경로입니다. 공통 접두사는 **`/api/v1`**이며, 백엔드의 완전한 API 명세를 대신하지 않습니다.

| 메서드 | 접두사 이후 경로 | 용도 |
| --- | --- | --- |
| POST | `/auth/join` | 회원가입 |
| POST | `/user/login`, `/user/logout` | 로그인·로그아웃 |
| GET | `/user` | 이름·이메일 조회 |
| PUT | `/user/name` | 이름 변경, `{ newName }` |
| GET | `/news` | 뉴스 조회 |
| POST | `/ocr/scan` | 이미지 OCR, multipart `file` |
| POST | `/ocr/confirm` | `{ itemReportNo, ocrText }`로 감미료 확인 |
| GET | `/foods/search-item-name?itemReportNo=...` | 품목번호로 상품명 조회 |
| GET | `/foods/search-item-detail?itemReportNo=...` | 품목번호로 식품 상세 조회 |
| GET | `/foods/search-names?name=...&page=...` | 식품명 검색; 빈 검색어는 `제로` 사용 |
| GET | `/foods/{id}` | 식품 상세 |
| GET | `/foods/{id}/sweeteners` | 식품 감미료 |
| GET | `/ocr/{foodId}/exists` | 식품 저장 여부 |
| POST / DELETE | `/ocr/{foodId}` | 식품 저장·삭제 |
| GET | `/ocr?page=...&size=10` | 저장 식품 목록 |
| GET | `/image-search?query=...` | 식품 이미지 주소 검색 |
| GET | `/proxy?url=...` | 이미지 프록시 |
| POST | `/recipes/suggest` | 재료 기반 추천 |
| POST | `/recipes/createRecipe` | 상세 레시피 생성 |
| POST | `/recipes` | 레시피 저장 |
| GET | `/recipes/recent` | 최근 저장 레시피 |
| GET | `/recipes?page=...&size=10` | 저장 레시피 목록 |
| GET / DELETE | `/recipes/{id}` | 저장 레시피 조회·삭제 |
| GET | `/boards/scroll?category=...&page=...&size=10` | 카테고리별 게시글 |
| GET | `/boards/{postId}/full` | 게시글·댓글 등 상세 |
| POST | `/boards` | 게시글 작성 |
| PUT / DELETE | `/boards/{postId}` | 게시글 수정·삭제 |
| GET | `/boards/my?page=...&size=...` | 내가 쓴 글 |
| POST / DELETE | `/likes/{postId}` | 좋아요·취소 |
| GET | `/likes/my?page=...&size=10` | 좋아요한 글 |
| POST | `/comments/{postId}` | 댓글·대댓글 작성 |
| PUT / DELETE | `/comments/{commentId}` | 댓글·대댓글 수정·삭제 |

### 인증과 오류 처리

`customFetch(endpoint, options, navigate)`는 `/api/v1`을 붙이고 `credentials: 'include'`로 쿠키를 포함합니다. 토큰을 localStorage에 저장하는 방식은 구현되어 있지 않습니다.

- `401`이면 `/login`으로 이동하고 `selectedCategory`를 `홈`으로 설정한 뒤 `undefined`를 반환합니다.
- 응답 본문을 텍스트로 읽고 JSON 파싱을 시도하며, JSON이 아니면 문자열을 반환합니다.
- 나머지 실패 응답은 `Error`에 `status`, `statusText`, `detail`, `errorCode`, `raw`를 붙여 throw합니다.
- 일부 커뮤니티 요청은 공통 래퍼를 거치지 않으므로 인증 만료·오류 처리가 동일하지 않습니다.

응답 형태는 API마다 다릅니다. 예를 들어 레시피는 `result.data`, 식품 상세는 응답 자체, 게시글 페이지는 `content`·`last`를 사용합니다. 공통 응답 구조를 가정해 일괄 변경하기 전에 각 호출부를 확인하세요.

## 상태 관리와 데이터 모델

| 구분 | 보관 데이터 | 구현 위치 |
| --- | --- | --- |
| Zustand | 사용자 `name`, `email`, setter와 `reset` | `stores/user.ts` |
| React Query | 식품 검색, 저장 목록의 페이지 데이터 | `App.tsx`, 검색·설정 화면 |
| 컴포넌트 상태 | 폼 입력, 모달, 이미지, 상세 정보, 커뮤니티 목록 | 각 페이지 |
| Router state | 선택 이미지, 식품 ID·OCR 정보, 재료 키워드, 레시피 항목 | `navigate(..., { state })` |
| sessionStorage | 탭 선택, 검색어, 레시피 추천·생성 결과 및 저장 표시 | 각 페이지와 레이아웃 |

주요 세션 키는 `selectedCategory`, `keyword`, `recipeKeyword`, `recipeData`, 레시피 제목, `${title}스크랩`입니다. Zustand 사용자 상태에는 영속화 미들웨어가 없으며 `RootLayout`이 이름 또는 이메일이 비어 있을 때 `/user`를 다시 조회합니다.

영양정보 모델은 `src/type/nutritientData.ts`에 정의되어 있습니다. 총중량·열량·단백질·탄수화물·나트륨·콜레스테롤·지방·포화지방·트랜스지방·당류와 세부 당 성분을 표로 변환합니다. 감미료 모델은 이름·분류·열량·GI 지수·설명·부작용 필드를 포함합니다. 게시글·댓글 모델은 `src/type/post.ts`, 카테고리 표시는 `src/type/community.ts`를 참조합니다.

## 배포

### Vercel 설정

실제 앱과 `vercel.json`이 있는 `ZeroPick`을 프로젝트 Root Directory로 지정하는 구성이 적합합니다.

| 항목 | 값 |
| --- | --- |
| Root Directory | `ZeroPick` |
| Framework | Vite |
| Build Command | `yarn build` |
| Output Directory | `dist` |
| Install Command | `yarn install --frozen-lockfile` |

`vercel.json`은 다음 순서로 요청을 처리합니다.

1. `/api/:path*` → 설정된 백엔드의 `/api/:path*`
2. 나머지 경로 → `/index.html`

두 번째 규칙은 BrowserRouter의 하위 URL로 직접 접근할 때 앱 진입 파일을 반환하기 위한 설정입니다. 다른 호스팅에서도 API 전달과 SPA fallback을 각각 구성해야 합니다. Vercel Analytics는 `App.tsx`에 포함되어 있습니다. 실제 배포 프로젝트의 대시보드 설정과 서비스 가용성은 저장소만으로 확인할 수 없습니다.

### GitHub Actions

`.github/workflows/deploy.yml`은 `main` push 시 실행됩니다. 현재 워크플로는 앱을 설치·검사·빌드하는 대신 `main`을 `OrangeKim04/frontend` 포크 저장소에 **강제 푸시**하여 동기화합니다. 실행에는 저장소 Secrets `TOKEN`, `EMAIL`이 필요합니다.

따라서 워크플로 이름이 `Deploy`여도 빌드·린트 통과를 보장하지 않습니다. Vercel 배포 연결은 별도 서비스 설정입니다. 루트 `build.sh`에는 `[team-repo-name]` 자리표시자가 남아 있고 앱 빌드 명령도 없으므로 실제 배포 빌드 명령으로 바로 사용하지 않습니다.

## 개발 시 확인 사항

다음은 현재 코드·설정에서 확인한 항목으로, 문서 작성 과정에서 애플리케이션 코드를 수정하지는 않았습니다.

| 증상·항목 | 확인 내용 |
| --- | --- |
| 개발 화면은 열리지만 데이터가 안 나옴 | Vite 개발 프록시 비활성화 여부, 백엔드 가용성, 쿠키 확인 |
| 상세 URL을 직접 열면 데이터가 없음 | 식품·카메라·분석·레시피 일부 화면이 URL만으로 복원되지 않고 Router state에 의존 |
| 저장 식품과 저장 레시피 데이터 충돌 가능 | 두 목록의 React Query 키가 모두 `['SavedRecipes']`; 서로 다른 API에 맞게 키 분리가 필요 |
| 인증 만료 이후 후속 오류 | 공통 래퍼의 `401` 반환값이 `undefined`; 호출부가 응답 필드를 바로 참조하는지 확인 |
| 무한 로딩 또는 오류 확인이 어려움 | 일부 상세 화면은 실패를 콘솔에만 기록하고 데이터가 없으면 로더를 계속 표시 |
| 영양 표에 `undefined g` 표시 가능 | 선택적 세부 당 성분에 표시용 기본값 처리 없음 |
| npm 재현 설치 실패 가능 | `package.json`과 `package-lock.json`의 의존성 불일치 |
| 린트 설정 변경이 반영되지 않음 | ESLint 9의 `eslint.config.js`가 실행 기준이며 `.eslintrc.js`도 별도로 존재 |
| 커밋 훅 | 기존 안내에 Husky가 언급되지만 현재 패키지·추적 파일에는 Husky/commitlint 자동 실행 구성이 없음 |

자동화된 테스트 실행 스크립트는 없습니다. 변경 검증은 `yarn lint`, `yarn build`를 먼저 실행하고, API가 연결된 환경에서 아래 흐름을 점검합니다.

1. 회원가입 → 로그인 → 사용자 정보 표시 → 이름 변경 → 로그아웃.
2. 이미지 선택 → 크롭 → OCR 성공 결과 확인 및 스크랩.
3. OCR 실패 → 품목제조보고번호 입력 → 분석 결과 확인.
4. 상품 검색 → 다음 페이지 로딩 → 상세 → 저장 식품 조회·삭제.
5. 재료 입력 → 추천 → 상세 생성 → 스크랩 → 저장 목록 조회·삭제.
6. 게시글 작성·편집·삭제, 좋아요·취소, 댓글·대댓글 작성·수정·삭제.
7. 로그인 만료, 직접 URL 진입, 새로고침, API 오류 시 화면 상태.

문서 작성 환경에서는 의존성이 설치되어 있지 않아 앱 빌드·린트·실서비스 연동은 실행 검증하지 않았습니다. 위 내용은 소스 분석 결과이며 실행 성공을 의미하지 않습니다.

## 협업 규칙

기존 README에 기록된 팀원과 협업 방식을 유지합니다.

| 팀원 | 역할 |
| --- | --- |
| 김규리 | Frontend |
| 임용진 | Frontend |

- 기능 작업은 Issue를 기준으로 `develop`에서 `feature/기능이름` 브랜치를 만듭니다.
- 작업 시작 전에 최신 `develop`을 반영하고, 가능하면 작업 파일이 겹치지 않도록 조율합니다.
- 완료된 기능은 `develop`에 병합하고 검증 후 `main`으로 반영합니다.
- Issue·PR 작성 시 `.github`의 템플릿을 참고합니다.

| 브랜치 | 용도 |
| --- | --- |
| `main` | 배포 기준; push 시 포크 동기화 워크플로 실행 |
| `develop` | 기능 통합 |
| `feature/기능이름` | 개별 기능 개발 |

커밋 메시지는 `태그: 설명` 형태를 사용합니다. 예: `feat: 식품 검색 추가`, `docs: 프로젝트 README 구체화`.

지원 태그는 `ci`, `chore`, `docs`, `ticket`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`입니다. Prettier 설정은 공백 3칸, 세미콜론 사용, 작은따옴표, 줄 너비 80, trailing comma `all`을 기준으로 합니다.
