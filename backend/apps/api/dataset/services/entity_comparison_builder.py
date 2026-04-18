from collections import defaultdict
from typing import Any, Dict, Iterable, List


def build_entity_comparison_data(data_qs: Iterable) -> List[Dict[str, Any]]:
    """
    entity比較用（wide形式）
    timeを軸にして entity を横展開する
    """

    # time -> {entity -> value}
    table: Dict[str, Dict[str, Any]] = defaultdict(dict)
    all_times = set()

    for dp in data_qs:
        time = dp.raw_time
        entity = dp.entity

        all_times.add(time)
        table[time][entity] = dp.value

    # time順に整形
    return [{"time": t, **table[t]} for t in sorted(all_times)]
