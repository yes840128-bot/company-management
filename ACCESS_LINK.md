# 접속 링크

## 🚀 배포된 애플리케이션 링크

### 프로덕션 URL
**https://company-management-7pqi.vercel.app**

### 주요 페이지
- 메인 페이지: https://company-management-7pqi.vercel.app
- 업체 목록: https://company-management-7pqi.vercel.app/companies
- 업체 등록: https://company-management-7pqi.vercel.app/companies/new
- 파일 관리: https://company-management-7pqi.vercel.app/files

## ⚠️ 중요 사항

### 데이터베이스 설정 필요
현재 PostgreSQL로 마이그레이션되었으므로, Vercel 대시보드에서 다음 환경 변수를 설정해야 합니다:

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **프로젝트 선택**: company-management
3. **Settings > Environment Variables**로 이동
4. 다음 환경 변수 추가:
   - `DATABASE_URL`: PostgreSQL 연결 문자열
     - Supabase 사용 시: Supabase 프로젝트의 Connection string
     - Vercel Postgres 사용 시: 자동으로 설정됨

### 데이터베이스 옵션

#### 옵션 1: Supabase (무료, 추천)
1. https://supabase.com 에서 계정 생성
2. 새 프로젝트 생성
3. Settings > Database > Connection string에서 "URI" 복사
4. Vercel 환경 변수에 `DATABASE_URL`로 설정

#### 옵션 2: Vercel Postgres
1. Vercel 대시보드에서 프로젝트 선택
2. Storage 탭에서 Postgres 추가
3. 자동으로 `DATABASE_URL` 환경 변수가 설정됨

### 마이그레이션 실행
데이터베이스 설정 후, 다음 명령어로 마이그레이션을 실행하세요:
```bash
npx prisma migrate deploy
```

또는 Vercel 대시보드의 Deployments 탭에서 최신 배포를 확인하고, 필요시 재배포하세요.

## 📝 배포 상태 확인
- GitHub 저장소: https://github.com/yes840128-bot/company-management
- Vercel 대시보드: https://vercel.com/dashboard

