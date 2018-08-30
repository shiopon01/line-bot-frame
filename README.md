# line-bot-frame

1. `yarn install`
2. `make`
3. zip以下のzipファイルを任意のS3バケットに `s3://bucket/zip/example.zip` の形で保存
4. CloudFormationで `cloudformation/template.yml` のテンプレートを実行
  - `TemplateBucketName` はzipを保存したバケットの名前
  - `ChannelSecret` `AccessToken` は自分で取得したLINE Message APIの情報
3. 手動でLambda関数 `JobWorker` のトリガーにSQS `LineMessage` を設定
4. LINE Developersのチャネル基本設定の `Webhook URL` にステージのURLを設定

言ったことがそのまま返ってくるbotの完成

4. zipの削除は `make clean`