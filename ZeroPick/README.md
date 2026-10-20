# ZeroPick 애플리케이션

이 디렉터리는 제로픽 React + TypeScript + Vite 앱의 실행 루트입니다.

전체 기능, 설치·실행, 개발 API 프록시, 라우트, API 호출 목록, 상태 관리, 배포 및 협업 규칙은 [저장소 README](../README.md)를 확인하세요.

```sh
yarn install --frozen-lockfile
yarn dev
```

현재 Vite 개발 프록시는 비활성화되어 있습니다. API 기능을 사용하려면 상위 README의 로컬 실행 설정을 먼저 적용하세요.

| 명령 | 용도 |
| --- | --- |
| `yarn dev` | 개발 서버 |
| `yarn build` | TypeScript 검사 및 프로덕션 빌드 |
| `yarn lint` | ESLint 검사 |
| `yarn preview` | 빌드 결과 미리보기 |
