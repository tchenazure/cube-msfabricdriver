"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MSFabricQuery = void 0;
const ramda_1 = __importDefault(require("ramda"));
const schema_compiler_1 = require("@cubejs-backend/schema-compiler");
const GRANULARITY_TO_INTERVAL = {
    day: 'day',
    week: 'week',
    hour: 'hour',
    minute: 'minute',
    second: 'second',
    month: 'month',
    quarter: 'quarter',
    year: 'year'
};
class MSFabricFilter extends schema_compiler_1.BaseFilter {
    likeIgnoreCase(column, not, param, type) {
        const p = (!type || type === 'contains' || type === 'ends') ? '%' : '';
        const s = (!type || type === 'contains' || type === 'starts') ? '%' : '';
        return `LOWER(${column})${not ? ' NOT' : ''} LIKE CONCAT('${p}', ${this.allocateParam(param)}, '${s}')`;
    }
}
class MSFabricQuery extends schema_compiler_1.BaseQuery {
    newFilter(filter) {
        return new MSFabricFilter(this, filter);
    }
    convertTz(field) {
        return `from_utc_timestamp(${field}, '${this.timezone}')`;
    }
    timeStampCast(value) {
        return `from_utc_timestamp(replace(replace(${value}, 'T', ' '), 'Z', ''), 'UTC')`;
    }
    dateTimeCast(value) {
        return `from_utc_timestamp(${value}, 'UTC')`; // TODO
    }
    subtractInterval(date, interval) {
        const [number, type] = this.parseInterval(interval);
        return `(${date} - INTERVAL '${number}' ${type})`;
    }
    addInterval(date, interval) {
        const [number, type] = this.parseInterval(interval);
        return `(${date} + INTERVAL '${number}' ${type})`;
    }
    timeGroupedColumn(granularity, dimension) {
        return `date_trunc('${GRANULARITY_TO_INTERVAL[granularity]}', ${dimension})`;
    }
    escapeColumnName(name) {
        return `\`${name}\``;
    }
    getFieldIndex(id) {
        const dimension = this.dimensionsForSelect().find((d) => d.dimension === id);
        if (dimension) {
            return super.getFieldIndex(id);
        }
        return this.escapeColumnName(this.aliasName(id, false));
    }
    unixTimestampSql() {
        return 'unix_timestamp()';
    }
    seriesSql(timeDimension) {
        const values = timeDimension.timeSeries().map(([from, to]) => `select '${from}' f, '${to}' t`).join(' UNION ALL ');
        return `SELECT ${this.timeStampCast('dates.f')} date_from, ${this.timeStampCast('dates.t')} date_to FROM (${values}) AS dates`;
    }
    orderHashToString(hash) {
        if (!hash || !hash.id) {
            return null;
        }
        const fieldIndex = this.getFieldIndex(hash.id);
        if (fieldIndex === null) {
            return null;
        }
        const dimensionsForSelect = this.dimensionsForSelect();
        const dimensionColumns = ramda_1.default.flatten(dimensionsForSelect.map((s) => s.selectColumns() && s.aliasName()))
            .filter(s => !!s);
        if (dimensionColumns.length) {
            const direction = hash.desc ? 'DESC' : 'ASC';
            return `${fieldIndex} ${direction}`;
        }
        return null;
    }
    groupByClause() {
        const dimensionsForSelect = this.dimensionsForSelect();
        const dimensionColumns = ramda_1.default.flatten(dimensionsForSelect.map((s) => s.selectColumns() && s.aliasName()))
            .filter(s => !!s);
        return dimensionColumns.length ? ` GROUP BY ${dimensionColumns.join(', ')}` : '';
    }
    defaultRefreshKeyRenewalThreshold() {
        return 120;
    }
}
exports.MSFabricQuery = MSFabricQuery;
//# sourceMappingURL=MSFabricQuery.js.map