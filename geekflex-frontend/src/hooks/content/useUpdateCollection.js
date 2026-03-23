import { useState } from "react";
import { collectionService } from "@services/collectionService";

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
      const collection = await collectionService.updateCollection(collectionId, collectionData);
      console.log("📦 컬렉션 수정 성공:", collection);
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
