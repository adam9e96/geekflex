import { useState } from "react";
import { getAccessToken } from "@utils/auth";
import { buildApiUrl } from "@services/apiClient";

/**
 * 컬렉션 삭제를 위한 커스텀 훅
 *
 * 반환: { deleteCollection, isLoading, error }
 */
const useDeleteCollection = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 컬렉션 삭제
   * @param {number} collectionId - 컬렉션 ID
   * @returns {Promise<void>}
   */
  const deleteCollection = async (collectionId) => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(buildApiUrl(`/api/v1/collections/${collectionId}`), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || "컬렉션 삭제에 실패했습니다.";
        throw new Error(errorMessage);
      }

      console.log("📦 컬렉션 삭제 성공");
    } catch (err) {
      console.error("컬렉션 삭제 실패:", err);
      setError(err.message || "컬렉션 삭제에 실패했습니다.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteCollection, isLoading, error };
};

export default useDeleteCollection;
