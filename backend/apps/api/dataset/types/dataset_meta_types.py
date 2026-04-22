from typing import TypedDict


class DatasetMetaData(TypedDict):
    entities: list[str]
    metrics: list[str]
