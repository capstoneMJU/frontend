# 제로픽 (ZeroPick)

**제로 제품의 원재료와 감미료를 확인하고, 나에게 맞는 식품을 선택하는 서비스**

제로픽은 원재료 이미지 분석, 식품 영양정보 검색, 재료 기반 레시피 추천과 커뮤니티를 제공하는 모바일 중심 웹 애플리케이션입니다. 이 저장소는 프런트엔드 코드이며, OCR·식품 조회·레시피 생성은 별도 백엔드 API와 연동합니다.

## 주요 기능

| 기능 | 설명 |
| --- | --- |
| **원재료 분석** | 이미지를 선택하고 분석 영역을 자르면 영양성분과 감미료 정보를 확인합니다. OCR 실패 시 품목제조보고번호를 직접 입력할 수 있습니다. |
| **식품 검색** | 상품명으로 식품을 검색하고 영양정보·감미료를 조회하거나 관심 식품을 저장합니다. |
| **레시피 추천** | 재료를 입력해 레시피를 추천받고, 재료와 조리 단계를 확인해 저장합니다. |
| **커뮤니티** | 제로 상품 리뷰·레시피·자유 게시판에서 이미지, 좋아요, 댓글·대댓글로 소통합니다. |
| **마이페이지** | 프로필 이름을 변경하고 내가 쓴 글, 좋아요한 글, 저장한 식품과 레시피를 모아 봅니다. |

## 기술 스택

| 구분 | 기술 |
| --- | --- |
| 프레임워크 | React 19, TypeScript 5.7, Vite 6 |
| 라우팅 | React Router 7 |
| 상태 관리 | TanStack React Query 5, Zustand 5 |
| 스타일 | styled-components 6, Pretendard |
| 폼·이미지 | React Hook Form, Yup, react-cropper |
| 개발 도구 | Yarn Classic, ESLint, Prettier |
| 배포 | Vercel, GitHub Actions |

## 시작하기

Node.js와 **Yarn Classic(v1)**이 필요합니다. 모든 실행 명령은 `ZeroPick/`에서 사용합니다.

```sh
git clone https://github.com/capstoneMJU/frontend.git
cd frontend/ZeroPick
yarn install --frozen-lockfile
yarn dev
```

터미널에 표시된 개발 서버 주소로 접속합니다. 기본 주소는 `http://localhost:5173`입니다.

> 현재 npm 잠금 파일과 패키지 선언에 차이가 있으므로 Yarn으로 설치하세요.

### 로컬 API 연결

**현재 개발 프록시는 비활성화되어 있습니다.** 로그인과 데이터 조회를 사용하려면 `ZeroPick/vite.config.ts`의 `defineConfig` 안에 다음 설정을 추가하세요. 기존 `plugins`와 `resolve` 설정은 유지합니다.

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

`target`은 저장소에 설정된 백엔드 주소입니다. 사용 가능한 백엔드가 다르면 변경하세요. API는 `/api/v1` 상대 경로를 사용하며, 현재 `.env`를 통한 API 주소 변경은 구현되어 있지 않습니다.

### 실행 명령어

| 명령 | 설명 |
| --- | --- |
| `yarn dev` | 개발 서버 실행 |
| `yarn build` | TypeScript 검사 후 프로덕션 빌드 → `dist/` |
| `yarn lint` | ESLint 검사 |
| `yarn preview` | 빌드 결과 미리보기 |

## 프로젝트 구조

```text
frontend/
├── .github/                  # Issue·PR 템플릿, 저장소 동기화 워크플로
└── ZeroPick/
    ├── public/               # 정적 파일
    ├── src/
    │   ├── App.tsx           # 라우팅, QueryClient 설정
    │   ├── pages/            # 홈·검색·레시피·커뮤니티·설정 화면
    │   ├── layout/           # 공통 레이아웃과 하단 내비게이션
    │   ├── components/       # 영양성분표, 감미료 정보, 모달 등
    │   ├── hooks/            # 공통 API 요청, 이미지·뉴스 조회
    │   ├── stores/           # 사용자 상태
    │   ├── type/             # 식품·영양정보·게시글 타입
    │   └── assets/, fonts/   # 아이콘과 폰트
    ├── vite.config.ts        # 빌드, 경로 별칭, 개발 프록시
    └── vercel.json           # 배포 API 프록시, SPA 경로 처리
```

### 주요 화면

| 영역 | 대표 경로 |
| --- | --- |
| 로그인·회원가입 | `/login`, `/signup` |
| 홈·원재료 분석 | `/home`, `/camera`, `/home/result` |
| 식품 검색·상세 | `/search`, `/:id` |
| 레시피 | `/recipe`, `/recipe/list`, `/recipe/:title` |
| 커뮤니티 | `/community`, `/community/post/:postId` |
| 설정·저장 목록 | `/setting`, `/setting/ocr`, `/setting/recipes` |

전체 라우트는 [App.tsx](ZeroPick/src/App.tsx)에서 확인할 수 있습니다.

## 개발 참고

- **API 요청:** [CustomFetch.tsx](ZeroPick/src/hooks/CustomFetch.tsx)가 `/api/v1` 요청과 쿠키 인증을 처리합니다. `401` 응답 시 로그인 화면으로 이동하며, 일부 커뮤니티 요청은 직접 `fetch`를 사용합니다.
- **상태 관리:** 사용자 이름·이메일은 Zustand, 검색·저장 목록은 React Query를 사용합니다. 검색어와 레시피 결과 일부는 `sessionStorage`에 보관합니다.
- **화면 진입:** 일부 식품·분석·레시피 상세 화면은 Router state에 의존하므로 URL 직접 접속만으로 데이터를 복원하지 못할 수 있습니다.
- **확인할 항목:** 저장 식품과 저장 레시피의 React Query 키가 동일해 캐시 분리가 필요합니다. 자동 테스트 스크립트는 없으며, 변경 후 `yarn lint`와 `yarn build` 및 주요 사용자 흐름을 확인하세요.

## 배포

Vercel 프로젝트는 다음 기준으로 설정합니다.

| 설정 | 값 |
| --- | --- |
| Root Directory | `ZeroPick` |
| Build Command | `yarn build` |
| Output Directory | `dist` |
| Install Command | `yarn install --frozen-lockfile` |

[vercel.json](ZeroPick/vercel.json)은 `/api/*`를 백엔드로 전달하고, 나머지 경로는 `index.html`로 연결합니다. 로컬 Vite 서버에서는 이 설정이 적용되지 않습니다.

GitHub Actions는 `main` push 시 포크 저장소로 코드를 동기화합니다. **빌드·린트 검증은 수행하지 않으며**, Secrets `TOKEN`, `EMAIL`이 필요합니다. 자세한 동작은 [워크플로](.github/workflows/deploy.yml)를 참고하세요.

## 팀과 협업

| 김규리 | 임용진 |
| :---: | :---: |
| Frontend | Frontend |

- **브랜치:** `develop`에서 `feature/기능이름` 생성 → 기능 구현 → `develop` 통합 → 검증 후 `main` 반영
- **커밋:** `태그: 설명` — 예: `feat: 식품 검색 추가`, `docs: README 수정`
- **코드 스타일:** Prettier 기준 공백 3칸, 작은따옴표, 세미콜론 사용
- **Issue·PR:** `.github`의 템플릿 사용
