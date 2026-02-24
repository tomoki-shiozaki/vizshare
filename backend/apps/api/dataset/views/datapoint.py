from typing import Dict, List, TypedDict

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
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

    time: str  # CSVのraw_timeを格納
    # metrics は任意で追加される
    # 例: "anomaly": 0.12, "upper": 0.15
    # TypedDict total=False により任意で追加可能


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

    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)

        # DataPoint を取得して entity -> time -> order_index 順にソート
        data_qs = dataset.data_points.all().order_by(  # type: ignore
            "entity", "time", "order_index"  # type: ignore
        )

        result: TimeSeriesDataByEntity = {}

        for dp in data_qs:
            # entity ごとのリストを取得、なければ新規作成
            entity_data = result.setdefault(dp.entity, [])

            # 同じ raw_time の dict がすでにあるかチェック
            if entity_data and entity_data[-1].get("time") == dp.raw_time:
                # 既存の dict に metric を追加
                entity_data[-1][dp.metric] = dp.value
            else:
                # 新しい dict を作成して追加（TypedDict 変数を経由することで型安全）
                point: TimeSeriesPoint = {"time": dp.raw_time}
                point[dp.metric] = dp.value
                entity_data.append(point)

        return Response(result, status=status.HTTP_200_OK)
