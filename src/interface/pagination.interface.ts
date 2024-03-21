import { SortOrderEnum } from "../util/pagination/sort-order.enum";

export interface PaginationInterface {
    limit?: number;
    page?: number;
    offset?: number;
    sortBy?: string;
    sortOrder?: SortOrderEnum;
    pagination?: boolean;
}