// Word and vocabulary type contracts

export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | string;

export interface EtymologyRoot {
  root: string;
  meaning: string;
}

export interface Word {
  word: string;
  def: string;
  ex: string;
  pos: PartOfSpeech;
  distractors?: [string, string, string];
  tier?: 1 | 2 | 3;
  roots?: EtymologyRoot[];
  synonyms?: string[];
  antonyms?: string[];
}

export type VocabWord = Word;
