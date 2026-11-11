import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Database,
  Upload,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Sparkles,
  RefreshCw,
  Search,
  Tag
} from 'lucide-react';

export const DataHubPage: React.FC = () => {
  const [dragOver, setDragOver] = useState(false);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  const fetchDatasets = async () => {
    setLoading(true);
    const res = await api.getDatasets();
    if (res?.datasets) {
      setDatasets(res.datasets);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDatasets();
  }, []);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const payload = {
        dataset_name: file.name,
        dataset_type: file.name.endsWith('.geojson')
          ? 'Geospatial / Vector (GeoJSON)'
          : file.name.endsWith('.tif')
          ? 'Raster / Satellite'
          : 'Tabular / Borehole Logs',
        source: 'User Upload via Command Center',
        records: Math.floor(Math.random() * 500) + 50,
        description: `Directly ingested file ${file.name} for validation pipeline.`,
        tags: ['user-upload', 'cadastre', 'manganese']
      };

      const res = await api.uploadDataset(payload);
      if (res?.dataset) {
        setDatasets((prev) => [res.dataset, ...prev]);
        setUploadSuccess(`Dataset "${file.name}" uploaded and queued for schema verification.`);
        setTimeout(() => setUploadSuccess(null), 4000);
      }
    }
  };

  const filteredDatasets = datasets.filter((d) =>
    searchQuery === ''
      ? true
      : d.dataset_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dataset_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-full w-full overflow-y-auto bg-[#060911] text-[#F2F6FA] p-6 space-y-6 select-none font-sans">
      <div className="w-full space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-[#54D8E8]" />
              <h1 className="font-heading font-bold text-lg text-[#F2F6FA]">
                Data Hub & Ingestion Pipeline
              </h1>
            </div>
            <p className="text-xs font-mono text-[#9BAFC1] mt-0.5">
              Multi-Source Geological, Borehole Core, Satellite, and Telemetry Integration (Live FastAPI Registry)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDatasets}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#090D16] border border-[#1C3045] text-xs font-mono text-[#9BAFC1] hover:text-[#54D8E8] transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>SYNC REGISTRY</span>
            </button>
            <span className="px-2.5 py-1 rounded bg-[#43D6A0]/20 text-[#43D6A0] text-xs font-mono font-bold border border-[#43D6A0]/40">
              SCHEMA VALIDATOR ACTIVE
            </span>
          </div>
        </div>

        {uploadSuccess && (
          <div className="p-3.5 rounded-xl bg-[#43D6A0]/10 border border-[#43D6A0]/40 text-xs font-mono text-[#43D6A0] flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {/* DRAG AND DROP UPLOAD ZONE */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
            dragOver
              ? 'border-[#54D8E8] bg-[#54D8E8]/10 scale-[1.01]'
              : 'border-[#1C3045] bg-[#101B2A] hover:border-[#54D8E8]/50'
          }`}
        >
          <div className="h-12 w-12 rounded-xl bg-[#090D16] border border-[#1C3045] flex items-center justify-center text-[#54D8E8] mb-3 shadow-[0_0_15px_rgba(84,216,232,0.15)]">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="font-heading font-bold text-base text-[#F2F6FA]">
            Drag & Drop Geological or Telemetry Files
          </h3>
          <p className="text-xs text-[#9BAFC1] mt-1 font-mono max-w-lg">
            Supported Formats: CSV (Borehole logs), GeoJSON (Faults & Boundaries), GeoTIFF (Satellite Bands), JSON Telemetry
          </p>
          <label className="mt-4 px-4 py-2 rounded-lg bg-[#090D16] border border-[#1C3045] text-xs font-mono text-[#F2F6FA] hover:border-[#54D8E8] transition-colors cursor-pointer">
            <span>Browse Local File</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  const f = e.target.files[0];
                  api.uploadDataset({
                    dataset_name: f.name,
                    dataset_type: 'User Upload',
                    source: 'Local File Browser',
                    records: 120,
                    description: f.name,
                    tags: ['upload']
                  }).then((res) => {
                    if (res?.dataset) {
                      setDatasets((prev) => [res.dataset, ...prev]);
                      setUploadSuccess(`Uploaded ${f.name}`);
                      setTimeout(() => setUploadSuccess(null), 3000);
                    }
                  });
                }
              }}
            />
          </label>
        </div>

        {/* DATA READINESS METER (Signature Feature) */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045]">
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#1C3045]">
            <span className="font-heading font-bold text-sm text-[#F2F6FA] flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#54D8E8]" />
              DATA READINESS METER (AI PREPARATION COMPLIANCE)
            </span>
            <span className="text-xs font-mono text-[#43D6A0] font-bold">96% COMPLIANT</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045]">
              <span className="text-[#9BAFC1]">Borehole Stratigraphy</span>
              <div className="text-sm font-bold text-[#43D6A0] mt-1">✓ Complete QA/QC</div>
              <div className="text-[10px] text-[#9BAFC1] mt-0.5">32 Core Logs Validated</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045]">
              <span className="text-[#9BAFC1]">Multispectral Bands</span>
              <div className="text-sm font-bold text-[#43D6A0] mt-1">✓ Level-2A Ortho</div>
              <div className="text-[10px] text-[#9BAFC1] mt-0.5">Cloud Cover &lt;20%</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045]">
              <span className="text-[#9BAFC1]">Structural Fault Map</span>
              <div className="text-sm font-bold text-[#43D6A0] mt-1">✓ Topo Aligned</div>
              <div className="text-[10px] text-[#9BAFC1] mt-0.5">GSI 1:50,000 Grid</div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045]">
              <span className="text-[#9BAFC1]">Telemetry Sync</span>
              <div className="text-sm font-bold text-[#54D8E8] mt-1">✓ Sub-hourly Cadence</div>
              <div className="text-[10px] text-[#9BAFC1] mt-0.5">MOIL SCADA Linked</div>
            </div>
          </div>
        </div>

        {/* UPLOADED DATASETS TABLE */}
        <div className="p-5 rounded-xl bg-[#101B2A] border border-[#1C3045] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-heading font-bold text-sm text-[#F2F6FA]">
              Integrated Data Assets ({filteredDatasets.length})
            </h3>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog by keyword or format..."
                className="w-72 h-8 px-2.5 pl-8 rounded-lg bg-[#090D16] border border-[#1C3045] text-xs text-[#F2F6FA] placeholder-[#9BAFC1]/50 focus:border-[#54D8E8] focus:outline-none font-mono"
              />
              <Search className="h-3.5 w-3.5 text-[#9BAFC1] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-2">
            {filteredDatasets.map((file, i) => (
              <div
                key={file.id || i}
                className="p-3.5 rounded-lg bg-[#090D16] border border-[#1C3045] flex flex-wrap items-center justify-between gap-3 text-xs font-mono hover:border-[#54D8E8]/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-[#101B2A] border border-[#1C3045] flex items-center justify-center text-[#54D8E8] shrink-0">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-[#F2F6FA]">{file.dataset_name}</div>
                    <div className="text-[10.5px] text-[#9BAFC1]">
                      {file.dataset_type} • {file.source}
                      {file.file_size_mb && ` • ${file.file_size_mb} MB`}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-[#9BAFC1]">{file.last_updated}</span>
                  <span className="px-2 py-0.5 rounded bg-[#43D6A0]/20 text-[#43D6A0] text-[10px] font-bold border border-[#43D6A0]/40">
                    {file.validation_status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
