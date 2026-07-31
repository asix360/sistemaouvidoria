import React, { useState } from 'react';
import { Sparkles, X, Check, Copy, RefreshCw, MessageSquare } from 'lucide-react';
import { Manifestation } from '../types';
import { GoogleGenAI } from '@google/genai';

interface GeminiResponseAssistantModalProps {
  manifestation: Manifestation;
  onClose: () => void;
  onApplyResponse: (text: string) => void;
}

export const GeminiResponseAssistantModal: React.FC<GeminiResponseAssistantModalProps> = ({
  manifestation: m,
  onClose,
  onApplyResponse
}) => {
  const [tone, setTone] = useState<'empatico' | 'tecnico' | 'conciso'>('empatico');
  const [generatedDraft, setGeneratedDraft] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleGenerate = async () => {
    setLoading(true);
    setCopied(false);

    try {
      // Use Gemini API if available, or generate a structured response
      const apiKey = process.env.GEMINI_API_KEY;
      if (apiKey) {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Você é um Ouvidor Público Sênior do Sistema Único de Saúde (SUS) trabalhando em uma Unidade de Pronto Atendimento (UPA 24h).
Escreva uma resposta oficial, profissional e altamente cortês em português para a seguinte manifestação do cidadão:

Protocolo: ${m.protocol}
Tipo: ${m.type}
Categoria: ${m.category} - ${m.subcategory}
Setor Envolvido: ${m.sector_name}
Descrição do relato: "${m.description}"
Modo Anônimo: ${m.is_anonymous ? 'Sim' : 'Não'}
Nome do Cidadão: ${m.is_anonymous ? 'Cidadão' : m.complainant.name}

Tom desejado: ${tone === 'empatico' ? 'Empático, acolhedor e humanizado' : tone === 'tecnico' ? 'Técnico, fundamentado em normas do SUS' : 'Direto e conciso'}.
Inclua saudação, explicação das providências adotadas com o setor ${m.sector_name}, desculpas se aplicável e encerramento oficial da Ouvidoria UPA Central.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
        });

        if (response.text) {
          setGeneratedDraft(response.text);
        } else {
          throw new Error('Retorno vazio do Gemini');
        }
      } else {
        // High quality fallback template generator
        const greetingName = m.is_anonymous ? 'Prezado(a) Cidadão(ã)' : `Prezado(a) ${m.complainant.name}`;
        let draft = '';

        if (m.type === 'Reclamação') {
          draft = `${greetingName},\n\nEm atenção à sua manifestação registrada sob o Protocolo nº ${m.protocol}, lamentamos profundamente os transtornos ocorridos no setor de ${m.sector_name}.\n\nInformamos que sua observação foi encaminhada à Coordenação Técnica da unidade para apuração do fato relatado e alinhamento da equipe de plantão, visando garantir a humanização do atendimento exigida pelas diretrizes do SUS.\n\nReiteramos nosso compromisso com a melhoria contínua e a transparência nos serviços prestados à população.\n\nAtenciosamente,\nOuvidoria Geral - UPA 24h Central.`;
        } else if (m.type === 'Elogio') {
          draft = `${greetingName},\n\nAgradecemos imensamente o registro de sua manifestação sob o Protocolo nº ${m.protocol}.\n\nSeu elogio dirigido ao setor de ${m.sector_name} traz grande satisfação para toda a equipe. Informamos que a sua mensagem foi registrada e compartilhada com a Direção Geral para inclusão nos elogios funcionais dos servidores envolvidos.\n\nAtenciosamente,\nOuvidoria UPA Central - SUS.`;
        } else {
          draft = `${greetingName},\n\nEm atenção à sua solicitação registrada sob o Protocolo nº ${m.protocol}, informamos que os esclarecimentos pertinentes ao setor de ${m.sector_name} foram analisados pela nossa equipe.\n\nEstamos à disposição para novas orientações por meio deste canal oficial de Ouvidoria do SUS.\n\nAtenciosamente,\nOuvidoria Geral da UPA.`;
        }
        setGeneratedDraft(draft);
      }
    } catch (err) {
      console.warn('Fallback Gemini Draft:', err);
      setGeneratedDraft(
        `Prezado(a) ${m.is_anonymous ? 'Cidadão(ã)' : m.complainant.name},\n\nEm atenção à sua manifestação (${m.protocol}), informamos que o relato foi recebido e encaminhado ao setor de ${m.sector_name} para apuração cabível.\n\nAtenciosamente,\nOuvidoria UPA Central.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-2xl w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-base">
            <Sparkles className="w-5 h-5" /> Assistente IA Gemini - Minuta de Resposta SUS
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Protocol Context */}
        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-xl text-xs space-y-1">
          <span className="font-bold text-purple-900 dark:text-purple-200">
            Protocolo: {m.protocol} ({m.type} • {m.sector_name})
          </span>
          <p className="text-purple-800 dark:text-purple-300 line-clamp-2 italic">
            "{m.description}"
          </p>
        </div>

        {/* Tone Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tom da Resposta:</span>
          {(['empatico', 'tecnico', 'conciso'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                tone === t
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        {!generatedDraft && !loading && (
          <button
            onClick={handleGenerate}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Gerar Minuta de Resposta
          </button>
        )}

        {loading && (
          <div className="py-8 text-center text-xs text-purple-600 dark:text-purple-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin" />
            <span>Gerando minuta oficial de resposta em padrão SUS...</span>
          </div>
        )}

        {/* Result Area */}
        {generatedDraft && !loading && (
          <div className="space-y-3">
            <textarea
              rows={8}
              value={generatedDraft}
              onChange={e => setGeneratedDraft(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-3 leading-relaxed focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex items-center justify-between">
              <button
                onClick={handleGenerate}
                className="px-3 py-1.5 text-xs text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-lg font-semibold flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Gerar Outra Opção
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedDraft);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 border text-xs rounded-lg font-semibold flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </button>

                <button
                  onClick={() => {
                    onApplyResponse(generatedDraft);
                    onClose();
                  }}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1"
                >
                  <Check className="w-4 h-4" /> Usar Esta Resposta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
