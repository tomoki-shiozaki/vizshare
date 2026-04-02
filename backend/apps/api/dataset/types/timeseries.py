from typing import Dict, List, TypedDict


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
