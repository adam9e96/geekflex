import { useState } from "react";
import { collectionService } from "@services/collectionService";

/**
 * 컬렉션 생성을 위한 커스텀 훅
 *
 * 반환: { createCollection, isLoading, error }
 */
const useCreateCollection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 컬렉션 생성
   * @param {object} collectionData - { title, description, isPublic }
   * @returns {Promise<object>} 생성된 컬렉션 데이터
   */
  const createCollection = async (collectionData) => {
    setIsLoading(true);
    setError(null);

    try {
      const collection = await collectionService.createCollection(collectionData);
      console.log("📦 컬렉션 생성 성공:", collection);
      return collection;
    } catch (err) {
      console.error("컬렉션 생성 실패:", err);
      setError(err.message || "컬렉션 생성에 실패했습니다.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { createCollection, isLoading, error };
};

export default useCreateCollection;
