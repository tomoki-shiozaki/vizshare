# Neon: app_user 作成・権限設定手順

このドキュメントは、Neon（PostgreSQL）環境においてアプリケーション用ユーザー `app_user` を作成し、必要な権限を付与するための手順をまとめたものです。

---

## 目的

- アプリケーション用DBユーザー `app_user` を作成する
- 最小権限で安全にアクセスできるようにする
- 将来作成されるテーブル・シーケンスにも自動で権限を付与する

---

## 前提

- 実行ロール：`neondb_owner`（またはスーパーユーザー相当）
- 対象スキーマ：`public`
- 環境：Neon PostgreSQL

---

## 1. ロール作成（未作成の場合のみ）

```sql
-- =========================================
-- 1. ロール作成（未作成なら）
-- =========================================
CREATE ROLE app_user WITH LOGIN PASSWORD '****************';
```

> ※ パスワードはSecret Managerや環境変数で管理することが推奨

---

## 2. スキーマアクセス権

```sql
-- =========================================
-- 2. スキーマアクセス権
-- =========================================
GRANT USAGE ON SCHEMA public TO app_user;

-- セキュリティ強化：DDL禁止
REVOKE CREATE ON SCHEMA public FROM app_user;
```

---

## 3. 既存テーブル権限（重要）

```sql
-- =========================================
-- 3. 既存テーブル権限
-- =========================================
GRANT SELECT, INSERT, UPDATE, DELETE
ON ALL TABLES IN SCHEMA public
TO app_user;
```

---

## 4. 既存シーケンス権限（AUTO INCREMENT対策）

```sql
-- =========================================
-- 4. 既存シーケンス権限
-- =========================================
GRANT USAGE, SELECT
ON ALL SEQUENCES IN SCHEMA public
TO app_user;
```

---

## 5. 将来作成されるテーブルへの権限

```sql
-- =========================================
-- 5. 将来作成されるテーブルへの権限
-- =========================================
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;
```

---

## 6. 将来作成されるシーケンスへの権限

```sql
-- =========================================
-- 6. 将来作成されるシーケンスへの権限
-- =========================================
ALTER DEFAULT PRIVILEGES FOR ROLE neondb_owner IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO app_user;
```

---

## 7. 権限確認（任意）

```sql
-- =========================================
-- 7. 確認用
-- =========================================
SELECT grantee, privilege_type, table_name
FROM information_schema.role_table_grants
WHERE grantee = 'app_user';
```

---

## 8. 接続ユーザー（重要）

この設定では、用途によってDB接続ユーザーを使い分ける。

### ■ 管理・マイグレーション用（neondb_owner）

```text
postgresql://neondb_owner:<password>@<host>/neondb?sslmode=require&channel_binding=require
```

用途：

- Django migration（makemigrations / migrate）
- テーブル・スキーマ変更
- 初期データ投入

---

### ■ アプリケーション用（app_user）

```text
postgresql://app_user:<password>@<host>/neondb?sslmode=require&channel_binding=require
```

用途：

- API実行時のDBアクセス
- 通常のCRUD操作

---

## 補足

- `ALTER DEFAULT PRIVILEGES` は「そのロール（ここでは neondb_owner）が今後作るオブジェクト」にのみ適用される
- 既存オブジェクトには影響しないため、3・4のGRANTが必須
- Neonではブランチ環境ごとに権限状態が異なるため注意

---

## まとめ

この設定により `app_user` は以下が可能になる：

- データのCRUD操作（SELECT/INSERT/UPDATE/DELETE）
- シーケンス利用（ID自動採番）
- 将来のテーブル・シーケンスにも自動追従
- DDL（CREATEなど）は不可
