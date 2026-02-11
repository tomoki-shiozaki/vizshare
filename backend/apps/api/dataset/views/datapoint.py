from typing import Dict, List, TypedDict

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.dataset.models import Dataset

# ===============================
# 🔹 型定義（返却データ構造）
# ===============================


class TimeSeriesPoint(TypedDict, total=False):
    """
    1つの時刻における metric データ
    """

    time: str  # ISO形式の datetime
    # metrics は任意で追加される
    # 例: "anomaly": 0.12, "upper": 0.15
    # key は str、value は float | None
    # TypedDict では事前定義できないので total=False


# entityごとのデータ構造
# キー: entity名、値: TimeSeriesPoint のリスト（時間順）
TimeSeriesDataByEntity = Dict[str, List[TimeSeriesPoint]]


# ===============================
# 🔹 API View
# ===============================


class DatasetDataAPIView(APIView):
    """
    Dataset に紐づく DataPoint を entity ごとに整理して返す
    Recharts でそのまま使える形
    """

    def get(self, request, pk: int):
        try:
            dataset = Dataset.objects.get(pk=pk)
        except Dataset.DoesNotExist:
            return Response(
                {"detail": "Dataset not found"}, status=status.HTTP_404_NOT_FOUND
            )

        # DataPoint を取得して時間順にソート
        data_qs = dataset.data_points.all().order_by("entity", "time", "order_index")  # type: ignore

        result: TimeSeriesDataByEntity = {}

        for dp in data_qs:
            entity_data = result.setdefault(dp.entity, [])

            # 同じ raw_time の dict がすでにあるかチェック
            if entity_data and entity_data[-1].get("time") == dp.raw_time:
                # metric を追加
                entity_data[-1][dp.metric] = dp.value
            else:
                # 新しい raw_time の dict を作成
                entity_data.append({"time": dp.raw_time, dp.metric: dp.value})  # type: ignore

        return Response(result, status=status.HTTP_200_OK)
