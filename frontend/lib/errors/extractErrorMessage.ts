import type { AxiosErrorWithResponse, ApiErrorResponse } from "@/types/client";

// 型ガード
const isApiErrorResponse = (data: unknown): data is ApiErrorResponse =>
  typeof data === "object" && data !== null;

export const extractErrorMessage = (error: AxiosErrorWithResponse): string => {
  const status = error.response?.status;
  const data: unknown = error.response?.data;

  // response自体がない（ネットワーク断など）
  if (!error.response) {
    return "サーバーに接続できませんでした。";
  }

  // 5xx は詳細を見せない
  if (status && status >= 500 && status < 600) {
    return "サーバー内部エラーが発生しました。";
  }

  // DRF系 JSON error
  if (isApiErrorResponse(data)) {
    if (typeof data.detail === "string") {
      return data.detail;
    }

    if (
      Array.isArray(data.non_field_errors) &&
      data.non_field_errors.length > 0
    ) {
      return data.non_field_errors[0];
    }

    for (const value of Object.values(data)) {
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "string"
      ) {
        return value[0];
      }

      if (typeof value === "string") {
        return value;
      }
    }
  }

  // fallback
  return "エラーが発生しました。";
};
