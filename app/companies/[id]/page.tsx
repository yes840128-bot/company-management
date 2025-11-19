'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Company } from '@/types/company';
import { parseBusinessLicenseText } from '@/lib/parseBusinessLicense';

// 파일 정보 타입
interface FileInfo {
  id: string;
  originalName: string;
  storedName?: string;
  path?: string;
  fileType: string;
  uploadedAt: string;
  extractedText?: string;
  status: string | null;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<Company>>({});
  const [selectedFileType, setSelectedFileType] = useState<string>('businessLicense');
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [fileList, setFileList] = useState<FileInfo[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCompany();
      fetchFiles();
    }
  }, [id]);

  // 파일 목록 조회
  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/companies/${id}/files`);
      if (response.ok) {
        const files = await response.json();
        setFileList(files);
      }
    } catch (error) {
      console.error('파일 목록을 불러오는데 실패했습니다:', error);
    }
  };

  const fetchCompany = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        setFormData(data);
      } else {
        alert('업체를 찾을 수 없습니다.');
        router.push('/companies');
      }
    } catch (error) {
      console.error('업체 정보를 불러오는데 실패했습니다:', error);
      alert('업체 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 저장 버튼 클릭 - DB에 저장
  const handleSave = async () => {
    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedCompany = await response.json();
        setCompany(updatedCompany);
        setFormData(updatedCompany);
        alert('저장되었습니다.');
      } else {
        const errorData = await response.json();
        alert(`저장에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    }
  };

  // 파일 업로드 처리 (OCR 자동 채우기 포함)
  const handleFileUpload = async (file: File) => {
    try {
      // 파일 MIME 타입 확인
      const isTextFile = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
      const isImageFile = file.type.startsWith('image/') || 
                         /\.(jpg|jpeg|png)$/i.test(file.name);

      // 파일 타입 결정 (사업자등록증인 경우)
      let determinedFileType = selectedFileType;
      if (selectedFileType === 'businessLicense' || selectedFileType === 'biz_license') {
        if (isTextFile) {
          determinedFileType = 'biz_license_text';
        } else if (isImageFile) {
          determinedFileType = 'biz_license';
        }
      }

      // 텍스트 파일인 경우 파일 내용을 직접 읽어서 처리
      if (isTextFile && (selectedFileType === 'businessLicense' || selectedFileType === 'biz_license')) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const textContent = e.target?.result as string;
            
            // 텍스트 내용을 파싱하여 폼에 채우기
            if (textContent) {
              const parsedData = parseBusinessLicenseText(textContent);
              setFormData((prev) => ({
                ...prev,
                ...(parsedData.companyName && { companyName: parsedData.companyName }),
                ...(parsedData.businessNumber && { businessNumber: parsedData.businessNumber }),
                ...(parsedData.representativeName && { representativeName: parsedData.representativeName }),
                ...(parsedData.address && { address: parsedData.address }),
                ...(parsedData.businessType && { businessType: parsedData.businessType }),
                ...(parsedData.businessItem && { businessItem: parsedData.businessItem }),
                ...(parsedData.establishedAt && { establishedAt: parsedData.establishedAt }),
              }));
            }
            
            // 파일 업로드 (텍스트 파일도 서버에 저장)
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('fileType', determinedFileType);

            const uploadResponse = await fetch(`/api/companies/${id}/upload`, {
              method: 'POST',
              body: uploadFormData,
            });

            if (uploadResponse.ok) {
              setUploadMessage('업로드 성공 - 텍스트 내용으로 폼이 자동 채워졌습니다.');
              await fetchFiles();
              setTimeout(() => setUploadMessage(''), 3000);
            } else {
              const errorData = await uploadResponse.json();
              setUploadMessage(`업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
              setTimeout(() => setUploadMessage(''), 3000);
            }
          } catch (error) {
            console.error('텍스트 파일 처리 실패:', error);
            setUploadMessage('텍스트 파일 처리에 실패했습니다.');
            setTimeout(() => setUploadMessage(''), 3000);
          }
        };
        reader.onerror = () => {
          setUploadMessage('텍스트 파일 읽기에 실패했습니다.');
          setTimeout(() => setUploadMessage(''), 3000);
        };
        reader.readAsText(file, 'UTF-8');
        return; // 텍스트 파일은 아래 OCR 처리 로직을 건너뜀
      }

      // 이미지 파일인 경우 기존 OCR 처리 로직
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileType', determinedFileType);

      const response = await fetch(`/api/companies/${id}/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const result = await response.json();
        setUploadMessage('업로드 성공');
        
        // 파일 목록 새로고침
        await fetchFiles();
        
        // 사업자등록증인 경우 OCR 결과를 받아서 폼에 자동 채우기
        if (selectedFileType === 'businessLicense' || selectedFileType === 'biz_license') {
          if (result.file?.extractedText) {
            const parsedData = parseBusinessLicenseText(result.file.extractedText);
            // 추출된 정보를 폼에 자동으로 채우기 (값이 있을 때만)
            setFormData((prev) => ({
              ...prev,
              ...(parsedData.companyName && { companyName: parsedData.companyName }),
              ...(parsedData.businessNumber && { businessNumber: parsedData.businessNumber }),
              ...(parsedData.representativeName && { representativeName: parsedData.representativeName }),
              ...(parsedData.address && { address: parsedData.address }),
              ...(parsedData.businessType && { businessType: parsedData.businessType }),
              ...(parsedData.businessItem && { businessItem: parsedData.businessItem }),
              ...(parsedData.establishedAt && { establishedAt: parsedData.establishedAt }),
            }));
          }
        }
        
        // 3초 후 메시지 제거
        setTimeout(() => setUploadMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setUploadMessage(`업로드 실패: ${errorData.error || '알 수 없는 오류'}`);
        setTimeout(() => setUploadMessage(''), 3000);
      }
    } catch (error) {
      console.error('파일 업로드 실패:', error);
      setUploadMessage('업로드 실패');
      setTimeout(() => setUploadMessage(''), 3000);
    }
  };

  // 파일 선택 버튼 클릭
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 드래그 앤 드롭 처리
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // 업체 삭제 처리
  const handleDelete = async () => {
    const confirmed = window.confirm('정말 이 업체를 삭제할까요? 이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`/api/companies/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          router.push('/companies');
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

  if (!company) {
    return null;
  }

  // fileType을 한글로 변환하는 함수
  const getFileTypeKorean = (fileType: string): string => {
    switch (fileType) {
      case 'business_license':
        return '사업자등록증';
      case 'credit':
        return '크레탑';
      case 'call_recording':
        return '통화녹음';
      default:
        return fileType;
    }
  };

  const getStatusBadgeColor = (status: string | null) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    switch (status) {
      case '사용중':
        return 'bg-green-100 text-green-800';
      case '삭제됨':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string | null) => {
    if (!status) return '-';
    return status;
  };

  // 날짜를 YYYY-MM-DD 형식으로 포맷하는 함수
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 상단: 제목과 뒤로 가기 */}
        <div className="mb-6">
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← 뒤로 가기(/companies)
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">업체 상세 목록</h1>
        </div>

        <div className="space-y-6">
          {/* 업체 기본 정보 폼 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">업체 기본 정보</h2>

            <div className="space-y-6">
              {/* 1. 업체명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업체명 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 2. 업태 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  업태
                </label>
                <input
                  type="text"
                  value={formData.businessType || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, businessType: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 3. 사업자등록번호 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록번호 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessNumber || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, businessNumber: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 4. 설립일 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">설립일</label>
                <input
                  type="date"
                  name="establishedAt"
                  value={formData.establishedAt ? new Date(formData.establishedAt).toISOString().split('T')[0] : ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ 
                      ...prev, 
                      establishedAt: e.target.value ? new Date(e.target.value).toISOString() : null 
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 5. 대표자명 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  대표자명 <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.representativeName || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, representativeName: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* 6. 주소 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 7. 기대출 현황 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기대출 현황</label>
                <input
                  type="text"
                  name="loanStatus"
                  value={formData.loanStatus || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, loanStatus: e.target.value }))
                  }
                  placeholder="예: OOO은행 3천만원, 이자율 4.2%"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 8. 기타정보 (메모) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">기타정보</label>
                <textarea
                  value={formData.memo || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, memo: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                업체 삭제
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
            </div>
          </div>

          {/* 파일 업로드 영역 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">파일 업로드</h2>

            {/* 파일 종류 선택 드롭다운 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                파일 종류
              </label>
              <select
                value={selectedFileType}
                onChange={(e) => setSelectedFileType(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="businessLicense">사업자등록증</option>
                <option value="credit">크레탑</option>
                <option value="callRecording">통화녹음</option>
              </select>
            </div>

            {/* 드래그 앤 드롭 영역 */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept={
                  selectedFileType === 'businessLicense'
                    ? '.pdf,.jpg,.jpeg,.png,.txt'
                    : selectedFileType === 'credit'
                    ? '.pdf,.xlsx,.xls'
                    : '.mp3,.wav,.m4a'
                }
              />
              <p className="text-gray-600 mb-4">
                파일을 드래그하여 여기에 놓거나, 아래 버튼을 클릭하세요
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                파일 선택
              </button>
            </div>

            {/* 업로드 성공 메시지 */}
            {uploadMessage && (
              <div
                className={`mt-4 p-3 rounded-lg text-center ${
                  uploadMessage === '업로드 성공'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {uploadMessage}
              </div>
            )}
          </div>

          {/* 파일 목록 */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">파일 목록</h2>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      파일명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      파일종류
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      업로드일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fileList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        업로드된 파일이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    fileList.map((file) => {
                      // 다운로드 URL 생성: path가 있으면 사용하고, 없으면 storedName으로 구성
                      const downloadUrl = file.path ?? `/uploads/${file.storedName}`;

                      return (
                        <tr 
                          key={file.id} 
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <a
                              href={downloadUrl}
                              download={file.originalName ?? undefined}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {file.originalName}
                            </a>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getFileTypeKorean(file.fileType)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(file.uploadedAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              사용중
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
