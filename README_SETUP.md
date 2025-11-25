# ⚡ 원클릭 환경 변수 설정

## 🎯 가장 간단한 방법

프로젝트 루트에서 다음 명령어 하나만 실행하세요:

### Windows (PowerShell)
```powershell
.\auto-setup.ps1
```

### 또는 Node.js
```bash
npm run setup:env
```

## 📋 준비물

스크립트 실행 시 **Supabase 연결 풀 URL**이 필요합니다.

### Supabase 연결 풀 URL 가져오기 (1분)

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** (⚙️) > **Database**
4. 아래로 스크롤하여 **Connection string** 섹션
5. **Connection pooling** 탭 클릭
6. **Transaction mode** 선택
7. 연결 문자열 복사

**형식 예시**: `postgres://postgres.xxx:password@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true`

## 🚀 실행 방법

1. **스크립트 실행**
   ```powershell
   .\auto-setup.ps1
   ```

2. **Supabase 연결 풀 URL 입력**
   - 스크립트가 요청하면 위에서 복사한 URL 붙여넣기

3. **완료!**
   - 스크립트가 자동으로 Vercel에 환경 변수를 설정합니다
   - Vercel이 자동으로 재배포를 시작합니다
   - 배포 완료 후 접속: https://company-management-7pqi.vercel.app/companies

## ✅ 확인

배포가 완료되면 (약 1-2분):
- https://company-management-7pqi.vercel.app/companies 접속
- 정상 작동하는지 확인!

## 🆘 문제 해결

### "Vercel에 로그인이 필요합니다"
- 브라우저가 자동으로 열립니다
- Vercel 계정으로 로그인하세요

### "환경 변수 설정 실패"
- Vercel CLI가 설치되어 있는지 확인: `vercel --version`
- Vercel에 로그인되어 있는지 확인: `vercel whoami`

### 여전히 오류가 발생하는 경우
- Vercel 대시보드 > Settings > Environment Variables에서 `DATABASE_URL` 확인
- 연결 풀 URL이 올바른지 확인 (`pooler.supabase.com` 포함)

