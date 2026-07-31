import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Manifestation, SystemSettings } from '../types';

export interface PDFExportFilterParams {
  searchTerm?: string;
  typeFilter?: string;
  statusFilter?: string;
  slaFilter?: string;
  showDeleted?: boolean;
  period?: string;
  sectorFilter?: string;
  generatedBy?: string;
}

export const exportManifestationsToPDF = (
  manifestations: Manifestation[],
  filters?: PDFExportFilterParams,
  settings?: SystemSettings
) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const upaName = settings?.upa_name || 'UPA 24h - Unidade de Pronto Atendimento';
  const nowStr = new Date().toLocaleString('pt-BR');

  // Header Banner Background
  doc.setFillColor(2, 132, 199); // Sky-600 #0284c7
  doc.rect(0, 0, pageWidth, 22, 'F');

  // Title in Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(upaName.toUpperCase(), 14, 10);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMA ÚNICO DE SAÚDE (SUS) — RELATÓRIO OFICIAL DA OUVIDORIA GERAL', 14, 16);

  // Date and User on Right Header
  doc.setFontSize(8);
  doc.text(`Emissão: ${nowStr}`, pageWidth - 14, 10, { align: 'right' });
  if (filters?.generatedBy) {
    doc.text(`Emitido por: ${filters.generatedBy}`, pageWidth - 14, 16, { align: 'right' });
  }

  // Active Filters Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.roundedRect(14, 25, pageWidth - 28, 25, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PARÂMETROS E FILTROS APLICADOS NESTE RELATÓRIO:', 18, 31);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');

  const filterText1 = `• Pesquisa de Texto: ${filters?.searchTerm ? `"${filters.searchTerm}"` : 'Todas (Sem busca textual)'}`;
  const filterText2 = `• Tipo: ${filters?.typeFilter && filters.typeFilter !== 'all' ? filters.typeFilter : 'Todos os Tipos'}`;
  const filterText3 = `• Status: ${filters?.statusFilter && filters.statusFilter !== 'all' ? filters.statusFilter : 'Todos os Status'}`;
  const filterText4 = `• SLA: ${filters?.slaFilter && filters.slaFilter !== 'all' ? filters.slaFilter : 'Todos os Prazos'}`;
  const filterText5 = `• Registros: ${filters?.showDeleted ? 'Lixeira / Ocultadas (Soft Delete)' : 'Manifestações Ativas'}`;
  const filterText6 = `• Total de Encontrados: ${manifestations.length} registro(s)`;

  doc.text(filterText1, 18, 37);
  doc.text(filterText2, 105, 37);
  doc.text(filterText3, 180, 37);

  doc.text(filterText4, 18, 43);
  doc.text(filterText5, 105, 43);
  doc.text(filterText6, 180, 43);

  // Table Data Mapping
  const tableRows = manifestations.map(m => [
    m.protocol,
    `${m.created_at} ${m.created_time ? m.created_time : ''}`.trim(),
    m.type,
    m.is_anonymous ? 'Anônimo' : (m.complainant?.name || 'N/I'),
    m.sector_name,
    `${m.sla.traffic_light} ${m.sla.initial_deadline}`,
    m.status
  ]);

  autoTable(doc, {
    startY: 54,
    head: [['Protocolo', 'Data/Hora Abertura', 'Tipo', 'Manifestante', 'Setor Envolvido', 'Prazo SLA', 'Status']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [2, 132, 199],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59]
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 32 },
      2: { fontStyle: 'bold', cellWidth: 28 },
      3: { cellWidth: 55 },
      4: { cellWidth: 45 },
      5: { cellWidth: 38 },
      6: { fontStyle: 'bold', cellWidth: 35 }
    },
    margin: { left: 14, right: 14, bottom: 20 },
    didDrawPage: (data) => {
      const totalPages = (doc as any).internal.getNumberOfPages();
      const currentPage = data.pageNumber;

      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.setDrawColor(226, 232, 240);
      doc.line(14, doc.internal.pageSize.getHeight() - 12, pageWidth - 14, doc.internal.pageSize.getHeight() - 12);

      doc.text(
        `UPA 24h Ouvidoria Geral SUS — Relatório oficial de controle gerencial e acompanhamento de protocolos`,
        14,
        doc.internal.pageSize.getHeight() - 7
      );

      doc.text(
        `Página ${currentPage} de ${totalPages}`,
        pageWidth - 14,
        doc.internal.pageSize.getHeight() - 7,
        { align: 'right' }
      );
    }
  });

  const fileName = `Relatorio_Manifestacoes_Ouvidoria_UPA_${new Date().toISOString().substring(0, 10)}.pdf`;
  doc.save(fileName);
};

export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [];

  // Header row
  csvRows.push(headers.join(';'));

  // Data rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header] ?? '';
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(';'));
  }

  // Add UTF-8 BOM for Portuguese accents in Excel
  const blob = new Blob(['\uFEFF' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportManifestationsToCSV = (manifestations: Manifestation[]) => {
  const exportData = manifestations.map(m => ({
    Protocolo: m.protocol,
    Data_Abertura: m.created_at,
    Hora: m.created_time || '',
    Tipo: m.type,
    Prioridade: m.priority,
    Status: m.status,
    Canal_Entrada: m.origin,
    Categoria: m.category,
    Setor_Envolvido: m.sector_name,
    Profissional_Citado: m.professional?.name || 'N/A',
    Sigiloso: m.is_confidential ? 'Sim' : 'Não',
    Anonimo: m.is_anonymous ? 'Sim' : 'Não',
    Manifestante_Nome: m.is_anonymous ? 'Anônimo' : m.complainant.name,
    Manifestante_CPF: m.is_anonymous ? '' : m.complainant.cpf,
    Manifestante_Telefone: m.is_anonymous ? '' : m.complainant.phone,
    Cartao_SUS: m.is_anonymous ? '' : m.complainant.sus_card,
    Classificacao_Risco: m.occurrence.classification_risk,
    Local_Ocorrencia: m.occurrence.location_room,
    Prazo_SLA: m.sla.initial_deadline,
    Semaforo_SLA: m.sla.traffic_light,
    Dias_Restantes: m.sla.remaining_days,
    Descricao: m.description
  }));

  exportToCSV(exportData, `Relatorio_Ouvidoria_UPA_SUS_${new Date().toISOString().substring(0, 10)}`);
};

export const printManifestationProtocol = (m: Manifestation, settings: SystemSettings) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>Protocolo de Atendimento Ouvidoria UPA - ${m.protocol}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #0284c7; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #0369a1; }
        .subtitle { font-size: 13px; color: #64748b; }
        .badge { display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #e0f2fe; color: #0369a1; }
        .section { margin-bottom: 20px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; }
        .section-title { font-size: 14px; font-weight: bold; color: #0f172a; margin-bottom: 10px; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; text-transform: uppercase; }
        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
        .label { font-weight: bold; color: #475569; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
        .signature-box { margin-top: 50px; text-align: center; display: flex; justify-content: space-around; }
        .sig-line { border-top: 1px solid #000; width: 220px; padding-top: 5px; font-size: 12px; }
        @media print {
          body { padding: 0; }
          button { display: none; }
        }
      </style>
    </head>
    <body>
      <div style="text-align: right; margin-bottom: 10px;">
        <button onclick="window.print()" style="padding: 8px 16px; background: #0284c7; color: white; border: none; border-radius: 4px; cursor: pointer;">Imprimir Comprovante</button>
      </div>

      <div class="header">
        <div>
          <div class="title">${settings.upa_name}</div>
          <div class="subtitle">Sistema Único de Saúde (SUS) - Ouvidoria Geral da Saúde</div>
          <div class="subtitle">${settings.address} | Tel: ${settings.phone}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 18px; font-weight: bold; color: #0f172a;">${m.protocol}</div>
          <div style="font-size: 12px; color: #64748b;">Emissão: ${m.created_at} às ${m.created_time || '10:00'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Dados Principais da Manifestação</div>
        <div class="grid">
          <div><span class="label">Tipo de Manifestação:</span> ${m.type}</div>
          <div><span class="label">Prioridade:</span> ${m.priority}</div>
          <div><span class="label">Status Atual:</span> ${m.status}</div>
          <div><span class="label">Canal de Origem:</span> ${m.origin}</div>
          <div><span class="label">Setor Responsável:</span> ${m.sector_name}</div>
          <div><span class="label">Prazo de Resposta (SLA):</span> ${m.sla.initial_deadline} (${m.sla.status_label})</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Identificação do Manifestante</div>
        ${m.is_anonymous ? `
          <div style="font-style: italic; color: #64748b;">Manifestação registrada na modalidade ANÔNIMA. Dados pessoais preservados conforme diretrizes da OuvSUS e LGPD.</div>
        ` : `
          <div class="grid">
            <div><span class="label">Nome Completo:</span> ${m.complainant.name}</div>
            <div><span class="label">CPF:</span> ${m.complainant.cpf || 'Não informado'}</div>
            <div><span class="label">Cartão SUS:</span> ${m.complainant.sus_card || 'Não informado'}</div>
            <div><span class="label">Telefone / WhatsApp:</span> ${m.complainant.phone || m.complainant.whatsapp}</div>
            <div><span class="label">E-mail:</span> ${m.complainant.email || 'Não informado'}</div>
            <div><span class="label">Município:</span> ${m.complainant.city} - ${m.complainant.neighborhood}</div>
          </div>
        `}
      </div>

      <div class="section">
        <div class="section-title">Detalhamento do Ocorrido</div>
        <div class="grid" style="margin-bottom: 10px;">
          <div><span class="label">Data do Ocorrido:</span> ${m.occurrence.date} às ${m.occurrence.time}</div>
          <div><span class="label">Local / Sala:</span> ${m.occurrence.location_room}</div>
          <div><span class="label">Classificação de Risco:</span> ${m.occurrence.classification_risk}</div>
          <div><span class="label">Profissional Citado:</span> ${m.professional ? m.professional.name + ' (' + m.professional.registration + ')' : 'Nenhum profissional específico'}</div>
        </div>
        <div style="margin-top: 10px;">
          <div class="label" style="margin-bottom: 4px;">Descrição Detalhada:</div>
          <div style="background: #f8fafc; padding: 10px; border-radius: 4px; font-size: 13px; border-left: 3px solid #0284c7;">
            ${m.description}
          </div>
        </div>
      </div>

      ${m.responses && m.responses.length > 0 ? `
        <div class="section">
          <div class="section-title">Parecer e Resposta da Ouvidoria</div>
          ${m.responses.map(r => `
            <div style="margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px stroke #e2e8f0;">
              <div style="font-size: 12px; font-weight: bold; color: #0284c7;">Por: ${r.author_name} (${r.author_role}) em ${r.created_at}</div>
              <div style="font-size: 13px; margin-top: 4px;">${r.content.replace(/\n/g, '<br/>')}</div>
              ${r.digital_signature ? `<div style="font-size: 10px; color: #64748b; font-family: monospace; margin-top: 4px;">Assinatura Digital: ${r.digital_signature}</div>` : ''}
            </div>
          `).join('')}
        </div>
      ` : ''}

      <div class="signature-box">
        <div class="sig-line">
          ${m.is_anonymous ? 'Assinatura do Atendente' : 'Assinatura do Manifestante'}
        </div>
        <div class="sig-line">
          ${settings.ombudsman_coordinator}<br/>
          <span style="font-size: 10px; color: #64748b;">Ouvidoria Geral - UPA 24h</span>
        </div>
      </div>

      <div class="footer">
        Comprovante Oficial de Registro de Ouvidoria | ${settings.upa_name} | Documento emitido eletronicamente via Sistema Web OuvSUS UPA
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
};
