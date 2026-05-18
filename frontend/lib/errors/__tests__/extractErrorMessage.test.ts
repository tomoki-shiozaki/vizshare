import type { AxiosErrorWithResponse } from "@/types/client";
import { AxiosHeaders } from "axios";
import { extractErrorMessage } from "@/lib/errors/extractErrorMessage";

describe("extractErrorMessage", () => {
  const baseError: Partial<AxiosErrorWithResponse> = {
    config: {
      headers: new AxiosHeaders(),
      _retry: false,
    },
    isAxiosError: true,
    name: "AxiosError",
  };

  it("ネットワークエラーの場合（responseなし）", () => {
    const error = {
      ...baseError,
      message: "Network Error",
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe("サーバーに接続できませんでした。");
  });

  it("サーバーエラー（500系）の場合", () => {
    const error = {
      ...baseError,
      message: "Service Unavailable",
      response: {
        status: 503,
        data: undefined,
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe(
      "サーバー内部エラーが発生しました。",
    );
  });

  it("data.detailがある場合", () => {
    const error = {
      ...baseError,
      response: {
        status: 400,
        data: { detail: "詳細エラー" },
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe("詳細エラー");
  });

  it("data.non_field_errorsがある場合", () => {
    const error = {
      ...baseError,
      response: {
        status: 400,
        data: { non_field_errors: ["非フィールドエラー"] },
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe("非フィールドエラー");
  });

  it("その他のフィールドの配列や文字列がある場合", () => {
    const error1 = {
      ...baseError,
      response: {
        status: 400,
        data: { username: ["ユーザー名エラー"] },
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error1)).toBe("ユーザー名エラー");

    const error2 = {
      ...baseError,
      response: {
        status: 400,
        data: { email: "メールエラー" },
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error2)).toBe("メールエラー");
  });

  it("dataが文字列の場合はfallbackになる", () => {
    const error = {
      ...baseError,
      response: {
        status: 400,
        data: "エラーです",
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe("エラーが発生しました。");
  });

  it("どれにも当てはまらない場合はfallbackを返す", () => {
    const error = {
      ...baseError,
      message: "不明なエラー",
      response: {
        status: 400,
        data: {},
      },
    } as unknown as AxiosErrorWithResponse;

    expect(extractErrorMessage(error)).toBe("エラーが発生しました。");
  });
});
