# todoApp-dynamodb

DynamoDB (Localstack) を使ったTODOアプリのサンプル。

## Contents

- `README.md`: このファイル。
- `backend-spring/`: Spring Bootバックエンド。
  - テスト時: Testcontainersを使用。
  - 実行時: Spring Boot Docker Composeを使用。
- `backend-lambda/`: Lambdaバックエンド。
- `frontend`: フロントエンド (React + Vite + TS)。
- `e2e`: E2Eテスト (Playwright)。

## How to Run

```shell
$ cd ./backend
$ ./gradlew bootRun
```

```shell
$ cd ./frontend
$ npm i
$ npm run dev
```

## Endpoints

バックエンドは以下のようなエンドポイントをもつものとする。
なお、idの形式は一意な文字列であればなんでもよい。

```shell
# 2つの項目を新規に作成する。
$ curl -d '{"text":"foo"}' http://localhost:8080/api/todo
$ curl -d '{"text":"bar"}' http://localhost:8080/api/todo

# 作成した項目の一覧がJSONで取得できる。
$ curl http://localhost:8080/api/todo
[{"id":"1", "text":"foo"}, {"id":"2", "text":"bar"}]

# IDを指定してひとつの項目を個別に取得できる。
$ curl http://localhost:8080/api/todo/1
{"id":"1", text:"foo"}

# IDを指定して項目を削除できる。
$ curl -X DELETE http://localhost:8080/api/todo/1
# 削除されていることを確認。
$ curl http://localhost:8080/api/todo
[{"id":"2", "text":"bar"}]
```
