from typing import Dict, List, TypedDict

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.dataset.services.timeseries import build_time_series_data
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


class DatasetTimeSeriesAPIView(APIView):
    """
    Dataset に紐づく DataPoint を entity ごとに整理して返す
    Recharts でそのまま使える形
    """

    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)
        # DataPoint を取得して entity -> time -> order_index 順にソート
        data_qs = dataset.data_points.all().order_by("entity", "time", "order_index")  # type: ignore
        result = build_time_series_data(data_qs)
        return Response(result, status=status.HTTP_200_OK)


class PublicDatasetTimeSeriesAPIView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, pk: int):
        dataset = get_object_or_404(
            Dataset, pk=pk, is_public=True, status=Dataset.Status.PARSED
        )
        data_qs = dataset.data_points.all().order_by("entity", "time", "order_index")  # type: ignore
        result = build_time_series_data(data_qs)
        return Response(result, status=status.HTTP_200_OK)
