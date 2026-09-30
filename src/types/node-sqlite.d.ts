declare module "node:sqlite" {
  type SQLInputValue = string | number | bigint | null | Uint8Array
  type SQLOutputValue = string | number | bigint | null | Uint8Array
  type SupportedValueType = SQLOutputValue | Record<string, SQLOutputValue> | SQLOutputValue[]

  export class StatementSync {
    run(...anonymousParameters: SQLInputValue[]): {
      changes: number | bigint
      lastInsertRowid: number | bigint
    }
    get(...anonymousParameters: SQLInputValue[]): Record<string, SQLOutputValue> | undefined
    all(...anonymousParameters: SQLInputValue[]): Record<string, SQLOutputValue>[]
  }

  export class DatabaseSync {
    constructor(path: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean; enableDoubleQuotedStringLiterals?: boolean; allowExtension?: boolean })
    exec(sql: string): void
    prepare(sql: string): StatementSync
    close(): void
    open(): void
  }
}