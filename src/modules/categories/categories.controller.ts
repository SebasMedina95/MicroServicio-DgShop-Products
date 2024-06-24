import { Controller,
         Get,
         Post,
         Body,
         Patch,
         Param,
         Delete } from '@nestjs/common';

import { CategoriesService } from './categories.service';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';
import { CustomError } from '../../helpers/errors/custom.error';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { ICategory } from './interfaces/categories.interfaces';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post('/create')
  async create(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<ApiTransactionResponse<ICategory | CustomError>> {

    return this.categoriesService.create(createCategoryDto);

  }

  @Get('/get-paginated')
  async findAll(
    @Body() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<ICategory> | Object> {

    return this.categoriesService.findAll(pageOptionsDto);

  }

  @Get('/get-by-id/:id')
  async findOne(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.findOne(id);

  }

  @Patch('/update/:id')
  async update(
    @Param('id') id: number, 
    @Body() updateCategoryDto: UpdateCategoryDto
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.update(id, updateCategoryDto);

  }

  @Delete('/remove-logic/:id')
  async remove(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.remove(id);

  }
}
