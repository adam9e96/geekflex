# GeekFlex 배포 가이드 (Ubuntu VM + Docker Compose)

## 아키텍처 개요

```text
Cloudflare Tunnel
  -> Ubuntu VM
      -> geekflex-nginx:80
          -> /              React 정적 파일
          -> /api/          geekflex-backend:8080
          -> /uploads/      업로드 볼륨

Docker Compose
  -> geekflex-db      MariaDB
  -> geekflex-redis   Redis
  -> geekflex-backend Spring Boot
  -> geekflex-nginx   Nginx
```

| 서비스 | 실행 위치 | 비고 |
|---|---|---|
| Frontend | `geekflex-nginx` | `geekflex-frontend/dist` 정적 서빙 |
| Backend | `geekflex-backend` | Spring Boot `prod` 프로필 |
| MariaDB | `geekflex-db` | Docker volume에 데이터 보관 |
| Redis | `geekflex-redis` | Docker volume에 데이터 보관 |

## VM 준비

1. 서버에 Docker와 Docker Compose plugin을 설치한다.
2. 앱 디렉터리를 준비한다.

```bash
mkdir -p ~/apps
cd ~/apps
git clone <repo-url> geekflex
cd geekflex
cp .env.example .env
```

3. `.env`에 운영 값을 채운다.

필수 값:

- `GEEKFLEX_DB_ROOT_PASSWORD`
- `GEEKFLEX_DB_PASSWORD`
- `GEEKFLEX_REDIS_PASSWORD`
- `GeekFlex_RESEND_API_KEY`
- `GeekFlex_TMDB_API_KEY`
- `GeekFlex_TMDB_ACCESS_TOKEN`
- `GeekFlex_JWT_SECRET_KEY`

## 배포

프론트 정적 파일을 먼저 빌드한다.

```bash
cd ~/apps/geekflex/geekflex-frontend
docker run --rm \
  -v "$PWD:/app" \
  -w /app \
  node:alpine \
  sh -lc "npm ci && npm run build"
```

서비스를 실행한다.

```bash
cd ~/apps/geekflex
docker compose up -d --build
docker compose ps
```

헬스체크:

```bash
curl --fail --silent http://localhost/api/health
```

## Cloudflare Tunnel

Cloudflare Tunnel public hostname은 운영 도메인을 VM의 GeekFlex Nginx로 연결한다.

```text
geekflex.adam9e96.dev -> http://localhost:18080
```

같은 VM에서 다른 프로젝트를 함께 운영한다면 프로젝트별 hostname과 host port를 분리한다.

## CI/CD

GitHub Actions는 SSH로 VM에 접속해 다음 순서로 배포한다.

```bash
cd ~/apps/geekflex
git pull origin main
cd geekflex-frontend
docker run --rm -v "$PWD:/app" -w /app node:alpine sh -lc "npm ci && npm run build"
cd ..
docker compose up -d --build
docker compose ps
curl --fail --silent http://localhost:18080/api/health
```

필요한 GitHub Secrets:

- `VM_HOST`
- `VM_USER`
- `VM_SSH_KEY`
- `VM_PORT`

## 운영 참고

- 백엔드는 `application-prod.yml`을 사용한다.
- CORS 운영 도메인은 `https://geekflex.adam9e96.dev` 기준이다.
- 업로드 파일은 `geekflex_uploads_data` volume에 저장되고 Nginx가 `/uploads/`로 서빙한다.
- MariaDB, Redis, uploads 데이터는 Docker volume에 있으므로 백업 대상에 포함한다.
