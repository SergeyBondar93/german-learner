export type Level = 'A2' | 'B1' | 'B2';

export type Exercise = {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
};

export type Topic = {
  id: string;
  level: Level;
  title: string;
  summary: string;
  explanation: string;
  examples: string[];
  tip: string;
  reference?: {
    label: string;
    url: string;
  };
  exercises: Exercise[];
};
