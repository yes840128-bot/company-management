# 🎯 가장 간단한 설정 방법

## 한 번만 실행하면 끝!

### 1단계: Supabase 연결 풀 URL 가져오기 (1분)

1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. **Settings** > **Database**
4. **Connection string** > **Connection pooling** 탭
5. **Transaction mode** 선택
6. 연결 문자열 복사

### 2단계: 환경 변수 설정 (30초)

PowerShell에서 실행:
```powershell
.\auto-setup.ps1
```

스크립트가 URL을 요청하면 위에서 복사한 연결 문자열을 붙여넣으세요.

### 3단계: 완료! (자동)

- 스크립트가 자동으로 Vercel에 환경 변수를 설정합니다
- Vercel이 자동으로 재배포합니다 (약 1-2분)
- 배포 완료 후 접속: https://company-management-7pqi.vercel.app/companies

## ✅ 끝!

이제 추가 설정 없이 바로 사용할 수 있습니다!

