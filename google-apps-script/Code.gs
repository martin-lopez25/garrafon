const SHEETS = {
  PEOPLE: 'Personas',
  ASSIGNMENTS: 'garrafon',
  SETTINGS: 'Configuracion',
};

const PEOPLE_HEADERS = [
  'id', 'nombre', 'rol', 'estado', 'fecha_ingreso', 'color', 'ausencias_json',
];

const ASSIGNMENT_HEADERS = [
  'fecha', 'garrafones', 'comprador_id', 'comprador_nombre',
  'cargadores_ids', 'cargadores_nombres', 'estado_compra',
  'compra_confirmada_en', 'compra_confirmada_por', 'estado_carga',
  'carga_confirmada_en', 'carga_confirmada_por', 'notas',
  'ajuste_manual', 'dia_programado',
];

function doGet() {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const peopleSheet = spreadsheet.getSheetByName(SHEETS.PEOPLE);
    const assignmentsSheet = spreadsheet.getSheetByName(SHEETS.ASSIGNMENTS);
    const settingsSheet = spreadsheet.getSheetByName(SHEETS.SETTINGS);

    if (!peopleSheet || !assignmentsSheet || !settingsSheet) {
      return jsonResponse_({ ok: true, data: null });
    }

    const people = readRows_(peopleSheet).map((row) => ({
      id: text_(row.id),
      name: text_(row.nombre),
      role: text_(row.rol),
      status: text_(row.estado),
      joinedDate: dateText_(row.fecha_ingreso),
      colorSeed: text_(row.color),
      absences: parseJson_(row.ausencias_json, []),
    }));

    const assignments = readRows_(assignmentsSheet).map((row) => ({
      date: dateText_(row.fecha),
      garrafonesCount: Number(row.garrafones),
      buyerId: text_(row.comprador_id),
      buyerName: text_(row.comprador_nombre),
      loaderIds: splitList_(row.cargadores_ids),
      loaderNames: splitList_(row.cargadores_nombres),
      buyStatus: text_(row.estado_compra),
      buyConfirmedAt: optionalDateTimeText_(row.compra_confirmada_en),
      buyConfirmedBy: optionalText_(row.compra_confirmada_por),
      loadStatus: text_(row.estado_carga),
      loadConfirmedAt: optionalDateTimeText_(row.carga_confirmada_en),
      loadConfirmedBy: optionalText_(row.carga_confirmada_por),
      notes: optionalText_(row.notas),
      isCustomOverride: boolean_(row.ajuste_manual),
      isScheduledWaterDay: boolean_(row.dia_programado),
    }));

    const settings = {};
    readRows_(settingsSheet).forEach((row) => {
      settings[text_(row.clave)] = parseJson_(row.valor, row.valor);
    });

    return jsonResponse_({
      ok: true,
      data: {
        version: '1.0',
        updatedAt: text_(settings.updatedAt) || new Date().toISOString(),
        people,
        settings,
        assignments,
      },
    });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents);
    if (!payload.data) throw new Error('No se recibieron datos');

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

      writeTable_(
        getOrCreateSheet_(spreadsheet, SHEETS.PEOPLE),
        PEOPLE_HEADERS,
        payload.data.people.map((person) => [
          person.id,
          person.name,
          person.role,
          person.status,
          person.joinedDate,
          person.colorSeed || '',
          JSON.stringify(person.absences || []),
        ])
      );

      writeTable_(
        getOrCreateSheet_(spreadsheet, SHEETS.ASSIGNMENTS),
        ASSIGNMENT_HEADERS,
        payload.data.assignments.map((assignment) => [
          assignment.date,
          assignment.garrafonesCount,
          assignment.buyerId,
          assignment.buyerName,
          (assignment.loaderIds || []).join(', '),
          (assignment.loaderNames || []).join(', '),
          assignment.buyStatus,
          assignment.buyConfirmedAt || '',
          assignment.buyConfirmedBy || '',
          assignment.loadStatus,
          assignment.loadConfirmedAt || '',
          assignment.loadConfirmedBy || '',
          assignment.notes || '',
          Boolean(assignment.isCustomOverride),
          Boolean(assignment.isScheduledWaterDay),
        ])
      );

      const settingsRows = Object.keys(payload.data.settings).map((key) => [
        key,
        JSON.stringify(payload.data.settings[key]),
      ]);
      settingsRows.push(['updatedAt', JSON.stringify(payload.data.updatedAt)]);
      writeTable_(
        getOrCreateSheet_(spreadsheet, SHEETS.SETTINGS),
        ['clave', 'valor'],
        settingsRows
      );
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ ok: true });
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function getOrCreateSheet_(spreadsheet, name) {
  return spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
}

function writeTable_(sheet, headers, rows) {
  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  sheet.setFrozenRows(1);

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, headers.length);
}

function readRows_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(text_);
  return values
    .slice(1)
    .filter((row) => row.some((value) => value !== ''))
    .map((row) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = row[index];
      });
      return record;
    });
}

function parseJson_(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback;
  try {
    return JSON.parse(String(value));
  } catch (error) {
    return fallback;
  }
}

function splitList_(value) {
  if (!value) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function boolean_(value) {
  return value === true || String(value).toLowerCase() === 'true';
}

function text_(value) {
  return value === null || value === undefined ? '' : String(value);
}

function optionalText_(value) {
  const text = text_(value);
  return text || undefined;
}

function dateText_(value) {
  const text = text_(value);
  if (!text || /^\d{4}-\d{2}-\d{2}$/.test(text)) return text;

  const date = new Date(value);
  return isNaN(date.getTime())
    ? text
    : Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function optionalDateTimeText_(value) {
  const text = text_(value);
  if (!text) return undefined;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(text)) return text;

  const date = new Date(value);
  return isNaN(date.getTime())
    ? text
    : Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm');
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON
  );
}