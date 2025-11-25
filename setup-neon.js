// Neon 무료 데이터베이스 자동 설정 스크립트
// Neon은 무료이고 Vercel과 완벽하게 호환됩니다

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupNeon() {
  console.log('🚀 Neon 무료 데이터베이스 설정\n');
  console.log('Neon은 완전 무료이고 Vercel과 완벽하게 호환됩니다!\n');
  
  console.log('1단계: Neon 계정 생성 및 프로젝트 생성');
  console.log('   - https://neon.tech 접속');
  console.log('   - 무료 계정 생성 (GitHub로 간단히 가입 가능)');
  console.log('   - 새 프로젝트 생성\n');
  
  console.log('2단계: 연결 문자열 가져오기');
  console.log('   - 프로젝트 대시보드에서 "Connection string" 복사');
  console.log('   - 형식: postgres://user:pass@ep-xxx.region.neon.tech/dbname\n');
  
  const connectionString = await question('Neon 연결 문자열을 입력하세요: ');
  
  if (!connectionString || connectionString.trim() === '') {
    console.error('❌ 연결 문자열이 제공되지 않았습니다.');
    rl.close();
    process.exit(1);
  }
  
  const dbUrl = connectionString.trim();
  
  // Vercel 로그인 확인
  console.log('\n📋 Vercel 로그인 확인 중...');
  try {
    execSync('vercel whoami', { stdio: 'ignore' });
    console.log('✅ Vercel에 로그인되어 있습니다.\n');
  } catch (error) {
    console.log('⚠️ Vercel에 로그인이 필요합니다.');
    console.log('브라우저에서 인증을 완료하세요...\n');
    try {
      execSync('vercel login', { stdio: 'inherit' });
    } catch (loginError) {
      console.error('❌ 로그인에 실패했습니다.');
      rl.close();
      process.exit(1);
    }
  }
  
  // 프로젝트 링크 확인
  try {
    execSync('vercel link --yes', { stdio: 'ignore' });
  } catch (error) {
    // 링크 실패는 무시 (이미 링크되어 있을 수 있음)
  }
  
  // 환경 변수 설정
  console.log('🔧 환경 변수 설정 중...\n');
  
  const environments = ['production', 'preview', 'development'];
  
  for (const env of environments) {
    try {
      console.log(`Setting DATABASE_URL for ${env}...`);
      // 기존 환경 변수 삭제 시도 (실패해도 무시)
      try {
        execSync(`vercel env rm DATABASE_URL ${env} --yes`, { stdio: 'ignore' });
      } catch (e) {
        // 무시
      }
      // 새 환경 변수 추가
      execSync(`echo "${dbUrl}" | vercel env add DATABASE_URL ${env}`, { stdio: 'inherit' });
      console.log(`✅ ${env} 환경 변수 설정 완료\n`);
    } catch (error) {
      console.error(`❌ ${env} 환경 변수 설정 실패:`, error.message);
    }
  }
  
  console.log('🎉 환경 변수 설정이 완료되었습니다!');
  console.log('\n다음 단계:');
  console.log('1. Vercel이 자동으로 재배포를 시작합니다');
  console.log('2. 배포가 완료되면 (약 1-2분) https://company-management-7pqi.vercel.app/companies 접속');
  console.log('3. 정상 작동하는지 확인하세요\n');
  
  rl.close();
}

setupNeon().catch(error => {
  console.error('❌ 오류 발생:', error);
  rl.close();
  process.exit(1);
});

