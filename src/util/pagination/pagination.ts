import { FindOptionsWhere } from "typeorm";
import { Builder } from "builder-pattern";
import { SortOrderEnum } from "./sort-order.enum";
import { PaginationInterface } from "../../interface/pagination.interface";
import { dataSource } from "../data-source";

export class PaginatedResult<T> {
  docs: T[];
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  totalDocs: number;
  limit: number;
  totalPages: number;
  nextPage: number | null;
  prevPage: number | null;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

export async function getPaginatedResult(entity: any, condition: FindOptionsWhere<any>, options?: PaginationInterface, relations?: string[]): Promise<any> {
  const paginationOptions: PaginationInterface = Builder<PaginationInterface>()
    .pagination(options?.pagination ?? true)
    .page(options?.page ?? 1)
    .limit(options?.limit ?? 20)
    .sortBy(options?.sortBy ?? "id")
    .sortOrder(options?.sortOrder ?? SortOrderEnum.ASC)
    .build();

  const offset = (paginationOptions.page - 1) * paginationOptions.limit;
  const alias = entity.name.toLowerCase();

  const queryBuilder = dataSource.manager
    .getRepository(entity)
    .createQueryBuilder(alias)
    .where(condition)
    .offset(offset)
    .limit(paginationOptions.limit)
    .orderBy(`${alias}.${paginationOptions.sortBy}`, paginationOptions.sortOrder);

  if (relations && relations.length > 0) {
    relations.map(relation => queryBuilder.leftJoinAndSelect(`${alias}.${relation}`, relation));
  }
  const [result, totalDocs] = await queryBuilder.getManyAndCount();

  if (paginationOptions.pagination === false) {
    return result;
  }

  const totalPages = Math.ceil(totalDocs / paginationOptions.limit);
  const hasPrevPage = offset > 0;
  const hasNextPage = offset + result.length < totalDocs;
  const prevPage = hasPrevPage ? paginationOptions.page - 1 : null;
  const nextPage = hasNextPage ? paginationOptions.page + 1 : null;

  return Builder<PaginatedResult<any>>()
    .docs(result)
    .page(paginationOptions.page)
    .hasNext(hasNextPage)
    .hasPrevious(hasPrevPage)
    .totalDocs(totalDocs)
    .limit(paginationOptions.limit)
    .totalPages(totalPages)
    .nextPage(nextPage)
    .prevPage(prevPage)
    .hasPrevPage(hasPrevPage)
    .hasNextPage(hasNextPage)
    .build();
}


