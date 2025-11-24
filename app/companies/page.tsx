'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Company } from '@/types/company';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setError(null);
      const response = await fetch('/api/companies');
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }));
        throw new Error(errorData.error || `서버 오류: ${response.status}`);
      }
      
      const data = await response.json();
      setCompanies(data || []);
    } catch (error) {
      console.error('업체 목록을 불러오는데 실패했습니다:', error);
      setError(error instanceof Error ? error.message : '업체 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 업체 삭제 처리
  const handleDelete = async (companyId: string) => {
    // 확인 메시지
    const confirmed = window.confirm('정말 이 업체를 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmed) {
      return; // 취소하면 아무것도 하지 않음
    }

    try {
      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // 삭제 성공 시 목록에서 해당 업체 제거
          setCompanies((prev) => prev.filter((company) => company.id !== companyId));
        } else {
          alert('삭제에 실패했습니다.');
        }
      } else {
        const errorData = await response.json();
        alert(`삭제에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">로딩 중...</p>
      </div>
    );
  }

  if (error) {
    const isDatabaseError = error.includes('데이터베이스') || 
                           error.includes('DATABASE_URL') || 
                           error.includes('연결') ||
                           error.includes('Supabase');
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${isDatabaseError ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'} border rounded-lg p-6`}>
            <h2 className={`text-lg font-semibold ${isDatabaseError ? 'text-yellow-800' : 'text-red-800'} mb-2`}>
              {isDatabaseError ? '데이터베이스 설정 필요' : '오류가 발생했습니다'}
            </h2>
            <p className={`${isDatabaseError ? 'text-yellow-700' : 'text-red-600'} mb-4 whitespace-pre-line`}>
              {error}
            </p>
            {isDatabaseError && (
              <div className="bg-white rounded p-4 mb-4 border border-yellow-300">
                <h3 className="font-semibold text-gray-800 mb-2">설정 방법:</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Supabase 대시보드 접속: <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://supabase.com/dashboard</a></li>
                  <li>프로젝트 선택 → Settings → Database</li>
                  <li>Connection string → Connection pooling 탭</li>
                  <li>Transaction mode 선택 후 연결 문자열 복사</li>
                  <li>Vercel 대시보드 → 프로젝트 → Settings → Environment Variables</li>
                  <li>DATABASE_URL에 연결 풀 URL 설정 (형식: postgres://...@pooler.xxx.supabase.com:6543/...?pgbouncer=true)</li>
                  <li>Save 후 자동 재배포 대기</li>
                </ol>
              </div>
            )}
            <button
              onClick={fetchCompanies}
              className={`${isDatabaseError ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-red-600 hover:bg-red-700'} text-white px-4 py-2 rounded-lg transition-colors`}
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단: 제목과 업체 등록 버튼 */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">업체 관리</h1>
          <Link
            href="/companies/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            업체 등록
          </Link>
        </div>

        {/* 업체 목록 표 */}
        {companies.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 text-lg">등록된 업체가 없습니다.</p>
            <Link
              href="/companies/new"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              첫 업체를 추가해보세요
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    업체명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    사업자번호
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    대표자
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    위험등급
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    최근 수정일
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    작업
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/companies/${company.id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {company.companyName}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.businessNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.representativeName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          company.riskRating === '낮음'
                            ? 'bg-green-100 text-green-800'
                            : company.riskRating === '보통'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {company.riskRating}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(company.updatedAt).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDelete(company.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}


