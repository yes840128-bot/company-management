'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">환경 변수 설정 가이드</h1>
          
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">1단계: Supabase 연결 풀 URL 가져오기</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>https://supabase.com/dashboard 접속</li>
                <li>프로젝트 선택</li>
                <li><strong>Settings</strong> (⚙️) 클릭</li>
                <li><strong>Database</strong> 클릭</li>
                <li>아래로 스크롤하여 <strong>Connection string</strong> 섹션 찾기</li>
                <li><strong>Connection pooling</strong> 탭 클릭</li>
                <li><strong>Transaction mode</strong> 선택</li>
                <li>연결 문자열 복사</li>
              </ol>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-green-900 mb-4">2단계: Vercel에 환경 변수 설정</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>https://vercel.com/dashboard 접속</li>
                <li>프로젝트 <strong>company-management</strong> 선택</li>
                <li><strong>Settings</strong> 클릭</li>
                <li><strong>Environment Variables</strong> 클릭</li>
                <li><strong>Add New</strong> 클릭</li>
                <li>
                  <strong>Name</strong>: <code className="bg-gray-100 px-2 py-1 rounded">DATABASE_URL</code>
                </li>
                <li><strong>Value</strong>: Supabase에서 복사한 연결 풀 URL 붙여넣기</li>
                <li><strong>Environment</strong>: Production, Preview, Development 모두 체크</li>
                <li><strong>Save</strong> 클릭</li>
              </ol>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-yellow-900 mb-4">3단계: 재배포</h2>
              <p className="text-gray-700 mb-2">
                환경 변수를 저장하면 Vercel이 자동으로 재배포를 시작합니다.
              </p>
              <p className="text-gray-700">
                또는 <strong>Deployments</strong> 탭에서 수동으로 <strong>Redeploy</strong>를 클릭할 수 있습니다.
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-purple-900 mb-4">자동 설정 스크립트 사용 (선택사항)</h2>
              <p className="text-gray-700 mb-4">
                프로젝트 루트에서 다음 명령어를 실행하면 자동으로 환경 변수를 설정할 수 있습니다:
              </p>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between">
                  <code>.\auto-setup.ps1</code>
                  <button
                    onClick={() => copyToClipboard('.\\auto-setup.ps1')}
                    className="text-blue-400 hover:text-blue-300 text-xs"
                  >
                    {copied ? '복사됨!' : '복사'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/companies"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                설정 완료 후 돌아가기
              </Link>
              <a
                href="https://vercel.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Vercel 대시보드 열기
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

