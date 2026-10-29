import { Question, McqCategory } from '../types';

export const EXPANDED_QUESTION_BANK: Question[] = [
  // ================= QUANTITATIVE APTITUDE =================
  {
    id: 'qa-1',
    category: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Easy',
    question: 'A can do a piece of work in 12 days and B can do the same work in 24 days. Working together, in how many days can they complete the work?',
    options: ['6 days', '8 days', '9 days', '10 days'],
    correctAnswer: 1,
    explanation: "A's 1 day work = 1/12, B's 1 day work = 1/24. Together in 1 day = 1/12 + 1/24 = 3/24 = 1/8. Hence, together they take 8 days."
  },
  {
    id: 'qa-2',
    category: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Easy',
    question: 'The price of an article is increased by 20% and then decreased by 20%. What is the net change in price?',
    options: ['No change', '4% increase', '4% decrease', '2% decrease'],
    correctAnswer: 2,
    explanation: 'Using the formula a + b + (ab/100): 20 + (-20) + (20 * -20)/100 = 0 - 4 = -4%. Thus, there is a net 4% decrease.'
  },
  {
    id: 'qa-3',
    category: 'Quantitative Aptitude',
    topic: 'Speed, Distance and Time',
    difficulty: 'Medium',
    question: 'A train 150 metres long passes a pole in 15 seconds. What is the speed of the train in km/h?',
    options: ['32 km/h', '36 km/h', '40 km/h', '45 km/h'],
    correctAnswer: 1,
    explanation: 'Speed = Distance / Time = 150m / 15s = 10 m/s. Converting to km/h: 10 * (18/5) = 36 km/h.'
  },
  {
    id: 'qa-4',
    category: 'Quantitative Aptitude',
    topic: 'Profit and Loss',
    difficulty: 'Medium',
    question: 'A trader buys a book for ₹250 and sells it for ₹300. What is his percentage profit?',
    options: ['16.66%', '20%', '25%', '15%'],
    correctAnswer: 1,
    explanation: 'Profit = ₹300 - ₹250 = ₹50. Profit % = (Profit / Cost Price) * 100 = (50 / 250) * 100 = 20%.'
  },
  {
    id: 'qa-5',
    category: 'Quantitative Aptitude',
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    question: 'If A : B = 3 : 4 and B : C = 8 : 9, find the ratio A : C.',
    options: ['1 : 2', '2 : 3', '3 : 5', '4 : 5'],
    correctAnswer: 1,
    explanation: 'A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24/36 = 2/3. So, A : C is 2 : 3.'
  },
  {
    id: 'qa-6',
    category: 'Quantitative Aptitude',
    topic: 'Simple Interest',
    difficulty: 'Medium',
    question: 'What sum of money will amount to ₹1320 in 2 years at 10% per annum simple interest?',
    options: ['₹1000', '₹1100', '₹1150', '₹1200'],
    correctAnswer: 1,
    explanation: 'Amount = P(1 + (R*T)/100). 1320 = P(1 + 20/100) = 1.2P. P = 1320 / 1.2 = ₹1100.'
  },
  {
    id: 'qa-7',
    category: 'Quantitative Aptitude',
    topic: 'Permutations and Combinations',
    difficulty: 'Medium',
    question: "In how many different ways can the letters of the word 'LEADER' be arranged?",
    options: ['720', '360', '180', '120'],
    correctAnswer: 1,
    explanation: "Total letters = 6. Letter 'E' repeats twice. Total permutations = 6! / 2! = 720 / 2 = 360."
  },
  {
    id: 'qa-8',
    category: 'Quantitative Aptitude',
    topic: 'Probability',
    difficulty: 'Easy',
    question: 'Two dice are tossed simultaneously. What is the probability of getting a sum of 7?',
    options: ['1/6', '1/12', '5/36', '7/36'],
    correctAnswer: 0,
    explanation: 'Favourable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6. Total = 36. Probability = 6/36 = 1/6.'
  },
  {
    id: 'qa-9',
    category: 'Quantitative Aptitude',
    topic: 'Averages',
    difficulty: 'Easy',
    question: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What was the excluded number?',
    options: ['30', '32', '35', '40'],
    correctAnswer: 2,
    explanation: 'Sum of 5 numbers = 5 * 27 = 135. Sum of remaining 4 numbers = 4 * 25 = 100. Excluded number = 135 - 100 = 35.'
  },
  {
    id: 'qa-10',
    category: 'Quantitative Aptitude',
    topic: 'Number System',
    difficulty: 'Hard',
    question: 'What is the remainder when 2^31 is divided by 5?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2,
    explanation: 'Powers of 2 mod 5 follow cyclicity of 4: 2^1=2, 2^2=4, 2^3=3, 2^4=1. 31 mod 4 = 3. So 2^31 mod 5 = 2^3 mod 5 = 8 mod 5 = 3.'
  },
  {
    id: 'qa-11',
    category: 'Quantitative Aptitude',
    topic: 'Pipes and Cisterns',
    difficulty: 'Medium',
    question: 'Pipe A can fill a tank in 6 hours and Pipe B can empty it in 8 hours. If both pipes are opened together, in how many hours will the tank be full?',
    options: ['12 hours', '18 hours', '24 hours', '30 hours'],
    correctAnswer: 2,
    explanation: 'Net rate per hour = 1/6 - 1/8 = (4 - 3)/24 = 1/24. Therefore, the tank fills in 24 hours.'
  },
  {
    id: 'qa-12',
    category: 'Quantitative Aptitude',
    topic: 'Boats and Streams',
    difficulty: 'Hard',
    question: 'A boat travels 24 km downstream in 2 hours and 16 km upstream in 2 hours. What is the speed of the water stream?',
    options: ['1 km/h', '2 km/h', '3 km/h', '4 km/h'],
    correctAnswer: 1,
    explanation: 'Downstream speed = 24/2 = 12 km/h. Upstream speed = 16/2 = 8 km/h. Stream speed = (12 - 8)/2 = 2 km/h.'
  },

  // ================= LOGICAL REASONING =================
  {
    id: 'lr-1',
    category: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
    options: ['95', '111', '127', '135'],
    correctAnswer: 2,
    explanation: 'Each term is (previous * 2) + 1. 63 * 2 + 1 = 127.'
  },
  {
    id: 'lr-2',
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: "Pointing to a gentleman, Deepak said, 'His only brother is the father of my daughter\\'s father.' How is the gentleman related to Deepak?",
    options: ['Father', 'Grandfather', 'Uncle', 'Brother-in-law'],
    correctAnswer: 2,
    explanation: "Daughter's father is Deepak himself. Deepak's father's brother is Deepak's paternal uncle."
  },
  {
    id: 'lr-3',
    category: 'Logical Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Easy',
    question: "In a certain code, 'PENCIL' is written as 'QFOEJM'. How is 'PAPER' written in that code?",
    options: ['QBQFS', 'QCQFS', 'QBQES', 'RCRFT'],
    correctAnswer: 0,
    explanation: 'Each letter is shifted forward by +1 position in the alphabet: P->Q, A->B, P->Q, E->F, R->S.'
  },
  {
    id: 'lr-4',
    category: 'Logical Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Medium',
    question: 'Rohan walks 10m North, turns right and walks 10m, then turns right again and walks 10m. In which direction is he now facing?',
    options: ['North', 'East', 'South', 'West'],
    correctAnswer: 2,
    explanation: 'Starting North -> turn right faces East -> turn right faces South.'
  },
  {
    id: 'lr-5',
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    difficulty: 'Medium',
    question: 'Statements: (1) All mangoes are golden. (2) No golden things are cheap. Conclusion I: All mangoes are cheap. Conclusion II: Golden things are not mangoes.',
    options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctAnswer: 3,
    explanation: 'Since all mangoes are golden and no golden things are cheap, mangoes cannot be cheap (I is false). Since all mangoes are golden, some golden things ARE mangoes (II is false). Neither follows.'
  },
  {
    id: 'lr-6',
    category: 'Logical Reasoning',
    topic: 'Analogy',
    difficulty: 'Easy',
    question: 'Architect : Building :: Sculptor : ?',
    options: ['Museum', 'Stone', 'Statue', 'Chisel'],
    correctAnswer: 2,
    explanation: 'An architect designs buildings; a sculptor creates statues.'
  },
  {
    id: 'lr-7',
    category: 'Logical Reasoning',
    topic: 'Odd One Out',
    difficulty: 'Easy',
    question: 'Find the odd one out among the following numbers: 27, 64, 125, 144, 216',
    options: ['64', '125', '144', '216'],
    correctAnswer: 2,
    explanation: '27 = 3^3, 64 = 4^3, 125 = 5^3, 216 = 6^3 are all cubes. 144 is 12^2, not a perfect cube.'
  },
  {
    id: 'lr-8',
    category: 'Logical Reasoning',
    topic: 'Seating Arrangement',
    difficulty: 'Hard',
    question: 'Five friends A, B, C, D, and E sit in a row facing North. C sits in the exact middle. E sits at the right end. If D sits immediately to the left of C, who is to the immediate right of A if A sits at the left end?',
    options: ['B', 'C', 'D', 'E'],
    correctAnswer: 2,
    explanation: 'Order from left to right: [1]=A, [2]=D, [3]=C, [4]=B, [5]=E. Immediate right of A is D.'
  },

  // ================= BASIC TECHNICAL KNOWLEDGE =================
  {
    id: 'tk-1',
    category: 'Basic Technical Knowledge',
    topic: 'Data Structures',
    difficulty: 'Easy',
    question: 'Which data structure operates strictly on the Last-In-First-Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
    correctAnswer: 1,
    explanation: 'A Stack stores elements in LIFO order (Last In, First Out).'
  },
  {
    id: 'tk-2',
    category: 'Basic Technical Knowledge',
    topic: 'Algorithms & Complexity',
    difficulty: 'Medium',
    question: 'What is the average time complexity of searching in a balanced Binary Search Tree containing n nodes?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    explanation: 'A balanced BST with height log(n) cuts the search space in half at each step, yielding O(log n).'
  },
  {
    id: 'tk-3',
    category: 'Basic Technical Knowledge',
    topic: 'DBMS',
    difficulty: 'Easy',
    question: 'In database management systems, what does the letter "A" represent in the ACID transaction properties?',
    options: ['Availability', 'Atomicity', 'Authentication', 'Authorization'],
    correctAnswer: 1,
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability.'
  },
  {
    id: 'tk-4',
    category: 'Basic Technical Knowledge',
    topic: 'DBMS',
    difficulty: 'Medium',
    question: 'Which Normal Form eliminates transitive functional dependencies on the primary key?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctAnswer: 2,
    explanation: 'Third Normal Form (3NF) requires a relation to be in 2NF and contain no transitive dependencies.'
  },
  {
    id: 'tk-5',
    category: 'Basic Technical Knowledge',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: "Which of the following is NOT one of Coffman's four necessary conditions for a system deadlock?",
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctAnswer: 2,
    explanation: 'The condition is NO Preemption (resources cannot be forcibly taken). Preemption Allowed prevents deadlocks.'
  },
  {
    id: 'tk-6',
    category: 'Basic Technical Knowledge',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the primary role of the CPU scheduler in an operating system?',
    options: ['Allocating disk space', 'Selecting a process from the ready queue for CPU execution', 'Managing virtual memory swap space', 'Translating domain names'],
    correctAnswer: 1,
    explanation: 'The short-term scheduler selects which ready process executes next on the CPU.'
  },
  {
    id: 'tk-7',
    category: 'Basic Technical Knowledge',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Which layer of the OSI model handles end-to-end packet routing and logical IP addressing?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctAnswer: 1,
    explanation: 'The Network Layer (Layer 3) handles IP addressing and packet routing across networks.'
  },
  {
    id: 'tk-8',
    category: 'Basic Technical Knowledge',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'How does TCP differ fundamentally from UDP?',
    options: ['TCP is connectionless', 'TCP provides reliable, ordered transmission with handshakes; UDP is connectionless', 'TCP is faster for video streaming', 'TCP works only on local area networks'],
    correctAnswer: 1,
    explanation: 'TCP is connection-oriented, ensures ordered and error-checked packet delivery via a 3-way handshake. UDP is connectionless and best-effort.'
  },
  {
    id: 'tk-9',
    category: 'Basic Technical Knowledge',
    topic: 'Object-Oriented Programming',
    difficulty: 'Easy',
    question: 'Which OOP principle bundles variables and methods together while hiding internal implementation details from external direct access?',
    options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Dynamic Binding'],
    correctAnswer: 2,
    explanation: 'Encapsulation bundles data and methods while restricting direct access to state via access modifiers.'
  },
  {
    id: 'tk-10',
    category: 'Basic Technical Knowledge',
    topic: 'Algorithms',
    difficulty: 'Hard',
    question: 'What is the worst-case time complexity of QuickSort when using a naive pivot on an already sorted array?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
    correctAnswer: 3,
    explanation: 'When the pivot creates unbalanced partitions of size 1 and n-1, QuickSort degenerates to O(n^2) runtime.'
  },

  // ================= VERBAL ABILITY =================
  {
    id: 'va-1',
    category: 'Verbal Ability',
    topic: 'Subject-Verb Agreement',
    difficulty: 'Easy',
    question: 'Choose the grammatically correct sentence that observes proper subject-verb agreement:',
    options: [
      'Neither the project manager nor the developers was present at the meeting.',
      'Neither the project manager nor the developers were present at the meeting.',
      'Neither the project manager nor the developers is present at the meeting.',
      'Neither the project manager nor the developers has been present at the meeting.'
    ],
    correctAnswer: 1,
    explanation: "With 'neither... nor', the verb agrees with the closer subject ('developers' is plural, so 'were' is correct)."
  },
  {
    id: 'va-2',
    category: 'Verbal Ability',
    topic: 'Vocabulary & Synonyms',
    difficulty: 'Easy',
    question: "Select the word that is most nearly SYNONYMOUS in meaning to 'CANDID':",
    options: ['Secretive', 'Frank', 'Deceptive', 'Hesitant'],
    correctAnswer: 1,
    explanation: "'Candid' means truthful, honest, and straightforward (Frank)."
  },
  {
    id: 'va-3',
    category: 'Verbal Ability',
    topic: 'Sentence Correction',
    difficulty: 'Medium',
    question: "Identify the best replacement: 'If he would have studied harder, he would have cleared the campus interview.'",
    options: ['Had he studied harder', 'If he has studied harder', 'If he will study harder', 'Should he have studied harder'],
    correctAnswer: 0,
    explanation: "The third conditional takes past perfect in the if-clause: 'Had he studied harder' or 'If he had studied harder'."
  },
  {
    id: 'va-4',
    category: 'Verbal Ability',
    topic: 'Vocabulary & Antonyms',
    difficulty: 'Medium',
    question: "Select the word that is most nearly OPPOSITE in meaning to 'PRAGMATIC':",
    options: ['Realistic', 'Practical', 'Idealistic', 'Rational'],
    correctAnswer: 2,
    explanation: "'Pragmatic' means dealing with things practically. Its direct opposite is 'Idealistic'."
  },
  {
    id: 'va-5',
    category: 'Verbal Ability',
    topic: 'Grammar & Prepositions',
    difficulty: 'Easy',
    question: "Select the appropriate preposition: 'The candidate complied _____ all the eligibility requirements.'",
    options: ['to', 'with', 'by', 'for'],
    correctAnswer: 1,
    explanation: "The standard English collocation is 'comply with'."
  },
  {
    id: 'va-6',
    category: 'Verbal Ability',
    topic: 'Spotting the Error',
    difficulty: 'Medium',
    question: "Identify the part with error: '[A] One of the most important skills / [B] for software engineers / [C] are the ability to write clean code / [D] and collaborate effectively.'",
    options: ['Part [A]', 'Part [B]', 'Part [C]', 'Part [D]'],
    correctAnswer: 2,
    explanation: "The subject is singular 'One' (of the skills), so the verb in [C] must be singular 'is', not 'are'."
  },
  {
    id: 'va-7',
    category: 'Verbal Ability',
    topic: 'Verbal Reasoning & Inference',
    difficulty: 'Medium',
    question: "Read the statement: 'Companies that invest in employee upskilling report 35% higher talent retention during downturns.' Which inference follows logically?",
    options: [
      'Talent retention depends entirely on compensation.',
      'Upskilling opportunities contribute positively to organizational talent retention.',
      'Employees who are not upskilled will definitely leave within one year.',
      'Downturns only affect companies without training programs.'
    ],
    correctAnswer: 1,
    explanation: 'The statement establishes a positive relationship between employee upskilling investments and talent retention.'
  },
  {
    id: 'va-8',
    category: 'Verbal Ability',
    topic: 'Idioms and Phrases',
    difficulty: 'Easy',
    question: "What is the meaning of the idiom 'to burn the midnight oil'?",
    options: [
      'To waste electricity unnecessarily',
      'To work or study late into the night',
      'To initiate an argument with colleagues',
      'To prepare for an upcoming journey'
    ],
    correctAnswer: 1,
    explanation: "'To burn the midnight oil' means to work or study late into the night."
  },
  {
    id: 'va-9',
    category: 'Verbal Ability',
    topic: 'Sentence Completion',
    difficulty: 'Easy',
    question: "The director's presentation was so _____ that several investors decided to fund the project on the spot.",
    options: ['persuasive', 'dubious', 'monotonous', 'hesitant'],
    correctAnswer: 0,
    explanation: "'Persuasive' means convincing and effective, fitting the immediate positive response of investors."
  },
  {
    id: 'va-10',
    category: 'Verbal Ability',
    topic: 'Analogies',
    difficulty: 'Medium',
    question: "Select the pair that best expresses a relationship similar to: ARCHITECT : BLUEPRINT",
    options: ['Musician : Instrument', 'Author : Novel', 'Doctor : Hospital', 'Teacher : Student'],
    correctAnswer: 1,
    explanation: "An architect creates a blueprint as their primary planned work, just as an author creates a novel."
  },
  {
    id: 'va-11',
    category: 'Verbal Ability',
    topic: 'One Word Substitution',
    difficulty: 'Easy',
    question: "One who possesses many talents and can easily adapt to different activities is known as:",
    options: ['Versatile', 'Ambidextrous', 'Philanthropist', 'Polyglot'],
    correctAnswer: 0,
    explanation: "'Versatile' describes a person capable of adapting to many different functions or activities."
  },
  {
    id: 'va-12',
    category: 'Verbal Ability',
    topic: 'Reading Comprehension',
    difficulty: 'Hard',
    question: "In technical documentation, using ambiguous terminology primarily increases which risk?",
    options: ['Memory leak runtime errors', 'Misinterpretation of system requirements and test cases', 'Network latency', 'Compilation overhead'],
    correctAnswer: 1,
    explanation: "Ambiguous documentation directly leads to misinterpretation by developers and QA engineers."
  },

  // ================= LOGICAL REASONING (EXPANDED) =================
  {
    id: 'lr-11',
    category: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    question: 'Find the next number in the sequence: 4, 9, 19, 39, 79, ?',
    options: ['119', '139', '159', '179'],
    correctAnswer: 2,
    explanation: 'Pattern: Each term is (previous term * 2) + 1. (79 * 2) + 1 = 158 + 1 = 159.'
  },
  {
    id: 'lr-12',
    category: 'Logical Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Medium',
    question: "If in a certain code 'CAMPUS' is coded as 'EDORWU', how is 'OFFER' coded in that language?",
    options: ['QHHGT', 'QGGHT', 'PHHGT', 'QHIHT'],
    correctAnswer: 0,
    explanation: 'Each letter is shifted forward by 2 positions: O(+2)=Q, F(+2)=H, F(+2)=H, E(+2)=G, R(+2)=T.'
  },
  {
    id: 'lr-13',
    category: 'Logical Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Easy',
    question: 'Rahul walks 12 km North, turns right and walks 5 km. How far is he from his starting point?',
    options: ['13 km', '15 km', '17 km', '10 km'],
    correctAnswer: 0,
    explanation: 'By Pythagoras theorem: sqrt(12^2 + 5^2) = sqrt(144 + 25) = sqrt(169) = 13 km.'
  },
  {
    id: 'lr-14',
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: "Pointing to a photograph, Priya said, 'He is the only son of my grandfather's only son.' How is the man related to Priya?",
    options: ['Uncle', 'Brother', 'Cousin', 'Father'],
    correctAnswer: 1,
    explanation: "Grandfather's only son is Priya's father. The only son of Priya's father is Priya's brother."
  },
  {
    id: 'lr-15',
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    difficulty: 'Hard',
    question: 'Statements: (1) All algorithms are logic. (2) Some logic is code. Conclusions: I. Some code is logic. II. All algorithms are code.',
    options: ['Only Conclusion I follows', 'Only Conclusion II follows', 'Both follow', 'Neither follows'],
    correctAnswer: 0,
    explanation: "Since 'Some logic is code' can be converted to 'Some code is logic', Conclusion I follows. Conclusion II does not necessarily follow."
  },
  {
    id: 'lr-16',
    category: 'Logical Reasoning',
    topic: 'Arrangements',
    difficulty: 'Medium',
    question: 'Five colleagues A, B, C, D, and E sit in a row facing North. C is at the exact center. A is to the immediate right of C. Who is at the right end if B and D sit together?',
    options: ['A', 'B', 'D', 'Cannot be determined without more data'],
    correctAnswer: 3,
    explanation: 'While C is at index 3 and A is at index 4, the relative positions of B and D at indices 1, 2 or 5 cannot be uniquely fixed.'
  },
  {
    id: 'lr-17',
    category: 'Logical Reasoning',
    topic: 'Clocks and Calendars',
    difficulty: 'Easy',
    question: 'What is the angle between the hour hand and the minute hand of a clock at 3:30?',
    options: ['70 degrees', '75 degrees', '80 degrees', '90 degrees'],
    correctAnswer: 1,
    explanation: 'Angle = |30H - 5.5M| = |30(3) - 5.5(30)| = |90 - 165| = 75 degrees.'
  },
  {
    id: 'lr-18',
    category: 'Logical Reasoning',
    topic: 'Data Sufficiency',
    difficulty: 'Hard',
    question: 'Is integer x divisible by 6? Statement (1): x is divisible by 2. Statement (2): x is divisible by 3.',
    options: ['Statement (1) alone is sufficient', 'Statement (2) alone is sufficient', 'Both statements together are sufficient', 'Statements together are not sufficient'],
    correctAnswer: 2,
    explanation: 'A number is divisible by 6 if and only if it is divisible by both 2 and 3. Both statements together are required and sufficient.'
  },

  // ================= QUANTITATIVE APTITUDE (EXPANDED) =================
  {
    id: 'qa-11',
    category: 'Quantitative Aptitude',
    topic: 'Permutations & Combinations',
    difficulty: 'Medium',
    question: 'In how many ways can 5 candidates be seated in a row for an interview panel?',
    options: ['60', '100', '120', '24'],
    correctAnswer: 2,
    explanation: 'The number of linear arrangements of 5 distinct items is 5! = 5 * 4 * 3 * 2 * 1 = 120.'
  },
  {
    id: 'qa-12',
    category: 'Quantitative Aptitude',
    topic: 'Probability',
    difficulty: 'Easy',
    question: 'Two fair coins are tossed simultaneously. What is the probability of getting at least one head?',
    options: ['1/4', '1/2', '3/4', '1'],
    correctAnswer: 2,
    explanation: 'Total outcomes: {HH, HT, TH, TT} = 4. Favorable outcomes with >= 1 head: {HH, HT, TH} = 3. Probability = 3/4.'
  },
  {
    id: 'qa-13',
    category: 'Quantitative Aptitude',
    topic: 'Averages',
    difficulty: 'Easy',
    question: 'The average age of 4 students is 20 years. If the age of the teacher (35 years) is included, what is the new average age?',
    options: ['22 years', '23 years', '24 years', '25 years'],
    correctAnswer: 1,
    explanation: 'Sum of 4 students = 4 * 20 = 80. New total = 80 + 35 = 115. New average = 115 / 5 = 23 years.'
  },
  {
    id: 'qa-14',
    category: 'Quantitative Aptitude',
    topic: 'Pipes & Cisterns',
    difficulty: 'Medium',
    question: 'Pipe A fills a tank in 10 hours, while Pipe B empties it in 15 hours. If both pipes are opened together, in how many hours will the tank fill?',
    options: ['25 hours', '30 hours', '20 hours', '18 hours'],
    correctAnswer: 1,
    explanation: 'Net fill rate per hour = 1/10 - 1/15 = (3 - 2)/30 = 1/30. The tank will fill completely in 30 hours.'
  },
  {
    id: 'qa-15',
    category: 'Quantitative Aptitude',
    topic: 'Compound Interest',
    difficulty: 'Hard',
    question: 'What is the compound interest on ₹10,000 for 2 years at 10% per annum compounded annually?',
    options: ['₹2,000', '₹2,100', '₹2,200', '₹2,050'],
    correctAnswer: 1,
    explanation: 'A = P(1 + r/100)^t = 10000(1.10)^2 = 10000 * 1.21 = ₹12,100. CI = ₹12,100 - ₹10,000 = ₹2,100.'
  },
  {
    id: 'qa-16',
    category: 'Quantitative Aptitude',
    topic: 'Mixtures & Alligations',
    difficulty: 'Medium',
    question: 'In what ratio must tea worth ₹60/kg be mixed with tea worth ₹85/kg to produce a blend worth ₹70/kg?',
    options: ['3 : 2', '2 : 3', '1 : 2', '4 : 3'],
    correctAnswer: 0,
    explanation: 'By alligation rule: (85 - 70) : (70 - 60) = 15 : 10 = 3 : 2.'
  },

  // ================= BASIC TECHNICAL KNOWLEDGE (EXPANDED) =================
  {
    id: 'tk-11',
    category: 'Basic Technical Knowledge',
    topic: 'Data Structures',
    difficulty: 'Easy',
    question: 'Which data structure follows the Last-In, First-Out (LIFO) order of execution?',
    options: ['Queue', 'Stack', 'Circular Linked List', 'Binary Search Tree'],
    correctAnswer: 1,
    explanation: 'A Stack strictly enforces LIFO semantics via push and pop operations.'
  },
  {
    id: 'tk-12',
    category: 'Basic Technical Knowledge',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'Which SQL clause is used to filter the results of grouped records generated by GROUP BY?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'LIMIT'],
    correctAnswer: 1,
    explanation: 'HAVING filters aggregate/grouped records, whereas WHERE filters individual rows prior to grouping.'
  },
  {
    id: 'tk-13',
    category: 'Basic Technical Knowledge',
    topic: 'Algorithms',
    difficulty: 'Medium',
    question: 'What is the average time complexity of searching for an element in a balanced Binary Search Tree (AVL / Red-Black)?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1,
    explanation: 'A balanced BST maintains height proportional to log2(n), giving O(log n) search runtime.'
  },
  {
    id: 'tk-14',
    category: 'Basic Technical Knowledge',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'What is the default TCP port number used by HTTPS for secure web traffic?',
    options: ['80', '22', '443', '8080'],
    correctAnswer: 2,
    explanation: 'HTTPS traffic runs over TCP port 443 with TLS encryption (HTTP standard uses port 80).'
  },
  {
    id: 'tk-15',
    category: 'Basic Technical Knowledge',
    topic: 'Operating Systems',
    difficulty: 'Hard',
    question: "What is 'thrashing' in virtual memory systems?",
    options: [
      'A hardware CPU failure',
      'Excessive page faults causing the system to spend more time swapping pages than executing instructions',
      'Overheating of secondary storage',
      'Compacting memory to eliminate external fragmentation'
    ],
    correctAnswer: 1,
    explanation: "Thrashing occurs when memory is overcommitted, causing continuous page faults and disk I/O thrashing."
  }
];

export function importQuestionDataset(newQuestions: Question[]): { added: number; total: number } {
  const existingStr = localStorage.getItem('telemetry_questions');
  let current: Question[] = existingStr ? JSON.parse(existingStr) : [];
  const existingIds = new Set(current.map(q => q.id));

  let added = 0;
  for (const q of newQuestions) {
    if (!existingIds.has(q.id)) {
      current.push(q);
      existingIds.add(q.id);
      added++;
    }
  }

  localStorage.setItem('telemetry_questions', JSON.stringify(current));
  return { added, total: current.length };
}
