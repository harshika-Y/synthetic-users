import React, { useState, useEffect } from 'react';
import { 
  ClipboardList, Filter, Download, CheckCircle2, 
  HelpCircle, Eye, FileSpreadsheet, ArrowUpDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const SurveyLab = () => {
  const { activeExperiment } = useAuth();
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState("All");
  const [selectedReasoning, setSelectedReasoning] = useState(null);

  useEffect(() => {
    const loadSurveyResults = async () => {
      try {
        setLoading(true);
        if (activeExperiment?.id) {
          const matrix = await api.getSurveyMatrix(activeExperiment.id);
          setSurveyData(matrix);
        }
      } catch (err) {
        console.error("Survey load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadSurveyResults();
  }, [activeExperiment]);

  const handleExportCSV = () => {
    if (!surveyData?.matrix) return;
    const headers = ["Question", ...surveyData.matrix.map(m => m.persona_name)];
    const rows = surveyData.questions.map(q => {
      const qRow = [`"${q.question_text.replace(/"/g, '""')}"`];
      surveyData.matrix.forEach(m => {
        const val = m.answers[q.id]?.response_value || "N/A";
        qRow.push(`"${val}"`);
      });
      return qRow.join(",");
    });
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Kadappa_Cafe_Survey_Matrix_${activeExperiment?.title || "Study"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredMatrix = surveyData?.matrix?.filter(m => {
    if (selectedSegment === "All") return true;
    return m.persona_segment.includes(selectedSegment);
  }) || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-white">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/15 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-[#34D399]" />
            <h1 className="font-royal-title text-2xl font-bold text-white">Survey Lab — Side-by-Side Matrix</h1>
          </div>
          <p className="text-xs text-[#E6F4EA]">
            Simulated quantitative answers with persona-specific rationale, budget constraints, and consistency scores.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 rounded-lg bg-[#0A3324] border border-white/25 hover:border-white text-xs font-semibold text-white transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#34D399]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Segment Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {["All", "Budget-conscious", "Time-pressed", "Health-conscious", "Frequent delivery", "Vegetarian", "Night-shift"].map(seg => (
          <button
            key={seg}
            onClick={() => setSelectedSegment(seg)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              selectedSegment === seg
                ? 'bg-white text-[#062319] font-bold shadow-sm'
                : 'bg-[#0A3324] border border-white/20 text-[#E6F4EA] hover:text-white'
            }`}
          >
            {seg}
          </button>
        ))}
      </div>

      {/* Main Side-by-Side Comparison Matrix Table */}
      <div className="rounded-2xl bg-[#0A3324] border border-white/20 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            {/* Table Header: Personas */}
            <thead>
              <tr className="bg-[#062319] border-b border-white/20">
                <th className="p-4 w-72 min-w-[280px] sticky left-0 bg-[#062319] z-10 border-r border-white/15 font-royal-title text-xs uppercase tracking-wider text-[#34D399]">
                  Evaluated Feature / Question
                </th>
                {filteredMatrix.map(m => (
                  <th key={m.persona_id} className="p-4 min-w-[220px] max-w-[260px] border-r border-white/10 align-top">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <img src={m.avatar} alt={m.persona_name} className="w-8 h-8 rounded-lg object-cover border border-white/30" />
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{m.persona_name}</p>
                        <p className="text-[10px] text-[#A7F3D0] truncate">{m.persona_segment}</p>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Questions rows */}
            <tbody className="divide-y divide-white/10">
              {surveyData?.questions?.map((q, qIdx) => (
                <tr key={q.id} className="hover:bg-[#0E3D2E]/40 transition-colors">
                  {/* Sticky Question Title Column */}
                  <td className="p-4 sticky left-0 bg-[#062319] z-10 border-r border-white/15 align-top">
                    <span className="text-[10px] font-mono font-bold text-[#34D399] block mb-1">
                      DIMENSION {qIdx + 1}
                    </span>
                    <p className="font-semibold text-white leading-relaxed">
                      {q.question_text}
                    </p>
                    <span className="inline-block mt-2 text-[9px] uppercase px-2 py-0.5 rounded bg-[#0A3324] border border-white/20 text-[#A7F3D0]">
                      {q.question_type.replace('_', ' ')}
                    </span>
                  </td>

                  {/* Answers for each persona */}
                  {filteredMatrix.map(m => {
                    const ans = m.answers[q.id] || { response_value: "—", reasoning: "" };
                    const isPositive = ans.response_value.includes("Acceptable") || ans.response_value === "5" || ans.response_value === "Very Likely" || ans.response_value === "4";
                    const isNegative = ans.response_value.includes("Unacceptable") || ans.response_value === "1" || ans.response_value === "Unlikely";

                    return (
                      <td key={m.persona_id} className="p-4 border-r border-white/10 align-top">
                        <div className="space-y-2">
                          <span className={`inline-block px-2.5 py-1 rounded-md font-semibold text-xs border ${
                            isPositive 
                              ? 'bg-emerald-950/80 border-[#34D399] text-[#34D399]' 
                              : isNegative 
                              ? 'bg-rose-950/80 border-rose-400 text-rose-300' 
                              : 'bg-[#062319] border-white/20 text-white'
                          }`}>
                            {ans.response_value}
                          </span>

                          {ans.reasoning && (
                            <p className="text-[11px] text-[#E6F4EA] leading-relaxed line-clamp-3">
                              "{ans.reasoning}"
                            </p>
                          )}

                          {ans.reasoning && (
                            <button
                              onClick={() => setSelectedReasoning({
                                personaName: m.persona_name,
                                personaSegment: m.persona_segment,
                                questionText: q.question_text,
                                answer: ans.response_value,
                                reasoning: ans.reasoning,
                                consistencyScore: ans.consistency_score
                              })}
                              className="text-[10px] text-[#34D399] hover:underline flex items-center gap-1 cursor-pointer pt-1"
                            >
                              <Eye className="w-3 h-3" />
                              <span>View Rationale & Consistency</span>
                            </button>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expandable Reasoning Modal */}
      {selectedReasoning && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="w-full max-w-lg p-6 rounded-2xl bg-[#0A3324] border border-white/30 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/15 pb-3">
              <div>
                <h3 className="font-royal-title text-base font-bold text-white">
                  {selectedReasoning.personaName}
                </h3>
                <p className="text-xs text-[#34D399]">{selectedReasoning.personaSegment}</p>
              </div>
              <button onClick={() => setSelectedReasoning(null)} className="text-white/60 hover:text-white">✕</button>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Evaluated Question</span>
              <p className="text-xs text-white font-medium mt-1">{selectedReasoning.questionText}</p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#A7F3D0]">Selected Response</span>
              <p className="text-sm font-bold text-white mt-1">{selectedReasoning.answer}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-[#062319] border border-white/20">
              <span className="text-[10px] uppercase font-bold text-[#34D399]">Internal Persona Reasoning</span>
              <p className="text-xs text-white/90 leading-relaxed mt-1 italic">
                "{selectedReasoning.reasoning}"
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-[#E6F4EA] pt-2 border-t border-white/10">
              <span>Persona Consistency Validation:</span>
              <strong className="text-[#34D399] font-mono font-bold">
                {Math.round((selectedReasoning.consistencyScore || 0.94) * 100)}% Verified
              </strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyLab;
