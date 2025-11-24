# 배포 가이드

## Vercel 배포 방법

### 1. Vercel 로그인
터미널에서 다음 명령어를 실행하고, 브라우저에서 인증을 완료하세요:
```bash
vercel login
```

### 2. PostgreSQL 데이터베이스 설정
Vercel은 SQLite를 지원하지 않으므로 PostgreSQL 데이터베이스가 필요합니다.

#### 옵션 A: Supabase 사용 (무료)
1. https://supabase.com 에서 계정 생성
2. 새 프로젝트 생성
3. Settings > Database > Connection string에서 Connection string 복사
4. Vercel 대시보드에서 환경 변수 `DATABASE_URL` 설정

#### 옵션 B: Vercel Postgres 사용
1. Vercel 대시보드에서 프로젝트 선택
2. Storage 탭에서 Postgres 추가
3. 자동으로 `DATABASE_URL` 환경 변수가 설정됩니다

### 3. 환경 변수 설정
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `DATABASE_URL`: PostgreSQL 연결 문자열

### 4. 배포
터미널에서 다음 명령어를 실행:
```bash
vercel --prod
```

또는 Vercel 대시보드에서 GitHub 저장소를 연결하여 자동 배포를 설정할 수 있습니다.

## 배포 후 확인 사항
1. 배포된 URL로 접속하여 `/companies` 페이지가 정상 작동하는지 확인
2. 데이터베이스 마이그레이션 실행 (필요한 경우):
   ```bash
   npx prisma migrate deploy
   ```


