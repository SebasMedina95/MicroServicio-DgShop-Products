import { Controller,
         Get,
         Post,
         Body,
         Patch,
         Param,
         Delete } from '@nestjs/common';

import { ProvidersService } from './providers.service';

import { CreateProviderDto } from './dto/create-provider.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { PageOptionsDto } from '../../helpers/paginations/dto/page-options.dto';
import { PageDto } from '../../helpers/paginations/dto/page.dto';

import { ApiTransactionResponse } from '../../util/ApiResponse';
import { CustomError } from '../../helpers/errors/custom.error';
import { IProvider } from './interfaces/providers.interface';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('/create')
  async create(
    @Body() createProviderDto: CreateProviderDto
  ): Promise<ApiTransactionResponse<IProvider | CustomError>> {

    return this.providersService.create(createProviderDto);

  }

  @Get('/get-paginated')
  async findAll(
    @Body() pageOptionsDto: PageOptionsDto
  ): Promise<PageDto<IProvider> | Object> {

    return this.providersService.findAll(pageOptionsDto);

  }

  @Get('/get-by-id/:id')
  async findOne(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<IProvider | string>> {

    return this.providersService.findOne(id);

  }

  @Patch('/update/:id')
  async update(
    @Param('id') id: number, 
    @Body() updateProviderDto: UpdateProviderDto
  ): Promise<ApiTransactionResponse<IProvider | string>> {

    return this.providersService.update(id, updateProviderDto);

  }

  @Delete('/remove-logic/:id')
  async remove(
    @Param('id') id: number
  ): Promise<ApiTransactionResponse<IProvider | string>> {

    return this.providersService.remove(id);

  }
}
