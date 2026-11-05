export type Level = 'A2' | 'B1' | 'B2';

export type Exercise = {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
};

export type GrammarTable = {
  caption: string;
  headers: string[];
  rows: string[][];
};

export type Topic = {
  id: string;
  level: Level;
  title: string;
  summary: string;
  explanation: string;
  grammarTables?: GrammarTable[];
  examples: string[];
  tip: string;
  reference?: {
    label: string;
    url: string;
  };
  exercises: Exercise[];
};
