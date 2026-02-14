from rest_framework.pagination import LimitOffsetPagination


class StandardPagination(LimitOffsetPagination):
    # クライアントが limit を指定しなかった場合のデフォルト
    default_limit = 10

    # クライアントが指定できる最大件数（安全装置）
    max_limit = 50
