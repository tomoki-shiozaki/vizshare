from typing import Iterable

from apps.api.dataset.types.timeseries import TimeSeriesDataByEntity, TimeSeriesPoint


def build_time_series_data(data_qs: Iterable) -> TimeSeriesDataByEntity:
    """
    DataPoint の queryset から entity ごとの時系列データを作成
    """
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

    return result
