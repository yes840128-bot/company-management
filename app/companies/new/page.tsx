'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { parseBusinessLicenseText } from '@/lib/parseBusinessLicense';

export default function NewCompanyPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    representativeName: '',
    address: '',
    businessType: '',
    businessItem: '',
    creditRating: '',
    riskRating: '',
    memo: '',
    establishedAt: '',
    loanStatus: '',
    businessLicensePath: '',
  });
  const [selectedFileType, setSelectedFileType] = useState<string>('businessLicense');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [manualText, setManualText] = useState<string>('');
  const textFileInputRef = useRef<HTMLInputElement>(null); // 텍스트 파일 전용 input ref

  // 파싱된 데이터를 폼에 자동으로 채우는 함수
  function applyParsedDataToForm(parsedData: {
    companyName?: string;
    businessNumber?: string;
    representativeName?: string;
    address?: string;
    businessType?: string;
    businessItem?: string;
    establishedAt?: string | null;
  }) {
    // 추출된 정보를 폼에 자동으로 채우기 (값이 있을 때만)
    setFormData((prev) => ({
      ...prev,
      ...(parsedData.companyName && { companyName: parsedData.companyName }),
      ...(parsedData.businessNumber && { businessNumber: parsedData.businessNumber }),
      ...(parsedData.representativeName && { representativeName: parsedData.representativeName }),
      ...(parsedData.address && { address: parsedData.address }),
      ...(parsedData.businessType && { businessType: parsedData.businessType }),
      ...(parsedData.businessItem && { businessItem: parsedData.businessItem }),
      ...(parsedData.establishedAt !== undefined && { establishedAt: parsedData.establishedAt || '' }),
    }));
  }

  // 텍스트를 파싱하여 폼에 자동으로 채우는 함수 (하위 호환성 유지)
  function applyTextToForm(text: string) {
    if (!text || !text.trim()) {
      return;
    }

    // parseBusinessLicenseText 함수로 텍스트에서 정보 추출
    const parsedData = parseBusinessLicenseText(text);
    applyParsedDataToForm(parsedData);
  }

  // 파일 업로드 및 자동 채우기
  const handleFileUpload = async (file: File, fileType: string) => {
    try {
      // 업로드한 파일을 상태에 저장 (등록 시 함께 보내기 위해)
      setUploadedFile(file);
      setUploadMessage('파일이 선택되었습니다. 등록 버튼을 눌러 업로드하세요.');

      // 파일 타입이 사업자등록증이거나 텍스트 파일인 경우에만 처리
      if (fileType !== 'businessLicense' && fileType !== 'biz_license' && fileType !== 'text') {
        return;
      }

      // 파일 MIME 타입 확인
      const isTextFile = file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt');
      const isImageFile = file.type.startsWith('image/') || 
                         /\.(jpg|jpeg|png)$/i.test(file.name);

      // 파일 타입 결정
      let determinedFileType = 'biz_license'; // 기본값 (이미지)
      if (fileType === 'text' || isTextFile) {
        // 'text' 타입으로 명시적으로 호출된 경우 또는 텍스트 파일인 경우
        determinedFileType = 'biz_license_text';
      } else if (isImageFile) {
        determinedFileType = 'biz_license';
      }

      // FormData 생성
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('fileType', determinedFileType);

      // preview-from-file API 호출 (텍스트 파일과 이미지 파일 모두 동일한 API 사용)
      const response = await fetch('/api/companies/preview-from-file', {
        method: 'POST',
        body: uploadFormData,
      });

      if (response.ok) {
        const previewData = await response.json();
        
        // 파싱된 데이터가 있으면 폼에 자동으로 채우기
        if (previewData.parsed) {
          applyParsedDataToForm(previewData.parsed);
          
          // 성공 메시지 설정
          if (isTextFile) {
            setUploadMessage('파일이 선택되었고, 텍스트 내용으로 폼이 자동 채워졌습니다.');
          } else {
            setUploadMessage('파일이 선택되었고, OCR 결과로 폼이 자동 채워졌습니다.');
          }
        } else if (previewData.rawText) {
          // parsed가 없으면 rawText로 파싱 (하위 호환성)
          applyTextToForm(previewData.rawText);
          setUploadMessage('파일이 선택되었고, 폼이 자동 채워졌습니다.');
        } else {
          setUploadMessage('파일이 선택되었습니다. 등록 버튼을 눌러 업로드하세요.');
        }
      } else {
        const errorData = await response.json();
        if (response.status === 500) {
          setUploadMessage('파일 처리에 실패했습니다. 파일은 등록 시 함께 업로드됩니다.');
        } else {
          setUploadMessage(`파일 처리에 실패했습니다: ${errorData.error || '알 수 없는 오류'}`);
        }
      }
    } catch (error) {
      console.error('파일 처리 실패:', error);
      setUploadMessage('파일 처리에 실패했습니다. 파일은 등록 시 함께 업로드됩니다.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // FormData 생성 (파일과 함께 보내기 위해)
      const sendData = new FormData();

      // 기존 formData 안에 들어있는 값들을 FormData에 옮기기
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          sendData.append(key, String(value));
        }
      });

      // 업로드된 파일이 있다면 같이 첨부
      if (uploadedFile) {
        // 파일 타입 결정
        const isTextFile = uploadedFile.type === 'text/plain' || uploadedFile.name.toLowerCase().endsWith('.txt');
        const isImageFile = uploadedFile.type.startsWith('image/') || 
                           /\.(jpg|jpeg|png)$/i.test(uploadedFile.name);
        
        let fileType = 'business_license'; // 기본값 (이미지)
        if (isTextFile) {
          fileType = 'business_license_text';
        } else if (isImageFile) {
          fileType = 'business_license';
        }
        
        sendData.append('file', uploadedFile);
        sendData.append('fileType', fileType);
      }

      const response = await fetch('/api/companies', {
        method: 'POST',
        body: sendData,
      });

      if (response.ok) {
        const newCompany = await response.json();
        alert('업체가 등록되었습니다.');
        router.push(`/companies/${newCompany.id}`);
      } else {
        const errorData = await response.json().catch(() => null);
        alert(errorData?.error || '업체 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('등록 실패:', error);
      alert('업체 등록에 실패했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            href="/companies"
            className="text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← 목록으로 돌아가기
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">새 업체 등록</h1>

          {/* 정보 입력 폼 */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. 업체명 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                업체명 <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, companyName: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 2. 업태 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">업태</label>
              <input
                type="text"
                value={formData.businessType}
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
                value={formData.businessNumber}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, businessNumber: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 4. 설립일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">설립일</label>
              <input
                type="date"
                name="establishedAt"
                value={formData.establishedAt}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, establishedAt: e.target.value }))
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
                value={formData.representativeName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, representativeName: e.target.value }))
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 6. 주소 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
              <input
                type="text"
                value={formData.address}
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
                value={formData.loanStatus}
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
                value={formData.memo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, memo: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>

            {/* 파일 업로드 섹션 */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">파일 업로드</h3>
              <div className="mb-3">
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
              
              {/* 기존 파일 업로드 버튼 (이미지 + 텍스트 파일 모두 선택 가능) */}
              <label className="flex flex-col items-center p-3 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors mb-3">
                <input
                  type="file"
                  accept={
                    selectedFileType === 'businessLicense'
                      ? '.jpg,.jpeg,.png,.txt' // 1) 수정: .pdf 제거, .txt 포함
                      : selectedFileType === 'credit'
                      ? '.pdf,.xlsx,.xls'
                      : '.mp3,.wav,.m4a'
                  }
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('선택된 파일:', file.name, '타입:', file.type);
                      handleFileUpload(file, selectedFileType);
                    }
                  }}
                />
                <span className="text-sm font-medium text-blue-700">파일 선택</span>
              </label>

              {/* 2) 추가: 텍스트 파일 전용 업로드 버튼 */}
              <div className="mb-3">
                <button
                  type="button"
                  onClick={() => textFileInputRef.current?.click()}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  텍스트 파일 업로드
                </button>
                <input
                  ref={textFileInputRef}
                  type="file"
                  accept=".txt"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      console.log('텍스트 파일 선택:', file.name, '타입:', file.type);
                      handleFileUpload(file, 'text'); // 'text' 타입으로 명시적으로 호출
                    }
                  }}
                />
              </div>

              {uploadMessage && (
                <div className="mt-2 text-sm text-gray-600">
                  {uploadMessage}
                </div>
              )}
              <p className="text-xs text-gray-500 mt-2">
                * 이미지(.jpg, .png) 또는 텍스트 파일(.txt)을 업로드하면 자동으로 내용이 채워집니다. 확인 후 수정하실 수 있습니다.
              </p>

              {/* 텍스트 직접 붙여넣기 섹션 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  사업자등록증 텍스트 직접 붙여넣기
                </label>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="홈택스/국세청에서 복사한 사업자등록증 텍스트를 붙여넣어 주세요."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={6}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (manualText.trim()) {
                      applyTextToForm(manualText);
                      setUploadMessage('붙여넣은 텍스트를 분석해서 폼을 자동으로 채웠습니다. 내용 확인 후 수정해 주세요.');
                    }
                  }}
                  disabled={!manualText.trim()}
                  className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
                >
                  텍스트에서 자동 채우기
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                등록
              </button>
              <Link
                href="/companies"
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors text-center"
              >
                취소
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
