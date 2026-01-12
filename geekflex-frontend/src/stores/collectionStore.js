import { create } from "zustand";
import { getAccessToken } from "@utils/auth";

/**
 * 컬렉션 페이지 상태 관리 Zustand 스토어
 * 
 * @param {Object} set - Zustand의 set 함수
 * @param {Object} get - Zustand의 get 함수
 * @returns {Object} 컬렉션 페이지 상태 관리 스토어
 * 
 * @since 2025-01-XX
 * @description 컬렉션 페이지의 모달 상태, 정렬, 컬렉션 데이터를 관리하는 스토어
 * 
 * @usage 사용처:
 * - src/pages/CollectionPage.jsx
 */
export const useCollectionStore = create((set, get) => ({
  // 모달 상태
  isCreateModalOpen: false,
  isEditModalOpen: false,
  editingCollection: null,

  // 정렬 상태
  sortBy: "latest", // 'latest' | 'views'

  // 내 컬렉션 데이터
  myCollections: [],
  isLoadingMy: true,
  errorMy: null,

  // 공개 컬렉션 데이터
  publicCollections: [],
  isLoadingPublic: true,
  errorPublic: null,
  publicTotalElements: 0,
  publicTotalPages: 0,

  // 페이지네이션
  publicPage: 0,
  publicSize: 20,

  // 컬렉션 생성 모달 열기
  openCreateModal: () => {
    set({ isCreateModalOpen: true });
  },

  // 컬렉션 생성 모달 닫기
  closeCreateModal: () => {
    set({ isCreateModalOpen: false });
  },

  // 컬렉션 수정 모달 열기
  openEditModal: (collection) => {
    set({
      isEditModalOpen: true,
      editingCollection: collection,
    });
  },

  // 컬렉션 수정 모달 닫기
  closeEditModal: () => {
    set({
      isEditModalOpen: false,
      editingCollection: null,
    });
  },

  // 정렬 기준 변경
  setSortBy: (sortBy) => {
    set({ sortBy, publicPage: 0 }); // 정렬 변경 시 첫 페이지로 리셋
  },

  // 내 컬렉션 데이터 설정
  setMyCollections: (collections, isLoading, error) => {
    set({
      myCollections: collections || [],
      isLoadingMy: isLoading ?? false,
      errorMy: error || null,
    });
  },

  // 공개 컬렉션 데이터 설정
  setPublicCollections: (collections, isLoading, error, totalElements, totalPages) => {
    set({
      publicCollections: collections || [],
      isLoadingPublic: isLoading ?? false,
      errorPublic: error || null,
      publicTotalElements: totalElements || 0,
      publicTotalPages: totalPages || 0,
    });
  },

  // 내 컬렉션 가져오기
  fetchMyCollections: async () => {
    set({ isLoadingMy: true, errorMy: null });

    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        set({
          myCollections: [],
          errorMy: "로그인이 필요합니다.",
          isLoadingMy: false,
        });
        return;
      }

      const response = await fetch("/api/v1/collections/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          set({
            myCollections: [],
            errorMy: "로그인이 필요합니다.",
            isLoadingMy: false,
          });
        } else {
          set({
            myCollections: [],
            errorMy: `내 컬렉션 데이터를 불러오는데 실패했습니다: ${response.status}`,
            isLoadingMy: false,
          });
        }
        return;
      }

      const result = await response.json();
      console.log("📦 내 컬렉션 목록 응답 데이터:", result);

      const collectionList = result.data || result;
      const collectionsArray = Array.isArray(collectionList) ? collectionList : [];

      set({
        myCollections: collectionsArray,
        isLoadingMy: false,
        errorMy: null,
      });
    } catch (error) {
      console.error("내 컬렉션 목록 데이터 로딩 실패:", error);
      const errorMessage =
        error.message && error.message.includes("401")
          ? "로그인이 필요합니다."
          : error.message || "내 컬렉션 데이터를 불러오는데 실패했습니다.";

      set({
        myCollections: [],
        errorMy: errorMessage,
        isLoadingMy: false,
      });
    }
  },

  // 공개 컬렉션 가져오기
  fetchPublicCollections: async (sortBy, page, size) => {
    const params = {
      sortBy: sortBy || get().sortBy,
      page: page !== undefined ? page : get().publicPage,
      size: size !== undefined ? size : get().publicSize,
    };

    set({ isLoadingPublic: true, errorPublic: null });

    try {
      const queryParams = new URLSearchParams({
        sortBy: params.sortBy,
        page: params.page.toString(),
        size: params.size.toString(),
      });

      const response = await fetch(`/api/v1/collections?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`공개 컬렉션 데이터를 불러오는데 실패했습니다: ${response.status}`);
      }

      const result = await response.json();
      console.log("📦 공개 컬렉션 목록 응답 데이터:", result);

      const data = result.data || result;
      const content = data.content || (Array.isArray(data) ? data : []);

      set({
        publicCollections: content,
        publicTotalElements: data.totalElements || content.length,
        publicTotalPages: data.totalPages || 1,
        publicPage: params.page,
        isLoadingPublic: false,
        errorPublic: null,
      });
    } catch (error) {
      console.error("공개 컬렉션 목록 데이터 로딩 실패:", error);
      set({
        publicCollections: [],
        errorPublic: error.message || "공개 컬렉션 데이터를 불러오는데 실패했습니다.",
        isLoadingPublic: false,
      });
    }
  },

  // 컬렉션 삭제
  deleteCollection: async (collectionId) => {
    try {
      const accessToken = getAccessToken();
      if (!accessToken) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await fetch(`/api/v1/collections/${collectionId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: "include",
      });

      if (!response.ok && response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.message || errorData.error || "컬렉션 삭제에 실패했습니다.";
        throw new Error(errorMessage);
      }

      console.log("📦 컬렉션 삭제 성공");

      // 삭제 후 목록 새로고침
      get().fetchMyCollections();
      get().fetchPublicCollections();
    } catch (error) {
      console.error("컬렉션 삭제 실패:", error);
      throw error;
    }
  },

  // 모든 컬렉션 새로고침
  refetchAll: () => {
    get().fetchMyCollections();
    get().fetchPublicCollections();
  },
}));
