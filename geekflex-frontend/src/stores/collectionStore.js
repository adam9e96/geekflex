import { create } from "zustand";
import { collectionService } from "@services/collectionService";

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
      const collections = await collectionService.fetchMyCollections();
      const collectionsArray = Array.isArray(collections) ? collections : [];

      set({
        myCollections: collectionsArray,
        isLoadingMy: false,
        errorMy: null,
      });
    } catch (error) {
      console.error("내 컬렉션 목록 데이터 로딩 실패:", error);
      set({
        myCollections: [],
        errorMy: error.message,
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
      const data = await collectionService.fetchPublicCollections(params);
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
        errorPublic: error.message,
        isLoadingPublic: false,
      });
    }
  },

  // 컬렉션 삭제
  deleteCollection: async (collectionId) => {
    try {
      await collectionService.deleteCollection(collectionId);
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
