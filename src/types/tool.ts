//temp category btw
export enum ToolCategory {
  ONE = "1",
  TWO = "2",
  THREE = "3",
}

export interface Tool {
  tool_id: string;
  name: string;
  description: string;
  category: ToolCategory;
  total_quantity: number;
  image?: string; // Not sure na kub
}
