import { useState } from "react";
import { getAccessToken } from "@utils/auth";

/**
 * 컬렉션 수정을 위한 커스텀 훅
 *
 * 반환: { updateCollection, isLoading, error }
 */
const useUpdateCollection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 컬렉션 수정
   * @param {number} collectionId - 컬렉션 ID
   * @param {object} collectionData - { title, description, isPublic }
   * @returns {Promise<object>} 수정된 컬렉션 데이터
   */
  const updateCollection = async (collectionId, collectionData) => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`/api/v1/collections/${collectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(collectionData),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || errorData.error || "컬렉션 수정에 실패했습니다.";
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log("📦 컬렉션 수정 응답:", result);

      // 응답 형식에 따라 데이터 추출
      const collection = result.data || result;
      return collection;
    } catch (err) {
      console.error("컬렉션 수정 실패:", err);
      setError(err.message || "컬렉션 수정에 실패했습니다.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateCollection, isLoading, error };
};

export default useUpdateCollection;

