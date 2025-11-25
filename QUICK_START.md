# 🚀 빠른 시작 가이드

## 한 번만 실행하면 끝! 환경 변수 자동 설정

### 방법 1: PowerShell 스크립트 (Windows, 추천)

```powershell
.\auto-setup.ps1
```

스크립트가 Supabase 연결 풀 URL을 요청하면 입력하세요.

### 방법 2: Node.js 스크립트

```bash
npm run setup:env
```

또는 직접 실행:
```bash
node setup-vercel-env.js
```

### Supabase 연결 풀 URL 가져오기

1. **Supabase 대시보드 접속**: https://supabase.com/dashboard
2. **프로젝트 선택**
3. **Settings** > **Database** 이동
4. **Connection string** 섹션에서 **Connection pooling** 탭 선택
5. **Transaction mode** 선택
6. 연결 문자열 복사 (형식: `postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true`)

### 스크립트 실행 후

1. 스크립트가 자동으로 Vercel에 환경 변수를 설정합니다
2. Vercel이 자동으로 재배포를 시작합니다
3. 배포 완료 후 접속: https://company-management-7pqi.vercel.app/companies

## ✅ 완료!

이제 추가 설정 없이 바로 사용할 수 있습니다!

