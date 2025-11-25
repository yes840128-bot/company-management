# Vercel 환경 변수 자동 설정 PowerShell 스크립트
# 사용법: .\auto-setup.ps1

Write-Host "🚀 Vercel 환경 변수 자동 설정" -ForegroundColor Green
Write-Host ""

# Supabase 연결 풀 URL 입력 요청
Write-Host "Supabase 연결 풀 URL이 필요합니다." -ForegroundColor Yellow
Write-Host ""
Write-Host "Supabase에서 연결 풀 URL을 가져오는 방법:"
Write-Host "1. https://supabase.com/dashboard 접속"
Write-Host "2. 프로젝트 선택 > Settings > Database"
Write-Host "3. Connection string > Connection pooling 탭"
Write-Host "4. Transaction mode 선택 후 연결 문자열 복사"
Write-Host ""

$databaseUrl = Read-Host "DATABASE_URL을 입력하세요"

if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
    Write-Host "❌ DATABASE_URL이 제공되지 않았습니다." -ForegroundColor Red
    exit 1
}

# Vercel 로그인 확인
Write-Host ""
Write-Host "📋 Vercel 로그인 확인 중..." -ForegroundColor Yellow
try {
    vercel whoami | Out-Null
    Write-Host "✅ Vercel에 로그인되어 있습니다." -ForegroundColor Green
} catch {
    Write-Host "⚠️ Vercel에 로그인이 필요합니다." -ForegroundColor Yellow
    Write-Host "브라우저에서 인증을 완료하세요..."
    vercel login
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 로그인에 실패했습니다." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🔧 환경 변수 설정 중..." -ForegroundColor Yellow
Write-Host ""

# 환경 변수 설정 함수
function Set-VercelEnv {
    param(
        [string]$Environment,
        [string]$Value
    )
    
    Write-Host "Setting DATABASE_URL for $Environment..." -ForegroundColor Cyan
    try {
        vercel env add DATABASE_URL $Environment "$Value" 2>&1 | Out-Null
        Write-Host "✅ $Environment 환경 변수 설정 완료" -ForegroundColor Green
    } catch {
        Write-Host "⚠️ 환경 변수가 이미 존재합니다. 업데이트 중..." -ForegroundColor Yellow
        try {
            vercel env rm DATABASE_URL $Environment --yes 2>&1 | Out-Null
            vercel env add DATABASE_URL $Environment "$Value" 2>&1 | Out-Null
            Write-Host "✅ $Environment 환경 변수 업데이트 완료" -ForegroundColor Green
        } catch {
            Write-Host "❌ $Environment 환경 변수 설정 실패" -ForegroundColor Red
        }
    }
    Write-Host ""
}

# 각 환경에 대해 설정
Set-VercelEnv -Environment "production" -Value $databaseUrl
Set-VercelEnv -Environment "preview" -Value $databaseUrl
Set-VercelEnv -Environment "development" -Value $databaseUrl

Write-Host "🎉 환경 변수 설정이 완료되었습니다!" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:"
Write-Host "1. Vercel이 자동으로 재배포를 시작합니다"
Write-Host "2. 배포가 완료되면 https://company-management-7pqi.vercel.app/companies 접속"
Write-Host "3. 정상 작동하는지 확인하세요"
Write-Host ""

