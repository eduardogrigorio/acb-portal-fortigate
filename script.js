const sheetName = 'Folha1';
const scriptProp = PropertiesService.getScriptProperties();

function initialSetup() {
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  scriptProp.setProperty('key', activeSpreadsheet.getId());
  
  // Cria a sheet se não existir
  if (!activeSpreadsheet.getSheetByName(sheetName)) {
    const sheet = activeSpreadsheet.insertSheet(sheetName);
    sheet.appendRow(['Data', 'Nome', 'Email', 'Mensagem']);
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  
  try {
    // Tenta obter o lock por 10 segundos
    if (!lock.tryLock(10000)) {
      throw new Error('Não foi possível obter o lock');
    }
    
    // Verifica se o setup foi feito
    const sheetId = scriptProp.getProperty('key');
    if (!sheetId) {
      throw new Error('Execute o initialSetup primeiro');
    }
    
    // Obtém os dados do POST
    const formData = e.parameter;
    const nome = formData.nome;
    const email = formData.email;
    const mensagem = formData.mensagem;
    
    // Validação básica
    if (!nome || !email || !mensagem) {
      throw new Error('Todos os campos são obrigatórios');
    }
    
    // Abre a planilha e a sheet
    const spreadsheet = SpreadsheetApp.openById(sheetId);
    const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
    
    // Adiciona cabeçalhos se a sheet estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Data', 'Nome', 'Email', 'Mensagem']);
    }
    
    // Adiciona os dados
    sheet.appendRow([new Date(), nome, email, mensagem]);
    
    // Retorna sucesso
    return ContentService.createTextOutput(JSON.stringify({ 
      success: true,
      message: 'Dados salvos com sucesso'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    // Retorna erro
    return ContentService.createTextOutput(JSON.stringify({ 
      success: false, 
      error: error.message 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } finally {
    // Libera o lock
    lock.releaseLock();
  }
}