import React, { useState } from 'react';
import { User, StudentProfile, ResumeData } from '../types';
import { getProfile } from '../utils/storage';
import { getResume, saveResume, parseResumeText } from '../utils/jobService';
import { validatePdfFile, extractTextFromPdf, formatFileSize } from '../utils/pdfExtractor';
import { 
  FileText, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle,
  RefreshCw,
  Edit3, 
  Save, 
  X,
  FileCheck,
  GraduationCap,
  Briefcase,
  Award,
  Layers,
  Phone,
  Mail,
  ExternalLink,
  ShieldCheck,
  Trash2
} from 'lucide-react';

interface ResumeAnalysisViewProps {
  user: User;
  profile?: StudentProfile | null;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onExploreJobs?: () => void;
  onNavigateToJobs?: () => void;
  onNavigateToTests?: () => void;
}

export const ResumeAnalysisView: React.FC<ResumeAnalysisViewProps> = ({
  user,
  onRefreshStats,
  showToast,
}) => {
  const profile = getProfile(user.id);
  const [savedResume, setSavedResume] = useState<ResumeData | null>(() => getResume(user.id));

  // Option 1: PDF File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfValidationError, setPdfValidationError] = useState<string | null>(null);

  // Option 2: Plain Text State
  const [pastedText, setPastedText] = useState(
    savedResume && savedResume.inputMethod === 'text' ? savedResume.rawText : ''
  );
  const [textValidationError, setTextValidationError] = useState<string | null>(null);

  // General Processing State
  const [isParsing, setIsParsing] = useState(false);
  const [parsingMessage, setParsingMessage] = useState('Analysing resume...');

  // Review & Correction Form State
  const [isEditing, setIsEditing] = useState(!savedResume);
  const [editSkills, setEditSkills] = useState(
    savedResume ? savedResume.extractedSkills.join(', ') : ''
  );
  const [editEducation, setEditEducation] = useState(savedResume?.extractedEducation || '');
  const [editProjects, setEditProjects] = useState(savedResume?.extractedProjects || '');
  const [editCerts, setEditCerts] = useState(savedResume?.extractedCertifications || '');
  const [editExperience, setEditExperience] = useState(savedResume?.extractedExperience || '');
  const [editContact, setEditContact] = useState(
    savedResume?.contactInfo
      ? [
          savedResume.contactInfo.email ? `Email: ${savedResume.contactInfo.email}` : '',
          savedResume.contactInfo.phone ? `Phone: ${savedResume.contactInfo.phone}` : '',
          savedResume.contactInfo.links?.length ? `Links: ${savedResume.contactInfo.links.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' | ') || 'Not detected in the supplied text'
      : 'Not detected in the supplied text'
  );

  // ----------------- OPTION 1: PDF HANDLERS -----------------
  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPdfValidationError(null);
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const validation = validatePdfFile(file);
    if (!validation.valid) {
      setPdfValidationError(validation.error || 'Invalid PDF file.');
      setSelectedFile(null);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);

    // If text is also present in Option 2, inform the student of mutual exclusivity
    if (pastedText.trim().length > 0) {
      showToast(
        'Dual Input Notice',
        'You have both selected a PDF and entered text. Please use one method at a time.',
        'info'
      );
    }
  };

  const handleClearPdf = () => {
    setSelectedFile(null);
    setPdfValidationError(null);
    const input = document.getElementById('pdf-upload-input') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  const handleAnalysePdf = async () => {
    if (isParsing) return;

    // Check mutual exclusivity
    if (pastedText.trim().length > 0) {
      setPdfValidationError(
        'Please use one input method at a time. Clear the text in Option 2 or click "Clear Text" before analysing this PDF.'
      );
      showToast(
        'Single Method Required',
        'Please use either PDF upload or pasted text, not both simultaneously.',
        'error'
      );
      return;
    }

    if (!selectedFile) {
      setPdfValidationError('Please select a PDF file first.');
      return;
    }

    const validation = validatePdfFile(selectedFile);
    if (!validation.valid) {
      setPdfValidationError(validation.error || 'Invalid PDF file.');
      return;
    }

    setIsParsing(true);
    setParsingMessage('Extracting readable text directly from PDF...');
    setPdfValidationError(null);

    try {
      // Extract directly from text-based PDF
      const extractedText = await extractTextFromPdf(selectedFile);
      const formattedSize = formatFileSize(selectedFile.size);

      setParsingMessage('Running rule-based section and entity audit...');

      const parsed = parseResumeText(
        extractedText,
        selectedFile.name,
        user.id,
        'pdf',
        formattedSize
      );

      // Populate review form
      setEditSkills(parsed.extractedSkills.join(', '));
      setEditEducation(parsed.extractedEducation);
      setEditProjects(parsed.extractedProjects);
      setEditCerts(parsed.extractedCertifications);
      setEditExperience(parsed.extractedExperience);
      setEditContact(
        [
          parsed.contactInfo?.email ? `Email: ${parsed.contactInfo.email}` : '',
          parsed.contactInfo?.phone ? `Phone: ${parsed.contactInfo.phone}` : '',
          parsed.contactInfo?.links?.length ? `Links: ${parsed.contactInfo.links.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' | ') || 'Not detected in the supplied text'
      );

      saveResume(parsed);
      setSavedResume(parsed);
      setIsEditing(false);
      onRefreshStats();

      showToast(
        'PDF Parsed Successfully',
        `Extracted resume text from ${selectedFile.name} (${formattedSize}).`,
        'success'
      );
    } catch (err: any) {
      const msg = err?.message || 'Could not extract text from the selected PDF.';
      setPdfValidationError(msg);
      showToast('PDF Extraction Notice', msg, 'error');
    } finally {
      setIsParsing(false);
      setParsingMessage('Analysing resume...');
    }
  };

  // ----------------- OPTION 2: PASTED TEXT HANDLERS -----------------
  const handleClearText = () => {
    setPastedText('');
    setTextValidationError(null);
  };

  const handleAnalysePastedText = () => {
    if (isParsing) return;

    // Check mutual exclusivity
    if (selectedFile) {
      setTextValidationError(
        'Please use one input method at a time. Remove the uploaded PDF in Option 1 before analysing pasted text.'
      );
      showToast(
        'Single Method Required',
        'Please remove the selected PDF before analysing pasted text.',
        'error'
      );
      return;
    }

    const trimmed = pastedText.trim();
    if (!trimmed) {
      setTextValidationError('Please paste your resume text before clicking Analyse Resume.');
      return;
    }

    if (trimmed.length < 50) {
      setTextValidationError(
        `Supplied text is too short (${trimmed.length} characters). Please provide at least 50 characters of resume content for meaningful analysis.`
      );
      return;
    }

    setIsParsing(true);
    setParsingMessage('Analysing resume text...');
    setTextValidationError(null);

    try {
      const parsed = parseResumeText(
        trimmed,
        'Pasted_Resume_Text.txt',
        user.id,
        'text',
        `${trimmed.length} characters`
      );

      // Populate review form
      setEditSkills(parsed.extractedSkills.join(', '));
      setEditEducation(parsed.extractedEducation);
      setEditProjects(parsed.extractedProjects);
      setEditCerts(parsed.extractedCertifications);
      setEditExperience(parsed.extractedExperience);
      setEditContact(
        [
          parsed.contactInfo?.email ? `Email: ${parsed.contactInfo.email}` : '',
          parsed.contactInfo?.phone ? `Phone: ${parsed.contactInfo.phone}` : '',
          parsed.contactInfo?.links?.length ? `Links: ${parsed.contactInfo.links.join(', ')}` : '',
        ]
          .filter(Boolean)
          .join(' | ') || 'Not detected in the supplied text'
      );

      saveResume(parsed);
      setSavedResume(parsed);
      setIsEditing(false);
      onRefreshStats();

      showToast(
        'Resume Text Analysed',
        'Extracted credentials and updated section audit.',
        'success'
      );
    } catch (err: any) {
      const msg = err?.message || 'Error analysing supplied resume text.';
      setTextValidationError(msg);
      showToast('Analysis Error', msg, 'error');
    } finally {
      setIsParsing(false);
      setParsingMessage('Analysing resume...');
    }
  };

  // ----------------- SAMPLE RESUME HELPER -----------------
  const handleLoadSampleResume = () => {
    handleClearPdf();
    const sample = `AARAV SHARMA
Email: aarav.sharma@college.edu | Phone: +91 98765 43210
LinkedIn: linkedin.com/in/aarav-sharma | GitHub: github.com/aaravsharma

EDUCATION:
B.Tech in Computer Science and Engineering
National Institute of Engineering & Technology | Expected Graduation: 2026
CGPA: 8.65 / 10 | 12th Senior Secondary: 89.2%

TECHNICAL SKILLS:
- Programming Languages: Python, Java, C++, SQL, JavaScript, TypeScript
- Web & Backend Frameworks: React, Flask, Node.js, Express, Tailwind CSS
- Databases & Tools: PostgreSQL, MySQL, MongoDB, Git, GitHub, Docker, Linux
- Core CS Foundations: Data Structures, Algorithms, DBMS, Operating Systems, Computer Networks

KEY PROJECTS:
1. Placement Preparation & Tracking System (Telemetry)
   - Built an end-to-end placement tracking portal using Python Flask and SQLite with automated scoring algorithms and live opportunity integration.
2. Distributed In-Memory Cache Service
   - Designed a multi-threaded LRU caching engine in Java supporting TTL expiration and TCP socket communication.

WORK EXPERIENCE & INTERNSHIPS:
Software Engineering Intern at TechVanguard Solutions (June 2025 - August 2025)
- Developed REST microservices using Python and PostgreSQL. Reduced query latency by 28% through database indexing.

CERTIFICATIONS:
- HackerRank 5-Star Problem Solving in Python & Java
- AWS Certified Cloud Practitioner
- NPTEL Data Structures and Algorithms Certification`;

    setPastedText(sample);
    setTextValidationError(null);
    showToast(
      'Sample Resume Loaded',
      'Sample resume pasted into Option 2. Click "Analyse Resume" to process.',
      'info'
    );
  };

  // ----------------- SAVE VERIFIED RESUME -----------------
  const handleSaveVerifiedResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!savedResume) return;

    const skillsArray = editSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const updatedResume: ResumeData = {
      ...savedResume,
      extractedSkills: skillsArray,
      extractedEducation: editEducation.trim() || 'Not detected in the supplied text',
      extractedProjects: editProjects.trim() || 'Not detected in the supplied text',
      extractedCertifications: editCerts.trim() || 'Not detected in the supplied text',
      extractedExperience: editExperience.trim() || 'Not detected in the supplied text',
      sectionAudit: {
        contactInfo: editContact.trim() !== 'Not detected in the supplied text',
        education: editEducation.trim() !== 'Not detected in the supplied text',
        technicalSkills: skillsArray.length > 0,
        projects: editProjects.trim() !== 'Not detected in the supplied text',
        experience: editExperience.trim() !== 'Not detected in the supplied text',
        certifications: editCerts.trim() !== 'Not detected in the supplied text',
      },
      updatedAt: new Date().toISOString(),
    };

    saveResume(updatedResume);
    setSavedResume(updatedResume);
    setIsEditing(false);
    onRefreshStats();
    showToast('Resume Details Saved', 'Verified resume sections updated in storage.', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      
      {/* 1. Header Banner */}
      <div className="card-panel p-6 sm:p-7 bg-white flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#E7F0FA] text-[#203B53] text-xs font-semibold mb-2 border border-[#D0E2F5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#398879]" />
            <span>Telemetry Placement Resume Verification</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] tracking-tight">
            Resume Analysis & Section Audit
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-1 max-w-2xl leading-relaxed">
            Transparent, rule-based text extraction for campus placement candidates. Upload your text-based PDF or paste plain text to audit contact details, academic credentials, technical skills, projects, and certifications.
          </p>
        </div>

        <button
          onClick={handleLoadSampleResume}
          disabled={isParsing}
          className="btn-secondary text-xs sm:text-sm !py-2.5 !px-4 flex items-center gap-1.5 cursor-pointer shrink-0 disabled:opacity-50"
        >
          <FileText className="w-4 h-4 text-[#398879]" />
          <span>Load Sample Resume</span>
        </button>
      </div>

      {/* 2. Dual Input Methods Grid (Option 1: PDF & Option 2: Plain Text) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Input Options */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* OPTION 1: Upload a PDF */}
          <div className="card-panel p-6 bg-white space-y-4 border-2 border-transparent hover:border-[#D0E2F5] transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E7F0FA] text-[#203B53] flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h2 className="text-sm font-bold text-[#172B3A]">Option 1: Upload a PDF</h2>
              </div>
              <span className="text-[11px] font-semibold text-[#758392]">Max 5 MB (.pdf)</span>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#203B53]">
                Select Text-Based PDF Document:
              </label>

              {/* PDF Dropzone */}
              <label className="border-2 border-dashed border-[#CFD9E4] hover:border-[#398879] rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer bg-[#F8FAFC] transition-colors relative">
                <Upload className="w-7 h-7 text-[#398879] mb-1.5" />
                <p className="text-xs font-bold text-[#172B3A]">
                  Click to choose PDF resume
                </p>
                <p className="text-[11px] text-[#758392] mt-0.5">
                  Direct text extraction • Scanned image PDFs will require plain text
                </p>
                <input
                  id="pdf-upload-input"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handlePdfChange}
                  disabled={isParsing}
                  className="hidden"
                />
              </label>

              {/* Selected File Details */}
              {selectedFile && (
                <div className="p-3 rounded-xl bg-[#E7F0FA] border border-[#D0E2F5] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate max-w-[220px]">
                    <FileCheck className="w-5 h-5 text-[#398879] shrink-0" />
                    <div className="truncate">
                      <p className="font-bold text-[#203B53] truncate">{selectedFile.name}</p>
                      <p className="text-[11px] text-[#758392]">{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearPdf}
                    disabled={isParsing}
                    className="p-1 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer disabled:opacity-50"
                    title="Remove selected file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* PDF Validation Error */}
              {pdfValidationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{pdfValidationError}</p>
                </div>
              )}

              {/* PDF Submission Button */}
              <button
                type="button"
                onClick={handleAnalysePdf}
                disabled={isParsing || !selectedFile}
                className="w-full btn-primary text-xs !py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isParsing && selectedFile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{parsingMessage}</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" />
                    <span>Analyse PDF Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OPTION 2: Paste Resume Text */}
          <div className="card-panel p-6 bg-white space-y-4 border-2 border-transparent hover:border-[#D0E2F5] transition-all">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#E7F0FA] text-[#203B53] flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h2 className="text-sm font-bold text-[#172B3A]">Option 2: Paste Resume Text</h2>
              </div>
              <span className="text-[11px] text-[#758392] font-mono">
                {pastedText.trim().length} chars
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="pasted-textarea" className="font-semibold text-[#203B53]">
                  Resume Plain Text Content:
                </label>
                {pastedText && (
                  <button
                    type="button"
                    onClick={handleClearText}
                    disabled={isParsing}
                    className="text-[11px] text-red-600 hover:underline cursor-pointer"
                  >
                    Clear Text
                  </button>
                )}
              </div>

              <textarea
                id="pasted-textarea"
                rows={9}
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setTextValidationError(null);
                }}
                disabled={isParsing}
                placeholder="Paste your complete resume text here (Contact info, Education, Technical Skills, Projects, Work Experience, Certifications)..."
                className="w-full p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-mono text-[#263746] focus:bg-white focus:outline-none focus:border-[#398879] transition-colors"
              />

              <p className="text-[11px] text-[#758392]">
                Minimum 50 characters required. Use this if your PDF is scanned or does not contain selectable text.
              </p>

              {/* Text Validation Error */}
              {textValidationError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{textValidationError}</p>
                </div>
              )}

              {/* Text Submission Button */}
              <button
                type="button"
                onClick={handleAnalysePastedText}
                disabled={isParsing || !pastedText.trim()}
                className="w-full btn-primary text-xs !py-2.5 flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isParsing && !selectedFile ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>{parsingMessage}</span>
                  </>
                ) : (
                  <>
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Analyse Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Findings, Section Audit & Verified Review */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-panel p-6 bg-white space-y-5">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E2E8F0] gap-2">
              <div>
                <h2 className="text-base font-bold text-[#172B3A] flex items-center gap-2">
                  <span>Resume Analysis Findings & Audit</span>
                  {savedResume && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#E7F4F1] text-[#206053] border border-[#B2DDD5]">
                      Active Analysis
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#758392] mt-0.5">
                  {savedResume ? (
                    <>
                      Source: <strong>{savedResume.fileName}</strong> ({savedResume.fileSize || `${savedResume.rawText.length} chars`}) • Last audited: {savedResume.updatedAt.slice(0, 10)}
                    </>
                  ) : (
                    'Audit sections and verify extracted information against standard placement criteria.'
                  )}
                </p>
              </div>

              {savedResume && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-secondary text-xs !py-1.5 !px-3 flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#398879]" />
                  <span>Edit Details</span>
                </button>
              )}
            </div>

            {/* Section Presence Audit Badges */}
            {savedResume && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#758392] block">
                  Resume Section Audit
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  
                  {/* Contact Info */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.contactInfo ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Contact Details</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.contactInfo ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                  {/* Education */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.education ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Education Details</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.education ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                  {/* Technical Skills */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.technicalSkills ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Technical Skills</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.technicalSkills ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                  {/* Projects */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.projects ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Projects</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.projects ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                  {/* Experience */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.experience ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Work Experience</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.experience ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                  {/* Certifications */}
                  <div className={`p-2.5 rounded-lg border ${savedResume.sectionAudit?.certifications ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    <span className="block font-bold">Certifications</span>
                    <span className="text-[11px]">
                      {savedResume.sectionAudit?.certifications ? '✓ Detected' : '— Not detected'}
                    </span>
                  </div>

                </div>
              </div>
            )}

            {/* Editing Form vs Display Findings */}
            {isEditing && savedResume ? (
              <form onSubmit={handleSaveVerifiedResume} className="space-y-4 text-xs pt-2">
                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    placeholder="Email: student@college.edu | Phone: +91 9876543210"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">
                    Extracted Technical Skills (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editSkills}
                    onChange={(e) => setEditSkills(e.target.value)}
                    placeholder="Python, Java, Data Structures, SQL, React, Git, Docker"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                  <p className="text-[11px] text-[#758392] mt-1">
                    Leave empty if no technical skills were present.
                  </p>
                </div>

                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">
                    Education & Degree Details
                  </label>
                  <input
                    type="text"
                    value={editEducation}
                    onChange={(e) => setEditEducation(e.target.value)}
                    placeholder="B.Tech Computer Science | CGPA: 8.65"
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-[#172B3A] block mb-1">Projects</label>
                    <textarea
                      rows={3}
                      value={editProjects}
                      onChange={(e) => setEditProjects(e.target.value)}
                      placeholder="Projects detected from resume"
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-[#172B3A] block mb-1">Work Experience & Internships</label>
                    <textarea
                      rows={3}
                      value={editExperience}
                      onChange={(e) => setEditExperience(e.target.value)}
                      placeholder="Work experience detected from resume"
                      className="w-full p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-[#172B3A] block mb-1">Certifications</label>
                  <input
                    type="text"
                    value={editCerts}
                    onChange={(e) => setEditCerts(e.target.value)}
                    placeholder="AWS Certified, HackerRank, etc."
                    className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] focus:bg-white focus:outline-none focus:border-[#398879]"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary !py-2 !px-4 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary !py-2 !px-5 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Verified Details</span>
                  </button>
                </div>
              </form>
            ) : savedResume ? (
              <div className="space-y-4 text-xs pt-1">
                
                {/* Contact Information */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Contact Information:</span>
                  </span>
                  <div className="text-[#758392] leading-relaxed">
                    {savedResume.contactInfo?.email || savedResume.contactInfo?.phone || savedResume.contactInfo?.links?.length ? (
                      <div className="space-y-1">
                        {savedResume.contactInfo.email && <p>Email: <strong className="text-[#172B3A]">{savedResume.contactInfo.email}</strong></p>}
                        {savedResume.contactInfo.phone && <p>Phone: <strong className="text-[#172B3A]">{savedResume.contactInfo.phone}</strong></p>}
                        {savedResume.contactInfo.links && savedResume.contactInfo.links.length > 0 && (
                          <p>Profiles: {savedResume.contactInfo.links.join(' • ')}</p>
                        )}
                      </div>
                    ) : (
                      <p className="italic text-[#758392]">Not detected in the supplied text</p>
                    )}
                  </div>
                </div>

                {/* Education */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Education Details:</span>
                  </span>
                  <p className="text-[#758392] leading-relaxed">
                    {savedResume.extractedEducation}
                  </p>
                </div>

                {/* Technical Skills */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Technical Skills (Matched against predefined keyword dictionary):</span>
                  </span>
                  {savedResume.extractedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {savedResume.extractedSkills.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 rounded-lg bg-[#E7F0FA] text-[#203B53] font-semibold border border-[#D0E2F5]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[#758392] italic">
                      No matching technical skills detected in the supplied text
                    </p>
                  )}
                </div>

                {/* Projects */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Projects:</span>
                  </span>
                  <p className="text-[#758392] leading-relaxed whitespace-pre-line">
                    {savedResume.extractedProjects}
                  </p>
                </div>

                {/* Work Experience */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Work Experience & Internships:</span>
                  </span>
                  <p className="text-[#758392] leading-relaxed whitespace-pre-line">
                    {savedResume.extractedExperience}
                  </p>
                </div>

                {/* Certifications */}
                <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                  <span className="font-bold text-[#172B3A] flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Certifications:</span>
                  </span>
                  <p className="text-[#758392] leading-relaxed">
                    {savedResume.extractedCertifications}
                  </p>
                </div>

                {/* System Scope & Transparency Notice */}
                <div className="p-3 rounded-xl bg-[#E7F0FA] border border-[#D0E2F5] text-[#203B53] text-[11px] flex items-start gap-2 leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-[#398879] shrink-0 mt-0.5" />
                  <p>
                    <strong>College Project Integrity:</strong> Resume analysis operates via transparent, rule-based text processing. It does not invent qualifications, skills, or experience that were not present in your input. If a section shows "Not detected in the supplied text", verify that the section is clearly labeled in your document.
                  </p>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#758392] space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#E7F0FA] text-[#398879] flex items-center justify-center font-bold text-xl">
                  📄
                </div>
                <h3 className="font-bold text-[#172B3A]">No Resume Analysed Yet</h3>
                <p className="max-w-sm mx-auto">
                  Upload a text-based PDF using Option 1 or paste your resume text in Option 2 to extract details.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
