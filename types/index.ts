export type UserRole =
    | "Admin"
    | "Property Manager"
    | "Read-Only Analyst";

export type UserStatus = "Active" | "Disabled";

export interface BuildingAssignment {
    id: number;
    name: string;
    portfolioCount?: number;
}

export interface SystemUser {
    id: string;
    fullName: string;
    title: string;
    isVerified?: boolean;
    email: string;
    role: UserRole;
    assignedBuildings: BuildingAssignment[];
    status: UserStatus;
}

export interface PaginationState {
    page: number;
    pageSize: number;
    totalCount: number;
}
