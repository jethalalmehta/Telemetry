import React, { useState, useEffect, useRef, useMemo } from 'react';
import { User, McqCategory, QuestionClient, TestAttempt, Question } from '../types';
import { 
  getTestQuestions, 
  submitTest, 
  getTestAttempts, 
  getTestAttemptById, 
  addTask, 
  getAvailableQuestionCount 
} from '../utils/storage';
import { 
  BookOpen, 
  Award, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw, 
  HelpCircle,
  ListOrdered,
  Clock,
  Flag,
  AlertTriangle,
  CheckSquare,
  TrendingUp,
  BrainCircuit,
  MessageSquareText,
  Code2,
  MinusCircle,
  Filter,
  X,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface MockTestViewProps {
  user: User;
  onRefreshStats: () => void;
  showToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
  onNavigateToDashboard?: () => void;
}

const CATEGORIES: Array<{
  name: McqCategory;
  subtitle: string;
  description: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  accentColor: string;
  badgeBg: string;
}> = [
  {
    name: 'Quantitative Aptitude',
    subtitle: 'Numerical & Mathematical Reasoning',
    description: 'Time & Work, Percentages, Speed-Distance, Profit & Loss, Ratios, Averages, Number Systems.',
    icon: TrendingUp,
    accentColor: '#398879',
    badgeBg: '#E7F0FA',
  },
  {
    name: 'Logical Reasoning',
    subtitle: 'Analytical & Deductive Logic',
    description: 'Number Series, Blood Relations, Coding-Decoding, Syllogisms, Clocks, Direction Sense & Patterns.',
    icon: BrainCircuit,
    accentColor: '#203B53',
    badgeBg: '#F0F4F8',
  },
  {
    name: 'Verbal Ability',
    subtitle: 'English Grammar & Comprehension',
    description: 'Subject-Verb Agreement, Vocabulary & Synonyms, Sentence Correction, Prepositions & Verbal Deductions.',
    icon: MessageSquareText,
    accentColor: '#8C5A20',
    badgeBg: '#FFF4E6',
  },
  {
    name: 'Basic Technical Knowledge',
    subtitle: 'Core CS Foundations',
    description: 'Data Structures, Algorithms & Complexity, DBMS Normalization, OS Deadlocks & Networking protocols.',
    icon: Code2,
    accentColor: '#2C5E8A',
    badgeBg: '#EAF2FA',
  },
];

export const MockTestView: React.FC<MockTestViewProps> = ({
  user,
  onRefreshStats,
  showToast,
  onNavigateToDashboard,
}) => {
  // Test State: 'idle' | 'testing' | 'submitted'
  const [testState, setTestState] = useState<'idle' | 'testing' | 'submitted'>('idle');
  const [activeCategory, setActiveCategory] = useState<McqCategory>('Quantitative Aptitude');
  
  // Test Configuration Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [configCategory, setConfigCategory] = useState<McqCategory>('Quantitative Aptitude');
  const [configQuestionCount, setConfigQuestionCount] = useState<number>(10);
  const [configIsCustom, setConfigIsCustom] = useState(false);
  const [customCountInput, setCustomCountInput] = useState('10');
  const [configDifficulty, setConfigDifficulty] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');

  // In-test state
  const [questions, setQuestions] = useState<QuestionClient[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number }>({});
  const [flaggedForReview, setFlaggedForReview] = useState<{ [qId: string]: boolean }>({});
  const [totalTestSeconds, setTotalTestSeconds] = useState<number>(12 * 60);
  const [timeRemaining, setTimeRemaining] = useState<number>(12 * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Results after submission or reviewing an attempt
  const [lastResult, setLastResult] = useState<{
    attempt: TestAttempt;
    detailedResults: Array<{
      question: Question;
      selectedAnswer: number | null;
      isCorrect: boolean;
    }>;
  } | null>(null);
  const [reviewFilter, setReviewFilter] = useState<'all' | 'incorrect' | 'correct' | 'unanswered'>('all');
  const [hasLoggedToTracker, setHasLoggedToTracker] = useState(false);

  // Past attempts
  const [attempts, setAttempts] = useState<TestAttempt[]>(() => getTestAttempts(user.id));
  const historySectionRef = useRef<HTMLDivElement | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (testState === 'testing') {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmitOnTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testState, questions, userAnswers]);

  const handleAutoSubmitOnTimeUp = () => {
    showToast('Time Expired', 'Assessment timer elapsed. Responses have been submitted automatically.', 'info');
    performSubmit(totalTestSeconds);
  };

  // Open config modal with preselected category
  const openTestConfig = (cat?: McqCategory) => {
    const targetCat = cat || activeCategory;
    setConfigCategory(targetCat);
    setConfigIsCustom(false);
    setConfigQuestionCount(10);
    setCustomCountInput('10');
    setConfigDifficulty('All');
    setIsConfigModalOpen(true);
  };

  // Available questions calculation for currently selected config
  const availableQuestionsCount = useMemo(() => {
    return getAvailableQuestionCount(configCategory, configDifficulty);
  }, [configCategory, configDifficulty]);

  // Handle custom count input change with friendly clamping
  const handleCustomCountChange = (valStr: string) => {
    setCustomCountInput(valStr);
    const parsed = parseInt(valStr, 10);
    if (!isNaN(parsed) && parsed > 0) {
      if (parsed > availableQuestionsCount) {
        setConfigQuestionCount(availableQuestionsCount);
      } else {
        setConfigQuestionCount(parsed);
      }
    }
  };

  // Launch test from configuration modal
  const handleStartConfiguredTest = () => {
    const requestedCount = configIsCustom 
      ? Math.max(1, Math.min(parseInt(customCountInput, 10) || 5, availableQuestionsCount))
      : configQuestionCount;

    if (availableQuestionsCount === 0) {
      showToast('Insufficient Questions', 'No questions available for this category and difficulty filter.', 'error');
      return;
    }

    const effectiveCount = Math.min(requestedCount, availableQuestionsCount);
    const qs = getTestQuestions(configCategory, effectiveCount, configDifficulty);

    if (qs.length === 0) {
      showToast('No Questions Found', 'Could not load practice questions for this selection.', 'error');
      return;
    }

    // Dynamic timer: ~1.25 minutes per question (minimum 3 minutes)
    const durationSeconds = Math.max(180, effectiveCount * 75);

    setActiveCategory(configCategory);
    setQuestions(qs);
    setCurrentIndex(0);
    setUserAnswers({});
    setFlaggedForReview({});
    setTotalTestSeconds(durationSeconds);
    setTimeRemaining(durationSeconds);
    setLastResult(null);
    setHasLoggedToTracker(false);
    setIsConfigModalOpen(false);
    setIsSubmitting(false);
    setTestState('testing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast('Practice Assessment Started', `${qs.length} questions loaded. Timer set to ${Math.round(durationSeconds / 60)} minutes.`, 'info');
  };

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleClearResponse = (questionId: string) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[questionId];
      return copy;
    });
  };

  const handleToggleFlag = (questionId: string) => {
    setFlaggedForReview((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const performSubmit = (durationSeconds: number) => {
    if (isSubmitting) return; // Prevent duplicate submission
    setIsSubmitting(true);

    const qIds = questions.map((q) => q.id);
    const timeSpent = Math.max(1, durationSeconds);
    const result = submitTest(user.id, activeCategory, userAnswers, qIds, timeSpent);
    
    setLastResult(result);
    setTestState('submitted');
    setIsSubmitModalOpen(false);
    setAttempts(getTestAttempts(user.id));
    onRefreshStats();
    showToast('Quiz Submitted!', `Score: ${result.attempt.score} / ${result.attempt.totalQuestions} (${result.attempt.percentage}%)`, 'success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  const confirmSubmit = () => {
    const timeSpent = totalTestSeconds - timeRemaining;
    performSubmit(timeSpent);
  };

  const handleLogTaskToTracker = () => {
    if (!lastResult || hasLoggedToTracker) return;
    const { attempt } = lastResult;
    
    addTask(user.id, {
      title: `Review ${attempt.category} Practice Test (${attempt.score}/${attempt.totalQuestions})`,
      category: 'Aptitude',
      status: attempt.percentage >= 60 ? 'Completed' : 'In Progress',
      targetDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      notes: `Scored ${attempt.score}/${attempt.totalQuestions} (${attempt.percentage}%). Need to review ${attempt.incorrectAnswers} incorrect and ${attempt.unanswered} skipped questions.`
    });

    setHasLoggedToTracker(true);
    onRefreshStats();
    showToast('Syllabus Tracker Updated', 'Test practice review added to your preparation tasks.', 'success');
  };

  const handleReviewPreviousAttempt = (attemptId: string) => {
    const res = getTestAttemptById(user.id, attemptId);
    if (!res) {
      showToast('Attempt Not Found', 'Could not locate the saved attempt details.', 'error');
      return;
    }
    setActiveCategory(res.attempt.category);
    setLastResult(res);
    setTestState('submitted');
    setReviewFilter('all');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Performance label calculation based on clearly defined score ranges
  const getPerformanceFeedback = (percentage: number) => {
    if (percentage >= 80) {
      return {
        label: 'Excellent',
        title: 'Outstanding Performance!',
        message: 'Mastered concepts with high precision. You are in the top percentile for campus screening rounds.',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
      };
    }
    if (percentage >= 60) {
      return {
        label: 'Good',
        title: 'Good Job!',
        message: 'Comfortably meets standard campus evaluation cutoffs. Review missed questions to build speed.',
        badge: 'bg-teal-100 text-teal-800 border-teal-300'
      };
    }
    return {
      label: 'Needs Practice',
      title: 'Needs Practice',
      message: 'Focus on fundamental concepts and formulas. Review the step-by-step explanations below before re-attempting.',
      badge: 'bg-amber-100 text-amber-800 border-amber-300'
    };
  };

  // Overview stats calculated from actual attempts
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...attempts.map((a) => a.percentage)) 
    : 0;
  const totalCorrect = attempts.reduce((acc, curr) => acc + curr.score, 0);
  const totalQuestionsAnswered = attempts.reduce((acc, curr) => acc + curr.totalQuestions, 0);
  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrect / totalQuestionsAnswered) * 100) 
    : 0;

  // ------------------ VIEW 1: ACTIVE TIMED QUIZ INTERFACE ------------------
  if (testState === 'testing' && questions.length > 0) {
    const currentQ = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;
    const answeredTotal = Object.keys(userAnswers).length;
    const unansweredTotal = questions.length - answeredTotal;
    const flaggedTotal = Object.values(flaggedForReview).filter(Boolean).length;
    const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
    const isCurrentAnswered = userAnswers[currentQ.id] !== undefined;
    const isCurrentFlagged = !!flaggedForReview[currentQ.id];
    const isTimerLow = timeRemaining <= 120; // under 2 mins

    return (
      <div className="max-w-4xl mx-auto space-y-5 animate-fade-in pb-12">
        {/* Test Header with Live Timer */}
        <div className="card-panel p-4 sm:p-5 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-[#E2E8F0] shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5]">
                {activeCategory}
              </span>
              <span className="text-xs text-[#758392]">{questions.length} Questions</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-[#203B53] mt-1">
              Placement Practice Assessment
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-mono font-bold transition-colors ${
                isTimerLow
                  ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                  : 'bg-[#F5F7FA] text-[#203B53] border-[#E2E8F0]'
              }`}
              title="Time remaining"
            >
              <Clock className={`w-4 h-4 ${isTimerLow ? 'text-rose-600' : 'text-[#398879]'}`} />
              <span>{formatTimer(timeRemaining)}</span>
            </div>

            <button
              onClick={handleManualSubmitClick}
              disabled={isSubmitting}
              className="btn-primary text-xs sm:text-sm !py-2 !px-4 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              Submit Quiz
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
          <div
            className="bg-[#398879] h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Question Palette & Legend */}
        <div className="card-panel p-4 bg-white border border-[#E2E8F0] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-[#203B53] flex items-center gap-1.5">
              <ListOrdered className="w-4 h-4 text-[#398879]" />
              Question Navigation Palette
            </span>
            <div className="flex items-center gap-3 text-[11px] text-[#758392]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#398879]" /> Answered ({answeredTotal})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#DCA65A]" /> Flagged ({flaggedTotal})
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E2E8F0]" /> Unanswered ({unansweredTotal})
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q.id] !== undefined;
              const isFlagged = !!flaggedForReview[q.id];
              const isCurrent = idx === currentIndex;

              let btnStyle = 'bg-white border-[#E2E8F0] text-[#203B53] hover:bg-[#F5F7FA]';
              if (isCurrent) {
                btnStyle = 'ring-2 ring-[#203B53] bg-[#203B53] text-white font-bold border-transparent';
              } else if (isFlagged) {
                btnStyle = 'bg-[#FFF9EE] border-[#F2CF99] text-[#8C5A20] font-semibold';
              } else if (isAnswered) {
                btnStyle = 'bg-[#E7F4F1] border-[#A4D9C1] text-[#206053] font-semibold';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-8 h-8 rounded-lg border text-xs flex items-center justify-center transition-all cursor-pointer relative ${btnStyle}`}
                  title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ' (Flagged)' : ''}`}
                >
                  {idx + 1}
                  {isFlagged && !isCurrent && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#DCA65A] rounded-full border border-white" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Current Question Card */}
        <div className="card-panel p-6 bg-white border border-[#E2E8F0] space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#203B53]">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[#DCE3EB]">•</span>
              <span className="text-xs text-[#758392]">{currentQ.topic}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] px-2 py-0.5 rounded bg-[#F5F7FA] text-[#758392] border border-[#E2E8F0]">
                {currentQ.difficulty}
              </span>

              <button
                onClick={() => handleToggleFlag(currentQ.id)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors cursor-pointer ${
                  isCurrentFlagged
                    ? 'bg-[#FFF9EE] border-[#F2CF99] text-[#8C5A20]'
                    : 'bg-white border-[#E2E8F0] text-[#758392] hover:bg-[#F5F7FA]'
                }`}
                title="Flag question for review"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isCurrentFlagged ? 'Flagged' : 'Flag'}
                </span>
              </button>
            </div>
          </div>

          <p className="text-base sm:text-lg font-semibold text-[#203B53] leading-snug">
            {currentQ.question}
          </p>

          {/* MCQ Options */}
          <div className="space-y-2.5 pt-1">
            {currentQ.options.map((option, optIdx) => {
              const isSelected = userAnswers[currentQ.id] === optIdx;
              const optionLetter = String.fromCharCode(65 + optIdx);

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#E7F4F1] border-[#398879] text-[#203B53] shadow-2xs ring-1 ring-[#398879]'
                      : 'bg-white border-[#E2E8F0] text-[#263746] hover:bg-[#F5F7FA] hover:border-[#CFD9E4]'
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                      isSelected
                        ? 'bg-[#398879] text-white'
                        : 'bg-[#F5F7FA] text-[#203B53] border border-[#E2E8F0]'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-xs sm:text-sm flex-1 leading-relaxed">
                    {option}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[#398879] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Navigation & Controls */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div>
              {isCurrentAnswered && (
                <button
                  onClick={() => handleClearResponse(currentQ.id)}
                  className="text-xs text-[#758392] hover:text-rose-600 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Response</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentIndex === 0}
                className="btn-secondary text-xs !py-2 !px-3 disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleManualSubmitClick}
                  className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer"
                >
                  <span>Submit Quiz</span>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                  className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Confirmation Modal Before Submission */}
        {isSubmitModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#172B3A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#E7F0FA] text-[#203B53]">
                  <HelpCircle className="w-6 h-6 text-[#398879]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#203B53]">Submit Practice Assessment?</h3>
                  <p className="text-xs text-[#758392]">Verify your response summary before final evaluation.</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 py-2 text-center text-xs">
                <div className="p-2.5 rounded-lg bg-[#E7F4F1] border border-[#A4D9C1]">
                  <span className="font-extrabold text-[#206053] text-lg block">{answeredTotal}</span>
                  <span className="text-[#206053] font-medium text-[11px]">Answered</span>
                </div>
                <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="font-extrabold text-gray-700 text-lg block">{unansweredTotal}</span>
                  <span className="text-gray-600 font-medium text-[11px]">Unanswered</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#FFF9EE] border border-[#F2CF99]">
                  <span className="font-extrabold text-[#8C5A20] text-lg block">{flaggedTotal}</span>
                  <span className="text-[#8C5A20] font-medium text-[11px]">Flagged</span>
                </div>
              </div>

              {unansweredTotal > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>You have {unansweredTotal} unanswered {unansweredTotal === 1 ? 'question' : 'questions'}. Unanswered questions are evaluated as zero marks.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer"
                >
                  Return to Test
                </button>
                <button
                  onClick={confirmSubmit}
                  disabled={isSubmitting}
                  className="btn-primary text-xs !py-2 !px-4 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  Yes, Submit Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------ VIEW 2: COMPREHENSIVE QUIZ RESULTS SCREEN ------------------
  if (testState === 'submitted' && lastResult) {
    const { attempt, detailedResults } = lastResult;
    const { percentage, score, totalQuestions, correctAnswers, incorrectAnswers, unanswered, accuracy } = attempt;
    const timeSpent = attempt.timeSpentSeconds || 0;
    const feedback = getPerformanceFeedback(percentage);

    const filteredResults = detailedResults.filter((item) => {
      if (reviewFilter === 'correct') return item.isCorrect;
      if (reviewFilter === 'incorrect') return !item.isCorrect && item.selectedAnswer !== null;
      if (reviewFilter === 'unanswered') return item.selectedAnswer === null || item.selectedAnswer === undefined;
      return true;
    });

    // Topic-wise breakdown calculation
    const topicStats: { [topic: string]: { total: number; correct: number } } = {};
    detailedResults.forEach(item => {
      const top = item.question.topic || 'General';
      if (!topicStats[top]) topicStats[top] = { total: 0, correct: 0 };
      topicStats[top].total++;
      if (item.isCorrect) topicStats[top].correct++;
    });

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
        {/* Top Summary Card */}
        <div className="card-panel p-6 sm:p-8 bg-white border border-[#E2E8F0] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-[#E7F0FA] text-[#203B53] border border-[#D0E2F5]">
                  {attempt.category}
                </span>
                <span className="text-xs text-[#758392]">
                  {new Date(attempt.submittedAt).toLocaleDateString()} at {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-[#203B53] tracking-tight">
                Practice Assessment Scorecard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${feedback.badge}`}>
                {feedback.label}
              </span>
            </div>
          </div>

          {/* Performance Message Banner */}
          <div className="p-4 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex items-start gap-3">
            <Award className="w-5 h-5 text-[#398879] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-[#203B53]">{feedback.title}</h3>
              <p className="text-xs text-[#758392] mt-0.5 leading-relaxed">{feedback.message}</p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-center shadow-2xs">
              <span className="text-[11px] text-[#758392] font-medium block">Total Score</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#203B53] mt-1">
                {score} <span className="text-sm font-normal text-[#758392]">/ {totalQuestions}</span>
              </p>
              <span className="text-[11px] text-[#398879] font-bold mt-0.5 block">
                {percentage}% Score
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#E7F4F1] border border-[#A4D9C1] text-center shadow-2xs">
              <span className="text-[11px] text-[#206053] font-medium block">Correct Answers</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#206053] mt-1">
                {correctAnswers}
              </p>
              <span className="text-[11px] text-[#206053] font-medium mt-0.5 block">
                {accuracy}% Accuracy
              </span>
            </div>

            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center shadow-2xs">
              <span className="text-[11px] text-rose-700 font-medium block">Incorrect</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-700 mt-1">
                {incorrectAnswers}
              </p>
              <span className="text-[11px] text-rose-600 font-medium mt-0.5 block">
                {unanswered} Unanswered
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0] text-center shadow-2xs">
              <span className="text-[11px] text-[#758392] font-medium block">Time Taken</span>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#203B53] mt-1 font-mono">
                {formatTimer(timeSpent)}
              </p>
              <span className="text-[11px] text-[#758392] font-medium mt-0.5 block">
                {totalQuestions > 0 ? Math.round(timeSpent / totalQuestions) : 0}s / question
              </span>
            </div>
          </div>

          {/* Topic-wise Breakdown */}
          {Object.keys(topicStats).length > 0 && (
            <div className="pt-2 space-y-2">
              <h3 className="text-xs font-bold text-[#203B53] uppercase tracking-wider">
                Topic-Wise Mastery Breakdown
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {Object.entries(topicStats).map(([top, stat]) => {
                  const topicPct = Math.round((stat.correct / stat.total) * 100);
                  return (
                    <div key={top} className="p-2.5 rounded-lg bg-[#F5F7FA] border border-[#E2E8F0] flex items-center justify-between">
                      <span className="font-medium text-[#203B53] truncate pr-2">{top}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-[#203B53]">{stat.correct}/{stat.total}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                          topicPct >= 75 ? 'bg-emerald-100 text-emerald-800' : topicPct >= 50 ? 'bg-teal-100 text-teal-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {topicPct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => openTestConfig(attempt.category)}
                className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Try Again</span>
              </button>

              <button
                onClick={handleLogTaskToTracker}
                disabled={hasLoggedToTracker}
                className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-[#398879]" />
                <span>{hasLoggedToTracker ? 'Logged in Tracker' : 'Log Task to Tracker'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTestState('idle');
                  setLastResult(null);
                }}
                className="btn-secondary text-xs !py-2 !px-3 cursor-pointer"
              >
                Back to Practice Tests
              </button>
              {onNavigateToDashboard && (
                <button
                  onClick={onNavigateToDashboard}
                  className="btn-secondary text-xs !py-2 !px-3 cursor-pointer"
                >
                  Dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Detailed Solutions & Question Review */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#203B53]">Question Review & Solutions</h2>
              <p className="text-xs text-[#758392]">
                Inspect explanations, formulas, and verified correct options for each question.
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg border border-[#E2E8F0] bg-white p-0.5 text-xs">
              <button
                onClick={() => setReviewFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'all' ? 'bg-[#203B53] text-white' : 'text-[#758392] hover:text-[#203B53]'
                }`}
              >
                All ({detailedResults.length})
              </button>
              <button
                onClick={() => setReviewFilter('incorrect')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'incorrect' ? 'bg-rose-600 text-white' : 'text-[#758392] hover:text-rose-600'
                }`}
              >
                Incorrect ({incorrectAnswers})
              </button>
              <button
                onClick={() => setReviewFilter('correct')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'correct' ? 'bg-[#398879] text-white' : 'text-[#758392] hover:text-[#398879]'
                }`}
              >
                Correct ({correctAnswers})
              </button>
              <button
                onClick={() => setReviewFilter('unanswered')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                  reviewFilter === 'unanswered' ? 'bg-gray-700 text-white' : 'text-[#758392] hover:text-gray-900'
                }`}
              >
                Skipped ({unanswered})
              </button>
            </div>
          </div>

          {filteredResults.map((item) => {
            const { question, selectedAnswer, isCorrect } = item;
            const originalIndex = detailedResults.findIndex((d) => d.question.id === question.id);
            const isUnanswered = selectedAnswer === null || selectedAnswer === undefined;

            return (
              <div
                key={question.id}
                className={`card-panel p-5 bg-white space-y-3.5 border rounded-xl shadow-2xs transition-all ${
                  isCorrect 
                    ? 'border-[#B9E4D0]' 
                    : isUnanswered 
                    ? 'border-[#E2E8F0]' 
                    : 'border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#203B53]">Question {originalIndex + 1}</span>
                    <span className="text-[#DCE3EB]">•</span>
                    <span className="text-[#758392]">{question.topic}</span>
                  </div>
                  
                  {isCorrect ? (
                    <span className="badge-mint px-2.5 py-0.5 rounded text-xs flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#23584E]" />
                      Correct
                    </span>
                  ) : isUnanswered ? (
                    <span className="px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 border border-gray-200 text-xs flex items-center gap-1 font-semibold">
                      <MinusCircle className="w-3.5 h-3.5 text-gray-500" />
                      Not Answered
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200 text-xs flex items-center gap-1 font-semibold">
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      Incorrect
                    </span>
                  )}
                </div>

                <p className="text-sm sm:text-base font-semibold text-[#203B53]">
                  {question.question}
                </p>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {question.options.map((opt, optIdx) => {
                    const isUserChoice = selectedAnswer === optIdx;
                    const isTheCorrectOne = question.correctAnswer === optIdx;
                    const letter = String.fromCharCode(65 + optIdx);

                    let style = 'bg-[#F5F7FA] border-[#E2E8F0] text-[#263746]';
                    if (isTheCorrectOne) {
                      style = 'bg-[#E7F4F1] border-[#A4D9C1] text-[#206053] font-bold ring-1 ring-[#A4D9C1]';
                    } else if (isUserChoice && !isCorrect) {
                      style = 'bg-rose-50 border-rose-200 text-rose-800 line-through';
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3 rounded-lg border flex items-center gap-2.5 ${style}`}
                      >
                        <span className="w-6 h-6 rounded flex items-center justify-center font-bold text-[11px] bg-white border border-[#E2E8F0] shrink-0">
                          {letter}
                        </span>
                        <span className="flex-1">{opt}</span>
                        {isTheCorrectOne && (
                          <span className="text-[10px] text-[#206053] font-bold shrink-0">
                            ✓ Correct Answer
                          </span>
                        )}
                        {isUserChoice && !isTheCorrectOne && (
                          <span className="text-[10px] text-rose-600 font-medium shrink-0">
                            Your Choice
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {isUnanswered && (
                  <div className="text-[11px] text-[#758392] italic bg-[#F5F7FA] px-3 py-1.5 rounded-md border border-[#E2E8F0]">
                    Status: You skipped this question. The verified solution is highlighted above.
                  </div>
                )}

                {/* Explanation block */}
                <div className="p-3.5 rounded-lg bg-[#FAFCFE] border border-[#E2E8F0] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#203B53]">
                    <Sparkles className="w-3.5 h-3.5 text-[#398879]" />
                    <span>Explanation & Derivation:</span>
                  </div>
                  <p className="text-xs text-[#758392] leading-relaxed">
                    {question.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ------------------ VIEW 3: PRACTICE TESTS HUB (LANDING PAGE) ------------------
  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-12">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#203B53] tracking-tight">
            Aptitude & Practice Tests
          </h1>
          <p className="text-xs sm:text-sm text-[#758392] mt-0.5">
            Campus-placement practice assessments with customizable question counts, timed execution, and instant scorecards.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => openTestConfig()}
            className="btn-primary text-xs !py-2 !px-4 shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Start Practice Test</span>
          </button>

          {onNavigateToDashboard && (
            <button
              onClick={onNavigateToDashboard}
              className="btn-secondary text-xs !py-2 !px-3.5 cursor-pointer"
            >
              ← Back to Dashboard
            </button>
          )}
        </div>
      </div>

      {/* Overview Analytics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <span className="text-xs text-[#758392] font-medium block">Total Quizzes Attempted</span>
          <p className="text-2xl font-extrabold text-[#203B53] mt-1">
            {totalAttempts}
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block">
            {totalAttempts === 0 ? 'No attempts yet' : 'Real saved sessions'}
          </span>
        </div>

        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <span className="text-xs text-[#758392] font-medium block">Average Score</span>
          <p className="text-2xl font-extrabold text-[#203B53] mt-1">
            {avgScore}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block">
            Across all categories
          </span>
        </div>

        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <span className="text-xs text-[#758392] font-medium block">Best Score</span>
          <p className="text-2xl font-extrabold text-[#398879] mt-1">
            {bestScore}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block">
            Highest result recorded
          </span>
        </div>

        <div className="card-panel p-4 bg-white border border-[#E2E8F0]">
          <span className="text-xs text-[#758392] font-medium block">Overall Accuracy</span>
          <p className="text-2xl font-extrabold text-[#203B53] mt-1">
            {overallAccuracy}%
          </p>
          <span className="text-[11px] text-[#758392] mt-0.5 block">
            {totalCorrect} of {totalQuestionsAnswered} answered
          </span>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const categoryAttempts = attempts.filter((a) => a.category === cat.name);
          const bestCatScore =
            categoryAttempts.length > 0
              ? Math.max(...categoryAttempts.map((a) => a.percentage))
              : null;
          const totalInCat = getAvailableQuestionCount(cat.name);

          return (
            <div
              key={cat.name}
              className="card-panel p-5 bg-white border border-[#E2E8F0] hover:border-[#398879]/50 transition-all flex flex-col justify-between group shadow-2xs hover:shadow-xs rounded-xl"
            >
              <div>
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105"
                  style={{ backgroundColor: cat.badgeBg }}
                >
                  <Icon className="w-5 h-5" style={{ color: cat.accentColor }} />
                </div>
                
                <h3 className="text-base font-bold text-[#203B53] mb-0.5">
                  {cat.name}
                </h3>
                <p className="text-[11px] font-medium text-[#398879] mb-2">
                  {cat.subtitle}
                </p>
                <p className="text-xs text-[#758392] leading-relaxed mb-4 min-h-[50px]">
                  {cat.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between text-xs text-[#758392]">
                  <span>Attempts: {categoryAttempts.length}</span>
                  {bestCatScore !== null ? (
                    <span className="font-bold text-[#398879]">
                      Best: {bestCatScore}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#758392]/80">{totalInCat} MCQs Available</span>
                  )}
                </div>

                <button
                  onClick={() => openTestConfig(cat.name)}
                  className="btn-primary w-full !py-2.5 text-xs font-semibold justify-center shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Previous Attempts History */}
      <div ref={historySectionRef} className="card-panel p-6 bg-white border border-[#E2E8F0] shadow-2xs rounded-xl">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#398879]" />
            <h2 className="text-base font-bold text-[#203B53]">
              Quiz History & Previous Attempts
            </h2>
          </div>
          <span className="text-xs text-[#758392]">
            {attempts.length} {attempts.length === 1 ? 'Attempt' : 'Attempts'} Logged
          </span>
        </div>

        {attempts.length === 0 ? (
          <div className="py-10 text-center">
            <BookOpen className="w-8 h-8 text-[#758392]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#203B53]">No practice tests taken yet</p>
            <p className="text-xs text-[#758392] max-w-sm mx-auto mt-1">
              Select one of the 4 placement categories above to launch your first practice assessment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#758392] font-semibold">
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5">Date & Time</th>
                  <th className="pb-2.5 text-center">Questions</th>
                  <th className="pb-2.5 text-center">Score</th>
                  <th className="pb-2.5 text-center">Percentage</th>
                  <th className="pb-2.5 text-center">Status</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {attempts.map((att) => (
                  <tr key={att.id} className="hover:bg-[#F5F7FA]/70 transition-colors">
                    <td className="py-3 font-medium text-[#203B53]">
                      {att.category}
                    </td>
                    <td className="py-3 text-[#758392] text-xs">
                      {new Date(att.submittedAt).toLocaleDateString()} • {new Date(att.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-center text-[#758392]">
                      {att.totalQuestions}
                    </td>
                    <td className="py-3 text-center font-bold text-[#203B53]">
                      {att.score} / {att.totalQuestions}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`font-extrabold ${att.percentage >= 60 ? 'text-[#398879]' : 'text-[#8C5A20]'}`}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      {att.percentage >= 80 ? (
                        <span className="badge-mint px-2.5 py-0.5 rounded text-xs font-semibold">
                          Excellent
                        </span>
                      ) : att.percentage >= 60 ? (
                        <span className="px-2.5 py-0.5 rounded bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200">
                          Good
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 text-xs font-medium border border-amber-200">
                          Needs Practice
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => handleReviewPreviousAttempt(att.id)}
                        className="text-xs font-semibold text-[#398879] hover:underline flex items-center gap-1 ml-auto cursor-pointer"
                        title="Review complete question-by-question solutions"
                      >
                        <span>Review Result</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Test Configuration Modal */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#172B3A]/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-[#E7F4F1] rounded-lg text-[#206053]">
                  <BookOpen className="w-5 h-5 text-[#398879]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#203B53]">Configure Practice Test</h3>
                  <p className="text-xs text-[#758392]">Select question count, category, and difficulty</p>
                </div>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="p-1 rounded-lg text-[#758392] hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Category Selection */}
              <div>
                <label className="text-xs font-semibold text-[#203B53] block mb-1.5">
                  Assessment Category:
                </label>
                <select
                  value={configCategory}
                  onChange={(e) => setConfigCategory(e.target.value as McqCategory)}
                  className="w-full text-xs p-2.5 rounded-lg border border-[#E2E8F0] focus:ring-2 focus:ring-[#398879] focus:outline-none bg-white font-medium text-[#203B53]"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Number of Questions */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#203B53]">
                    Number of Questions:
                  </label>
                  <span className="text-[11px] text-[#758392]">
                    {availableQuestionsCount} questions available in bank
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-2">
                  {[5, 10, 15, 20].map((count) => {
                    const isSelected = !configIsCustom && configQuestionCount === count;
                    const isExceeding = count > availableQuestionsCount;
                    return (
                      <button
                        key={count}
                        type="button"
                        disabled={isExceeding}
                        onClick={() => {
                          setConfigIsCustom(false);
                          setConfigQuestionCount(count);
                        }}
                        className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isExceeding
                            ? 'opacity-40 bg-gray-100 border-gray-200 cursor-not-allowed text-gray-400'
                            : isSelected
                            ? 'bg-[#203B53] text-white border-transparent shadow-xs'
                            : 'bg-white border-[#E2E8F0] text-[#203B53] hover:bg-[#F5F7FA]'
                        }`}
                      >
                        {count} MCQs
                      </button>
                    );
                  })}
                </div>

                {/* Custom count toggle */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setConfigIsCustom(true);
                      handleCustomCountChange(customCountInput);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-md border font-medium cursor-pointer ${
                      configIsCustom 
                        ? 'bg-[#E7F0FA] text-[#203B53] border-[#D0E2F5] font-semibold' 
                        : 'text-[#758392] hover:text-[#203B53] border-transparent'
                    }`}
                  >
                    Custom Count
                  </button>
                  {configIsCustom && (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="number"
                        min="1"
                        max={availableQuestionsCount}
                        value={customCountInput}
                        onChange={(e) => handleCustomCountChange(e.target.value)}
                        className="w-24 text-xs p-1.5 rounded-md border border-[#E2E8F0] focus:ring-1 focus:ring-[#398879] focus:outline-none"
                        placeholder="e.g. 8"
                      />
                      <span className="text-[11px] text-[#758392]">
                        (Max: {availableQuestionsCount})
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty Selection */}
              <div>
                <label className="text-xs font-semibold text-[#203B53] block mb-1.5">
                  Difficulty Level:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setConfigDifficulty(diff)}
                      className={`py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        configDifficulty === diff
                          ? 'bg-[#398879] text-white border-transparent shadow-xs'
                          : 'bg-white border-[#E2E8F0] text-[#203B53] hover:bg-[#F5F7FA]'
                      }`}
                    >
                      {diff === 'All' ? 'All Levels' : diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimated Duration Info */}
              <div className="p-3 rounded-xl bg-[#F5F7FA] border border-[#E2E8F0] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-[#203B53]">
                  <Clock className="w-4 h-4 text-[#398879]" />
                  <span className="font-semibold">Estimated Test Duration:</span>
                </div>
                <span className="font-bold text-[#398879] font-mono">
                  {Math.round(Math.max(180, (configIsCustom ? (parseInt(customCountInput, 10) || 5) : configQuestionCount) * 75) / 60)} Minutes
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="btn-secondary text-xs !py-2 !px-4 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartConfiguredTest}
                className="btn-primary text-xs !py-2 !px-5 cursor-pointer shadow-xs"
              >
                Start Practice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
