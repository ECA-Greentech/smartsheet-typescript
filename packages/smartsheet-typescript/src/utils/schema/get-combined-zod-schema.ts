import { SmartsheetColumnDefinition, SmartsheetSchema } from '@/schema/schema-definitions';
import { z } from 'zod';
import { ConditionalRowValue, rowTypeMap } from '@/utils/rich-row-types';

/**
 * Convert raw schema into an object of keys with corresponding Zod schemas for safe parsing.
 * @param schema - The raw schema of a sheet.
 */
export function getCombinedZodSchema<Schema extends SmartsheetSchema>(schema: Schema) {
  return Object.fromEntries(Object.entries(schema).map(([columnName, columnDefinition]) => {
    const rowTypeBuilder = rowTypeMap[columnDefinition.columnType] as ConditionalRowValue<typeof columnDefinition.columnType, z.ZodSchema> | undefined;
    if (!rowTypeBuilder) {
      throw new Error(`Row type builder for "${columnDefinition.columnType}" not found.`);
    }
    return [
      columnName,
      // I have added `optional()` to the end of each schema because the Smartsheet might not have value for all columns.
      // It is highly possible that a column should be treated as required, but it is lack of a value in the sheet.
      rowTypeBuilder(columnDefinition as SmartsheetColumnDefinition<typeof columnDefinition.columnType, [string, ...string[]]>).optional(),
    ];
  }));
}
