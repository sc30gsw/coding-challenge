# 電気料金シミュレーション - ENECHANGE Challenge

このプロジェクトは、フロントエンドエンジニア向け課題として作成された電気料金シミュレーションページです。

## 技術スタック

- **Runtime**: Bun
- **Build Tool**: Vite
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Target**: モバイルファースト、レスポンシブデザイン

## セットアップ・開発

```bash
# 依存関係のインストール
bun install

# 開発サーバー起動
bun dev

# プロダクションビルド
bun run build

# ビルド結果のプレビュー
bun run preview
```

## プロジェクト構成

```
/sc30gsw
├── public/                          # 画像およびその他のアセット
├── .gitignore                       # Git無視ファイル
│── src/
│   |── main.tsx                     # ルートコンポーネント
│   ├── app.tsx                      # アプリメインコンポーネント
│   ├── globals.css                  # グローバルスタイル
│   ├── components/                  # アプリケーション全体で使用されるコンポーネント
│   │   └── ui/                      # アプリケーション全体で使用される共通コンポーネント
│   │       ├── header.tsx           # アプリケーション全体で使用されるヘッダー
│   │       ├── app-sidebar.tsx      # アプリケーション全体で使用されるサイドバー
│   │       ├── button.tsx           # 共通ボタンコンポーネント
│   │       ├── input.tsx            # 共通インプットコンポーネント
│   │       ├── card.tsx             # 共通カードコンポーネント
│   │       ├── error-boundary.tsx   # エラーバウンダリコンポーネント
│   │       └── ***                  # その他の共通コンポーネント
│   ├── features/                    # ドメイン別の機能実装
│   │   └── users/                   # ユーザー関連機能の親ディレクトリ
│   │       ├── components/          # この機能で使用されるコンポーネント
│   │       │   ├── user-list.ts     # ユーザーリスト取得・表示用コンポーネント
│   │       │   └── *.ts             # その他のコンポーネント
│   │       ├── hooks/               # この機能で使用されるフック
│   │       │   ├── use-user-search.ts # ユーザー検索用フック
│   │       │   └── *.ts             # その他のフック
│   │       ├── types/               # この機能で使用される型定義
│   │       │   ├── schema/          # Zodスキーマ
│   │       │   │   ├── user-search-schema.ts # ユーザー検索用Zodスキーマ
│   │       │   │   └── *.ts         # その他のZodスキーマ
│   │       │   ├── search-params/   # nuqs検索パラメータ型定義
│   │       │   │   ├── user-search-params.ts # ユーザー検索用検索パラメータ型定義
│   │       │   │   └── *.ts         # その他の検索パラメータ型定義
│   │       │   ├── user.ts          # ユーザー関連型定義
│   │       │   └── *.ts             # その他の型定義ファイル
│   │       └── utils/               # この機能で使用されるユーティリティ定義
│   ├── hooks/                       # アプリ全体で使用されるカスタムフック（use-***.ts）
│   ├── types/                       # アプリ全体で使用される型定義
│   ├── constants/                   # アプリ全体で使用される定数
│   ├── utils/                       # アプリ全体で使用されるユーティリティ実装
│   │   ├── api.ts                   # APIユーティリティ関数
│   │   ├── validation.ts            # バリデーションユーティリティ関数
│   │   └── error-handling.ts        # エラーハンドリングユーティリティ関数
│   ├── lib/                         # ライブラリ設定定義と共通ヘルパー関数
│   └── vite-env.d.ts                # 環境変数定義ファイル
├── tests/                           # E2Eテストコード
│   ├── screenshots/                 # テストで撮影されたスクリーンショット（ビジュアルリグレッションテスト用）
│   │   └── *.png                    # 任意の画面や要素のスクリーンショット
│   ├── fixtures/                    # テストデータとモックファイル
│   ├── unit/                        # 単体テストファイル
│   │   └── *.test.ts                # 単体テストファイル
│   └── *.spec.ts                    # 各画面のE2Eテストコード
├── .env.example                     # 環境変数テンプレート
├── biome.json                       # リンター/フォーマッター設定ファイル
├── package.json                     # パッケージマネージャー設定ファイル
├── playwright.config.ts             # Playwright設定ファイル
├── vitest.config.ts                 # Vitest設定ファイル
├── tsconfig.json                    # TypeScript設定ファイル
└── vite.config.ts                   # Vite設定ファイル
```

※ components/uiやfeatures・utilsなどに記載のあるディレクトリやファイルはサンプルです