from collections import defaultdict
from typing import Any, Dict, Iterable, List


def build_entity_comparison_data(data_qs: Iterable) -> List[Dict[str, Any]]:
    """
    entity比較用（wide形式）
    timeを軸にして entity を横展開する

    前提:
    - data_qs は単一 metric にフィルタ済み
    - time は None でない
    """

    table: Dict[Any, Dict[str, Any]] = defaultdict(dict)
    time_map: Dict[Any, str] = {}

    ordered_times: List[Any] = []
    seen = set()

    metric_seen = None  # 単一metricチェック用

    for dp in data_qs:
        # --- metricガード ---
        if metric_seen is None:
            metric_seen = dp.metric
        elif dp.metric != metric_seen:
            raise ValueError("Multiple metrics not allowed")

        # --- timeガード ---
        if dp.time is None:
            raise ValueError("time must not be None")

        t = dp.time
        raw = dp.raw_time
        entity = dp.entity

        if t not in seen:
            seen.add(t)
            ordered_times.append(t)

        table[t][entity] = dp.value
        time_map[t] = raw

    return [{"time": time_map[t], **table[t]} for t in ordered_times]
