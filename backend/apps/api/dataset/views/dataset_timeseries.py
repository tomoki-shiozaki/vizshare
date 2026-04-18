from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.dataset.services.entity_comparison_builder import (
    build_entity_comparison_data,
)
from apps.api.dataset.services.timeseries import build_time_series_data
from apps.api.dataset.types.entity_comparison_types import EntityComparisonResponse
from apps.api.dataset.types.timeseries import TimeSeriesDataByEntity
from apps.api.utils.schema import schema
from apps.dataset.models import Dataset

# ===============================
# 🔹 API View
# ===============================


class DatasetTimeSeriesAPIView(APIView):
    """
    Dataset に紐づく DataPoint を entity ごとに整理して返す
    Recharts でそのまま使える形
    """

    permission_classes = [IsAuthenticated]

    @schema(
        summary="ユーザー Dataset の時系列データ取得",
        description="Dataset に紐づく DataPoint を entity ごとに整理して返す（Recharts 形式）",
        tags=["Dataset"],
        responses=TimeSeriesDataByEntity,
    )
    def get(self, request, pk: int):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)
        # DataPoint を取得して entity -> time -> order_index 順にソート
        data_qs = dataset.data_points.all().order_by("entity", "time", "order_index")  # type: ignore
        result = build_time_series_data(data_qs)
        return Response(result, status=status.HTTP_200_OK)


class DatasetEntityComparisonAPIView(APIView):
    """
    Dataset の entity 比較用時系列データ（wide形式）
    Recharts でそのまま使える形
    """

    permission_classes = [IsAuthenticated]

    @schema(
        summary="ユーザー Dataset の entity比較データ取得",
        description="timeを軸にentityを横展開したRecharts用データ",
        tags=["Dataset"],
        responses=EntityComparisonResponse,
    )
    def get(self, request, pk: int):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)

        metric = request.query_params.get("metric")
        if not metric:
            return Response(
                {"detail": "metric is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        data_qs = dataset.data_points.filter(metric=metric).order_by(  # type: ignore
            "time", "entity", "order_index"
        )

        result = build_entity_comparison_data(data_qs)

        return Response(result, status=status.HTTP_200_OK)


class PublicDatasetTimeSeriesAPIView(APIView):
    permission_classes = [AllowAny]

    @schema(
        summary="公開 Dataset の時系列データ取得",
        description="公開 Dataset に紐づく DataPoint を entity ごとに整理して返す（Recharts 形式）",
        tags=["Dataset"],
        responses=TimeSeriesDataByEntity,
    )
    def get(self, request, pk: int):
        dataset = get_object_or_404(
            Dataset, pk=pk, is_public=True, status=Dataset.Status.PARSED
        )
        data_qs = dataset.data_points.all().order_by("entity", "time", "order_index")  # type: ignore
        result = build_time_series_data(data_qs)
        return Response(result, status=status.HTTP_200_OK)
