import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customFetch, type ApiError } from "@toppers/api-client";

const API_BASE = "/api";

export interface StudentFilters {
  q?: string;
  class?: string;
  status?: "active" | "archived";
  page?: number;
  limit?: number;
  sortBy?: "fullName" | "admissionDate" | "class" | "studentCode";
  sortOrder?: "asc" | "desc";
}

export interface StudentCard {
  id: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  photoUrl: string;
  status: "active" | "archived";
  attendancePercentage: number | null;
  feeStatus: string | null;
  latestPerformanceNote: {
    id: string;
    note: string;
    authorName: string | null;
    createdAt: string;
  } | null;
}

export interface StudentProfile {
  id: string;
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  dateOfBirth: string;
  admissionDate: string;
  status: "active" | "archived";
  photoUrl: string;
  personalInfo: {
    studentCode: string;
    fullName: string;
    class: string;
    section: string;
    dateOfBirth: string;
    admissionDate: string;
    status: "active" | "archived";
  };
  attendanceSummary: {
    attendancePercentage: number | null;
    presentDays: number | null;
    absentDays: number | null;
    totalDays: number | null;
    lastRecordedAt: string | null;
  };
  performanceNotes: Array<{
    id: string;
    note: string;
    authorName: string | null;
    createdAt: string;
  }>;
  academicProgress: {
    currentStanding: string;
    latestObservation: string | null;
    remarks: string[];
  };
  feeStatus: {
    status: string | null;
    outstandingAmount: number | null;
    dueDate: string | null;
    updatedAt: string | null;
  };
  reportsHistory: {
    placeholder: boolean;
    items: unknown[];
  };
  parents: Array<{
    id: string;
    userId: string | null;
    name: string;
    phone: string | null;
    email: string | null;
    relationship: "father" | "mother" | "guardian";
    address: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

export interface StudentCreateInput {
  studentCode: string;
  fullName: string;
  class: string;
  section: string;
  dateOfBirth: string;
  admissionDate: string;
  photoUrl: string;
  status?: "active" | "archived";
}

export interface StudentUpdateInput {
  studentCode?: string;
  fullName?: string;
  class?: string;
  section?: string;
  dateOfBirth?: string;
  admissionDate?: string;
  photoUrl?: string;
  status?: "active" | "archived";
}

export interface ParentCreateInput {
  name: string;
  phone: string;
  email?: string;
  relationship: "father" | "mother" | "guardian";
  address: string;
  userId?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export function useStudents(filters: StudentFilters = {}) {
  const params = new URLSearchParams();
  
  if (filters.q) params.append("q", filters.q);
  if (filters.class) params.append("class", filters.class);
  if (filters.status) params.append("status", filters.status);
  if (filters.page) params.append("page", String(filters.page));
  if (filters.limit) params.append("limit", String(filters.limit));
  if (filters.sortBy) params.append("sortBy", filters.sortBy);
  if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

  return useQuery({
    queryKey: ["students", filters],
    queryFn: async () => {
      const queryString = params.toString();
      const url = queryString ? `${API_BASE}/students?${queryString}` : `${API_BASE}/students`;
      const response = await customFetch<ApiResponse<StudentCard[]>>(url, {
        method: "GET",
      });
      return response;
    },
  });
}

export function useStudent(id: string | undefined) {
  return useQuery({
    queryKey: ["student", id],
    queryFn: async () => {
      if (!id) throw new Error("Student ID is required");
      return customFetch<ApiResponse<StudentProfile>>(`${API_BASE}/students/${id}`, {
        method: "GET",
      });
    },
    enabled: !!id,
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: StudentCreateInput) => {
      return customFetch<ApiResponse<{ id: string }>>(`${API_BASE}/students`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: StudentUpdateInput }) => {
      return customFetch<ApiResponse<StudentProfile>>(`${API_BASE}/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", variables.id] });
    },
  });
}

export function useArchiveStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return customFetch<ApiResponse<null>>(`${API_BASE}/students/${id}/archive`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useRestoreStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return customFetch<ApiResponse<null>>(`${API_BASE}/students/${id}/restore`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return customFetch<ApiResponse<null>>(`${API_BASE}/students/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useStudentParents(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-parents", studentId],
    queryFn: async () => {
      if (!studentId) throw new Error("Student ID is required");
      return customFetch<ApiResponse<StudentProfile["parents"]>>(`${API_BASE}/students/${studentId}/parents`, {
        method: "GET",
      });
    },
    enabled: !!studentId,
  });
}

export function useCreateStudentParent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, data }: { studentId: string; data: ParentCreateInput }) => {
      return customFetch<ApiResponse<StudentProfile["parents"]>>(`${API_BASE}/students/${studentId}/parents`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["student-parents", variables.studentId] });
    },
  });
}
