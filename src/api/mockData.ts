export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Question[];
  attemptsAllowed: number;
  attemptsRemaining: number; // Added
  expiresAt?: string; // Added (ISO date)
  isCertified?: boolean; // Added for UI helper
  timeLimit?: number; // in minutes
}

export interface Certification {
  id: string;
  quizId: string;
  quizTitle: string;
  issueDate: string;
  score: number;
  userId: string;
}

export const MOCK_QUIZZES: Quiz[] = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    description: 'Master compound components, render props, and higher-order components.',
    category: 'Frontend',
    attemptsAllowed: 2,
    attemptsRemaining: 1,
    expiresAt: '2026-12-31',
    isCertified: true,
    questions: [
      {
        id: 'q1',
        text: 'What is the main benefit of Compound Components?',
        options: [
          'Implicit state sharing between parent and children',
          'Better performance than hooks',
          'Automatic code splitting',
          'Replacing Redux completely'
        ],
        correctAnswer: 0
      },
      // ... same questions as before
      {
        id: 'q2',
        text: 'React.useMemo is used for...',
        options: [
          'Skipping rendering of children',
          'Memoizing expensive calculations',
          'Storing mutable values',
          'Triggering side effects'
        ],
        correctAnswer: 1
      },
      {
        id: 'q3',
        text: 'Which hook should be used for DOM measurements?',
        options: [
          'useEffect',
          'useInsertionEffect',
          'useLayoutEffect',
          'useRef'
        ],
        correctAnswer: 2
      },
      {
        id: 'q4',
        text: 'What does "Lifting State Up" mean?',
        options: [
          'Moving state to a global store like Zustand',
          'Moving state to the closest common ancestor',
          'Using context for all state',
          'Rendering components at the top level'
        ],
        correctAnswer: 1
      },
      {
        id: 'q5',
        text: 'The "Key" prop in React is primarily for:',
        options: [
          'Styling elements in a list',
          'Identifying elements across renders for reconciliation',
          'Storing unique data',
          'Security purposes'
        ],
        correctAnswer: 1
      }
    ]
  },
  {
    id: '2',
    title: 'Azure Cloud Architecture',
    description: 'Cloud design patterns and infrastructure on Azure.',
    category: 'Cloud',
    attemptsAllowed: 2,
    attemptsRemaining: 2,
    expiresAt: '2024-01-01', // Expired
    questions: [
      {
        id: 'a1',
        text: 'Which service is best for serverless compute in Azure?',
        options: ['Azure VMs', 'Azure Functions', 'AKS', 'App Service'],
        correctAnswer: 1
      },
      {
        id: 'a2',
        text: 'What is Azure Resource Manager (ARM)?',
        options: ['A backup tool', 'A deployment and management service', 'A billing portal', 'A security firewall'],
        correctAnswer: 1
      },
      {
        id: 'a3',
        text: 'Which Azure storage type is optimized for Big Data analytics?',
        options: ['Blob Storage', 'File Storage', 'Data Lake Storage Gen2', 'Queue Storage'],
        correctAnswer: 2
      },
      {
        id: 'a4',
        text: 'What is the default isolation level in Azure SQL?',
        options: ['Read Committed', 'Read Committed Snapshot', 'Repeatable Read', 'Serializable'],
        correctAnswer: 1
      },
      {
        id: 'a5',
        text: 'Azure Cosmos DB is a:',
        options: ['Relational database only', 'Single-region database', 'Globally distributed multi-model database', 'Caching service'],
        correctAnswer: 2
      }
    ]
  }
];

export const MOCK_CERTIFICATIONS: Certification[] = [
  {
    id: 'cert_1',
    quizId: '1',
    quizTitle: 'Advanced React Patterns',
    issueDate: '2024-03-15',
    score: 100,
    userId: 'student_1'
  }
];

export const MOCK_STATS = {
  totalCertified: 1250,
  totalAttempts: 4500,
  passRate: 72,
  topQuiz: 'Advanced React Patterns'
};
