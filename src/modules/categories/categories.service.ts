import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/database/prisma.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';

import { MySqlErrorsExceptions } from '../../helpers/errors/exceptions-sql';
import { ApiTransactionResponse } from '../../util/ApiResponse';
import { ICategory } from './interfaces/categories.interfaces';

@Injectable()
export class CategoriesService {

  private readonly logger = new Logger('CategoriesService');
  private readonly errorsSQL = new MySqlErrorsExceptions();

  constructor(
    private prisma: PrismaService
  ){}

  async create(createCategoryDto: CreateCategoryDto): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

  async findAll(pageOptionsDto: PageOptionsDto): Promise<PageDto<ICategory> | Object> {

    throw new Error("No implementado aún");

  }

  async findOne(id: number): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

  async remove(id: number): Promise<ApiTransactionResponse<ICategory | string>> {

    throw new Error("No implementado aún");

  }

}
