import { BaseFilter, BaseQuery } from '@cubejs-backend/schema-compiler';
declare class MSFabricFilter extends BaseFilter {
    likeIgnoreCase(column: any, not: any, param: any, type: string): string;
}
export declare class MSFabricQuery extends BaseQuery {
    newFilter(filter: any): MSFabricFilter;
    convertTz(field: string): string;
    timeStampCast(value: string): string;
    dateTimeCast(value: string): string;
    subtractInterval(date: string, interval: string): string;
    addInterval(date: string, interval: string): string;
    timeGroupedColumn(granularity: string, dimension: string): string;
    escapeColumnName(name: string): string;
    getFieldIndex(id: string): any;
    unixTimestampSql(): string;
    seriesSql(timeDimension: any): string;
    orderHashToString(hash: any): string | null;
    groupByClause(): string;
    defaultRefreshKeyRenewalThreshold(): number;
}
export {};
//# sourceMappingURL=MSFabricQuery.d.ts.map