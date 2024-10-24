interface IDateRange {
  beginDate: Date;
  endDate: Date;
}

export function isWithinFiscalYear(dateRange: IDateRange) {
  const { beginDate, endDate } = dateRange;

  const fiscalYearStartForBeginDate = getFiscalYearStart(beginDate);
  const fiscalYearEndForBeginDate = getFiscalYearEnd(beginDate);

  const isValid =
    beginDate >= fiscalYearStartForBeginDate &&
    beginDate <= fiscalYearEndForBeginDate &&
    endDate >= fiscalYearStartForBeginDate &&
    endDate <= fiscalYearEndForBeginDate;

  return { isValid, fiscalYear: fiscalYearEndForBeginDate.getFullYear() };
}

const getFiscalYearStart = (date: Date): Date => {
  const year =
    date.getMonth() >= 9 ? date.getFullYear() : date.getFullYear() - 1;

  return new Date(year, 9, 1);
};

const getFiscalYearEnd = (date: Date): Date => {
  const year =
    date.getMonth() >= 9 ? date.getFullYear() + 1 : date.getFullYear();
  return new Date(year, 8, 30, 23, 59, 59);
};
