import pytest

from apps.dataset.services.tasks_runner import parse_dataset_sync


class TestParseDatasetSync:
    """parse_dataset_sync のテスト"""

    def test_skip_when_mark_processing_returns_false(self, mocker):
        """
        すでに処理中なら何もしない
        """
        dataset = mocker.Mock()
        dataset.mark_processing.return_value = False

        # tasks_runner 内で使われている Dataset.objects.get をモック
        mocker.patch(
            "apps.dataset.services.tasks_runner.Dataset.objects.get",
            return_value=dataset,
        )

        # tasks_runner 内で使われている parse_dataset_csv をモック
        parse_csv_mock = mocker.patch(
            "apps.dataset.services.tasks_runner.parse_dataset_csv"
        )

        parse_dataset_sync(dataset_id=1)

        dataset.mark_processing.assert_called_once()
        parse_csv_mock.assert_not_called()
        dataset.mark_parsed.assert_not_called()
        dataset.mark_failed.assert_not_called()

    def test_success_flow(self, mocker):
        """
        正常系: CSV解析 → mark_parsed 呼ばれる
        """
        dataset = mocker.Mock()
        dataset.mark_processing.return_value = True

        mocker.patch(
            "apps.dataset.services.tasks_runner.Dataset.objects.get",
            return_value=dataset,
        )

        parse_csv_mock = mocker.patch(
            "apps.dataset.services.tasks_runner.parse_dataset_csv",
            return_value=10,
        )

        parse_dataset_sync(dataset_id=1)

        parse_csv_mock.assert_called_once_with(dataset)
        dataset.mark_parsed.assert_called_once_with(result={"row_count": 10})
        dataset.mark_failed.assert_not_called()

    def test_failure_flow(self, mocker):
        """
        例外発生時: mark_failed が呼ばれ例外再送出
        """
        dataset = mocker.Mock()
        dataset.mark_processing.return_value = True

        mocker.patch(
            "apps.dataset.services.tasks_runner.Dataset.objects.get",
            return_value=dataset,
        )

        mocker.patch(
            "apps.dataset.services.tasks_runner.parse_dataset_csv",
            side_effect=Exception("boom"),
        )

        with pytest.raises(Exception):
            parse_dataset_sync(dataset_id=1)

        dataset.mark_failed.assert_called_once()
        dataset.mark_parsed.assert_not_called()
