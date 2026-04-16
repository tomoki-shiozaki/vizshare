from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.generics import ListAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.api.dataset.serializers.dataset_timeseries import DataPointSerializer
from apps.api.dataset.services.timeseries import build_time_series_data
from apps.api.dataset.types.timeseries import TimeSeriesDataByEntity
from apps.api.utils.schema import schema
from apps.dataset.models import Dataset


# ===============================
# 🔹 API View
# ===============================
class DatasetDataPointAPIView(ListAPIView):
    serializer_class = DataPointSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        dataset = get_object_or_404(
            Dataset,
            pk=self.kwargs["pk"],
            owner=self.request.user,
        )

        qs = dataset.data_points.all()  # type: ignore

        # --- クエリパラメータ ---
        entities = self.request.query_params.get("entities")  # type: ignore
        metrics = self.request.query_params.get("metrics")  # type: ignore
        start = self.request.query_params.get("start")  # type: ignore
        end = self.request.query_params.get("end")  # type: ignore

        if entities:
            entity_list = [e.strip() for e in entities.split(",")]
            qs = qs.filter(entity__in=entity_list)

        if metrics:
            metric_list = [m.strip() for m in metrics.split(",")]
            qs = qs.filter(metric__in=metric_list)

        if start:
            qs = qs.filter(raw_time__gte=start)

        if end:
            qs = qs.filter(raw_time__lte=end)

        return qs.order_by("time", "entity", "metric", "order_index")


class DatasetMetaAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk: int):
        dataset = get_object_or_404(Dataset, pk=pk, owner=request.user)

        qs = dataset.data_points.all()  # type: ignore

        entities = list(qs.values_list("entity", flat=True).distinct())
        metrics = list(qs.values_list("metric", flat=True).distinct())

        return Response(
            {
                "entities": sorted(entities),
                "metrics": sorted(metrics),
            }
        )


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
