export class CSV {
  constructor() {}

  ConvertToCSV(dataTable, fileName) {
    let csv;

    csv += dataTable.Columns.forEach(column => column = column.ColumnName); //.Cast<DataColumn>()

    csv += "\r\n";

    for (let row in dataTable.Rows) {
      csv += (dataTable.Columns.forEach(column => row[column.ColumnName].toString().replace(",", ";"))).join(","); //.Cast<DataColumn>()

      csv += "\r\n";
    }

    return csv;
  }
}


export default CSV;