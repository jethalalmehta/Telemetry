import { Question } from '../types';

export const INITIAL_QUESTIONS: Question[] = [
  // ================= QUANTITATIVE APTITUDE (10 QUESTIONS) =================
  {
    id: 'qa-1',
    category: 'Quantitative Aptitude',
    topic: 'Time and Work',
    difficulty: 'Easy',
    question: 'A can do a piece of work in 12 days and B can do the same work in 24 days. Working together, in how many days can they complete the work?',
    options: ['6 days', '8 days', '9 days', '10 days'],
    correctAnswer: 1, // 8 days
    explanation: "A's 1 day work = 1/12, B's 1 day work = 1/24. Together in 1 day = 1/12 + 1/24 = 3/24 = 1/8. Hence, together they take 8 days."
  },
  {
    id: 'qa-2',
    category: 'Quantitative Aptitude',
    topic: 'Percentages',
    difficulty: 'Easy',
    question: 'The price of an article is increased by 20% and then decreased by 20%. What is the net change in price?',
    options: ['No change', '4% increase', '4% decrease', '2% decrease'],
    correctAnswer: 2, // 4% decrease
    explanation: 'Using the formula a + b + (ab/100): 20 + (-20) + (20 * -20)/100 = 0 - 4 = -4%. Thus, there is a net 4% decrease.'
  },
  {
    id: 'qa-3',
    category: 'Quantitative Aptitude',
    topic: 'Speed, Distance and Time',
    difficulty: 'Medium',
    question: 'A train 150 metres long passes a pole in 15 seconds. What is the speed of the train in km/h?',
    options: ['32 km/h', '36 km/h', '40 km/h', '45 km/h'],
    correctAnswer: 1, // 36 km/h
    explanation: 'Speed = Distance / Time = 150m / 15s = 10 m/s. Converting to km/h: 10 * (18/5) = 36 km/h.'
  },
  {
    id: 'qa-4',
    category: 'Quantitative Aptitude',
    topic: 'Profit and Loss',
    difficulty: 'Medium',
    question: 'A trader buys a book for ₹250 and sells it for ₹300. What is his percentage profit?',
    options: ['16.66%', '20%', '25%', '15%'],
    correctAnswer: 1, // 20%
    explanation: 'Profit = ₹300 - ₹250 = ₹50. Profit % = (Profit / Cost Price) * 100 = (50 / 250) * 100 = 20%.'
  },
  {
    id: 'qa-5',
    category: 'Quantitative Aptitude',
    topic: 'Ratio and Proportion',
    difficulty: 'Easy',
    question: 'If A : B = 3 : 4 and B : C = 8 : 9, find the ratio A : C.',
    options: ['1 : 2', '2 : 3', '3 : 5', '4 : 5'],
    correctAnswer: 1, // 2 : 3
    explanation: 'A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24/36 = 2/3. So, A : C is 2 : 3.'
  },
  {
    id: 'qa-6',
    category: 'Quantitative Aptitude',
    topic: 'Simple Interest',
    difficulty: 'Medium',
    question: 'What sum of money will amount to ₹1320 in 2 years at 10% per annum simple interest?',
    options: ['₹1000', '₹1100', '₹1150', '₹1200'],
    correctAnswer: 1, // ₹1100
    explanation: 'Amount = P + SI = P + (P * R * T)/100 = P(1 + (10 * 2)/100) = P * 1.20. Therefore, P = 1320 / 1.2 = ₹1100.'
  },
  {
    id: 'qa-7',
    category: 'Quantitative Aptitude',
    topic: 'Permutations and Combinations',
    difficulty: 'Medium',
    question: 'In how many different ways can the letters of the word "LEADER" be arranged?',
    options: ['720', '360', '180', '120'],
    correctAnswer: 1, // 360
    explanation: 'Total letters = 6. The letter "E" appears twice. Total distinct arrangements = 6! / 2! = 720 / 2 = 360.'
  },
  {
    id: 'qa-8',
    category: 'Quantitative Aptitude',
    topic: 'Probability',
    difficulty: 'Easy',
    question: 'Two dice are tossed simultaneously. What is the probability of getting a sum of 7?',
    options: ['1/6', '1/12', '5/36', '7/36'],
    correctAnswer: 0, // 1/6
    explanation: 'Favourable outcomes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs. Total outcomes = 36. Probability = 6/36 = 1/6.'
  },
  {
    id: 'qa-9',
    category: 'Quantitative Aptitude',
    topic: 'Averages',
    difficulty: 'Easy',
    question: 'The average of 5 numbers is 27. If one number is excluded, the average becomes 25. What was the excluded number?',
    options: ['30', '32', '35', '40'],
    correctAnswer: 2, // 35
    explanation: 'Total sum of 5 numbers = 5 * 27 = 135. Total sum of remaining 4 numbers = 4 * 25 = 100. Excluded number = 135 - 100 = 35.'
  },
  {
    id: 'qa-10',
    category: 'Quantitative Aptitude',
    topic: 'Number System',
    difficulty: 'Hard',
    question: 'What is the remainder when 2^31 is divided by 5?',
    options: ['1', '2', '3', '4'],
    correctAnswer: 2, // 3
    explanation: '2^1 mod 5 = 2, 2^2 mod 5 = 4, 2^3 mod 5 = 3, 2^4 mod 5 = 1. Cyclicity is 4. 31 mod 4 = 3. So 2^31 mod 5 = 2^3 mod 5 = 8 mod 5 = 3.'
  },

  // ================= LOGICAL REASONING (10 QUESTIONS) =================
  {
    id: 'lr-1',
    category: 'Logical Reasoning',
    topic: 'Number Series',
    difficulty: 'Easy',
    question: 'Find the next number in the series: 3, 7, 15, 31, 63, ?',
    options: ['95', '111', '127', '135'],
    correctAnswer: 2, // 127
    explanation: 'Pattern: Each term is multiplied by 2 and increased by 1 (3*2+1=7, 7*2+1=15, 15*2+1=31, 31*2+1=63, 63*2+1=127).'
  },
  {
    id: 'lr-2',
    category: 'Logical Reasoning',
    topic: 'Blood Relations',
    difficulty: 'Medium',
    question: 'Pointing to a gentleman, Deepak said, "His only brother is the father of my daughter\'s father." How is the gentleman related to Deepak?',
    options: ['Father', 'Grandfather', 'Uncle', 'Brother-in-law'],
    correctAnswer: 2, // Uncle
    explanation: '"My daughter\'s father" is Deepak himself. Deepak\'s father is the only brother of that gentleman. Hence, the gentleman is Deepak\'s father\'s brother, which is his uncle.'
  },
  {
    id: 'lr-3',
    category: 'Logical Reasoning',
    topic: 'Coding-Decoding',
    difficulty: 'Easy',
    question: 'In a certain code, "PENCIL" is written as "QFOEJM". How is "PAPER" written in that code?',
    options: ['QBQFS', 'QCQFS', 'QBQES', 'RCRFT'],
    correctAnswer: 0, // QBQFS
    explanation: 'Each letter is shifted forward by +1. P->Q, A->B, P->Q, E->F, R->S. Result: QBQFS.'
  },
  {
    id: 'lr-4',
    category: 'Logical Reasoning',
    topic: 'Direction Sense',
    difficulty: 'Medium',
    question: 'Rohan walks 10m towards North, turns right and walks 10m, then turns right again and walks 10m. In which direction is he now facing?',
    options: ['North', 'East', 'South', 'West'],
    correctAnswer: 2, // South
    explanation: 'Starting facing North: First right turn makes him face East. Second right turn makes him face South.'
  },
  {
    id: 'lr-5',
    category: 'Logical Reasoning',
    topic: 'Syllogisms',
    difficulty: 'Medium',
    question: 'Statements: (1) All mangoes are golden. (2) No golden things are cheap. Conclusion I: All mangoes are cheap. Conclusion II: Golden things are not mangoes.',
    options: ['Only I follows', 'Only II follows', 'Either I or II follows', 'Neither I nor II follows'],
    correctAnswer: 3, // Neither I nor II follows
    explanation: 'Since all mangoes are golden and no golden things are cheap, no mangoes are cheap (so I is false). Also, mangoes are golden, so saying golden things cannot be mangoes is false (II is false).'
  },
  {
    id: 'lr-6',
    category: 'Logical Reasoning',
    topic: 'Analogy',
    difficulty: 'Easy',
    question: 'Architect : Building :: Sculptor : ?',
    options: ['Museum', 'Stone', 'Statue', 'Chisel'],
    correctAnswer: 2, // Statue
    explanation: 'An architect designs/creates a building; a sculptor creates a statue.'
  },
  {
    id: 'lr-7',
    category: 'Logical Reasoning',
    topic: 'Odd One Out',
    difficulty: 'Easy',
    question: 'Find the odd one out among the given options: 27, 64, 125, 144, 216',
    options: ['64', '125', '144', '216'],
    correctAnswer: 2, // 144
    explanation: '27 = 3^3, 64 = 4^3, 125 = 5^3, 216 = 6^3 are all perfect cubes. 144 is 12^2 (not a perfect cube).'
  },
  {
    id: 'lr-8',
    category: 'Logical Reasoning',
    topic: 'Seating Arrangement',
    difficulty: 'Hard',
    question: 'Five friends A, B, C, D, and E are sitting in a row facing North. C is sitting in the middle. A is immediately to the right of B, and D is to the left of C. If E is at the right end, who is sitting to the immediate left of C?',
    options: ['A', 'B', 'D', 'E'],
    correctAnswer: 2, // D
    explanation: 'With 5 positions (1, 2, 3, 4, 5) and C at 3, E at 5. Since D is to the left of C, and A is immediately to the right of B, the order is B, A, D, ?, E or D at 2 and B, A at 1, 2... specifically D sits at position 2 immediately to the left of C.'
  },
  {
    id: 'lr-9',
    category: 'Logical Reasoning',
    topic: 'Clock Problems',
    difficulty: 'Medium',
    question: 'What is the angle between the hour hand and the minute hand of a clock at 3:30?',
    options: ['70°', '75°', '80°', '85°'],
    correctAnswer: 1, // 75°
    explanation: 'Angle = |30*H - (11/2)*M| = |30*3 - (11/2)*30| = |90 - 165| = 75°.'
  },
  {
    id: 'lr-10',
    category: 'Logical Reasoning',
    topic: 'Statement and Assumptions',
    difficulty: 'Hard',
    question: 'Statement: "Please do not lean out of the train door." - Notice on a passenger coach. Assumption I: Leaning out is dangerous. Assumption II: People tend to read notices.',
    options: ['Only assumption I is implicit', 'Only assumption II is implicit', 'Both I and II are implicit', 'Neither is implicit'],
    correctAnswer: 2, // Both I and II are implicit
    explanation: 'A warning is issued because the act is dangerous (Assumption I), and notices are posted with the expectation that passengers will read and comply (Assumption II).'
  },

  // ================= BASIC TECHNICAL KNOWLEDGE (10 QUESTIONS) =================
  {
    id: 'tk-1',
    category: 'Basic Technical Knowledge',
    topic: 'Data Structures',
    difficulty: 'Easy',
    question: 'Which data structure follows the Last-In-First-Out (LIFO) principle?',
    options: ['Queue', 'Stack', 'Linked List', 'Array'],
    correctAnswer: 1, // Stack
    explanation: 'A Stack follows the Last-In-First-Out (LIFO) order, where elements are inserted and removed from the same end (top).'
  },
  {
    id: 'tk-2',
    category: 'Basic Technical Knowledge',
    topic: 'Algorithms & Complexity',
    difficulty: 'Medium',
    question: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST) with n nodes?',
    options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    correctAnswer: 1, // O(log n)
    explanation: 'In a balanced BST, each comparison reduces the search space by half, yielding an average and worst case search time of O(log n).'
  },
  {
    id: 'tk-3',
    category: 'Basic Technical Knowledge',
    topic: 'Database Management Systems',
    difficulty: 'Easy',
    question: 'In relational databases, what does the "A" in ACID properties stand for?',
    options: ['Availability', 'Atomicity', 'Authentication', 'Authorization'],
    correctAnswer: 1, // Atomicity
    explanation: 'ACID stands for Atomicity, Consistency, Isolation, and Durability. Atomicity ensures all operations in a transaction succeed or none do.'
  },
  {
    id: 'tk-4',
    category: 'Basic Technical Knowledge',
    topic: 'Database Management Systems',
    difficulty: 'Medium',
    question: 'Which normal form eliminates transitive dependency in a relational database table?',
    options: ['First Normal Form (1NF)', 'Second Normal Form (2NF)', 'Third Normal Form (3NF)', 'Boyce-Codd Normal Form (BCNF)'],
    correctAnswer: 2, // 3NF
    explanation: 'Third Normal Form (3NF) requires a relation to be in 2NF and have no transitive functional dependencies on the primary key.'
  },
  {
    id: 'tk-5',
    category: 'Basic Technical Knowledge',
    topic: 'Operating Systems',
    difficulty: 'Medium',
    question: 'Which of the following is NOT one of Coffman\'s four necessary conditions for a deadlock to occur?',
    options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
    correctAnswer: 2, // Preemption Allowed
    explanation: 'Deadlock requires: Mutual Exclusion, Hold and Wait, NO preemption, and Circular Wait. If preemption is allowed, deadlock cannot occur.'
  },
  {
    id: 'tk-6',
    category: 'Basic Technical Knowledge',
    topic: 'Operating Systems',
    difficulty: 'Easy',
    question: 'What is the main role of the CPU scheduler in an operating system?',
    options: ['Allocating memory to processes', 'Selecting a process from the ready queue for execution', 'Managing disk files', 'Handling network packets'],
    correctAnswer: 1, // Selecting a process from the ready queue
    explanation: 'The CPU (short-term) scheduler chooses which process in the ready queue is allocated the CPU for execution next.'
  },
  {
    id: 'tk-7',
    category: 'Basic Technical Knowledge',
    topic: 'Computer Networks',
    difficulty: 'Easy',
    question: 'Which layer of the OSI model is responsible for end-to-end packet delivery and host-to-host routing?',
    options: ['Data Link Layer', 'Network Layer', 'Transport Layer', 'Session Layer'],
    correctAnswer: 1, // Network Layer
    explanation: 'The Network Layer (Layer 3) handles routing, logical IP addressing, and packet forwarding across network boundaries.'
  },
  {
    id: 'tk-8',
    category: 'Basic Technical Knowledge',
    topic: 'Computer Networks',
    difficulty: 'Medium',
    question: 'How does TCP differ fundamentally from UDP?',
    options: [
      'TCP is connectionless and faster; UDP is connection-oriented',
      'TCP provides reliable, ordered data stream; UDP is connectionless and unreliable',
      'TCP only works over wireless networks',
      'TCP uses 8-byte headers while UDP uses 20-byte headers'
    ],
    correctAnswer: 1, // TCP provides reliable, ordered data stream; UDP is connectionless and unreliable
    explanation: 'TCP establishes a 3-way handshake and guarantees delivery, ordering, and error-checking. UDP is lightweight and connectionless without acknowledgements.'
  },
  {
    id: 'tk-9',
    category: 'Basic Technical Knowledge',
    topic: 'Object Oriented Programming',
    difficulty: 'Easy',
    question: 'Which OOP concept refers to wrapping data and code operating on that data into a single unit and restricting direct access?',
    options: ['Inheritance', 'Polymorphism', 'Encapsulation', 'Abstraction'],
    correctAnswer: 2, // Encapsulation
    explanation: 'Encapsulation binds data and functions together into an object and hides internal states to prevent unauthorized direct modification.'
  },
  {
    id: 'tk-10',
    category: 'Basic Technical Knowledge',
    topic: 'Data Structures',
    difficulty: 'Hard',
    question: 'What is the worst-case time complexity of QuickSort when a naive first-element pivot selection is used on an already sorted array?',
    options: ['O(log n)', 'O(n)', 'O(n log n)', 'O(n^2)'],
    correctAnswer: 3, // O(n^2)
    explanation: 'When the partition is completely unbalanced (e.g. 1 element vs n-1 elements repeatedly), QuickSort degenerates to O(n^2).'
  },

  // ================= VERBAL ABILITY (10 QUESTIONS) =================
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
    correctAnswer: 1, // Neither... nor follows the closer subject "developers" (plural) -> were
    explanation: 'When compound subjects are connected by "neither... nor", the verb agrees with the noun or pronoun closest to it. Since "developers" is plural, the plural verb "were" is correct.'
  },
  {
    id: 'va-2',
    category: 'Verbal Ability',
    topic: 'Vocabulary & Synonyms',
    difficulty: 'Easy',
    question: 'Select the word that is most nearly SYNONYMOUS in meaning to "CANDID":',
    options: ['Secretive', 'Frank', 'Deceptive', 'Hesitant'],
    correctAnswer: 1, // Frank
    explanation: '"Candid" means truthful, straightforward, and frank. "Frank" is the direct synonym, whereas "secretive" and "deceptive" are antonyms.'
  },
  {
    id: 'va-3',
    category: 'Verbal Ability',
    topic: 'Sentence Correction',
    difficulty: 'Medium',
    question: 'Identify the best replacement for the underlined phrase: "If he would have studied harder, he would have cleared the campus interview."',
    options: [
      'Had he studied harder',
      'If he has studied harder',
      'If he will study harder',
      'Should he have studied harder'
    ],
    correctAnswer: 0, // Had he studied harder
    explanation: 'In third conditional sentences (unreal past), the condition clause uses the past perfect tense ("had studied" or inverted "Had he studied"), not "would have studied".'
  },
  {
    id: 'va-4',
    category: 'Verbal Ability',
    topic: 'Vocabulary & Antonyms',
    difficulty: 'Medium',
    question: 'Select the word that is most nearly OPPOSITE in meaning to "PRAGMATIC":',
    options: ['Realistic', 'Practical', 'Idealistic', 'Rational'],
    correctAnswer: 2, // Idealistic
    explanation: '"Pragmatic" means dealing with things sensibly and realistically based on practical considerations. Its opposite is "idealistic" (guided by ideals rather than practical reality).'
  },
  {
    id: 'va-5',
    category: 'Verbal Ability',
    topic: 'Grammar & Prepositions',
    difficulty: 'Easy',
    question: 'Select the appropriate preposition to complete the sentence: "The candidate complied _____ all the eligibility requirements stipulated by the recruitment panel."',
    options: ['to', 'with', 'by', 'for'],
    correctAnswer: 1, // with
    explanation: 'The standard idiom and grammatical collocation is "comply with" (meaning to conform or adhere to rules/requests).'
  },
  {
    id: 'va-6',
    category: 'Verbal Ability',
    topic: 'Spotting the Error',
    difficulty: 'Medium',
    question: 'Identify the part of the sentence that contains an error: "[A] One of the most important skills / [B] for software engineers / [C] are the ability to write clean code / [D] and collaborate effectively."',
    options: ['Part [A]', 'Part [B]', 'Part [C]', 'Part [D]'],
    correctAnswer: 2, // Part [C]
    explanation: 'The true grammatical subject is "One" (singular), so the verb should be singular: "is the ability", not "are the ability".'
  },
  {
    id: 'va-7',
    category: 'Verbal Ability',
    topic: 'Verbal Reasoning & Inference',
    difficulty: 'Medium',
    question: 'Read the statement: "Companies that invest consistently in employee upskilling report 35% higher talent retention during economic downturns." Which of the following is logically supported by the passage?',
    options: [
      'Talent retention depends entirely on financial compensation.',
      'Upskilling opportunities contribute positively to organizational talent retention.',
      'Employees who are not upskilled will definitely leave within one year.',
      'Economic downturns only affect companies that do not train their staff.'
    ],
    correctAnswer: 1, // Upskilling opportunities contribute positively to organizational talent retention
    explanation: 'The statement establishes a positive correlation between consistent upskilling investment and retention. Option B captures this supported conclusion without overstating causality.'
  },
  {
    id: 'va-8',
    category: 'Verbal Ability',
    topic: 'Idioms and Phrases',
    difficulty: 'Easy',
    question: 'What is the meaning of the idiom "to burn the midnight oil"?',
    options: [
      'To waste electricity unnecessarily',
      'To work or study late into the night',
      'To initiate an argument with colleagues',
      'To prepare for an upcoming journey'
    ],
    correctAnswer: 1, // To work or study late into the night
    explanation: '"To burn the midnight oil" is an English idiom meaning to work, study, or prepare diligently late into the night.'
  },
  {
    id: 'va-9',
    category: 'Verbal Ability',
    topic: 'Vocabulary & Analogy',
    difficulty: 'Medium',
    question: 'Complete the analogy: EPHEMERAL : PERMANENT :: VOLATILE : ?',
    options: ['Unstable', 'Steady', 'Transient', 'Explosive'],
    correctAnswer: 1, // Steady
    explanation: 'Ephemeral is the antonym of Permanent. Similarly, Volatile (unstable/erratic) has its antonym as Steady (stable/constant).'
  },
  {
    id: 'va-10',
    category: 'Verbal Ability',
    topic: 'Sentence Completion',
    difficulty: 'Hard',
    question: 'Choose the word that best completes the sentence: "The lead architect offered a _______ argument that convinced the entire engineering committee to adopt the scalable microservices architecture."',
    options: ['cogent', 'specious', 'tenuous', 'spurious'],
    correctAnswer: 0, // cogent
    explanation: '"Cogent" means clear, logical, and convincing. "Specious" and "spurious" mean falsely plausible or counterfeit; "tenuous" means very weak or slight.'
  }
];
