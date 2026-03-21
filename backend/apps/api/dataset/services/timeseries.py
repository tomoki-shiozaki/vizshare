from typing import Dict, Iterable, List, TypedDict

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
# 🔹 関数
# ===============================


def build_time_series_data(data_qs: Iterable) -> TimeSeriesDataByEntity:
    """
    DataPoint の queryset から entity ごとの時系列データを作成
    """
    result: TimeSeriesDataByEntity = {}

    for dp in data_qs:
        entity_data = result.setdefault(dp.entity, [])

        if entity_data and entity_data[-1].get("time") == dp.raw_time:
            entity_data[-1][dp.metric] = dp.value
        else:
            point: TimeSeriesPoint = {"time": dp.raw_time}
            point[dp.metric] = dp.value
            entity_data.append(point)

    return result
