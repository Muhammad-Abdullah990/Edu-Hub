export type ParentRelationship = "father" | "mother" | "guardian";

export type ParentResponse = {
  id: string;
  userId: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  relationship: ParentRelationship;
  address: string;
  createdAt: string;
  updatedAt: string;
};

export type ParentCreateInput = {
  name: string;
  phone: string;
  email?: string;
  relationship: ParentRelationship;
  address: string;
  userId?: string;
};
