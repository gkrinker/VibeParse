export interface CodeHighlight {
  file_path: string;
  start_line: number;
  end_line: number;
  description: string;
  code: string;
}

export interface Scene {
  title: string;
  duration: number;
  content: string;
  code_highlights: CodeHighlight[];
}

export interface Script {
  scenes: Scene[];
} 