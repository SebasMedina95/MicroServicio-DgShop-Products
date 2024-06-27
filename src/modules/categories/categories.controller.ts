import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

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

  @MessagePattern({ cmd: 'create_category' })
  async create(
    @Payload() createCategoryDto: CreateCategoryDto
  ): Promise<ApiTransactionResponse<ICategory | CustomError>> {

    return this.categoriesService.create(createCategoryDto);

  }

  @MessagePattern({ cmd: 'get_categories_paginated' })
  async findAll(
    @Payload() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<ICategory> | Object> {

    return this.categoriesService.findAll(pageOptionsDto);

  }

  @MessagePattern({ cmd: '/get_category_by_id' })
  async findOne(
    @Payload('id') id: number
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.findOne(id);

  }

  @MessagePattern({ cmd: 'update_category' })
  async update(
    @Payload() updateCategoryDto: UpdateCategoryDto
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.update(updateCategoryDto.id, updateCategoryDto);

  }

  @MessagePattern({ cmd: 'remove_logic_category' })
  async remove(
    @Payload('id') id: number
  ): Promise<ApiTransactionResponse<ICategory | string>> {

    return this.categoriesService.remove(id);

  }
}
