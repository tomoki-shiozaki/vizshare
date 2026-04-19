from collections import defaultdict
from typing import Any, Dict, Iterable, List


def build_entity_comparison_data(data_qs: Iterable) -> List[Dict[str, Any]]:
    """
    entity比較用（wide形式）
    timeを軸にして entity を横展開する
    """

    table: Dict[Any, Dict[str, Any]] = defaultdict(dict)
    time_map: Dict[Any, str] = {}

    ordered_times: List[Any] = []
    seen = set()

    for dp in data_qs:
        t = dp.time
        raw = dp.raw_time
        entity = dp.entity

        if t not in seen:
            seen.add(t)
            ordered_times.append(t)

        table[t][entity] = dp.value
        time_map[t] = raw

    return [{"time": time_map[t], **table[t]} for t in ordered_times]
