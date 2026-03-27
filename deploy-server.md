# Render Backend Deployment

이 문서는 현재 `TeamC/backend` FastAPI 서버를 `Render`에 배포하는 절차를 정리한다.

기준 파일:
- `backend/render.yaml`
- `backend/Procfile`
- `backend/requirements.txt`
- `backend/.env.example`

공식 참고 문서:
- Render Web Services: https://render.com/docs/web-services
- Render Blueprint `render.yaml`: https://render.com/docs/blueprint-spec
- Render Environment Variables: https://render.com/docs/configure-environment-variables
- Render Default Environment Variables: https://render.com/docs/environment-variables

## 1. 현재 배포 방식

현재 백엔드는 `Render Web Service` 기준으로 정리되어 있다.

- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

`Render`는 웹 서비스가 `0.0.0.0`에 바인딩되고, `PORT` 환경변수를 사용하도록 요구한다. 현재 설정은 그 조건에 맞춰져 있다.

## 2. 사전 확인

배포 전에 아래 파일이 있는지 확인한다.

- `backend/requirements.txt`
- `backend/Procfile`
- `render.yaml`
- `backend/.env.example`

추가로 백엔드가 참조하는 주요 환경변수는 아래와 같다.

- `DATABASE_URL`
- `SECRET_KEY`
- `CF_ACCOUNT_ID`
- `CF_KV_NAMESPACE_ID`
- `CF_API_TOKEN`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `BACKEND_CORS_ORIGINS`

`BACKEND_CORS_ORIGINS`는 프론트엔드 주소를 쉼표로 구분해서 넣는다.

예시:

```env
BACKEND_CORS_ORIGINS=https://teamc-frontend.onrender.com,https://www.example.com
```

## 3. 가장 쉬운 방법: render.yaml 사용

리포지토리 루트에 이미 `render.yaml`이 있으므로, Render에서 Blueprint 방식으로 생성하는 것이 가장 간단하다.

절차:

1. Render에 로그인한다.
2. `New` -> `Blueprint`를 선택한다.
3. 현재 GitHub 저장소를 연결한다.
4. Render가 루트의 `render.yaml`을 읽는지 확인한다.
5. 서비스 이름과 브랜치를 확인한 뒤 생성한다.
6. 생성 후 `Environment` 탭에서 필요한 환경변수를 모두 입력한다.
7. 저장 시 `Save, rebuild, and deploy`를 선택한다.

현재 `render.yaml` 기준 서비스 정의:

```yaml
services:
  - type: web
    name: teamc-backend
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    plan: free
    envVars:
      - key: PYTHON_VERSION
        value: 3.12.8
```

## 4. 수동 생성 방법

`Blueprint`를 쓰지 않고 직접 Web Service를 만들어도 된다.

절차:

1. Render 대시보드에서 `New` -> `Web Service`
2. GitHub 저장소 선택
3. 아래 값을 입력

- Name: `teamc-backend`
- Runtime: `Python 3`
- Root Directory: `backend`
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

권장 추가 설정:

- Python Version: `3.12.8`
- Plan: 우선 `Free`로 시작 가능
- Auto Deploy: 필요 시 활성화

그 다음 `Environment` 탭에서 `.env.example` 기준으로 값을 모두 넣는다.

## 5. 환경변수 입력 기준

`backend/.env.example`에 있는 키를 그대로 Render에 등록하면 된다.

등록 팁:

- 비밀값은 Git에 넣지 말고 Render 대시보드에만 입력한다.
- `DATABASE_URL`은 실제 운영 DB 연결 문자열을 넣는다.
- `SUPABASE_*` 값은 프론트에서 쓰는 값과 헷갈리지 않게 백엔드용으로 확인해서 넣는다.
- `BACKEND_CORS_ORIGINS`에는 실제 프론트 배포 주소를 반드시 넣는다.

프론트가 아직 미배포라면 임시로 로컬 주소만 둘 수 있다.

예시:

```env
BACKEND_CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

프론트 배포 후에는 실제 Render 프론트 주소를 추가한다.

## 6. 배포 후 확인

배포가 끝나면 아래 순서로 확인한다.

1. Render 로그에서 build 성공 여부 확인
2. 배포 URL 접속
3. 루트 경로 `/` 확인

정상 응답 예시:

```json
{"message":"TeamC Backend API is running"}
```

그 다음 프론트에서 실제로 쓰는 엔드포인트를 확인한다.

- `/api/v1/meals`
- `/api/v1/meals/{date}`
- `/api/v1/news`
- `/api/v1/news/debug`
- `/api/v1/news/bookmarks`
- `/api/v1/community/posts`

## 7. 자주 막히는 지점

### 1. CORS 오류

원인:
- `BACKEND_CORS_ORIGINS`에 프론트 주소가 없음

대응:
- 프론트 실제 URL을 추가하고 재배포

### 2. 앱은 뜨는데 API가 실패함

원인:
- `SUPABASE_*`
- `NAVER_*`
- `CF_*`
- `DATABASE_URL`
중 하나가 빠졌거나 값이 틀림

대응:
- Render `Environment` 탭 값 재확인

### 3. 포트 바인딩 실패

원인:
- 시작 명령이 `$PORT`를 사용하지 않음

대응:
- 아래 명령을 유지

```bash
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

## 8. 운영 권장사항

- 처음에는 `Free`로 테스트
- 정상 동작 확인 후 필요 시 유료 플랜 검토
- 프론트 배포 URL이 바뀌면 `BACKEND_CORS_ORIGINS`도 같이 수정
- 중요한 비밀값은 Render 환경변수로만 관리

## 9. 현재 프로젝트 기준 최종 요약

이 프로젝트는 지금 `Render`에 바로 올릴 수 있는 상태다.

가장 추천하는 방식은:

1. GitHub에 현재 코드 푸시
2. Render에서 `Blueprint`로 생성
3. 환경변수 입력
4. 배포 완료 후 `/`와 주요 API 확인

필요하면 다음 단계로 프론트의 `REACT_APP_API_URL`까지 Render 백엔드 주소 기준으로 같이 정리한다.
